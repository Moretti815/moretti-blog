<template>
  <!-- 仅在 ≤1200px 时渲染 -->
  <div class="mobile-toc-wrapper">
    <!-- 浮动按钮 -->
    <button
      class="mobile-toc-btn"
      :class="{ hidden: isOpen }"
      aria-label="打开目录"
      @click="openToc"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        class="toc-icon"
      >
        <path
          fill="currentColor"
          d="M3 17v-2h14v2zm0-4v-2h14v2zm0-4V7h14v2zm17 8q-.425 0-.712-.288T19 16t.288-.712T20 15t.713.288T21 16t-.288.713T20 17m0-4q-.425 0-.712-.288T19 12t.288-.712T20 11t.713.288T21 12t-.288.713T20 13m0-4q-.425 0-.712-.288T19 8t.288-.712T20 7t.713.288T21 8t-.288.713T20 9"
        />
      </svg>
    </button>

    <!-- 目录面板遮罩 -->
    <Teleport to="body">
      <Transition name="mobile-toc-fade">
        <div v-if="isOpen" class="mobile-toc-overlay" @click.self="closeToc">
          <!-- 目录面板 -->
          <div class="mobile-toc-panel">
            <!-- 头部：标题 + 关闭按钮 -->
            <div class="mobile-toc-header">
              <span class="mobile-toc-title">目录</span>
              <button class="mobile-toc-close" aria-label="关闭目录" @click="closeToc">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                  />
                </svg>
              </button>
            </div>
            <!-- 目录列表 -->
            <div class="mobile-toc-list" :style="{ '--height': activeTocHeight + 'px' }">
              <span
                v-for="(item, index) in tocData"
                :key="index"
                :id="'mobile-toc-' + item.id"
                :class="[
                  'mobile-toc-item',
                  item.type,
                  { active: item.id === activeHeader || (index === 0 && !activeHeader) },
                ]"
                @click="scrollToHeader(item.id)"
              >
                {{ item.text }}
              </span>
              <span v-if="!tocData || tocData.length === 0" class="mobile-toc-empty">
                本文暂无目录
              </span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { throttle } from "lodash-es";

const route = useRoute();

const isOpen = ref(false);
const tocData = ref(null);
const activeHeader = ref(null);
const activeTocHeight = ref(0);
const postDom = ref(null);

// ---------- 与 Toc.vue 相同的核心逻辑 ----------

const getAllTitle = () => {
  try {
    postDom.value = document.getElementById("page-content");
    if (!postDom.value) return false;
    const headers = Array.from(postDom.value.querySelectorAll("h2, h3")).filter(
      (header) => header.parentElement.tagName.toLowerCase() === "div",
    );
    return headers;
  } catch (error) {
    console.error("获取所有目录数据出错：", error);
  }
};

const generateDirData = () => {
  const headers = getAllTitle();
  if (!headers) return false;
  const nestedData = [];
  headers.forEach((header) => {
    nestedData.push({
      id: header.id,
      type: header.tagName,
      text: header.textContent?.replace(/\u200B/g, "").trim(),
    });
  });
  tocData.value = nestedData;
};

const activeTocItem = throttle(
  () => {
    if (!tocData.value) return false;
    const headers = getAllTitle();
    if (!headers) return false;
    const bufferheight = 120;
    for (let header of headers) {
      const rect = header.getBoundingClientRect();
      if (rect.top - bufferheight <= 0 && rect.bottom + bufferheight >= 0) {
        activeHeader.value = header.id;
      }
    }
  },
  100,
  { leading: true, trailing: false },
);

// ---------- 打开 / 关闭 ----------

const openToc = () => {
  generateDirData(); // 每次打开重新获取
  isOpen.value = true;
  document.body.style.overflow = "hidden";
};

const closeToc = () => {
  isOpen.value = false;
  document.body.style.overflow = "";
};

// ---------- 点击目录项滚动 ----------

