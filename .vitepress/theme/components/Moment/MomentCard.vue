<template>
  <div class="moment-card">
    <!-- 头部信息 -->
    <div class="moment-header" v-if="showMeta">
      <img
        class="avatar"
        :src="themeConfig.siteMeta.author.cover"
        :alt="themeConfig.siteMeta.author.name"
      />
      <div class="info">
        <span class="nickname">{{ themeConfig.siteMeta.author.name }}</span>
        <time class="datetime" :datetime="formatDate(data.date)">
          {{ formatRelativeTime(data.date) }}
        </time>
      </div>
      <a
        v-if="data.link"
        :href="data.link"
        target="_blank"
        class="source-link"
        title="查看原文"
      >
        <i class="iconfont icon-link"></i>
      </a>
    </div>

    <!-- 内容区域 -->
    <div class="moment-content">
      <!-- 文本内容 -->
      <div
        class="content-text"
        v-html="processedContent"
        @click="handleContentClick"
      ></div>

      <!-- 图片网格 -->
      <div v-if="data.images?.length > 0" class="content-images" :class="`layout-${imageLayout}`">
        <a
          v-for="(img, index) in displayedImages"
          :key="index"
          class="image-item img-fancybox"
          :href="img"
          :data-fancybox="`moment-${data.id}`"
          :data-caption="`图片 ${index + 1} / ${data.images.length}`"
        >
          <img :src="img" :alt="`图片 ${index + 1}`" loading="lazy" />
        </a>
        <a
          v-if="hasMoreImages"
          class="image-more img-fancybox"
          :href="data.images[maxDisplayImages]"
          :data-fancybox="`moment-${data.id}`"
          data-caption="查看更多图片"
        >
          <span>+{{ data.images.length - maxDisplayImages }}</span>
        </a>
        <!-- 隐藏链接，用于加载剩余图片到灯箱 -->
        <a
          v-for="(img, index) in hiddenImages"
          :key="`hidden-${index}`"
          class="img-fancybox hidden"
          :href="img"
          :data-fancybox="`moment-${data.id}`"
          :data-caption="`图片 ${maxDisplayImages + index + 1} / ${data.images.length}`"
        >
          <img :src="img" alt="" />
        </a>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="moment-footer" v-if="showFooter">
      <div class="footer-left">
        <span class="footer-item" v-if="data.date">
          <i class="iconfont icon-calendar"></i>
          {{ formatDate(data.date) }}
        </span>
        <span class="footer-item" v-if="data.location">
          <i class="iconfont icon-location"></i>
          {{ data.location }}
        </span>
      </div>
      <div class="footer-right">
        <button
          v-if="type !== 'jike'"
          class="reply-btn"
          @click="handleReply"
          title="回复"
        >
          <i class="iconfont icon-comment"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { themeConfig } from '@/assets/themeConfig.mjs';

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  type: {
    type: String,
    default: 'memos',
  },
  showMeta: {
    type: Boolean,
    default: true,
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['tag-click', 'reply']);

// 处理内容
const processedContent = computed(() => {
  let content = props.data.content || '';

  // 处理 Memos 的标签格式 #tag
  if (props.type === 'memos') {
    content = content.replace(/#(\S+)/g, (match, tag) => {
      return `<span class="content-tag" data-tag="${tag}">#${tag}</span>`;
    });
  }

  // 处理 TGTalk 的标签链接
  if (props.type === 'tgtalk') {
    content = content.replace(
      /<a href="\?q=%23[^"]*">#([^<]*)<\/a>/g,
      '<span class="content-tag" data-tag="$1">#$1</span>'
    );
  }

  // 自动识别链接
  content = content.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener">$1</a>'
  );

  return content;
});

// 图片布局
const imageLayout = computed(() => {
  const count = props.data.images?.length || 0;
  if (count === 1) return 1;
  if (count === 2 || count === 4) return 2;
  return 3;
});

// 最多显示的图片数量
const maxDisplayImages = 9;

// 显示的图片
const displayedImages = computed(() => {
  return props.data.images?.slice(0, maxDisplayImages) || [];
});

