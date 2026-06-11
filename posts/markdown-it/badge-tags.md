---
title: Badge 徽章标签组件
description: 基于 Vue 组件的 Badge 徽章标签，支持自动获取站点图标、GitHub 头像识别、圆形/方形样式切换
date: 2026-06-14
categories: [开发教程]
tags: [VitePress, Vue, 组件]
---

# Badge 徽章标签组件

本站提供 `<Badge>` 组件，用于在文章中嵌入带图标的小标签。组件自动识别外部链接的站点图标和 GitHub 头像。

## 基本用法

<Badge text="普通带链接" link="#badge" /> <Badge text="纯文本指定圆形" round /> <Badge text="纯文本指定方形" square /> <Badge text="带个图" img="https://picsum.photos/100/100" />

语法：

```md
<Badge text="普通带链接" link="#badge" />
<Badge text="纯文本指定圆形" round />
<Badge text="纯文本指定方形" square />
<Badge text="带个图" img="https://picsum.photos/100/100" />
```

## 自动图标

外部域名自动获取站点图标 <Badge text="纸鹿" link="https://www.zhilu.site" />，<Badge text="古怪杂记本" link="https://gug.thisis.host/" square />，GitHub 链接能自动识别头像 <Badge text="KazariEX" link="https://github.com/KazariEX" />，也可指定方形 <Badge text="isYangs/GioPic" square link="https://github.com/isYangs/GioPic" />。

语法：

```md
<Badge text="纸鹿" link="https://www.zhilu.site" />
<Badge text="古怪杂记本" link="https://gug.thisis.host/" square />
<Badge text="KazariEX" link="https://github.com/KazariEX" />
<Badge text="isYangs/GioPic" square link="https://github.com/isYangs/GioPic" />
```

图标自动匹配规则：
- **GitHub 链接**：自动获取用户/仓库头像（`github.com/{user}.png`）
- **其他外部链接**：通过 Google Favicon 服务获取站点图标
- **手动指定**：使用 `img="url"` 覆盖自动图标

## 属性说明

| 属性 | 类型 | 说明 |
|------|------|------|
| `text` | `string` | 显示文本 |
| `link` | `string` | 链接地址，支持内部和外部链接 |
| `img` | `string` | 自定义图片 URL，覆盖自动图标 |
| `round` | `boolean` | 强制圆形样式 |
| `square` | `boolean` | 强制方形样式 |

样式规则：
- **有图时**默认圆形，指定 `square` 改为方形
- **无图时**默认方形，指定 `round` 改为圆形

## 在文本中使用

Badge 可以自然地嵌入段落文本中：这是一段关于 <Badge text="VitePress" link="https://vitepress.dev" /> 的介绍，它使用了 <Badge text="Vue" link="https://vuejs.org" /> 和 <Badge text="markdown-it" link="https://github.com/markdown-it/markdown-it" />。

## 与其他标签组合

Badge 可以和 ProseA 链接、自定义文本标签等其他外挂标签一起使用：

- [ProseA 智能链接](https://github.com)搭配 <Badge text="GitHub" link="https://github.com" />
- [变大变高]{.text-zoom}搭配 <Badge text="标签" round />

## 组件源码

组件位于 `.vitepress/theme/components/Tags/Badge.vue`，通过 `unplugin-vue-components` 自动注册，无需手动 import。
