<template>
  <div id="moment-page">
    <!-- Tab 切换 -->
    <div class="moment-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-item', { active: currentTab === tab.key }]"
        @click="switchTab(tab.key)"
      >
        <i :class="`iconfont icon-${tab.icon}`"></i>
        <span>{{ tab.label }}</span>
      </div>
    </div>

    <!-- 标签筛选 -->
    <div class="moment-tags" v-if="availableTags.length > 0">
      <span
        :class="['tag-item', { active: selectedTag === '' }]"
        @click="selectTag('')"
      >
        全部
      </span>
      <span
        v-for="tag in availableTags"
        :key="tag"
        :class="['tag-item', { active: selectedTag === tag }]"
        @click="selectTag(tag)"
      >
        #{{ tag }}
      </span>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="moment-loading">
      <Loading />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="moment-error">
      <i class="iconfont icon-error"></i>
      <p>{{ error }}</p>
      <button @click="fetchData">重试</button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredData.length === 0" class="moment-empty">
      <i class="iconfont icon-empty"></i>
      <p>暂无说说内容</p>
    </div>

    <!-- 瀑布流内容 -->
    <div v-else class="moment-waterfall">
      <div class="waterfall-column" v-for="(column, colIndex) in columns" :key="colIndex">
        <MomentCard
          v-for="item in column"
          :key="item.id"
          :data="item"
          :type="currentTab"
          @tag-click="selectTag"
        />
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore && !loading" class="moment-loadmore">
      <button @click="loadMore">加载更多</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { mainStore } from '@/store';
import { themeConfig } from '@/assets/themeConfig.mjs';
import MomentCard from '@/components/Moment/MomentCard.vue';
import Loading from '@/components/Loading.vue';
import initFancybox from '@/utils/initFancybox.mjs';

const store = mainStore();
const { themeValue } = storeToRefs(store);

// 所有可用的 Tab 配置
const allTabs = [
  { key: 'memos', label: 'Memos', icon: 'memo' },
  { key: 'jike', label: '即刻', icon: 'rss' },
  { key: 'tgtalk', label: 'TGTalk', icon: 'chat' },
  { key: 'mastodon', label: 'Mastodon', icon: 'link' },
];

// 从配置中读取启用的 Tab
const enabledTabs = themeConfig.moment?.tabs || [];
const tabs = computed(() => {
  // 如果没有配置 tabs，返回所有 Tab（兼容旧配置）
  if (enabledTabs.length === 0) return allTabs;
  // 根据配置过滤 Tab
  return allTabs.filter(tab => {
    const config = enabledTabs.find(t => t.key === tab.key);
    return config?.enable !== false;
  });
});

// 从配置读取默认 Tab
const defaultTab = themeConfig.moment?.defaultTab || 'memos';
const currentTab = ref(defaultTab);

// 数据状态
const loading = ref(false);
const error = ref('');
const rawData = ref([]);
const selectedTag = ref('');
const page = ref(1);
const hasMore = ref(true);

// 客户端检测
const isClient = ref(false);

// 瀑布流列数
const columnCount = computed(() => {
  if (!isClient.value) return 3; // 服务端固定返回3列
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1300) return 2;
  return 3;
});

// 过滤后的数据
const filteredData = computed(() => {
  if (!selectedTag.value) return rawData.value;
  return rawData.value.filter(item => item.tags?.includes(selectedTag.value));
});

// 瀑布流列数据
const columns = computed(() => {
  const cols = Array.from({ length: columnCount.value }, () => []);
  filteredData.value.forEach((item, index) => {
    const colIndex = index % columnCount.value;
    cols[colIndex].push(item);
  });
  return cols;
});

