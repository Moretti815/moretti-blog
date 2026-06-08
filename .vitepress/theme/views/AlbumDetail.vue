<!-- 相册详情页面 -->
<template>
  <div class="album-detail-page">
    <!-- 顶部横幅 -->
    <div
      v-if="currentAlbum"
      class="album-detail-hero"
      :style="heroStyle"
    >
      <div class="card-content">
        <div class="album-detail-tips">相册集</div>
        <h1 class="album-detail-title">{{ currentAlbum.class_name }}</h1>
        <div class="content-bottom">
          <p class="tips">{{ currentAlbum.description }}</p>
        </div>
        <div class="banner-button-group">
          <a class="banner-button" href="/pages/albums.html">
            <i class="iconfont icon-arrow-left"></i>
            <span>返回相册</span>
          </a>
        </div>
      </div>
    </div>

    <!-- 相册内容列表 -->
    <div v-if="currentAlbum" class="album-content-list">
      <div
        v-for="(item, index) in currentAlbum.album_list"
        :key="index"
        class="album-item"
      >
        <div class="album-content">
          <!-- 文字内容 -->
          <p v-if="item.content" class="datacont">{{ item.content }}</p>

          <!-- 图片网格 -->
          <div v-if="item.image && item.image.length" class="album-container-img">
            <a
              v-for="(img, imgIndex) in item.image"
              :key="imgIndex"
              class="album-content-img"
              :href="img"
              data-fancybox="album-gallery"
              :data-caption="item.content || '相册图片'"
            >
              <img :src="img" :alt="item.content || '相册图片'" loading="lazy" />
            </a>
            <!-- 填充空位 -->
            <div
              v-for="n in (2 - (item.image.length % 2)) % 2"
              :key="`empty-img-${n}`"
              class="album-content-noimg"
            ></div>
          </div>

          <!-- 音乐播放器 -->
          <div v-if="item.aplayer" class="album-music">
            <MusicPlayer
              :id="item.aplayer.id"
              :server="item.aplayer.server"
              type="song"
            />
          </div>
        </div>

        <hr class="album-divider" />

        <!-- 底部信息 -->
        <div class="album-bottom">
          <div class="album-info">
            <div v-if="item.date" class="album-info-time">
              <i class="iconfont icon-time"></i>
              <time :datetime="item.date">{{ formatDate(item.date) }}</time>
            </div>
            <a
              v-if="item.link"
              class="album-content-link"
              :href="item.link"
              target="_blank"
              rel="external nofollow"
              title="跳转到链接"
            >
              <i class="iconfont icon-link"></i>
              <span>链接</span>
            </a>
            <div v-if="item.address" class="album-info-address">
              <i class="iconfont icon-location"></i>
              <span>{{ item.address }}</span>
            </div>
            <div v-if="item.from" class="album-info-from">
              <i class="iconfont icon-fire"></i>
              <span>{{ item.from }}</span>
            </div>
          </div>
          <div
            v-if="item.content"
            class="album-reply"
            @click="copyToComment(item.content)"
            title="引用到评论"
          >
            <i class="iconfont icon-message"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="album-empty">
      <i class="iconfont icon-image"></i>
      <p>相册不存在或暂无内容</p>
      <a href="/pages/albums.html" class="back-link">返回相册列表</a>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, nextTick } from 'vue';
import { useData } from 'vitepress';
import albumData from '../assets/albumData.mjs';
import MusicPlayer from '../components/MusicPlayer.vue';
import initFancybox from '../utils/initFancybox.mjs';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});

const { theme } = useData();

// 当前相册
const currentAlbum = computed(() => {
  return albumData.find(album => album.path_name === props.name);
});

// 顶部横幅样式
const heroStyle = computed(() => {
  const bg = currentAlbum.value?.top_background;
  return bg ? { background: `url(${bg}) top / cover no-repeat` } : {};
});

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// 复制内容到评论
const copyToComment = (content) => {
  // 触发评论组件的填充方法
  const event = new CustomEvent('fill-comment', { detail: content });
  window.dispatchEvent(event);
};

