<!-- 全局搜索 - DocSearch -->
<template>
  <div id="docsearch-container" v-show="store.searchShow" class="docsearch-wrapper">
    <div class="docsearch-mask" @click="store.changeShowStatus('searchShow')" />
    <div id="docsearch" ref="docsearchRef" />
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import { onMounted, ref, watch, nextTick } from "vue";

const store = mainStore();
const docsearchRef = ref(null);
let docsearchInstance = null;

const { theme } = useData();
const searchConfig = theme.value.search || {};

// 动态导入 docsearch
const initDocsearch = async () => {
  if (!searchConfig.enable || !searchConfig.appId || !searchConfig.apiKey) {
    console.warn("DocSearch 配置不完整");
    return;
  }

  const docsearch = (await import("@docsearch/js")).default;
  await import("@docsearch/css");

  docsearchInstance = docsearch({
    container: "#docsearch",
    appId: searchConfig.appId,
    apiKey: searchConfig.apiKey,
    indexName: searchConfig.indexName || "blog",
    placeholder: "搜索文档",
    translations: {
      button: {
        buttonText: "搜索",
        buttonAriaLabel: "搜索",
      },
      modal: {
        searchBox: {
          resetButtonTitle: "清除查询",
          resetButtonAriaLabel: "清除查询",
          cancelButtonText: "取消",
          cancelButtonAriaLabel: "取消",
        },
        startScreen: {
          recentSearchesTitle: "最近搜索",
          noRecentSearchesText: "没有最近搜索",
          saveRecentSearchButtonTitle: "保存此搜索",
          removeRecentSearchButtonTitle: "从历史中移除此搜索",
          favoriteSearchesTitle: "收藏",
          removeFavoriteSearchButtonTitle: "从收藏中移除此搜索",
        },
        errorScreen: {
          titleText: "无法获取结果",
          helpText: "你可能需要检查你的网络连接",
        },
        footer: {
          selectText: "选择",
          selectKeyAriaLabel: "Enter 键",
          navigateText: "导航",
          navigateUpKeyAriaLabel: "上箭头",
          navigateDownKeyAriaLabel: "下箭头",
          closeText: "关闭",
          closeKeyAriaLabel: "Esc 键",
          searchByText: "搜索提供",
        },
        noResultsScreen: {
          noResultsText: "未找到相关结果",
          suggestedQueryText: "你可以尝试查询",
          reportMissingResultsText: "你认为这个查询应该有结果？",
          reportMissingResultsLinkText: "让我们知道",
        },
      },
    },
    // 搜索结果处理
    transformItems: (items) => {
      return items.map((item) => {
        return {
          ...item,
          url: item.url,
        };
      });
    },
    // 搜索打开时的回调
    onOpen: () => {
      document.body.style.overflow = "hidden";
    },
    // 搜索关闭时的回调
    onClose: () => {
      document.body.style.overflow = "";
      store.changeShowStatus("searchShow");
    },
    // 搜索结果点击
    navigator: {
      navigate: ({ itemUrl }) => {
        window.location.href = itemUrl;
      },
    },
  });
};

// 监听搜索显示状态
watch(
  () => store.searchShow,
  async (val) => {
    if (val) {
      await nextTick();
      // 如果已经初始化，需要触发打开
      if (docsearchInstance) {
        const searchButton = document.querySelector(".DocSearch-Button");
        if (searchButton) {
          searchButton.click();
        }
      } else {
        await initDocsearch();
        // 初始化后自动打开
        setTimeout(() => {
          const searchButton = document.querySelector(".DocSearch-Button");
          if (searchButton) {
            searchButton.click();
          }
        }, 100);
      }
    }
  },
);

onMounted(() => {
  // 预加载 docsearch
  if (searchConfig.enable) {
    initDocsearch();
  }
});
</script>