// 可用标签
const availableTags = computed(() => {
  const tags = new Set();
  rawData.value.forEach(item => {
    item.tags?.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).slice(0, 10);
});

// 切换 Tab
const switchTab = (tab) => {
  if (currentTab.value === tab) return;
  currentTab.value = tab;
  selectedTag.value = '';
  page.value = 1;
  hasMore.value = true;
  rawData.value = [];
  fetchData();
};

// 选择标签
const selectTag = (tag) => {
  selectedTag.value = tag;
};

// 获取数据
const fetchData = async () => {
  loading.value = true;
  error.value = '';

  try {
    switch (currentTab.value) {
      case 'memos':
        await fetchMemos();
        break;
      case 'jike':
        await fetchJike();
        break;
      case 'tgtalk':
        await fetchTGTalk();
        break;
      case 'mastodon':
        await fetchMastodon();
        break;
    }
    // 数据加载完成后，等待 DOM 更新，然后初始化 fancybox
    await nextTick();
    initFancybox(themeConfig);
  } catch (err) {
    error.value = err.message || '加载失败';
  } finally {
    loading.value = false;
  }
};

// Memos 数据
const fetchMemos = async () => {
  const response = await fetch('https://m.314926.xyz/api/v1/memos');
  const data = await response.json();

  if (!data.memos) throw new Error('获取 Memos 数据失败');

  rawData.value = data.memos.map(memo => ({
    id: memo.name,
    content: memo.content,
    snippet: memo.snippet,
    tags: memo.tags || [],
    date: memo.displayTime || memo.createTime,
    images: memo.attachments?.filter(a => a.type?.startsWith('image/')).map(a => a.url) || [],
    link: null,
  }));

  hasMore.value = !!data.nextPageToken;
};

// Jike RSS 数据
const fetchJike = async () => {
  const response = await fetch(
    'https://rsshub-api.2005815.xyz/?url=https://rsshub.261770.xyz/jike/user/07152f0c-0f65-4501-855b-031f3e20e4a5'
  );
  const xmlText = await response.text();

  // 解析 XML
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  // 检查解析错误
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) throw new Error('解析 RSS XML 失败');

  const items = xmlDoc.querySelectorAll('item');
  if (items.length === 0) throw new Error('获取 RSS 数据失败');

  rawData.value = Array.from(items).map((item, index) => {
    const title = item.querySelector('title')?.textContent || '';
    const description = item.querySelector('description')?.textContent || '';
    const link = item.querySelector('link')?.textContent || '';
    const pubDate = item.querySelector('pubDate')?.textContent || '';

    // 从 description 中提取图片
    const images = [];
    const imgMatches = description.match(/<img[^>]+src="([^"]+)"/g);
    if (imgMatches) {
      imgMatches.forEach(match => {
        const srcMatch = match.match(/src="([^"]+)"/);
        if (srcMatch) images.push(srcMatch[1]);
      });
    }

    // 清理内容：移除 HTML 标签
    const cleanContent = description.replace(/<[^>]+>/g, '').trim();

    return {
      id: `jike-${index}`,
      content: cleanContent,
      snippet: cleanContent.slice(0, 100),
      tags: [],
      date: pubDate,
      images: images,
      link: link,
    };
  });

  hasMore.value = false;
};

