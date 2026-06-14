<template>
  <div class="moment-card" :class="{ 'is-ad': data.isAd, 'is-top': data.isTop }">
    <!-- 徽标 -->
    <div class="moment-badges" v-if="data.isTop || data.isAd">
      <span v-if="data.isTop" class="badge badge-top">
        <i class="iconfont icon-pin"></i> 置顶
      </span>
      <span v-if="data.isAd" class="badge badge-ad">
        <i class="iconfont icon-ad"></i> 广告
      </span>
    </div>

    <!-- 头部信息 -->
    <div class="moment-header" v-if="showMeta">
      <img
        class="avatar"
        :src="data.author?.avatar || themeConfig.siteMeta.author.cover"
        :alt="data.author?.name || themeConfig.siteMeta.author.name"
      />
      <div class="info">
        <span class="nickname">{{ data.author?.name || themeConfig.siteMeta.author.name }}</span>
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
      <!-- 标签 -->
      <div v-if="data.tags?.length > 0 && type === 'memo'" class="content-tags">
        <span
          v-for="tag in data.tags"
          :key="tag"
          class="tag-chip"
          @click="emit('tag-click', tag)"
        >
          #{{ tag }}
        </span>
      </div>

      <!-- 文本内容 -->
      <div
        class="content-text"
        v-html="processedContent"
        @click="handleContentClick"
      ></div>

      <!-- 视频 -->
      <div v-if="data.video" class="content-video">
        <video
          v-if="isVideoUrl(data.video)"
          :src="data.video"
          controls
          preload="metadata"
          class="video-player"
        ></video>
        <iframe
          v-else
          :src="getEmbedUrl(data.video)"
          class="video-embed"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>

      <!-- 图片网格（memo 类型的内容已含 <img>，不再重复渲染） -->
      <div v-if="data.images?.length > 0 && type !== 'memo'" class="content-images" :class="`layout-${imageLayout}`">
        <template v-if="!isClient">
          <div
            v-for="(img, index) in displayedImages"
            :key="index"
            class="image-item"
          >
            <img :src="img" :alt="`图片 ${index + 1}`" loading="lazy" />
          </div>
        </template>
        <template v-else>
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
        </template>
      </div>

      <!-- 音乐 -->
      <div v-if="data.music?.length > 0" class="content-music">
        <div v-for="(track, idx) in data.music" :key="idx" class="music-track">
          <img v-if="track.cover" :src="track.cover" class="music-cover" />
          <div class="music-info">
            <span class="music-name">{{ track.name || track.title || '未知歌曲' }}</span>
            <span class="music-artist">{{ track.artist || track.author || '' }}</span>
          </div>
          <audio
            v-if="track.url"
            :src="track.url"
            controls
            class="music-player"
          ></audio>
        </div>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="moment-footer" v-if="showFooter">
      <div class="footer-left">
        <span class="footer-item" v-if="data.date">
          <i class="iconfont icon-calendar"></i>
          {{ formatDate(data.date) }}
        </span>
        <span
          class="footer-item footer-location"
          v-if="data.position?.name"
          :title="data.position.name"
        >
          <i class="iconfont icon-location"></i>
          <a v-if="data.position.url" :href="data.position.url" target="_blank" rel="noopener">
            {{ data.position.name }}
          </a>
          <template v-else>{{ data.position.name }}</template>
        </span>
        <span class="footer-item" v-if="data.views !== undefined && type === 'memo'">
          <span class="iconify" data-icon="hugeicons:view"></span>
          {{ data.views }}
        </span>
        <span class="footer-item" v-if="data.likesCount !== undefined && type === 'memo'">
          <span class="iconify" data-icon="mdi-light:heart"></span>
          {{ data.likesCount }}
        </span>
        <span class="footer-item" v-if="data.commentsCount !== undefined && type === 'memo'">
          <span class="iconify" data-icon="mdi-light:comment"></span>
          {{ data.commentsCount }}
        </span>
      </div>
      <div class="footer-right">
        <button
          v-if="type !== 'jike' && type !== 'mastodon'"
          class="reply-btn"
          @click="handleReply"
          title="回复"
        >
          <i class="iconfont icon-comment"></i>
        </button>
      </div>
    </div>

    <!-- 评论区 -->
    <div v-if="data.comments?.length > 0 && type === 'memo'" class="moment-comments">
      <div class="comments-title">评论 ({{ data.comments.length }})</div>
      <div v-for="comment in data.comments" :key="comment.coid" class="comment-item">
        <img
          v-if="comment.mail"
          :src="getCommentAvatar(comment)"
          class="comment-avatar"
        />
        <span v-else class="comment-avatar-placeholder"></span>
        <div class="comment-body">
          <div class="comment-meta">
            <span class="comment-author">
              <a v-if="comment.url" :href="comment.url" target="_blank" rel="noopener">
                {{ comment.author }}
              </a>
              <template v-else>{{ comment.author }}</template>
            </span>
            <span class="comment-time">{{ formatRelativeTime(comment.created * 1000) }}</span>
          </div>
          <div class="comment-text">{{ comment.text }}</div>
          <div v-if="comment.replies?.length > 0" class="comment-replies">
            <div v-for="reply in comment.replies" :key="reply.coid" class="reply-item">
              <span class="reply-author">{{ reply.author }}</span>
              <span class="reply-colon">:</span>
              <span class="reply-text">{{ reply.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { themeConfig } from '@/assets/themeConfig.mjs';

// 客户端检测
const isClient = ref(false);

onMounted(() => {
  isClient.value = true;
});

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

// 判断是否为直接视频 URL
const isVideoUrl = (url) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|avi)$/i.test(url);
};

