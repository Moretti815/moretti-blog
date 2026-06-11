---
title: VitePress 文章自定义标签效果展示
description: 基于 markdown-it-attrs 实现的自定义文本标签，支持行内类名、图标图片、故事感文字、阴影回声、滚动放大等效果
date: 2026-06-12
categories: [开发教程]
tags: [VitePress, Markdown, markdown-it]
---

# VitePress 文章自定义标签效果展示

本站使用 `markdown-it-attrs` 插件，支持在 Markdown 中通过 `{.classname}` 语法为行内元素添加 CSS 类名，实现丰富的文本效果。

## 语法说明

在任意行内元素后紧跟 `{.类名}` 即可为其添加 class：

```md
[文字内容]{.类名}
```

## 各级标题

### 三级标题

#### 四级标题

在 Front matter 中设置 `type: story`{lang="yaml"} 可以换用不同样式。

跟随 URL Hash（网址锚点）的高亮。

> 这是一段引用文字。引用可以用来强调某段话或者添加补充说明。

## 无序和有序列表

- 无序列表项 A
- 无序列表项 B
  - 嵌套项

1. 有序列表项 1
2. 有序列表项 2
3. 有序列表项 3

**粗体文字**、~~删除线文字~~、`行内代码`。

---

## 自定义标签效果

### 行内图标图片

带有 `icon` 类名的图片，会以行内方式嵌入文字中，不会触发 Fancybox 灯箱：

这是一段文字，中间有一个小图标 ![图片](https://picsum.photos/100/100){.icon} 看起来像嵌在文字里一样自然。

语法：

```md
![图片](https://picsum.photos/100/100){.icon}
```

### 标题感文字

[只在 type: story 时生效]{.title-like}，文字下方会出现主题色半透明下划线装饰。

语法：

```md
[文字内容]{.title-like}
```

### 故事感文字

[故事感。]{.text-story}

使用衬线字体和斜体，营造文学叙事氛围。

语法：

```md
[故事感。]{.text-story}
```

### 阴影回声

[阴 影 回 声]{.text-repeat}

宽字距搭配多层文字阴影，产生回声般的视觉层次。

语法：

```md
[阴 影 回 声]{.text-repeat}
```

### 滚动放大

滚动页面，然后悄悄[变大变高]{.text-zoom}，惊艳所有人。

语法：

```md
[变大变高]{.text-zoom}
```

## 组合使用

多种标签可以搭配使用，比如一段[充满故事感]{.text-story}的文字，突然[拉 开 距 离]{.text-repeat}，然后悄悄[绽放]{.text-zoom}。

## 实现原理

本站已安装 `markdown-it-attrs` 插件，它会在 markdown-it 解析阶段自动将 `{.classname}` 语法转换为 HTML 元素的 `class` 属性：

```md
[文字]{.my-class}
```

渲染为：

```html
<span class="my-class">文字</span>
```

然后在 `post.scss` 中为对应的 class 编写 CSS 样式即可。无需额外的 markdown-it 自定义容器配置。
