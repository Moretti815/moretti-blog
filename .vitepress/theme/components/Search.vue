<!-- 全局搜索 - DocSearch -->
<template>
  <!-- DocSearch 会自动创建模态框，这里不需要模板内容 -->
</template>

<script setup>
import { mainStore } from "@/store";
import { onMounted, watch } from "vue";

const store = mainStore();
let docsearchInstance = null;
let isInitialized = false;

const { theme } = useData();
const searchConfig = theme.value.search || {};

// 动态导入 docsearch
const initDocsearch = async () => {
  if (!searchConfig.enable || !searchConfig.appId || !searchConfig.apiKey) {
    console.warn("DocSearch 配置不完整");
    return;
  }

  if (isInitialized) return;
  isInitialized = true;

  const docsearch = (await import("@docsearch/js")).default;
  await import("@docsearch/css");

  docsearchInstance = docsearch({
    container: "#docsearch-container",
    appId: searchConfig.appId,
    apiKey: searchConfig.apiKey,
    indexName: searchConfig.indexName || "blog",
    placeholder: "搜索文章...",
    // 禁用默认按钮，我们使用自定义触发
    searchParameters: {
      hitsPerPage: 10,
    },
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
    // 搜索关闭时的回调
    onClose: () => {
      store.searchShow = false;
    },
    // 搜索结果点击
    navigator: {
      navigate: ({ itemUrl }) => {
        // 恢复 body 滚动
        document.body.style.overflow = "";
        document.body.classList.remove("DocSearch--active");
        // 使用 Vue Router 导航
        const router = useRouter();
        router.go(itemUrl);
      },
    },
  });
};