// 获取嵌入 URL（Bilibili / YouTube 等）
const getEmbedUrl = (url) => {
  if (!url) return '';
  // Bilibili
  const bvMatch = url.match(/(?:bilibili\.com\/video\/|b23\.tv\/)(BV\w+)/i);
  if (bvMatch) return `//player.bilibili.com/player.html?bvid=${bvMatch[1]}&autoplay=0`;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `//www.youtube.com/embed/${ytMatch[1]}?autoplay=0`;
  // 默认直接嵌入
  return url;
};

// MD5 用于 Gravatar 头像
const md5 = (s) => {
  const hex = (v) => '0123456789abcdef'.charAt(v);
  const str2blks = (s) => {
    const blks = []; let nblk = ((s.length + 8) >> 6) + 1;
    for (let i = 0; i < nblk * 16; i++) blks[i] = 0;
    for (let i = 0; i < s.length; i++) blks[i >> 2] |= s.charCodeAt(i) << ((i % 4) * 8);
    blks[s.length >> 2] |= 0x80 << ((s.length % 4) * 8);
    blks[nblk * 16 - 2] = s.length * 8;
    return blks;
  };
  const add = (x, y) => { const l = (x & 0xffff) + (y & 0xffff); return (x >> 16) + (y >> 16) + (l >> 16) << 16 | l & 0xffff; };
  const rol = (n, c) => n << c | n >>> (32 - c);
  const cmn = (q, a, b, x, s, t) => add(rol(add(add(a, q), add(x, t)), s), b);
  const ff = (a, b, c, d, x, s, t) => cmn(b & c | ~b & d, a, b, x, s, t);
  const gg = (a, b, c, d, x, s, t) => cmn(b & d | c & ~d, a, b, x, s, t);
  const hh = (a, b, c, d, x, s, t) => cmn(b ^ c ^ d, a, b, x, s, t);
  const ii = (a, b, c, d, x, s, t) => cmn(c ^ (b | ~d), a, b, x, s, t);
  const ue = encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, (_, h) => String.fromCharCode('0x' + h));
  const x = str2blks(ue);
  let [a, b, c, d] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
  for (let i = 0; i < x.length; i += 16) {
    const [aa, bb, cc, dd] = [a, b, c, d];
    a = ff(a, b, c, d, x[i + 0], 7, 0xd76aa478); d = ff(d, a, b, c, x[i + 1], 12, 0xe8c7b756); c = ff(c, d, a, b, x[i + 2], 17, 0x242070db); b = ff(b, c, d, a, x[i + 3], 22, 0xc1bdceee);
    a = ff(a, b, c, d, x[i + 4], 7, 0xf57c0faf); d = ff(d, a, b, c, x[i + 5], 12, 0x4787c62a); c = ff(c, d, a, b, x[i + 6], 17, 0xa8304613); b = ff(b, c, d, a, x[i + 7], 22, 0xfd469501);
    a = ff(a, b, c, d, x[i + 8], 7, 0x698098d8); d = ff(d, a, b, c, x[i + 9], 12, 0x8b44f7af); c = ff(c, d, a, b, x[i + 10], 17, 0xffff5bb1); b = ff(b, c, d, a, x[i + 11], 22, 0x895cd7be);
    a = ff(a, b, c, d, x[i + 12], 7, 0x6b901122); d = ff(d, a, b, c, x[i + 13], 12, 0xfd987193); c = ff(c, d, a, b, x[i + 14], 17, 0xa679438e); b = ff(b, c, d, a, x[i + 15], 22, 0x49b40821);
    a = gg(a, b, c, d, x[i + 1], 5, 0xf61e2562); d = gg(d, a, b, c, x[i + 6], 9, 0xc040b340); c = gg(c, d, a, b, x[i + 11], 14, 0x265e5a51); b = gg(b, c, d, a, x[i + 0], 20, 0xe9b6c7aa);
    a = gg(a, b, c, d, x[i + 5], 5, 0xd62f105d); d = gg(d, a, b, c, x[i + 10], 9, 0x02441453); c = gg(c, d, a, b, x[i + 15], 14, 0xd8a1e681); b = gg(b, c, d, a, x[i + 4], 20, 0xe7d3fbc8);
    a = gg(a, b, c, d, x[i + 9], 5, 0x21e1cde6); d = gg(d, a, b, c, x[i + 14], 9, 0xc33707d6); c = gg(c, d, a, b, x[i + 3], 14, 0xf4d50d87); b = gg(b, c, d, a, x[i + 8], 20, 0x455a14ed);
    a = gg(a, b, c, d, x[i + 13], 5, 0xa9e3e905); d = gg(d, a, b, c, x[i + 2], 9, 0xfcefa3f8); c = gg(c, d, a, b, x[i + 7], 14, 0x676f02d9); b = gg(b, c, d, a, x[i + 12], 20, 0x8d2a4c8a);
    a = hh(a, b, c, d, x[i + 5], 4, 0xfffa3942); d = hh(d, a, b, c, x[i + 8], 11, 0x8771f681); c = hh(c, d, a, b, x[i + 11], 16, 0x6d9d6122); b = hh(b, c, d, a, x[i + 14], 23, 0xfde5380c);
    a = hh(a, b, c, d, x[i + 1], 4, 0xa4beea44); d = hh(d, a, b, c, x[i + 4], 11, 0x4bdecfa9); c = hh(c, d, a, b, x[i + 7], 16, 0xf6bb4b60); b = hh(b, c, d, a, x[i + 10], 23, 0xbebfbc70);
    a = hh(a, b, c, d, x[i + 13], 4, 0x289b7ec6); d = hh(d, a, b, c, x[i + 0], 11, 0xeaa127fa); c = hh(c, d, a, b, x[i + 3], 16, 0xd4ef3085); b = hh(b, c, d, a, x[i + 6], 23, 0x04881d05);
    a = hh(a, b, c, d, x[i + 9], 4, 0xd9d4d039); d = hh(d, a, b, c, x[i + 12], 11, 0xe6db99e5); c = hh(c, d, a, b, x[i + 15], 16, 0x1fa27cf8); b = hh(b, c, d, a, x[i + 2], 23, 0xc4ac5665);
    a = ii(a, b, c, d, x[i + 0], 6, 0xf4292244); d = ii(d, a, b, c, x[i + 7], 10, 0x432aff97); c = ii(c, d, a, b, x[i + 14], 15, 0xab9423a7); b = ii(b, c, d, a, x[i + 5], 21, 0xfc93a039);
    a = ii(a, b, c, d, x[i + 12], 6, 0x655b59c3); d = ii(d, a, b, c, x[i + 3], 10, 0x8f0ccc92); c = ii(c, d, a, b, x[i + 10], 15, 0xffeff47d); b = ii(b, c, d, a, x[i + 1], 21, 0x85845dd1);
    a = ii(a, b, c, d, x[i + 8], 6, 0x6fa87e4f); d = ii(d, a, b, c, x[i + 15], 10, 0xfe2ce6e0); c = ii(c, d, a, b, x[i + 6], 15, 0xa3014314); b = ii(b, c, d, a, x[i + 13], 21, 0x4e0811a1);
    a = ii(a, b, c, d, x[i + 4], 6, 0xf7537e82); d = ii(d, a, b, c, x[i + 11], 10, 0xbd3af235); c = ii(c, d, a, b, x[i + 2], 15, 0x2ad7d2bb); b = ii(b, c, d, a, x[i + 9], 21, 0xeb86d391);
    a = add(a, aa); b = add(b, bb); c = add(c, cc); d = add(d, dd);
  }
  return hex(a >> 4 & 0xf) + hex(a & 0xf) + hex(a >> 12 & 0xf) + hex(a >> 8 & 0xf) + hex(a >> 20 & 0xf) + hex(a >> 16 & 0xf) + hex(a >> 28 & 0xf) + hex(a >> 24 & 0xf) +
         hex(b >> 4 & 0xf) + hex(b & 0xf) + hex(b >> 12 & 0xf) + hex(b >> 8 & 0xf) + hex(b >> 20 & 0xf) + hex(b >> 16 & 0xf) + hex(b >> 28 & 0xf) + hex(b >> 24 & 0xf) +
         hex(c >> 4 & 0xf) + hex(c & 0xf) + hex(c >> 12 & 0xf) + hex(c >> 8 & 0xf) + hex(c >> 20 & 0xf) + hex(c >> 16 & 0xf) + hex(c >> 28 & 0xf) + hex(c >> 24 & 0xf) +
         hex(d >> 4 & 0xf) + hex(d & 0xf) + hex(d >> 12 & 0xf) + hex(d >> 8 & 0xf) + hex(d >> 20 & 0xf) + hex(d >> 16 & 0xf) + hex(d >> 28 & 0xf) + hex(d >> 24 & 0xf);
};

