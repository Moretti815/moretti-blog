<!-- 友链鱼塘 -->
<template>
  <div class="fcircle">
    <!-- 顶图 -->
    <Banner type="page" title="友链鱼塘" desc="看看朋友们都在写什么">
      <template v-slot:header-slot>
        <div class="menu">
          <div class="menu-item refresh" @click="refreshData">
            <i class="iconfont icon-refresh" />
            <span class="name">刷新</span>
          </div>
        </div>
      </template>
    </Banner>
    <!-- 友链朋友圈内容 -->
    <div class="fcircle-content s-card">
      <div id="friend-circle-lite-root"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useData } from 'vitepress';

const { theme } = useData();

// 获取友链朋友圈配置
const circleOfFriendsUrl = theme.value?.friends?.circleOfFriends || '';

// 加载脚本和样式
let scriptEl = null;
let linkEl = null;

const loadFcircle = () => {
  // 加载 CSS
  linkEl = document.createElement('link');
  linkEl.rel = 'stylesheet';
  linkEl.href = 'https://fastly.jsdelivr.net/gh/willow-god/Friend-Circle-Lite/main/fclite.min.css';
  document.head.appendChild(linkEl);

  // 配置
  if (typeof window.UserConfig === 'undefined') {
    window.UserConfig = {
      private_api_url: circleOfFriendsUrl,
      page_turning_number: 20,
      error_img: 'https://i.p-i.vip/30/20240815-66bced9226a36.webp',
    };
  }

  // 加载 JS
  scriptEl = document.createElement('script');
  scriptEl.src = 'https://fastly.jsdelivr.net/gh/willow-god/Friend-Circle-Lite/main/fclite.min.js';
  scriptEl.async = true;
  document.body.appendChild(scriptEl);
};

// 刷新数据
const refreshData = () => {
  const root = document.getElementById('friend-circle-lite-root');
  if (root) {
    root.innerHTML = '';
  }
  // 重新加载
  if (scriptEl) {
    scriptEl.remove();
  }
  loadFcircle();
};

onMounted(() => {
  if (circleOfFriendsUrl) {
    loadFcircle();
  }
});

onUnmounted(() => {
  if (scriptEl) {
    scriptEl.remove();
  }
  if (linkEl) {
    linkEl.remove();
  }
});
</script>

<style lang="scss" scoped>
.fcircle {
  margin-bottom: 4rem;

  .banner-page {
    min-height: 260px;

    .menu {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: flex-start;
      margin-bottom: auto;

      .menu-item {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 46px;
        padding: 12px 18px;
        border-radius: 8px;
        background-color: var(--main-card-second-background);
        border: 1px solid var(--main-card-border);
        box-shadow: 0 8px 16px -4px var(--main-border-shadow);
        transition: all 0.3s;
        cursor: pointer;

        .iconfont {
          font-size: 18px;
          margin-right: 8px;
          transition: color 0.3s;
        }

        &.refresh {
          color: var(--main-color);

          .iconfont {
            color: var(--main-color);
          }
        }

        &:hover {
          color: #fff;
          background-color: var(--main-color);
          box-shadow: 0 8px 16px -4px var(--main-color-bg);

          .iconfont {
            color: #fff;
          }
        }
      }
    }
  }

  .fcircle-content {
    margin-top: 2rem;
    padding: 1.5rem;
    min-height: 400px;

    :deep(#friend-circle-lite-root) {
      // 适配暗色模式
      .fclite-article-item {
        background-color: var(--main-card-background);
        border: 1px solid var(--main-card-border);
        border-radius: 12px;
        margin-bottom: 1rem;
        padding: 1rem;
        transition: all 0.3s;

        &:hover {
          box-shadow: 0 8px 16px -4px var(--main-border-shadow);
          transform: translateY(-2px);
        }

        .fclite-article-title {
          color: var(--main-font-color);
          font-weight: 600;
        }

        .fclite-article-desc {
          color: var(--main-font-second-color);
        }

        .fclite-article-meta {
          color: var(--main-font-second-color);
        }
      }

      .fclite-load-more {
        background-color: var(--main-color);
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }
      }

      .fclite-loading {
        color: var(--main-font-second-color);
      }

      .fclite-error {
        color: var(--main-error-color, #f56c6c);
      }
    }
  }

  @media (max-width: 768px) {
    .fcircle-content {
      padding: 1rem;
      margin-top: 1rem;

      :deep(#friend-circle-lite-root) {
        .fclite-article-item {
          padding: 0.8rem;
        }
      }
    }
  }
}
</style>
