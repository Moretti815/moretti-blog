---
title: VitePress 文章键盘按键标签效果展示
description: 基于 markdown-it 自定义内联标签和 Vue 组件实现的键盘按键标签，支持单键、修饰键、组合键、图标模式等效果
date: 2026-06-17
categories: [开发教程]
tags: [VitePress, Markdown, markdown-it]
---

# VitePress 文章键盘按键标签效果展示

本站使用自定义 `markdown-it` 内联标签和 Vue 组件，支持通过 `:key{code="..."}` 语法在文章中渲染键盘按键元素。按下对应按键时按钮会高亮，点击也会触发事件。

## 语法说明

使用 `:key{...}` 语法，大括号内指定按键属性：

```md
:key{code="Escape"}
:key{code="A" ctrl shift}
:key{alt icon}
```

| 属性 | 类型 | 说明 |
|------|------|------|
| `code` | String | 按键代码（如 `Escape`、`A`、`ArrowUp`） |
| `text` | String | 自定义显示文本 |
| `icon` | Boolean | 显示图标符号（macOS 默认） |
| `ctrl` | Boolean | 添加 Ctrl 修饰键 |
| `shift` | Boolean | 添加 Shift 修饰键 |
| `alt` | Boolean | 添加 Alt 修饰键 |
| `meta` | Boolean | 添加 Meta 修饰键 |
| `cmd` | Boolean | 智能适配（macOS 用 Cmd，Windows 用 Ctrl） |
| `prevent` | Boolean | 阻止按键默认行为 |

## 纯 Code

:key{code="Escape"} :key{code="F2"} :key{code="Control"} :key{code="A"} :key{code=" "} :key{code="Tab"} :key{code="Enter"}

## 指定修饰符、图标、文本

macOS 自动使用图标符号，Windows 显示文字。使用 `icon` 属性可强制启用图标模式：

:key{code="Control" icon} :key{alt icon} :key{shift icon} :key{code=" " text="空格"} :key{code="Tab" icon} :key{code="Enter" icon}

## 组合键

:key{code="A" ctrl shift} :key{alt shift} :key{code="Escape" ctrl alt icon}

## 热血组合技

:key{code="ArrowUp"} :key{code="ArrowUp"} :key{code="ArrowDown"} :key{code="ArrowDown"} :key{code="ArrowLeft"} :key{code="ArrowRight"} :key{code="ArrowLeft"} :key{code="ArrowRight"} :key{code="B"} :key{code="A"}

## 效果特点

- 按下对应按键时按钮高亮（主题色背景 + 下移效果）
- 鼠标点击按钮也会触发 press 事件
- 支持 macOS / Windows 自动适配图标
- 支持组合键（Ctrl+Shift+A 等）
- 支持自定义显示文本
- 使用 `<ClientOnly>` 包裹，确保 SSR 安全
