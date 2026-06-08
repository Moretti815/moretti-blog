<template>
  <div class="author-content" v-if="likes && likes.length > 0">
    <template v-for="(like, index) in likes" :key="`like-${index}`">
      <!-- 动漫卡片 -->
      <div v-if="like.type === 'comic'" class="author-content-item comic-content">
        <div class="card-content">
          <div class="author-content-item-tips">{{ like.tips }}</div>
          <div class="author-content-item-title">{{ like.title }}</div>
          <div class="comic-box">
            <a
              v-for="(item, i) in like.list"
              :key="i"
              class="comic-item"
              :href="item.href || item.url"
              rel="external nofollow noreferrer"
              target="_blank"
              :title="item.name || item.title"
            >
              <div class="comic-item-cover">
                <img
                  :src="item.cover"
                  :alt="item.name || item.title"
                  onerror="this.onerror=null;this.src='https://bu.dusays.com/2023/03/03/6401a79030db5.png'"
                />
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- 其他喜好卡片 -->
      <div
        v-else
        class="author-content-item like-item"
        :class="like.type"
        :style="{ backgroundImage: `url(${like.bg})` }"
      >
        <div class="card-content">
          <div class="author-content-item-tips">{{ like.tips }}</div>
          <span class="author-content-item-title">{{ like.title }}</span>
          <div class="content-bottom">
            <div v-if="like.subtips" class="tips">{{ like.subtips }}</div>
            <div v-if="like.button" class="banner-button-group">
              <a class="banner-button" :href="like.button_link">
                <i class="iconfont icon-circle-chevron-right"></i>
                <span class="banner-button-text">{{ like.button_text }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  likes: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped lang="scss">
.author-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 0.5rem;
  gap: 0.5rem;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.author-content-item {
  border-radius: 12px;
  background: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: visible;
  min-height: 400px;
  color: #fff;
  flex: 1;
  width: calc(50% - 0.25rem);

  @media (max-width: 768px) {
    width: 100%;
  }

  // 动漫卡片需要 overflow hidden 但要有特殊处理
  &.comic {
    overflow: hidden;
  }

  .card-content {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    padding: 1rem 2rem;
  }

  .author-content-item-tips {
    opacity: 0.8;
    font-size: 0.6rem;
    margin-bottom: 0.5rem;
  }

  .author-content-item-title {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.1;
  }

  .content-bottom {
    margin-top: auto;

    .tips {
      font-size: 0.875rem;
      opacity: 0.8;
      margin-bottom: 1rem;
    }

    .banner-button-group {
      .banner-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: #fff;
        text-decoration: none;
        transition: 0.3s;

        &:hover {
          background: var(--main-color);
        }

        i {
          font-size: 14px;
        }
      }
    }
  }
}

// 动漫卡片样式 - 参考安知鱼原版
.comic-content {
  min-height: 300px;
  overflow: hidden;
  border-radius: 24px;
  background: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.3s ease;
  animation: slide-in 0.6s 0.6s backwards;
  flex: 1;
  width: calc(50% - 0.25rem);

  @media (max-width: 768px) {
    width: 100%;
    min-height: 250px;
  }

  &::after {
    box-shadow: 0 -48px 203px 11px #fbe9b8 inset;
    position: absolute;
    content: '';
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  .card-content {
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    height: 100%;
    width: 100%;
    flex-direction: column;
    padding: 1rem 2rem;
  }

  .author-content-item-tips,
  .author-content-item-title {
    z-index: 2;
    color: #fff;
    pointer-events: none;
    position: relative;
  }

  .author-content-item-tips {
    opacity: 0.8;
    font-size: 12px;
    margin-bottom: 0.5rem;
  }

  .author-content-item-title {
    font-size: 32px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 1rem;
  }

  .comic-box {
    display: flex;
    width: 120%;
    height: 100%;
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    z-index: 1;

    @media (max-width: 768px) {
      width: 140%;
    }
  }

  .comic-item {
    height: 100%;
    color: #fff;
    width: 20%;
    transform: skew(-10deg, 0deg);
    transition: 0.8s;
    position: relative;
    overflow: hidden;
    display: block;
    text-decoration: none;

    &:hover {
      width: 46%;

      .comic-item-cover {
        left: 16%;
        transform: skew(10deg, 0deg) scale(1.6);
      }
    }

    .comic-item-cover {
      position: absolute;
      top: 0;
      left: -50%;
      height: 100%;
      width: 200%;
      transform: skew(10deg, 0deg);
      object-fit: cover;
      transition: scale 0.2s, all 0.8s;

      img {
        height: 100%;
        width: 100%;
        max-width: none;
        border-radius: 0;
        object-fit: cover;
        transition: 0.8s;
      }
    }
  }
}

// 动画效果
@keyframes slide-in {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

// 其他喜好卡片样式
.like-item {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  &::after {
    box-shadow: 0 -69px 203px 11px #0e0e0e inset;
    position: absolute;
    content: '';
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  &.like-technology {
    min-height: 230px;

    &::after {
      box-shadow: 0 -69px 203px 11px #050b20 inset;
    }
  }

  &.like-music {
    min-height: 300px;
    overflow: hidden;

    @media (max-width: 768px) {
      min-height: 250px;
    }

    &::after {
      box-shadow: 0 -69px 203px 11px #0e0e0e inset;
    }
  }
}
</style>