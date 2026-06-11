---
title: LinkBanner 链接横幅标签
description: 仿 hexo 外挂标签的 ::link-banner 语法，在文章中嵌入带封面的链接横幅卡片
date: 2026-06-18
categories: [开发教程]
tags: [VitePress, Markdown, markdown-it]
---

# LinkBanner 链接横幅标签

本站使用自定义 `markdown-it` block 规则，支持通过 `::link-banner ... ::` 语法在文章中嵌入带封面图的链接横幅卡片。

## 语法说明

```md
::link-banner
---
banner: https://picsum.photos/480/240
title: 标题
description: 这是一行描述（可选，不提供则显示域名）
link: "#link-banner"
---
::
```

| 属性 | 类型 | 说明 |
|------|------|------|
| `banner` | String | 封面图 URL（可选，无图时仅显示文字） |
| `title` | String | 链接标题 |
| `description` | String | 描述文字（可选，不提供则自动显示域名） |
| `link` | String | 链接地址，支持内部和外部链接 |
| `mirror` | String | 图片镜像服务（可选：`weserv` / `baidu` / `fly`） |

## 基础用法

::link-banner
---
banner: https://picsum.photos/480/240
title: Lorem Picsum
description: 随机图片占位服务，每次刷新都会展示不同的图片。
link: https://picsum.photos
---
::

## 不带描述（自动显示域名）

当不提供 `description` 时，会自动提取链接域名作为描述：

::link-banner
---
banner: https://picsum.photos/480/240?random=1
title: GitHub
link: https://github.com
---
::

## 不带封面图

仅展示文字卡片，无封面背景图：

::link-banner
---
title: VitePress 官方文档
description: Vite 驱动、Vue 驱动的静态站点生成器
link: https://vitepress.dev
---
::

## 内部链接

支持站内链接：

::link-banner
---
banner: https://picsum.photos/480/240?random=2
title: 关于本站
description: 了解本站更多信息
link: /pages/about
---
::

## 搭配镜像服务

当图片无法直接访问时，可借助 `mirror` 属性使用第三方图片加载服务（weserv / baidu / fly）：

```md
::link-banner
---
banner: https://example.com/banner.jpg
title: 示例
link: https://example.com
mirror: weserv
---
::
```

## 多种风格展示

::link-banner
---
banner: https://picsum.photos/480/240?random=3
title: 纸鹿的博客
description: 分享技术与生活，摸鱼之余写点东西
link: https://www.zhilu.site
---
::

::link-banner
---
banner: https://picsum.photos/480/240?random=4
title: 無名小栈
link: https://blog.imsyy.top
---
::

## 实现原理

1. 自定义 `markdown-it` block 规则，在 fence 之前注册 `link_banner_block`
2. 匹配 `::link-banner` 开标记，解析内部的 YAML 式键值对
3. 查找对应的 `::` 闭标记
4. 根据属性渲染为带 `.link-banner` 类的 HTML

生成的 HTML 结构：

```html
<a class="link-banner s-card" href="链接" title="标题 - 描述 - 链接">
  <img class="link-banner-bg" src="封面图" alt="" loading="lazy" />
  <div class="link-banner-info">
    <div class="link-banner-title">标题</div>
    <div class="link-banner-desc">描述或域名</div>
  </div>
</a>
```

插件源码位于 `.vitepress/theme/utils/markdownItLinkBanner.mjs`，CSS 样式定义在 `post.scss` 中。