// 获取评论头像
const getCommentAvatar = (comment) => {
  if (comment.mail) {
    const hash = md5(comment.mail.trim().toLowerCase());
    return `https://www.weavatar.com/avatar/${hash}?s=40&d=identicon`;
  }
  return null;
};

// 处理内容
const processedContent = computed(() => {
  let content = props.data.content || '';

  // 移除 markdown 注释标记
  content = content.replace(/<!--markdown-->/g, '');

  // 处理 TGTalk 的标签链接
  if (props.type === 'tgtalk') {
    content = content.replace(
      /<a href="\?q=%23[^"]*">#([^<]*)<\/a>/g,
      '<span class="content-tag" data-tag="$1">#$1</span>'
    );
  }

  // 处理 Mastodon 和 Memos 的标签格式 #tag
  if (props.type === 'mastodon' || props.type === 'memos') {
    content = content.replace(/#(\S+)/g, (match, tag) => {
      return `<span class="content-tag" data-tag="${tag}">#${tag}</span>`;
    });
  }

  // 自动识别链接（排除 HTML 属性内的 URL，避免破坏已有标签）
  if (props.type !== 'memo') {
    content = content.replace(
      /(https?:\/\/[^\s<>"']+)/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>'
    );
  }

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
  if (!isClient.value) return formatDate(date);

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
// 徽标
.moment-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.6rem;

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.15rem 0.5rem;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 500;

    .iconfont {
      font-size: 0.75rem;
    }
  }

  .badge-top {
    background-color: #ffedd5;
    color: #c2410c;
  }

  .badge-ad {
    background-color: #fecaca;
    color: #b91c1c;
  }
}