<style lang="scss">
// DocSearch 自定义样式
.docsearch-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;

  .docsearch-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--main-mask-background);
    z-index: -1;
  }

  // 隐藏默认的搜索按钮，因为我们使用自己的触发方式
  .DocSearch-Button {
    display: none;
  }

  // 调整搜索模态框样式
  .DocSearch-Container {
    position: relative;
    z-index: 2001;
  }

  // 适配暗色主题
  .DocSearch-Modal {
    background-color: var(--main-card-background);
    border: 1px solid var(--main-card-border);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .DocSearch-SearchBar {
    border-bottom: 1px solid var(--main-card-border);
  }

  .DocSearch-Form {
    background-color: var(--main-card-second-background);
    border: 1px solid var(--main-card-border);

    &:focus-within {
      border-color: var(--main-color);
      box-shadow: 0 0 0 2px var(--main-color-bg);
    }
  }

  .DocSearch-Input {
    color: var(--main-font-color);
    font-family: var(--main-font-family);

    &::placeholder {
      color: var(--main-font-second-color);
    }
  }

  .DocSearch-Reset {
    color: var(--main-font-second-color);

    &:hover {
      color: var(--main-color);
    }
  }

  .DocSearch-Cancel {
    color: var(--main-color);
  }

  // 搜索结果列表
  .DocSearch-Dropdown {
    background-color: var(--main-card-background);
  }

  .DocSearch-Hit {
    border-radius: 8px;

    a {
      background-color: var(--main-card-second-background);
      border: 1px solid transparent;
      border-radius: 8px;

      &:hover {
        background-color: var(--main-color-bg);
        border-color: var(--main-color);
      }
    }

    &[aria-selected="true"] a {
      background-color: var(--main-color-bg);
      border-color: var(--main-color);
    }
  }

  .DocSearch-Hit-source {
    color: var(--main-font-color);
    background-color: var(--main-card-background);
    font-weight: 600;
  }

  .DocSearch-Hit-title {
    color: var(--main-font-color);
  }

  .DocSearch-Hit-path {
    color: var(--main-font-second-color);
  }

  .DocSearch-Hit-icon {
    color: var(--main-font-second-color);
  }

  // 高亮样式
  .DocSearch-Hit-Tree {
    color: var(--main-font-second-color);
  }

  .DocSearch-Highlight {
    color: var(--main-color);
    background: transparent;
    font-weight: 600;
  }

  // 无结果状态
  .DocSearch-NoResults {
    .DocSearch-Title {
      color: var(--main-font-color);
    }

    .DocSearch-Help {
      color: var(--main-font-second-color);
    }
  }

  .DocSearch-Title strong {
    color: var(--main-color);
  }

  // 开始屏幕
  .DocSearch-StartScreen {
    .DocSearch-Help {
      color: var(--main-font-second-color);
    }
  }

  .DocSearch-RecentSearches {
    .DocSearch-Label {
      color: var(--main-font-second-color);
    }
  }

  .DocSearch-RecentSearches-Item {
    background-color: var(--main-card-second-background);
    border: 1px solid transparent;
    border-radius: 8px;

    &:hover {
      background-color: var(--main-color-bg);
      border-color: var(--main-color);
    }

    .DocSearch-DeleteIcon,
    .DocSearch-FavoriteIcon {
      color: var(--main-font-second-color);

      &:hover {
        color: var(--main-color);
      }
    }
  }

  // 底部
  .DocSearch-Footer {
    background-color: var(--main-card-second-background);
    border-top: 1px solid var(--main-card-border);
  }

  .DocSearch-Logo {
    .DocSearch-Label {
      color: var(--main-font-second-color);
    }

    svg {
      color: var(--main-color);
    }
  }

  .DocSearch-Commands {
    color: var(--main-font-second-color);

    .DocSearch-Commands-Key {
      background-color: var(--main-card-background);
      border: 1px solid var(--main-card-border);
      color: var(--main-font-color);
    }
  }

  // 错误屏幕
  .DocSearch-ErrorScreen {
    .DocSearch-Title {
      color: var(--main-font-color);
    }

    .DocSearch-Help {
      color: var(--main-font-second-color);
    }
  }

  // 屏幕阅读器
  .DocSearch-Screen-Reader {
    color: var(--main-font-color);
  }
}

// 全局 DocSearch 样式覆盖（当模态框挂载到 body 时）
.DocSearch--active {
  body {
    overflow: hidden;
  }
}

// 暗色主题适配
html.dark {
  .DocSearch-Container {
    --docsearch-text-color: var(--main-font-color);
    --docsearch-muted-color: var(--main-font-second-color);
    --docsearch-container-background: rgba(0, 0, 0, 0.8);
    --docsearch-modal-background: var(--main-card-background);
    --docsearch-modal-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    --docsearch-searchbox-background: var(--main-card-second-background);
    --docsearch-searchbox-focus-background: var(--main-card-second-background);
    --docsearch-hit-color: var(--main-font-color);
    --docsearch-hit-active-color: var(--main-font-color);
    --docsearch-hit-background: var(--main-card-second-background);
    --docsearch-hit-shadow: none;
    --docsearch-key-gradient: linear-gradient(-225deg, var(--main-card-border), var(--main-card-background));
    --docsearch-key-shadow: none;
    --docsearch-footer-background: var(--main-card-second-background);
    --docsearch-footer-shadow: none;
    --docsearch-logo-color: var(--main-color);
    --docsearch-highlight-color: var(--main-color);
  }
}
</style>
