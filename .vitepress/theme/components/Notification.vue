<template>
  <Transition name="toast">
    <div v-if="visible" class="notification-toast">
      <!-- 关闭按钮 -->
      <button class="toast-close" title="关闭" @click="dismiss">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
          <path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z" />
        </svg>
      </button>
      <!-- 公告内容 -->
      <div class="toast-body" v-html="renderedContent" />
    </div>
  </Transition>
</template>

<script setup>
import MarkdownIt from 'markdown-it';

const STORAGE_KEY = 'blog-notification-dismissed';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

const visible = ref(false);
const renderedContent = ref('');

/** 简单哈希，用于标识内容是否更新 */
function contentHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return String(hash);
}

/** 检查是否应该显示公告 */
function shouldShow(hash) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const { hash: savedHash, time } = JSON.parse(raw);
    // 内容变了 → 重新显示
    if (savedHash !== hash) return true;
    // 24小时内关闭过 → 不再显示
    return Date.now() - time > TWENTY_FOUR_HOURS;
  } catch {
    return true;
  }
}

/** 记录关闭 */
function saveDismissed(hash) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ hash, time: Date.now() }));
}

/** 关闭公告 */
function dismiss() {
  visible.value = false;
  saveDismissed(currentHash);
}

let currentHash = '';

onMounted(async () => {
  try {
    const res = await fetch('/notification.md');
    if (!res.ok) return;
    const raw = await res.text();
    const trimmed = raw.trim();
    if (!trimmed) return;

    // 去除 frontmatter
    const content = trimmed.replace(/^---[\s\S]*?---\s*/, '');
    if (!content.trim()) return;

    currentHash = contentHash(content);
    if (!shouldShow(currentHash)) return;

    // 渲染 markdown
    const md = new MarkdownIt({ html: true, breaks: true, linkify: true });
    renderedContent.value = md.render(content);
    visible.value = true;
  } catch (e) {
    console.warn('加载公告失败:', e);
  }
});
</script>

<style lang="scss" scoped>
.notification-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1005;
  width: 320px;
  max-width: calc(100vw - 40px);
  padding: 16px 20px;
  border-radius: 14px;
  background: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  box-shadow: 0 8px 24px -4px var(--main-border-shadow);
  backdrop-filter: blur(12px);
}

.toast-close {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: var(--main-card-background);
  color: var(--main-font-second-color);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px var(--main-border-shadow);
  svg { display: block; }
  &:hover {
    background: var(--main-card-second-background);
    color: var(--main-font-color);
  }
}

.toast-body {
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--main-font-color);
  max-height: 300px;
  overflow-y: auto;
  padding-right: 16px;

  // markdown 内容样式
  :deep(p) {
    margin: 0 0 0.5em;
    &:last-child { margin-bottom: 0; }
  }
  :deep(a) {
    color: var(--main-color);
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
  :deep(strong) {
    color: var(--main-font-color);
    font-weight: 700;
  }
  :deep(ul), :deep(ol) {
    margin: 0.3em 0;
    padding-left: 1.2em;
  }
  :deep(li) {
    margin: 0.2em 0;
  }
  :deep(code) {
    padding: 0.1em 0.3em;
    border-radius: 4px;
    background: var(--main-card-second-background);
    font-size: 0.8em;
  }
  :deep(blockquote) {
    margin: 0.5em 0;
    padding: 0.3em 0.8em;
    border-left: 3px solid var(--main-color);
    color: var(--main-font-second-color);
  }
  :deep(img) {
    max-width: 100%;
    border-radius: 8px;
  }
}

/* 入场动画 */
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 1, 0.45);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

/* 移动端 */
@media (max-width: 768px) {
  .notification-toast {
    top: 12px;
    right: 12px;
    left: 12px;
    width: auto;
    max-width: none;
  }
}
</style>
