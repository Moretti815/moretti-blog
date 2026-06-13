---
title: VitePress 文章诗词展示标签效果
description: 基于 markdown-it 自定义 block 规则实现的诗词展示标签，支持标题、作者、落款等效果
date: 2026-06-19
categories: [开发教程]
tags: [VitePress, Markdown, markdown-it]
---

# VitePress 文章诗词展示标签效果

本站使用自定义 `markdown-it` block 规则，支持通过 `::poetry` 语法在文章中渲染诗词样式的文本，支持标题、作者、落款等元素。

## 语法说明

使用 `::poetry` 包裹内容，`---` 之间为 YAML 配置：

```md
::poetry
---
title: 诗的标题
author: 作者名
footer: 可选的落款
---
诗的第一行
诗的第二行
::
```

## 基础用法

最简单的用法，只有正文没有元信息：

```md
::poetry
静夜思
床前明月光，
疑是地上霜。
举头望明月，
低头思故乡。
::
```

::poetry
静夜思
床前明月光，
疑是地上霜。
举头望明月，
低头思故乡。
::

## 完整用法

指定标题、作者和落款：

```md
::poetry
---
title: 诗有诗的标题
author: 一名作者
footer: 可选的落款
---
如你所见，
我,
是一首——
*诗*。
::
```

::poetry
---
title: 诗有诗的标题
author: 一名作者
footer: 可选的落款
---
如你所见，
我,
是一首——
*诗*。
::

## 只有标题

仅指定标题，不包含作者和落款：

```md
::poetry
---
title: 春晓
---
春眠不觉晓，
处处闻啼鸟。
夜来风雨声，
花落知多少。
::
```

::poetry
---
title: 春晓
---
春眠不觉晓，
处处闻啼鸟。
夜来风雨声，
花落知多少。
::

## 支持内联格式

诗词正文支持 Markdown 内联语法，如 **加粗**、*斜体*、`代码` 等：

```md
::poetry
---
title: 格式示例
author: Markdown 诗人
---
这是**加粗**的一行
这是*斜体*的一行
这是`代码`的一行
::
```

::poetry
---
title: 格式示例
author: Markdown 诗人
---
这是**加粗**的一行
这是*斜体*的一行
这是`代码`的一行
::
