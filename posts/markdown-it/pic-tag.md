---
title: VitePress 文章图片展示标签效果
description: 基于 markdown-it 自定义 block 规则实现的图片展示标签，支持说明文字、灯箱缩放、尺寸控制等效果
date: 2026-06-18
categories: [开发教程]
tags: [VitePress, Markdown, markdown-it]
---

# VitePress 文章图片展示标签效果

本站使用自定义 `markdown-it` block 规则，支持通过 `::pic` 语法在文章中插入带说明文字的图片，并支持灯箱缩放。

## 语法说明

使用 `::pic` 包裹 YAML 配置块：

```md
::pic
---
src: https://picsum.photos/480/240
caption: 说明文字
# zoom: false       # 是否开启灯箱缩放，默认开启
# width: 480        # 指定最大宽度
# height: 240       # 指定最大高度
# mirror: https://images.weserv.nl/?url={url}  # 借助第三方图片加载服务
---
::
```

## 基础用法

最基本的用法，只指定图片地址：

```md
::pic
---
src: https://picsum.photos/480/240
---
::
```

::pic
---
src: https://picsum.photos/480/240
---
::

## 带说明文字

通过 `caption` 属性添加图片说明，显示在图片下方：

```md
::pic
---
src: https://picsum.photos/480/240
caption: 说明文字，还支持通过 width 或 height 属性指定尺寸
---
::
```

::pic
---
src: https://picsum.photos/480/240
caption: 说明文字，还支持通过 width 或 height 属性指定尺寸
---
::

## 指定尺寸

通过 `width` 或 `height` 控制图片的最大尺寸：

```md
::pic
---
src: https://picsum.photos/480/240
caption: 宽度限制为 300px
width: 300px
---
::
```

::pic
---
src: https://picsum.photos/480/240
caption: 宽度限制为 300px
width: 300px
---
::

```md
::pic
---
src: https://picsum.photos/480/240
caption: 高度限制为 150px
height: 150px
---
::
```

::pic
---
src: https://picsum.photos/480/240
caption: 高度限制为 150px
height: 150px
---
::

## 关闭灯箱缩放

设置 `zoom: false` 可以禁止点击图片打开灯箱：

```md
::pic
---
src: https://picsum.photos/480/240
caption: 点击此图片不会打开灯箱
zoom: false
---
::
```

::pic
---
src: https://picsum.photos/480/240
caption: 点击此图片不会打开灯箱
zoom: false
---
::

## 使用第三方图片代理

通过 `mirror` 属性可以将图片 URL 转发给第三方加载服务（如 `images.weserv.nl`），用 `{url}` 作为占位符：

```md
::pic
---
src: https://picsum.photos/480/240
caption: 通过 images.weserv.nl 代理加载
mirror: https://images.weserv.nl/?url={url}
---
::
```

::pic
---
src: https://picsum.photos/480/240
caption: 通过 images.weserv.nl 代理加载
mirror: https://images.weserv.nl/?url={url}
---
::

## 多张图片

在文章中连续使用多个 `::pic` 块，即可展示多张图片：

::pic
---
src: https://picsum.photos/640/360?random=1
caption: 第一张随机图片
---
::

::pic
---
src: https://picsum.photos/640/360?random=2
caption: 第二张随机图片
---
::
