---
title: VitePress 文章引用标签效果展示
description: 基于 markdown-it 自定义内联和 block 规则实现的引用标签，支持 Iconify 图标、自定义图标插槽与文字一起展示
date: 2026-06-20
categories: [开发教程]
tags: [VitePress, Markdown, markdown-it]
---

# VitePress 文章引用标签效果展示

本站使用自定义 `markdown-it` 规则，支持通过 `:quote[...]` 和 `::quote` 语法在文章中渲染带图标的引用内容。

## 语法说明

### 内联语法

```md
:quote[有时候，有些话，有点意思。]
```

### 块级语法（指定图标）

```md
::quote{icon="tabler:files"}
令图标有所指，引用亦有中心。
::
```

### 块级语法（图标插槽）

```md
::quote
#icon
ヾ(•ω•`)o
#default
图标插槽也可以是 Emoji 或颜文字，或者英文装饰。
::
```

## 内联引用

最简单的用法，直接在行内使用：

```md
:quote[有时候，有些话，有点意思。]
```

:quote[有时候，有些话，有点意思。]

可以在段落中混合使用：

```md
正如古人所说，:quote[学而不思则罔，思而不学则殆。]这句话至今仍有深意。
```

正如古人所说，:quote[学而不思则罔，思而不学则殆。]这句话至今仍有深意。

## 块级引用（指定图标）

通过 `{icon="..."}` 属性指定 Iconify 图标名称：

```md
::quote{icon="tabler:files"}
令图标有所指，引用亦有中心。
::
```

::quote{icon="tabler:files"}
令图标有所指，引用亦有中心。
::

使用不同图标：

```md
::quote{icon="tabler:heart"}
代码是一种艺术，每一行都有其存在的意义。
::
```

::quote{icon="tabler:heart"}
代码是一种艺术，每一行都有其存在的意义。
::

```md
::quote{icon="tabler:bulb"}
灵感往往来自于日常生活中的细微观察。
::
```

::quote{icon="tabler:bulb"}
灵感往往来自于日常生活中的细微观察。
::

## 块级引用（图标插槽）

通过 `#icon` 插槽可以使用 Emoji、颜文字或任意文字作为图标：

```md
::quote
#icon
ヾ(•ω•`)o
#default
图标插槽也可以是 Emoji 或颜文字，或者英文装饰。
::
```

::quote
#icon
ヾ(•ω•`)o
#default
图标插槽也可以是 Emoji 或颜文字，或者英文装饰。
::

使用 Emoji 作为图标插槽：

```md
::quote
#icon
🌟
#default
每一颗星星都在讲述自己的故事。
::
```

::quote
#icon
🌟
#default
每一颗星星都在讲述自己的故事。
::

## 块级引用（默认图标）

不指定图标时，使用默认的 `tabler:message-2` 图标：

```md
::quote
有时候，简单的一段话，就能引起共鸣。
::
```

::quote
有时候，简单的一段话，就能引起共鸣。
::

## 支持内联格式

正文内容支持 Markdown 内联语法，如 **加粗**、*斜体* 等：

```md
::quote{icon="tabler:star"}
这是一段包含**加粗**和*斜体*的引用文字。
::
```

::quote{icon="tabler:star"}
这是一段包含**加粗**和*斜体*的引用文字。
::
