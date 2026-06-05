<template>
  <div class="author-content" v-if="data">
    <div class="create-site-post author-content-item single">
      <div class="author-content-item-tips">{{ data.tip }}</div>
      <span class="author-content-item-title">{{ data.title }}</span>
      <div class="cause-content">
        <Content />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      tip: '',
      title: ''
    })
  }
});

// 动态导入 Markdown 文件
const Content = defineAsyncComponent(() => import('../../../../pages/about-content.md'));
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
}

.author-content-item {
  width: 100%;
  border-radius: 12px;
  background: var(--efu-card-bg, var(--main-card-background));
  border: var(--style-border-always, 1px solid var(--main-card-border));
  box-shadow: var(--efu-shadow-lightblack, 0 4px 8px rgba(0, 0, 0, 0.1));
  position: relative;
  padding: 1rem 2rem;
  overflow: hidden;
}

.create-site-post {
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
    margin-bottom: 1rem;
  }

  .cause-content {
    font-size: 16px;
    line-height: 1.8;
    color: var(--efu-fontcolor, var(--main-font-color));

    :deep(p) {
      margin-bottom: 1rem;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
