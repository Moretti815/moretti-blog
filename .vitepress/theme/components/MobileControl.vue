<template>
  <div ref="wrapperRef" class="mobile-control-wrapper" :class="{ 'on-post': isPostPage }">
    <!-- 操作按钮组（设置按钮上方，从右向左滑入） -->
    <div class="action-buttons">
      <!-- 4. 背景模糊 -->
      <!-- <button
        class="action-btn button-4"
        :class="{ show: isOpen, active: store.backgroundBlur }"
        title="背景模糊"
        @click.stop="store.changeShowStatus('backgroundBlur')"
      >
        <i class="iconfont icon-blur" />
      </button> -->
      <!-- 3. 播放器 -->
      <!-- <button
        class="action-btn button-3"
        :class="{ show: isOpen, active: store.playerShow }"
        title="播放器"
        @click.stop="store.playerShow = !store.playerShow"
      >
        <i class="iconfont icon-music" />
      </button> -->
      <!-- 2. 右键菜单 -->
      <!-- <button
        class="action-btn button-2"
        :class="{ show: isOpen, active: store.useRightMenu }"
        title="右键菜单"
        @click.stop="toggleRightMenu"
      >
        <i class="iconfont icon-list" />
      </button> -->
      <!-- 1. 明暗模式（最靠近设置按钮） -->
      <button
        class="action-btn button-1"
        :class="{ show: isOpen }"
        title="显示模式"
        @click.stop="store.changeThemeType()"
      >
        <i :class="`iconfont icon-${store.themeType}`" />
      </button>
      <!-- 5. 强制刷新（最顶部） -->
      <!-- <button
        class="action-btn button-5"
        :class="{ show: isOpen }"
        title="清除缓存并强制刷新"
        @click.stop="forceRefresh"
      >
        <Icon name="material-symbols:refresh" class-name="refresh-icon" />
      </button> -->
    </div>

    <!-- 设置按钮 -->
    <button
      class="control-toggle-btn"
      :class="{ open: isOpen }"
      aria-label="快捷设置"
      @click.stop="toggleMenu"
    >
      <!-- 齿轮图标（关闭态） -->
      <svg
        v-show="!isOpen"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        class="toggle-icon"
      >
        <path
          fill="currentColor"
          d="M19.9 12.66a1 1 0 0 1 0-1.32l1.28-1.44a1 1 0 0 0 .12-1.17l-2-3.46a1 1 0 0 0-1.07-.48l-1.88.38a1 1 0 0 1-1.15-.66l-.61-1.83a1 1 0 0 0-.95-.68h-4a1 1 0 0 0-1 .68l-.56 1.83a1 1 0 0 1-1.15.66L5 4.79a1 1 0 0 0-1 .48L2 8.73a1 1 0 0 0 .1 1.17l1.27 1.44a1 1 0 0 1 0 1.32L2.1 14.1a1 1 0 0 0-.1 1.17l2 3.46a1 1 0 0 0 1.07.48l1.88-.38a1 1 0 0 1 1.15.66l.61 1.83a1 1 0 0 0 1 .68h4a1 1 0 0 0 .95-.68l.61-1.83a1 1 0 0 1 1.15-.66l1.88.38a1 1 0 0 0 1.07-.48l2-3.46a1 1 0 0 0-.12-1.17ZM18.41 14l.8.9l-1.28 2.22l-1.18-.24a3 3 0 0 0-3.45 2L12.92 20h-2.56L10 18.86a3 3 0 0 0-3.45-2l-1.18.24l-1.3-2.21l.8-.9a3 3 0 0 0 0-4l-.8-.9l1.28-2.2l1.18.24a3 3 0 0 0 3.45-2L10.36 4h2.56l.38 1.14a3 3 0 0 0 3.45 2l1.18-.24l1.28 2.22l-.8.9a3 3 0 0 0 0 3.98m-6.77-6a4 4 0 1 0 4 4a4 4 0 0 0-4-4m0 6a2 2 0 1 1 2-2a2 2 0 0 1-2 2"
        />
      </svg>
      <!-- X 关闭图标（打开态） -->
      <svg
        v-show="isOpen"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        class="toggle-icon"
      >
        <path
          fill="currentColor"
          d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { mainStore } from "@/store";

