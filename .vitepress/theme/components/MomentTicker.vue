<template>
  <div id="moment-ticker" v-if="isClient && items.length > 0">
    <svg class="ticker-logo" @click="goToMoment" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M232 144C218.7 144 208 154.7 208 168L208 472C208 480.4 206.6 488.5 203.9 496L504 496C517.3 496 528 485.3 528 472L528 168C528 154.7 517.3 144 504 144L232 144zM136 544C96.2 544 64 511.8 64 472L64 176C64 162.7 74.7 152 88 152C101.3 152 112 162.7 112 176L112 472C112 485.3 122.7 496 136 496C149.3 496 160 485.3 160 472L160 168C160 128.2 192.2 96 232 96L504 96C543.8 96 576 128.2 576 168L576 472C576 511.8 543.8 544 504 544L136 544zM256 216C256 202.7 266.7 192 280 192L328 192C341.3 192 352 202.7 352 216L352 264C352 277.3 341.3 288 328 288L280 288C266.7 288 256 277.3 256 264L256 216zM408 240L456 240C469.3 240 480 250.7 480 264C480 277.3 469.3 288 456 288L408 288C394.7 288 384 277.3 384 264C384 250.7 394.7 240 408 240zM280 320L456 320C469.3 320 480 330.7 480 344C480 357.3 469.3 368 456 368L280 368C266.7 368 256 357.3 256 344C256 330.7 266.7 320 280 320zM280 400L456 400C469.3 400 480 410.7 480 424C480 437.3 469.3 448 456 448L280 448C266.7 448 256 437.3 256 424C256 410.7 266.7 400 280 400z"/></svg>
    <i class="iconfont icon-memo ticker-icon" @click="goToMoment"></i>
    <div class="ticker-wrapper" @click="goToMoment">
      <div class="ticker-content" :style="contentStyle">
        <div class="ticker-item">
          <span v-if="currentItem.tag" class="item-tag">#{{ currentItem.tag }}</span>
          <span class="item-text">{{ currentItem.snippet }}</span>
          <span v-if="currentItem.hasImage" class="item-badge">
            <i class="iconfont icon-image"></i>
          </span>
          <span v-if="currentItem.hasVideo" class="item-badge">
            <i class="iconfont icon-video"></i>
          </span>
          <span v-if="currentItem.hasMusic" class="item-badge">
            <i class="iconfont icon-music"></i>
          </span>
          <span v-if="currentItem.hasLink" class="item-badge">
            <i class="iconfont icon-link"></i>
          </span>
        </div>
      </div>
    </div>
    <i class="iconfont icon-right ticker-arrow" @click="goToMoment"></i>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { themeConfig } from '@/assets/themeConfig.mjs';

const items = ref([]);
const currentIndex = ref(0);
let intervalId = null;
const isTransitioning = ref(false);
const isClient = ref(false);

// 从配置读取数据源
const dataSource = themeConfig.momentTicker?.source || 'memos';
const maxItems = themeConfig.momentTicker?.limit || 5;

// 获取数据
const fetchData = async () => {
  try {
    switch (dataSource) {
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
      default:
        await fetchMemos();
    }
  } catch (err) {
    console.error('获取说说数据失败:', err);
  }
};

// 提取标签
const extractTag = (content) => {
  if (!content) return null;
  const match = content.match(/#(\S+)/);
  return match ? match[1] : null;
};

// Memos 数据
const fetchMemos = async () => {
  const response = await fetch('https://m.314926.xyz/api/v1/memos');
  const data = await response.json();

  if (!data.memos) return;

  items.value = data.memos.slice(0, maxItems).map(memo => {
    const tag = extractTag(memo.content);
    // 移除标签后的内容
    let cleanContent = memo.content?.replace(/#\S+\s*/g, '').trim() || '';
    cleanContent = cleanContent.replace(/<[^>]+>/g, '').slice(0, 60);

    return {
      id: memo.name,
      content: memo.content,
      snippet: cleanContent,
      tag: tag,
      hasImage: memo.attachments?.some(a => a.type?.startsWith('image/')),
      hasVideo: memo.attachments?.some(a => a.type?.startsWith('video/')),
      hasMusic: false,
      hasLink: /https?:\/\/[^\s]+/.test(memo.content),
      date: memo.displayTime || memo.createTime,
    };
  });
};

// Jike RSS 数据
const fetchJike = async () => {
  const response = await fetch(
    'https://rsshub-api.2005815.xyz/?url=https://rsshub.261770.xyz/jike/user/07152f0c-0f65-4501-855b-031f3e20e4a5'
  );
  const xmlText = await response.text();

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) return;

  const rssItems = xmlDoc.querySelectorAll('item');
  if (rssItems.length === 0) return;

  items.value = Array.from(rssItems).slice(0, maxItems).map((item, index) => {
    const description = item.querySelector('description')?.textContent || '';
    const hasImage = /<img[^>]+src="([^"]+)"/.test(description);
    let cleanContent = description.replace(/<[^>]+>/g, '').trim();

    return {
      id: `jike-${index}`,
      content: cleanContent,
      snippet: cleanContent.slice(0, 60),
      tag: null,
      hasImage: hasImage,
      hasVideo: false,
      hasMusic: false,
      hasLink: false,
      date: item.querySelector('pubDate')?.textContent,
    };
  });
};