const scrollToHeader = (id) => {
  try {
    const headerDom = document.getElementById(id);
    if (!headerDom || !postDom.value) return false;
    const headerTop = headerDom.offsetTop;
    const scrollHeight = headerTop + postDom.value.offsetTop - 80;
    // 先关闭面板、恢复滚动，再执行滚动
    closeToc();
    window.scroll({ top: scrollHeight, behavior: "smooth" });
  } catch (error) {
    console.error("目录滚动失败：", error);
  }
};

// ---------- 高亮同步（面板打开时） ----------

watch(
  () => activeHeader.value,
  (val) => {
    const tocListDom = document.querySelector(".mobile-toc-list");
    const activeItemDom = document.getElementById("mobile-toc-" + val);
    if (!tocListDom || !activeItemDom) return false;
    activeTocHeight.value = activeItemDom?.offsetTop - 2 || 0;
    tocListDom.scrollTo({ top: activeTocHeight.value - 80, behavior: "smooth" });
  },
);

// ---------- 路由变化 ----------

watch(
  () => route.path,
  () => {
    closeToc();
    generateDirData();
  },
);

// ---------- 生命周期 ----------

onMounted(() => {
  generateDirData();
  window.addEventListener("scroll", activeTocItem);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", activeTocItem);
  // 确保组件销毁时恢复滚动
  document.body.style.overflow = "";
});
</script>

<style lang="scss" scoped>
/* ============ 仅 ≤1200px 显示 ============ */
@media (min-width: 1201px) {
  .mobile-toc-wrapper {
    display: none !important;
  }
}

/* ============ 浮动按钮 ============ */
.mobile-toc-btn {
  position: fixed;
  right: 20px;
  bottom: 80px;
  z-index: 1003;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    opacity 0.3s,
    transform 0.3s;
  /* 默认图标颜色跟随主题 */
  .toc-icon {
    color: var(--main-font-color);
    transition: color 0.3s;
  }
  &:active {
    transform: scale(0.9);
  }
  &.hidden {
    opacity: 0;
    pointer-events: none;
    transform: scale(0.6);
  }
}

/* ============ 遮罩 + 面板 ============ */
.mobile-toc-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  /* 阻止触摸穿透 */
  touch-action: none;
  overscroll-behavior: contain;
}

.mobile-toc-panel {
  width: 85%;
  max-width: 380px;
  max-height: 75vh;
  border-radius: 16px;
  background: var(--main-card-background, #fff);
  border: 1px solid var(--main-card-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 头部 */
.mobile-toc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--main-card-border);
  flex-shrink: 0;
}
.mobile-toc-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--main-font-color);
}
.mobile-toc-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--main-font-color);
  opacity: 0.6;
  transition:
    opacity 0.2s,
    background-color 0.2s;
  &:hover,
  &:active {
    opacity: 1;
    background-color: var(--main-color-bg);
  }
}

/* 目录列表 */
.mobile-toc-list {
  position: relative;
  padding: 16px 20px 16px 28px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  flex: 1;
  /* 让列表内滚动时不触发页面滚动 */
  touch-action: pan-y;
}

.mobile-toc-item {
  margin: 4px 0;
  padding: 8px 14px;
  border-radius: 8px;
  opacity: 0.6;
  font-size: 15px;
  line-height: 1.5;
  cursor: pointer;
  transition:
    color 0.3s,
    opacity 0.3s,
    font-size 0.3s,
    background-color 0.3s;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
  &.H2 {
    font-weight: bold;
  }
  &.H3 {
    font-size: 14px;
    margin-left: 20px;
  }
  &.active {
    opacity: 1;
    color: var(--main-color);
    background-color: var(--main-color-bg);
    &.H2 {
      font-size: 17px;
    }
    &.H3 {
      font-size: 15px;
    }
  }
  &:active {
    opacity: 1;
    color: var(--main-color);
    background-color: var(--main-color-bg);
  }
}

.mobile-toc-empty {
  text-align: center;
  opacity: 0.4;
  padding: 2rem 0;
  font-size: 14px;
}

/* ============ 过渡动画 ============ */
.mobile-toc-fade-enter-active,
.mobile-toc-fade-leave-active {
  transition: opacity 0.25s ease;
}
.mobile-toc-fade-enter-from,
.mobile-toc-fade-leave-to {
  opacity: 0;
}
</style>
