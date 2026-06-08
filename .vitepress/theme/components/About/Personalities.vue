<template>
  <div class="author-content" v-if="data">
    <!-- 性格卡片 -->
    <div class="author-content-item personalities">
      <div class="author-content-item-tips">{{ data.tips }}</div>
      <span class="author-content-item-title">{{ data.title }}</span>
      <div class="title2" :style="{ color: data.color }">{{ data.type }}</div>
      <div class="image">
        <img :src="data.image" :alt="data.type" />
      </div>
      <div class="post-tips">
        {{ data.tip1 || '通过' }}
        <a href="https://www.16personalities.com/" target="_blank" rel="noopener noreferrer">{{ data.linkText || '16personalities' }}</a>
        {{ data.tip2 || '测试得出我是' }}
        <a :href="data.typeLink" target="_blank" rel="noopener noreferrer">{{ data.typeName }}</a>
      </div>
    </div>

    <!-- 个人照片卡片 -->
    <div class="author-content-item myphoto" v-if="data.myphoto">
      <img class="author-content-img" :src="data.myphoto" alt="my photo" />
      <div class="myphoto-title">{{ data.photoTitle || 'My Photo' }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      tips: '',
      title: '',
      type: '',
      color: '',
      image: '',
      myphoto: '',
      linkText: '',
      typeName: '',
      typeLink: '',
      tip1: '',
      tip2: '',
      photoTitle: ''
    })
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
  width: 49%;
  border-radius: 12px;
  background: var(--efu-card-bg, var(--main-card-background));
  border: var(--style-border-always, 1px solid var(--main-card-border));
  box-shadow: var(--efu-shadow-lightblack, 0 4px 8px rgba(0, 0, 0, 0.1));
  position: relative;
  padding: 1rem 2rem;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
  }
}

.personalities {
  overflow: hidden;
  position: relative;
  flex: 6;
  height: 60%;
  min-height: 240px;

  @media (max-width: 768px) {
    min-height: 240px;
  }

  .title2 {
    font-size: 36px;
    font-weight: 700;
    line-height: 1.1;
  }

  .image {
    position: absolute;
    right: -20px;
    bottom: -2rem;
    transition: transform 2s cubic-bezier(0.13, 0.45, 0.21, 1.02);
    user-select: none;
    z-index: 1;

    @media (max-width: 768px) {
      right: -60px;
      bottom: 20px;
      z-index: 0;
    }

    img {
      max-width: 280px;
      height: auto;

      @media (max-width: 768px) {
        max-width: 200px;
      }
    }
  }

  &:hover {
    .image {
      transform: rotate(-10deg) translateY(-10px);
    }
  }

  .post-tips {
    position: relative;
    margin-top: 1rem;
    font-size: 0.75rem;
    color: var(--efu-secondtext, var(--main-font-second-color));
    z-index: 2;
    padding: 4px 0;

    a {
      color: var(--efu-main, var(--main-color));
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.myphoto {
  height: 60%;
  min-height: 240px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  img {
    position: absolute;
    height: 100%;
    min-width: 100%;
    object-fit: cover;
    transition: 0.6s;
    user-select: none;
  }

  &:hover {
    img {
      min-width: 105%;
      transition: 2s;
    }
  }

  .myphoto-title {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: var(--efu-maskbgdeep, rgba(0, 0, 0, 0.6));
    padding: 0.5rem 2rem;
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: blur(20px);
    transform: translateZ(0);
    color: var(--efu-white, #fff);
    font-size: 1rem;
  }
}

.author-content-item-tips {
  opacity: 0.8;
  font-size: 0.6rem;
  margin-bottom: 0.5rem;
  color: var(--efu-fontcolor, var(--main-font-color));
}

.author-content-item-title {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--efu-fontcolor, var(--main-font-color));
  display: block;
  margin-bottom: 0.5rem;
}
</style>