const route = useRoute();
const store = mainStore();

const isOpen = ref(false);
const wrapperRef = ref(null);

// 判断是否为文章页面（用于调整按钮位置）
const isPostPage = computed(() => {
  const routePath = decodeURIComponent(route.path);
  return routePath.includes("/posts/");
});

// 切换菜单
const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

// 右键菜单开关（复用 Control.vue 逻辑）
const toggleRightMenu = () => {
  store.useRightMenu = !store.useRightMenu;
  if (typeof $message !== "undefined") {
    $message.info(`${store.useRightMenu ? "已开启" : "已关闭"}自定义右键菜单`);
  }
};

// 点击外部关闭
const handleClickOutside = (e) => {
  if (!isOpen.value) return;
  const wrapper = document.querySelector(".mobile-control-wrapper");
  if (wrapper && !wrapper.contains(e.target)) {
    isOpen.value = false;
  }
};

// 强制刷新（清除缓存 + Service Worker）
const forceRefresh = async () => {
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  }
  if ('caches' in window) {
    const names = await caches.keys();
    await Promise.all(names.map((n) => caches.delete(n)));
  }
  isOpen.value = false;
  window.location.reload(true);
};

// 路由变化时关闭
watch(
  () => route.path,
  () => {
    isOpen.value = false;
  },
);

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style lang="scss" scoped>
/* ============ 仅 ≤1200px 显示 ============ */
@media (min-width: 1201px) {
  .mobile-control-wrapper {
    display: none !important;
  }
}

/* ============ 容器 ============ */
.mobile-control-wrapper {
  position: fixed;
  right: 20px;
  bottom: 80px;
  z-index: 1004;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 在文章页面时上移，给目录按钮留出空间 */
  &.on-post {
    bottom: 140px;
  }
}

/* ============ 设置按钮 ============ */
.control-toggle-btn {
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
    transform 0.3s,
    background-color 0.3s;
  .toggle-icon {
    color: var(--main-font-color);
    transition: color 0.3s;
  }
  &:active {
    transform: scale(0.9);
  }
  &.open {
    .toggle-icon {
      color: var(--main-font-color);
    }
  }
}

/* ============ 操作按钮组 ============ */
.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;
}

.action-btn {
  width: 44px;
  height: 44px;
  margin-bottom: 8px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 默认隐藏态：向右偏移 + 透明 */
  opacity: 0;
  transform: translateX(60px);
  pointer-events: none;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease,
    background-color 0.3s;
  .iconfont {
    font-size: 20px;
    color: var(--main-font-color);
    transition: color 0.3s;
  }
  .refresh-icon {
    font-size: 20px;
    color: var(--main-font-color);
  }
  &:active {
    transform: translateX(0) scale(0.9) !important;
  }

  /* --- 隐藏态交错延迟（从左向右消失：顶部先消失） --- */
  &.button-4 {
    transition-delay: 0s;
  }
  &.button-3 {
    transition-delay: 0.06s;
  }
  &.button-2 {
    transition-delay: 0.12s;
  }
  &.button-5 {
    transition-delay: 0.18s;
  }
  &.button-1 {
    transition-delay: 0.24s;
  }

  /* --- 显示态 --- */
  &.show {
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
    /* 从右向左出现：底部先出现 */
    &.button-1 {
      transition-delay: 0s;
    }
    &.button-2 {
      transition-delay: 0.06s;
    }
    &.button-5 {
      transition-delay: 0.12s;
    }
    &.button-3 {
      transition-delay: 0.18s;
    }
    &.button-4 {
      transition-delay: 0.24s;
    }
  }

  /* --- 激活态（与 Control.vue 一致） --- */
  &.active {
    background-color: var(--main-color);
    .iconfont {
      color: #fff;
    }
  }
}
</style>
