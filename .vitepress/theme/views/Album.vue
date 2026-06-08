<!-- 相册列表页面 -->
<template>
  <div class="album-page">
    <!-- 顶部横幅 -->
    <div class="album-hero" :style="heroStyle">
      <div class="card-content">
        <div class="album-tips">相册集</div>
        <h1 class="album-title">这里是我的相册集哦😯</h1>
        <div class="content-bottom">
          <p class="tips">每一张照片都是一次美好的记忆。</p>
        </div>
        <div class="banner-button-group">
          <a class="banner-button" href="/pages/about.html">
            <i class="iconfont icon-arrow-right"></i>
            <span>关于本人</span>
          </a>
        </div>
      </div>
    </div>

    <!-- 相册卡片列表 -->
    <div class="card-album">
      <div
        v-for="(album, index) in albumList"
        :key="index"
        class="card"
        @click="goToAlbum(album.path_name)"
      >
        <img class="card_cover" :src="album.cover" :alt="album.class_name" />
        <div class="card__content">
          <p class="card__category">{{ album.class_name }}</p>
          <h3 class="card__heading">{{ album.description }}</h3>
        </div>
      </div>
      <!-- 填充空位保持布局 -->
      <div v-for="n in emptySlots" :key="`empty-${n}`" class="album-content-nocover"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useData } from 'vitepress';
import albumData from '../assets/albumData.mjs';

const router = useRouter();
const { theme } = useData();

// 相册配置
const albumConfig = computed(() => theme.value.album || {});

// 相册列表
const albumList = computed(() => albumData || []);

// 计算需要填充的空位数量（保持4列布局）
const emptySlots = computed(() => {
  const remainder = albumList.value.length % 4;
  return remainder === 0 ? 0 : 4 - remainder;
});

// 顶部横幅样式
const heroStyle = computed(() => {
  const bg = albumConfig.value.topBackground;
  return bg ? { background: `url(${bg}) top / cover no-repeat` } : {};
});

// 跳转到相册详情
const goToAlbum = (path) => {
  router.go(`/pages/albums/${path}`);
};
</script>

<style lang="scss" scoped>
.album-page {
  width: 100%;
  animation: fade-up 0.6s 0.1s backwards;
}

/* 顶部横幅 */
.album-hero {
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

  .album-tips {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .album-title {
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

/* 相册卡片列表 */
.card-album {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
  margin-top: 2rem;

  .album-content-nocover {
    width: calc(25% - 15px);
  }
}

.card {
  position: relative;
  width: calc(25% - 15px);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);

    .card_cover {
      transform: scale(1.05);
      filter: brightness(0.9) saturate(1.2) contrast(1);
    }
  }
}

.card_cover {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 16px;
  filter: brightness(0.75) saturate(1.2) contrast(0.85);
  transform-origin: center;
  transform: scale(1) translateZ(0);
  transition: filter 200ms linear, transform 200ms linear;
}

.card__content {
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 1.5rem;
  width: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
}

.card__category {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card__heading {
  color: white;
  font-size: 1.3rem;
  font-weight: bold;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
  line-height: 1.4;
  margin: 0;
}

/* 响应式 */
@media (max-width: 1200px) {
  .card-album {
    .card,
    .album-content-nocover {
      width: calc(33.333% - 14px);
    }
  }

  .card_cover {
    height: 350px;
  }
}

@media (max-width: 900px) {
  .card-album {
    .card,
    .album-content-nocover {
      width: calc(50% - 10px);
    }
  }

  .card_cover {
    height: 300px;
  }

  .album-hero {
    height: 350px;

    .album-title {
      font-size: 2rem;
    }
  }
}

@media (max-width: 600px) {
  .card-album {
    gap: 15px;

    .card,
    .album-content-nocover {
      width: 100%;
    }
  }

  .card_cover {
    height: 250px;
  }

  .album-hero {
    height: 300px;

    .album-title {
      font-size: 1.5rem;
    }

    .banner-button-group {
      .banner-button {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
      }
    }
  }

  .card__content {
    padding: 1rem;
  }

  .card__heading {
    font-size: 1.1rem;
  }
}

/* 夜间模式 */
:global([data-theme="dark"]) {
  .album-hero {
    &::before {
      background: rgba(0, 0, 0, 0.5);
    }
  }
}
</style>