// 初始化 Fancybox
onMounted(() => {
  nextTick(() => {
    initFancybox(theme.value);
  });
});
</script>

<style lang="scss" scoped>
.album-detail-page {
  width: 100%;
  animation: fade-up 0.6s 0.1s backwards;
}

/* 顶部横幅 */
.album-detail-hero {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, var(--main-color) 0%, var(--main-color-dark) 100%);
  margin-bottom: 2rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
  }

  .card-content {
    position: relative;
    z-index: 1;
    text-align: center;
    color: white;
    padding: 2rem;
  }

  .album-detail-tips {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .album-detail-title {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .content-bottom {
    .tips {
      font-size: 1rem;
      opacity: 0.9;
      margin-bottom: 1.5rem;
    }
  }

  .banner-button-group {
    display: flex;
    justify-content: center;
    gap: 1rem;

    .banner-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 30px;
      color: white;
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
      }

      i {
        font-size: 1.2rem;
      }
    }
  }
}

/* 相册内容列表 */
.album-content-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1rem;
}

.album-item {
  width: calc(33.333% - 1rem);
  border: 1px solid var(--main-card-border);
  border-radius: 12px;
  padding: 1rem;
  background: var(--main-card-background);
  box-shadow: var(--main-border-shadow);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: var(--main-color);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px -4px var(--main-border-shadow);
  }
}

.album-content {
  flex: 1;

  .datacont {
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--main-font-color);
    margin-bottom: 1rem;
    text-align: justify;
  }
}

/* 图片网格 */
.album-container-img {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 0.5rem;

  .album-content-noimg {
    width: calc(50% - 4px);
  }
}

.album-content-img {
  width: calc(50% - 4px);
  border-radius: 8px;
  overflow: hidden;
  display: block;
  position: relative;

  img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
}

/* 音乐播放器 */
.album-music {
  width: 100%;
  margin: 0.5rem 0;
  border-radius: 8px;
  overflow: hidden;
  background: var(--main-card-second-background);
}

/* 分隔线 */
.album-divider {
  border: none;
  border-top: 1px dashed var(--main-card-border);
  margin: 1rem 0;
}

/* 底部信息 */
.album-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.album-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  flex: 1;
}

.album-info-time,
.album-info-address,
.album-info-from {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--main-font-second-color);
  background: var(--main-card-second-background);
  padding: 4px 10px;
  border-radius: 20px;

  i {
    font-size: 0.8rem;
  }
}

.album-content-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--main-color);
  background: rgba(var(--main-color-rgb), 0.1);
  padding: 4px 10px;
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    background: var(--main-color);
    color: white;
  }

  i {
    font-size: 0.8rem;
  }
}

.album-reply {
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: var(--main-font-second-color);

  &:hover {
    background: var(--main-card-second-background);
    color: var(--main-color);
  }

  i {
    font-size: 1.2rem;
  }
}

/* 空状态 */
.album-empty {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--main-font-second-color);

  i {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }

  .back-link {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: var(--main-color);
    color: white;
    border-radius: 30px;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }
  }
}

/* 响应式 */
@media (max-width: 1200px) {
  .album-item {
    width: calc(50% - 0.75rem);
  }
}

@media (max-width: 768px) {
  .album-detail-hero {
    height: 350px;

    .album-detail-title {
      font-size: 2rem;
    }
  }

  .album-item {
    width: 100%;
  }

  .album-content-img {
    img {
      height: 120px;
    }
  }
}

@media (max-width: 600px) {
  .album-detail-hero {
    height: 300px;

    .album-detail-title {
      font-size: 1.5rem;
    }

    .banner-button-group {
      .banner-button {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
      }
    }
  }

  .album-info {
    gap: 0.3rem;
  }

  .album-info-time,
  .album-info-address,
  .album-info-from,
  .album-content-link {
    font-size: 0.7rem;
    padding: 3px 8px;
  }
}

/* 夜间模式 */
:global([data-theme="dark"]) {
  .album-detail-hero {
    &::before {
      background: rgba(0, 0, 0, 0.5);
    }
  }
}
</style>