// 是否有更多图片
const hasMoreImages = computed(() => {
  return props.data.images?.length > maxDisplayImages;
});

// 隐藏的图片（用于灯箱）
const hiddenImages = computed(() => {
  return props.data.images?.slice(maxDisplayImages + 1) || [];
});

// 格式化日期
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// 格式化相对时间
const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diff = now - d;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < week) return `${Math.floor(diff / day)} 天前`;
  if (diff < month) return `${Math.floor(diff / week)} 周前`;
  if (diff < year) return `${Math.floor(diff / month)} 个月前`;
  return `${Math.floor(diff / year)} 年前`;
};

// 处理内容点击（标签点击）
const handleContentClick = (e) => {
  const tagEl = e.target.closest('.content-tag');
  if (tagEl) {
    const tag = tagEl.dataset.tag;
    if (tag) {
      emit('tag-click', tag);
    }
  }
};

// 处理回复
const handleReply = () => {
  emit('reply', props.data);
};
</script>

<style lang="scss" scoped>
.moment-card {
  background-color: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s;
  box-shadow: var(--main-border-shadow);

  &:hover {
    border-color: var(--main-color);
    box-shadow: 0 8px 16px -4px var(--main-border-shadow);
  }
}

// 头部
.moment-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
  position: relative;

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 0.8rem;
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;

    .nickname {
      font-weight: 600;
      color: var(--main-font-color);
      font-size: 0.95rem;
    }

    .datetime {
      font-size: 0.8rem;
      color: var(--main-font-second-color);
      margin-top: 2px;
    }
  }

  .source-link {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: var(--main-card-second-background);
    color: var(--main-font-second-color);
    transition: all 0.3s;

    &:hover {
      background-color: var(--main-color);
      color: #fff;
    }

    .iconfont {
      font-size: 0.9rem;
    }
  }
}

// 内容
.moment-content {
  .content-text {
    color: var(--main-font-color);
    font-size: 0.95rem;
    line-height: 1.6;
    word-break: break-word;

    :deep(.content-tag) {
      color: var(--main-color);
      cursor: pointer;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }

    :deep(a) {
      color: var(--main-color);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    :deep(br) {
      display: block;
      content: '';
      margin: 0.3rem 0;
    }
  }

  // 图片网格
  .content-images {
    margin-top: 0.8rem;
    display: grid;
    gap: 0.4rem;

    &.layout-1 {
      grid-template-columns: 1fr;

      .image-item {
        aspect-ratio: 16/9;
      }
    }

    &.layout-2 {
      grid-template-columns: repeat(2, 1fr);

      .image-item {
        aspect-ratio: 1;
      }
    }

    &.layout-3 {
      grid-template-columns: repeat(3, 1fr);

      .image-item {
        aspect-ratio: 1;
      }
    }

    .image-item {
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      position: relative;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
      }

      &:hover img {
        transform: scale(1.05);
      }
    }

    .image-more {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.5);
      color: #fff;
      font-size: 1.2rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      aspect-ratio: 1;
      text-decoration: none;

      &:hover {
        background-color: rgba(0, 0, 0, 0.7);
      }
    }

    .hidden {
      display: none;
    }
  }
}

// 底部
.moment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px dashed var(--main-card-border);

  .footer-left {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;

    .footer-item {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.8rem;
      color: var(--main-font-second-color);

      .iconfont {
        font-size: 0.9rem;
      }
    }
  }

  .footer-right {
    .reply-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: none;
      background-color: transparent;
      color: var(--main-font-second-color);
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: var(--main-color-bg);
        color: var(--main-color);
      }

      .iconfont {
        font-size: 1rem;
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .moment-card {
    padding: 0.8rem;
  }

  .moment-header {
    .avatar {
      width: 36px;
      height: 36px;
    }

    .info {
      .nickname {
        font-size: 0.9rem;
      }
    }
  }

  .moment-content {
    .content-text {
      font-size: 0.9rem;
    }

    .content-images {
      gap: 0.3rem;

      &.layout-3 {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}
</style>
