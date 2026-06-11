---
title: ProseA 智能链接标签
description: 基于 markdown-it 的 ProseA 智能链接功能，自动根据域名展示 Iconify 图标，支持自定义图标、外部链接指示和悬停域名提示
date: 2026-06-13
categories: [开发教程]
tags: [VitePress, Markdown, markdown-it]
---

# 链接 ProseA

本站使用 ProseA 智能链接，自动为外部链接添加域名图标和访问提示。

## 基本效果

这是[内部链接](/pages/about)。

这是[站外链接](https://example.com)，默认在新标签页打开，并在鼠标悬停时展示域名。

根据域名自动匹配图标：

- [微软文档](https://docs.microsoft.com/zh-cn/)
- [GitHub](https://github.com)
- [哔哩哔哩](https://www.bilibili.com)
- [QQ 官网](https://im.qq.com)
- [微信公众号](https://mp.weixin.qq.com)
- [知乎](https://www.zhihu.com)
- [Google](https://www.google.com)

## 自定义图标

你可以将 `icon` 属性指定 Iconify 图标名，例如 [自定义图标](https://example.com){icon="tabler:color-swatch"}。图标可在 [Iconify](https://icon-sets.iconify.design/) 或 [Yesicon](https://yesicon.app/) 搜索。

语法：

```md
[文字](https://example.com){icon="tabler:color-swatch"}
```

更多自定义图标示例：

- [React 文档](https://react.dev){icon="simple-icons:react"}
- [Vue 文档](https://vuejs.org){icon="simple-icons:vuedotjs"}
- [VitePress](https://vitepress.dev){icon="simple-icons:vitepress"}

## 语法说明

### 自动域名图标

```md
[文字](https://github.com)
```

插件自动识别 `github.com` 并匹配 GitHub 图标。

### 自定义图标覆盖

```md
[文字](https://github.com){icon="ri:star-fill"}
```

使用 `icon` 属性覆盖自动匹配的图标。

### 内部链接

```md
[文字](/pages/about)
```

内部链接不会添加图标和外部链接指示器。

## 为更多站点匹配图标

你可以在 `blog/.vitepress/theme/utils/linkIcons.mjs` 中的 `domainIcons`（专门域名，优先级高）或 `mainDomainIcons`（主域名）添加匹配规则，为更多站点自动匹配图标。

## 实现原理

1. `markdown-it-attrs` 插件解析 `{icon="..."}` 属性并注入到链接 token
2. ProseA 插件覆盖 `link_open` 渲染器，读取 `icon` 属性和链接 URL
3. 根据域名从 `linkIcons.mjs` 映射表自动匹配 Iconify 图标
4. 渲染输出带有 `class="iconify"` + `data-icon` 的 `<span>`，Iconify 脚本扫描并渲染 SVG