// 标签
.content-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.5rem;

  .tag-chip {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    background-color: var(--main-color-bg);
    color: var(--main-color);
    border-radius: 10px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }
}

// 视频
.content-video {
  margin-top: 0.8rem;
  border-radius: 8px;
  overflow: hidden;

  .video-player {
    width: 100%;
    max-height: 400px;
    border-radius: 8px;
    background: #000;
  }

  .video-embed {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 8px;
  }
}

// 音乐
.content-music {
  margin-top: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .music-track {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.5rem;
    background-color: var(--main-card-second-background);
    border-radius: 8px;

    .music-cover {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .music-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;

      .music-name {
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--main-font-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .music-artist {
        font-size: 0.75rem;
        color: var(--main-font-second-color);
      }
    }

    .music-player {
      width: 120px;
      height: 32px;
      flex-shrink: 0;
    }
  }
}

// 底部位置链接
.footer-location {
  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

// 评论区
.moment-comments {
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--main-card-border);

  .comments-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--main-font-color);
    margin-bottom: 0.6rem;
  }

  .comment-item {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.6rem;

    .comment-avatar,
    .comment-avatar-placeholder {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .comment-avatar {
      object-fit: cover;
    }

    .comment-avatar-placeholder {
      background-color: var(--main-card-second-background);
    }

    .comment-body {
      flex: 1;
      min-width: 0;

      .comment-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.2rem;

        .comment-author {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--main-color);

          a {
            color: inherit;
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }

        .comment-time {
          font-size: 0.7rem;
          color: var(--main-font-second-color);
        }
      }

      .comment-text {
        font-size: 0.85rem;
        color: var(--main-font-color);
        line-height: 1.5;
      }

      .comment-replies {
        margin-top: 0.4rem;
        padding: 0.4rem;
        background-color: var(--main-card-second-background);
        border-radius: 6px;

        .reply-item {
          font-size: 0.8rem;
          line-height: 1.6;

          .reply-author {
            font-weight: 600;
            color: var(--main-color);
          }

          .reply-colon {
            color: var(--main-font-second-color);
          }

          .reply-text {
            color: var(--main-font-color);
          }
        }
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

    .content-video {
      .video-player {
        max-height: 250px;
      }
    }

    .content-music {
      .music-track {
        flex-wrap: wrap;

        .music-player {
          width: 100%;
        }
      }
    }
  }
}
</style>
