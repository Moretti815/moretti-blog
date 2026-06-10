<!-- 参考资料 -->
<template>
  <div v-if="limitedReferences.length" class="references s-card">
    <div class="title">
      <i class="iconfont icon-quote"></i>
      <span class="title-text">参考资料</span>
    </div>
    <ul class="list">
      <a
        v-for="(item, index) in limitedReferences"
        :key="index"
        :href="item.url"
        class="list-item"
        target="_blank"
      >
        <span class="item-title">{{ item.title }}</span>
      </a>
    </ul>
  </div>
</template>

<script setup>
import { useData } from 'vitepress';

const { frontmatter } = useData();

// 直接使用 frontmatter 来初始化 references
const references = ref(frontmatter.value?.references || []);

// 屏幕宽度，用于动态限制标题字数
const screenWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);

// 计算属性，用于动态限制标题字数
const limitedReferences = computed(() => {
  // 假设你想让标题占据屏幕宽度的某个百分比，例如 70%
  const maxChars = Math.floor((screenWidth.value * 0.7) / 16);

  return references.value.map(item => {
    let title = item.title;
    if (title.length > maxChars) {
      title = title.substring(0, maxChars) + '...';
    }
    return { ...item, title };
  });
});

// 在组件挂载时监听窗口大小变化，以便动态调整字数限制
onMounted(() => {
  window.addEventListener('resize', updateReferences);
  updateReferences(); // 首次加载时也更新
});

// 在组件卸载前移除事件监听器
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateReferences);
});

// 更新 references 的函数，触发 computed 重新计算
const updateReferences = () => {
  screenWidth.value = window.innerWidth;
  references.value = frontmatter.value?.references || [];
};
</script>

<style lang="scss" scoped>
.references {
  margin: 1rem 0;
  padding: 18px;
  margin-top: 2rem;
  background-color: var(--main-card-second-background);
  .title {
    display: flex;
    flex-direction: row;
    align-items: center;
    color: var(--main-font-second-color);
    font-size: 15px;
    margin-bottom: 0.8rem;
    .iconfont {
      margin-right: 4px;
      font-size: 18px;
      color: var(--main-font-second-color);
      opacity: 0.6;
    }
  }
  .list {
    display: flex;
    flex-direction: column;
    margin: 0;
    list-style-type: none;
    padding-left: 0.4rem;
    .list-item {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      position: relative;
      // width: max-content; // 如果你希望文本换行，这个可能需要调整或移除
      // 通常我们会让它占据可用宽度
      width: 100%; // 让列表项占据其父容器的全部宽度，以便文本换行
      padding-left: 1rem;
      margin-bottom: 0.4rem;
      overflow: auto;
      transition: color 0.3s;
      .item-title {
        padding-bottom: 2px;
        white-space: normal; /* 允许文本正常换行 */
        word-break: break-word; /* 允许在单词内换行以防止溢出 */
        overflow-wrap: break-word; /* 标准化属性，与 word-wrap: break-word 相同 */
      }
      &:last-child {
        margin-bottom: 0;
      }
      &::before {
        content: "";
        position: absolute;
        left: 0;
        width: 8px;
        height: 8px;
        opacity: 0.6;
        background-color: var(--main-font-color);
        border-radius: 50%;
        transition: background-color 0.3s;
      }
      &::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;
        height: 2px;
        width: 0;
        margin-left: 1rem;
        background-color: var(--main-color);
        transition: width 0.3s;
      }
      &:hover {
        color: var(--main-color);
        &::before {
          background-color: var(--main-color);
        }
        &::after {
          width: calc(100% - 1rem);
        }
      }
    }
  }
}
</style>