// TGTalk 数据
const fetchTGTalk = async () => {
  const response = await fetch('https://tgtalk.kemiaosw.top/');
  const data = await response.json();

  if (!data.data) return;

  items.value = data.data.slice(0, maxItems).map(item => {
    let content = item.text || '';
    // 提取标签
    const tag = extractTag(content);
    // 移除 emoji 图片标签
    content = content.replace(/<i class="emoji"[^>]*>.*?<\/i>/g, '');
    content = content.replace(/<img[^>]*telegram\.org[^>]*>/g, '');
    // 移除标签链接
    content = content.replace(/<a href="\?q=%23[^"]*">#([^<]*)<\/a>/g, '');
    const cleanContent = content.replace(/<[^>]+>/g, '').trim();

    // 过滤掉 telegram 图片
    const hasRealImage = item.image?.some(img => !img.includes('telegram.org'));

    return {
      id: `tgtalk-${item.id}`,
      content: cleanContent,
      snippet: cleanContent.slice(0, 60),
      tag: tag,
      hasImage: hasRealImage,
      hasVideo: false,
      hasMusic: false,
      hasLink: /https?:\/\/[^\s]+/.test(content),
      date: item.time,
    };
  });
};

// Mastodon 数据
const fetchMastodon = async () => {
  const apiUrl = themeConfig.moment?.mastodon?.apiUrl || 'https://mastodon-api.20050815.xyz/';
  const response = await fetch(apiUrl);
  const data = await response.json();

  if (!data.success || !data.data) return;

  const baseUrl = apiUrl.replace(/\/$/, '');

  items.value = data.data.slice(0, maxItems).map(item => {
    const content = item.text || '';
    const tag = extractTag(content);
    const cleanContent = content.replace(/#\S+\s*/g, '').trim();
    const hasImage = (item.image || []).length > 0;
    const hasLink = /https?:\/\/[^\s]+/.test(content);

    return {
      id: `mastodon-${item.id}`,
      content: content,
      snippet: cleanContent.slice(0, 60),
      tag: tag,
      hasImage: hasImage,
      hasVideo: false,
      hasMusic: false,
      hasLink: hasLink,
      date: item.time,
    };
  });
};

// 当前显示的项目
const currentItem = computed(() => {
  if (items.value.length === 0) return {};
  return items.value[currentIndex.value];
});

// 内容样式（用于过渡动画）
const contentStyle = computed(() => {
  return {
    opacity: isTransitioning.value ? 0 : 1,
    transform: isTransitioning.value ? 'translateY(10px)' : 'translateY(0)',
    transition: 'all 0.3s ease',
  };
});

// 开始自动滚动
const startTicker = () => {
  if (intervalId) clearInterval(intervalId);
  if (items.value.length <= 1) return;

  intervalId = setInterval(() => {
    isTransitioning.value = true;
    setTimeout(() => {
      currentIndex.value = (currentIndex.value + 1) % items.value.length;
      isTransitioning.value = false;
    }, 300);
  }, 4000); // 每4秒切换一次
};

// 跳转到说说页面
const goToMoment = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/pages/moment';
  }
};

onMounted(() => {
  // 标记为客户端环境
  isClient.value = true;

  // 获取数据并启动滚动
  fetchData().then(() => {
    startTicker();
  });
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style lang="scss" scoped>
#moment-ticker {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0.5rem auto;
  padding: 0.5rem 1rem;
  background-color: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  border-radius: 12px;
  backdrop-filter: blur(15px);
  transition: all 0.3s;
  user-select: none;

  &:hover {
    border-color: var(--main-color);
    box-shadow: var(--main-border-shadow);
  }
}

.ticker-logo {
  width: 1.2rem;
  height: 1.2rem;
  margin-right: 0.5rem;
  fill: var(--main-color);
  cursor: pointer;
  transition: opacity 0.3s;
  flex-shrink: 0;
  animation: bounce 1s infinite;

  &:hover {
    opacity: 0.8;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.ticker-icon {
  font-size: 1.2rem;
  margin-right: 0.8rem;
  color: var(--main-color);
  cursor: pointer;
  transition: opacity 0.3s;
  flex-shrink: 0;

  &:hover {
    opacity: 0.8;
  }
}

.ticker-wrapper {
  flex: 1;
  overflow: hidden;
  height: 24px;
  line-height: 24px;
  cursor: pointer;
  position: relative;
}

.ticker-content {
  display: flex;
  flex-direction: column;
}

.ticker-item {
  display: flex;
  align-items: center;
  height: 24px;
  min-height: 24px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--main-font-color);
  font-size: 0.9rem;
  padding-left: 4px;

  .item-tag {
    color: var(--main-color);
    font-weight: 500;
    margin-right: 0.4rem;
    flex-shrink: 0;
  }

  .item-text {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-badge {
    display: inline-flex;
    align-items: center;
    margin-left: 0.4rem;
    color: var(--main-font-second-color);
    font-size: 0.8rem;
    flex-shrink: 0;

    .iconfont {
      font-size: 0.85rem;
    }
  }
}

.ticker-arrow {
  font-size: 1rem;
  margin-left: 0.8rem;
  color: var(--main-font-second-color);
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;

  &:hover {
    color: var(--main-color);
    transform: translateX(2px);
  }
}

// 悬停时暂停切换
#moment-ticker:hover .ticker-content {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

// 响应式
@media (max-width: 768px) {
  #moment-ticker {
    padding: 0.4rem 0.8rem;
    margin: 0.5rem;
    width: calc(100% - 1rem);
  }

  .ticker-icon {
    font-size: 1rem;
    margin-right: 0.5rem;
  }

  .ticker-wrapper {
    height: 22px;
    line-height: 22px;
  }

  .ticker-item {
    height: 22px;
    font-size: 0.85rem;
  }

  .ticker-arrow {
    font-size: 0.9rem;
    margin-left: 0.5rem;
  }
}
</style>