// Mastodon 数据
const fetchMastodon = async () => {
  const apiUrl = themeConfig.moment?.mastodon?.apiUrl || 'https://mastodon-api.20050815.xyz/';
  const response = await fetch(apiUrl);
  const data = await response.json();

  if (!data.success || !data.data) throw new Error('获取 Mastodon 数据失败');

  // 获取 API 基础 URL（用于拼接图片代理路径）
  const baseUrl = apiUrl.replace(/\/$/, '');

  rawData.value = data.data.map(item => {
    // 处理内容：纯文本
    const content = item.text || '';

    // 提取标签（#tag 格式）
    const tags = [];
    const tagMatches = content.match(/#(\S+)/g);
    if (tagMatches) {
      tagMatches.forEach(match => {
        tags.push(match.slice(1));
      });
    }

    // 处理图片路径：如果是相对路径，拼接 API 基础 URL
    const images = (item.image || []).map(img => {
      if (img.startsWith('/')) {
        return baseUrl + img;
      }
      return img;
    });

    // 时间戳转换为北京时间
    // item.time 是毫秒时间戳，直接使用 Date 对象会自动转换为本地时间
    const beijingTime = item.time;

    return {
      id: `mastodon-${item.id}`,
      content: content,
      snippet: content.slice(0, 100),
      tags: tags,
      date: beijingTime,
      images: images,
      link: null,
    };
  });

  hasMore.value = !!data.nextBefore;
};

// TGTalk 数据
const fetchTGTalk = async () => {
  const response = await fetch('https://tgtalk.kemiaosw.top/');
  const data = await response.json();

  if (!data.data) throw new Error('获取 TGTalk 数据失败');

  rawData.value = data.data.map(item => {
    // 处理内容，移除 emoji 图片标签但保留文本
    let content = item.text || '';
    // 移除 <b>emoji</b> 标签但保留其中的文本
    content = content.replace(/<i class="emoji"[^>]*>.*?<b>([^<]*)<\/b>.*?<\/i>/g, '$1');
    // 移除 telegram emoji 图片
    content = content.replace(/<img[^>]*telegram\.org[^>]*>/g, '');

    // 提取标签
    const tags = [];
    const tagMatches = content.match(/<a href="\?q=%23[^"]*">#([^<]*)<\/a>/g);
    if (tagMatches) {
      tagMatches.forEach(match => {
        const tag = match.replace(/<[^>]+>/g, '');
        if (tag.startsWith('#')) {
          tags.push(tag.slice(1));
        }
      });
    }

    // 过滤掉 telegram 图片
    const images = (item.image || []).filter(img =>
      !img.includes('telegram.org')
    );

    return {
      id: `tgtalk-${item.id}`,
      content: content,
      snippet: content.replace(/<[^>]+>/g, '').slice(0, 100),
      tags: tags,
      date: item.time,
      images: images,
      link: null,
    };
  });

  hasMore.value = false;
};

// 加载更多
const loadMore = () => {
  page.value++;
  fetchData();
};

// 监听主题变化（用于地图等需要主题适配的组件）
watch(themeValue, () => {
  // 可以在这里处理主题变化时的逻辑
});

onMounted(() => {
  // 标记为客户端环境
  isClient.value = true;

  // 使用 nextTick 确保水合完成后再获取数据
  nextTick(() => {
    fetchData();
  });
});
</script>

<style lang="scss" scoped>
#moment-page {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  animation: fade-up 0.6s 0.1s backwards;
}

// Tab 样式
.moment-tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  .tab-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem;
    border-radius: 25px;
    background-color: var(--main-card-background);
    border: 1px solid var(--main-card-border);
    color: var(--main-font-color);
    cursor: pointer;
    transition: all 0.3s;

    .iconfont {
      font-size: 1.1rem;
    }

    &:hover {
      border-color: var(--main-color);
      color: var(--main-color);
    }

    &.active {
      background-color: var(--main-color);
      border-color: var(--main-color);
      color: #fff;
    }
  }
}

// 标签筛选
.moment-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;

  .tag-item {
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    background-color: var(--main-card-second-background);
    color: var(--main-font-second-color);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: var(--main-color-bg);
      color: var(--main-color);
    }

    &.active {
      background-color: var(--main-color);
      color: #fff;
    }
  }
}

// 加载状态
.moment-loading {
  display: flex;
  justify-content: center;
  padding: 3rem 0;
}

// 错误状态
.moment-error {
  text-align: center;
  padding: 3rem 0;
  color: var(--main-font-second-color);

  .iconfont {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  button {
    margin-top: 1rem;
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    border: none;
    background-color: var(--main-color);
    color: #fff;
    cursor: pointer;
    transition: opacity 0.3s;

    &:hover {
      opacity: 0.8;
    }
  }
}

// 空状态
.moment-empty {
  text-align: center;
  padding: 3rem 0;
  color: var(--main-font-second-color);

  .iconfont {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
}

// 瀑布流布局
.moment-waterfall {
  display: flex;
  gap: 1rem;

  .waterfall-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}

// 加载更多
.moment-loadmore {
  text-align: center;
  margin-top: 2rem;

  button {
    padding: 0.6rem 2rem;
    border-radius: 25px;
    border: 1px solid var(--main-card-border);
    background-color: var(--main-card-background);
    color: var(--main-font-color);
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: var(--main-color);
      color: var(--main-color);
    }
  }
}

// 响应式
@media (max-width: 1300px) {
  .moment-waterfall {
    gap: 0.8rem;
  }
}

@media (max-width: 768px) {
  #moment-page {
    padding: 0.5rem;
  }

  .moment-tabs {
    gap: 0.5rem;

    .tab-item {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }
  }

  .moment-waterfall {
    gap: 0.5rem;
  }
}
</style>