// 监听搜索显示状态
watch(
  () => store.searchShow,
  async (val) => {
    if (val) {
      await initDocsearch();
      // 触发 DocSearch 打开
      setTimeout(() => {
        const searchButton = document.querySelector("#docsearch-container .DocSearch-Button");
        if (searchButton) {
          searchButton.click();
        }
      }, 50);
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
// 隐藏默认的搜索按钮容器，但保留功能
#docsearch-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  overflow: hidden;
  z-index: -1;
  opacity: 0;
  pointer-events: none;
}

// DocSearch 模态框全局样式覆盖
.DocSearch-Container {
  --docsearch-text-color: var(--main-font-color);
  --docsearch-muted-color: var(--main-font-second-color);
  --docsearch-container-background: rgba(0, 0, 0, 0.6);
  --docsearch-modal-background: var(--main-card-background);
  --docsearch-modal-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  --docsearch-searchbox-background: var(--main-card-second-background);
  --docsearch-searchbox-focus-background: var(--main-card-second-background);
  --docsearch-hit-color: var(--main-font-color);
  --docsearch-hit-active-color: var(--main-font-color);
  --docsearch-hit-background: var(--main-card-second-background);
  --docsearch-hit-shadow: none;
  --docsearch-key-gradient: linear-gradient(-225deg, var(--main-card-border), var(--main-card-background));
  --docsearch-key-shadow: inset 0 -2px 0 0 var(--main-card-border), inset 0 0 1px 1px var(--main-card-border);
  --docsearch-footer-background: var(--main-card-second-background);
  --docsearch-footer-shadow: 0 -1px 0 0 var(--main-card-border);
  --docsearch-logo-color: var(--main-color);
  --docsearch-highlight-color: var(--main-color);

  z-index: 9999;
}

// 模态框主体
.DocSearch-Modal {
  background-color: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  max-width: 720px;
  margin: 60px auto auto;
}

// 搜索栏
.DocSearch-SearchBar {
  border-bottom: 1px solid var(--main-card-border);
  padding: 16px;
}

// 搜索表单
.DocSearch-Form {
  background-color: var(--main-card-second-background);
  border: 1px solid var(--main-card-border);
  border-radius: 12px;
  height: 48px;

  &:focus-within {
    border-color: var(--main-color);
    box-shadow: 0 0 0 3px var(--main-color-bg);
  }
}

// 搜索图标
.DocSearch-MagnifierLabel {
  color: var(--main-font-second-color);
  margin-left: 12px;
}

// 搜索输入框
.DocSearch-Input {
  color: var(--main-font-color);
  font-family: var(--main-font-family);
  font-size: 16px;
  padding: 0 12px;

  &::placeholder {
    color: var(--main-font-second-color);
  }
}

// 清除按钮
.DocSearch-Reset {
  color: var(--main-font-second-color);
  margin-right: 8px;

  &:hover {
    color: var(--main-color);
  }
}

// 取消按钮
.DocSearch-Cancel {
  color: var(--main-color);
  font-size: 14px;
  margin-left: 12px;
}

// 下拉区域
.DocSearch-Dropdown {
  background-color: var(--main-card-background);
  padding: 0 16px 16px;
  max-height: 500px;
  overflow-y: auto;
}

// 搜索结果项
.DocSearch-Hit {
  border-radius: 10px;
  margin-bottom: 8px;

  a {
    background-color: var(--main-card-second-background);
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 12px;
    transition: all 0.2s ease;

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

// 搜索结果来源
.DocSearch-Hit-source {
  color: var(--main-font-color);
  background-color: var(--main-card-background);
  font-weight: 600;
  font-size: 14px;
  padding: 12px 0 8px;
}

// 搜索结果标题
.DocSearch-Hit-title {
  color: var(--main-font-color);
  font-size: 14px;
  line-height: 1.5;
}

// 搜索结果路径
.DocSearch-Hit-path {
  color: var(--main-font-second-color);
  font-size: 12px;
  margin-top: 4px;
}

// 搜索结果图标
.DocSearch-Hit-icon {
  color: var(--main-font-second-color);
}

// 树形结构
.DocSearch-Hit-Tree {
  color: var(--main-font-second-color);
}

// 高亮样式
.DocSearch-Highlight {
  color: var(--main-color);
  background: transparent;
  font-weight: 600;
}

// 无结果状态
.DocSearch-NoResults {
  padding: 40px 0;

  .DocSearch-Title {
    color: var(--main-font-color);
    font-size: 16px;
  }

  .DocSearch-Help {
    color: var(--main-font-second-color);
    font-size: 14px;
    margin-top: 8px;
  }
}

.DocSearch-Title strong {
  color: var(--main-color);
}

// 开始屏幕
.DocSearch-StartScreen {
  padding: 20px 0;

  .DocSearch-Help {
    color: var(--main-font-second-color);
    font-size: 14px;
  }
}

// 最近搜索
.DocSearch-RecentSearches {
  .DocSearch-Label {
    color: var(--main-font-second-color);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.DocSearch-RecentSearches-Item {
  background-color: var(--main-card-second-background);
  border: 1px solid transparent;
  border-radius: 8px;
  margin-top: 8px;

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
  border-radius: 0 0 16px 16px;
  padding: 12px 16px;
}

.DocSearch-Logo {
  .DocSearch-Label {
    color: var(--main-font-second-color);
    font-size: 12px;
  }

  svg {
    color: var(--main-color);
  }
}

.DocSearch-Commands {
  color: var(--main-font-second-color);
  font-size: 12px;

  .DocSearch-Commands-Key {
    background-color: var(--main-card-background);
    border: 1px solid var(--main-card-border);
    border-radius: 4px;
    color: var(--main-font-color);
    padding: 2px 6px;
    font-size: 11px;
  }
}

// 错误屏幕
.DocSearch-ErrorScreen {
  padding: 40px 0;

  .DocSearch-Title {
    color: var(--main-font-color);
    font-size: 16px;
  }

  .DocSearch-Help {
    color: var(--main-font-second-color);
    font-size: 14px;
    margin-top: 8px;
  }
}

// 屏幕阅读器
.DocSearch-Screen-Reader {
  color: var(--main-font-color);
}

// 加载状态
.DocSearch-LoadingIndicator {
  color: var(--main-color);
}

// 响应式适配
@media (max-width: 768px) {
  .DocSearch-Modal {
    margin: 0;
    border-radius: 0;
    max-width: 100%;
    height: 100vh;
  }

  .DocSearch-Footer {
    border-radius: 0;
  }
}
</style>
