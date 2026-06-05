<template>
  <div class="author-info" v-if="data">
    <div class="author-tag-left">
      <span v-for="(tag, index) in data.leftTags" :key="`left-${index}`" class="author-tag">
        {{ tag }}
      </span>
    </div>
    <div class="author-img">
      <img :src="data.image" :alt="'Author Avatar'" />
    </div>
    <div class="author-tag-right">
      <span v-for="(tag, index) in data.rightTags" :key="`right-${index}`" class="author-tag">
        {{ tag }}
      </span>
    </div>
  </div>
  <div class="author-title" v-if="title">{{ title }}</div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      image: '',
      leftTags: [],
      rightTags: []
    })
  },
  title: {
    type: String,
    default: ''
  }
});
</script>

<style scoped lang="scss">
.author-info {
  display: flex;
  align-items: center;
  margin: 0 0 16px 0;

  .author-tag-left {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    .author-tag {
      &:first-child,
      &:last-child {
        margin-right: -16px;
      }
    }
  }

  .author-tag-right {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .author-tag {
      &:first-child,
      &:last-child {
        margin-left: -16px;
      }
    }
  }

  @media (max-width: 768px) {
    .author-tag-left,
    .author-tag-right {
      display: none;
    }
  }

  .author-tag {
    transform: translate(0, -4px);
    padding: 1px 8px;
    background: var(--efu-card-bg, var(--main-card-background));
    border: var(--style-border-always, 1px solid var(--main-card-border));
    border-radius: 40px;
    margin-top: 6px;
    font-size: 14px;
    font-weight: 700;
    box-shadow: var(--efu-shadow-lightblack, 0 4px 8px rgba(0, 0, 0, 0.1));
    animation: floating 6s ease-in-out infinite;

    &:nth-child(1) {
      animation-delay: 0s;
    }

    &:nth-child(2) {
      animation-delay: 0.6s;
    }

    &:nth-child(3) {
      animation-delay: 1.2s;
    }

    &:nth-child(4) {
      animation-delay: 1.8s;
    }
  }

  .author-img {
    margin: 0 30px;
    border-radius: 50%;
    width: 180px;
    height: 180px;
    position: relative;
    background: var(--efu-secondbg, var(--main-card-second-background));
    user-select: none;
    transition: 0.3s;

    &:hover {
      transform: scale(1.1);
    }

    &::before {
      content: '';
      transition: 1s;
      width: 30px;
      height: 30px;
      background: var(--efu-green, #10b981);
      position: absolute;
      border-radius: 50%;
      border: 5px solid var(--efu-background, var(--main-site-background));
      bottom: 5px;
      right: 10px;
      z-index: 2;
    }

    @media (max-width: 768px) {
      width: 120px;
      height: 120px;

      &::before {
        bottom: -2px;
        right: -2px;
        width: 20px;
        height: 20px;
      }
    }

    img {
      border-radius: 50%;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }
}

.author-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0.5rem 0;
  line-height: 1;
  color: var(--efu-fontcolor, var(--main-font-color));
}

@keyframes floating {
  0%, 100% {
    transform: translate(0, -4px);
  }
  50% {
    transform: translate(0, 4px);
  }
}
</style>
