---
title: 使用 follow.it 为 VitePress 博客实现邮件订阅
description: 详细介绍如何在 VitePress 博客中集成 follow.it 邮件订阅服务，包括 RSS Feed 配置、站点验证、订阅表单嵌入和关注按钮开发
date: 2026-06-10
categories: [开发教程]
tags: [VitePress, follow.it, 邮件订阅, RSS]
---

# 使用 follow.it 为 VitePress 博客实现邮件订阅

博客最怕的就是"写了没人看"。RSS 虽然好用，但门槛偏高——读者得自己装阅读器。相比之下，**邮件订阅**对普通用户更友好：输入邮箱就能收到更新通知，零门槛。

本文记录如何在 VitePress 博客中集成 [follow.it](https://follow.it) 邮件订阅，实现从配置到页面开发的完整流程。

## 为什么选择 follow.it

follow.it 是一个免费的博客订阅聚合平台，它基于 RSS 源工作，但提供了邮件推送能力。相比其他邮件订阅方案：

- **免费**：个人博客完全免费使用
- **无需后端**：不依赖自己的邮件服务器，follow.it 负责邮件发送
- **自带 RSS 聚合**：读者既可以用邮箱订阅，也可以用 RSS 阅读器
- **GDPR 合规**：符合最新的隐私法规

## 第一步：注册并配置 Feed

### 1. 添加你的站点

访问 [follow.it 的 Feed 设置页面](https://follow.it/ni/#add-feature)，输入你的博客 URL（例如 `https://b.2005815.xyz`）。

follow.it 会自动检测你的 RSS Feed 地址。如果你的博客没有自动发现标签，也可以直接输入 RSS 地址，比如：

```
https://b.2005815.xyz/rss.xml
```

> **前提**：你的博客需要先生成有效的 RSS Feed。VitePress 可以使用 `vitepress-plugin-rss` 等插件自动生成。

### 2. 设计订阅表单

配置完 Feed 后，follow.it 会引导你进入表单设计页面。你可以在这里自定义：

- 表单标题文字
- 输入框和按钮的颜色、字体
- 表单圆角、阴影等样式

设计完成后，点击 Continue 进入代码获取页面。

### 3. 获取嵌入代码

follow.it 会生成一段 HTML 表单代码，核心部分类似：

```html
<form
  action="https://api.follow.it/subscription-form/你的加密token/8"
  method="post"
>
  <input type="email" name="email" required placeholder="请输入您的邮箱" />
  <button type="submit">订阅</button>
</form>
```

这段 `action` URL 是关键，它包含了你的 Feed 标识信息。

## 第二步：站点验证（Claim Feed）

follow.it 需要通过验证来确认你确实是这个站点的所有者。有两种方式：

### 方式一：Meta 标签验证（推荐）

follow.it 会生成一个验证字符串，你需要将它以 `<meta>` 标签的形式添加到网站的 `<head>` 中。

在 VitePress 中，打开 `.vitepress/config.mjs`，在 `head` 数组中添加：

```js
export default defineConfig({
  head: [
    // ...其他 head 配置
    [
      "meta",
      {
        name: "follow.it-verification-code",
        content: "你的验证字符串",
      },
    ],
  ],
});
```

添加后回到 follow.it，点击邮件中的确认链接完成验证。

### 方式二：上传 HTML 文件

将 follow.it 提供的 HTML 验证文件放到 `public/` 目录下，构建后会自动部署到站点根路径。

## 第三步：创建订阅页面

### 页面组件

在 `.vitepress/theme/views/` 下创建 `Rss.vue`：

```vue
<template>
  <div class="rss-page">
    <div class="rss-header">
      <h1 class="rss-title">欢迎您订阅本站!</h1>
      <p class="rss-subtitle">
        您可以通过以下方式订阅本站的最新文章，第一时间获取更新通知
      </p>
    </div>

    <!-- 邮件订阅卡片 -->
    <div class="subscribe-card">
      <div class="card-header">
        <span class="card-number">1</span>
        <div class="card-header-text">
          <h2 class="card-title">邮件订阅</h2>
          <p class="card-desc">通过邮箱接收本站最新文章更新通知</p>
        </div>
      </div>
      <form
        class="subscribe-form"
        action="https://api.follow.it/subscription-form/你的token/8"
        method="post"
        target="_blank"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="请输入您的邮箱地址"
          class="email-input"
        />
        <button type="submit" class="submit-btn">订阅</button>
      </form>
      <div class="card-footer">
        <span>由 follow.it 提供邮件订阅服务</span>
      </div>
    </div>

    <!-- RSS 订阅卡片 -->
    <div class="subscribe-card">
      <div class="card-header">
        <span class="card-number">2</span>
        <div class="card-header-text">
          <h2 class="card-title">RSS 订阅</h2>
          <p class="card-desc">自备 RSS 阅读器，复制下方地址即可订阅</p>
        </div>
      </div>
      <div class="rss-url-box">
        <span class="rss-url-text">{{ rssUrl }}</span>
        <button class="copy-btn" :class="{ copied: isCopied }" @click="copyRssUrl">
          {{ isCopied ? '已复制' : '复制' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const rssUrl = 'https://你的域名/rss.xml';
const isCopied = ref(false);

const copyRssUrl = async () => {
  try {
    await navigator.clipboard.writeText(rssUrl);
    isCopied.value = true;
    setTimeout(() => { isCopied.value = false; }, 2000);
  } catch {
    // 降级方案
    const input = document.createElement('input');
    input.value = rssUrl;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    isCopied.value = true;
    setTimeout(() => { isCopied.value = false; }, 2000);
  }
};
</script>
```

核心思路：将 follow.it 生成的表单代码嵌入 Vue 组件，用 `target="_blank"` 在新窗口完成订阅流程，避免页面跳转。

### 页面路由

在 `pages/` 目录下创建 `rss.md`：

```md
---
title: RSS 订阅
aside: false
---

<script setup>
import Rss from '../.vitepress/theme/views/Rss.vue'
</script>

<Rss />
```

### 明暗模式适配

所有颜色使用 CSS 变量，自动适配明暗模式：

```scss
.subscribe-card {
  background: var(--main-card-background);
  border: 1px solid var(--main-card-border);
}
.email-input {
  background: var(--main-card-second-background);
  border: 1.5px solid var(--main-card-border);
  color: var(--main-font-color);
  &:focus {
    border-color: var(--main-color);
  }
}
.submit-btn {
  background: var(--main-color);
  color: #fff;
}
```

### 移动端适配

768px 以下改为纵向堆叠布局：

```scss
@media (max-width: 768px) {
  .subscribe-form {
    flex-direction: column;
    .submit-btn { width: 100%; }
  }
}
```

## 第四步：文章页添加关注按钮

除了独立的订阅页面，还可以在每篇文章底部放一个"关注博主"按钮，提高转化率。

在文章页的打赏按钮旁边添加一个 follow 链接：

```vue
<a
  class="follow-btn"
  href="https://follow.it/你的博客?leanpub"
  target="_blank"
  rel="noopener"
>
  <Icon name="mingcute:follow-line" class-name="follow-icon" />
  <span>关注博主</span>
</a>
```

> `?leanpub` 是 follow.it 的 Lean Follow Page 地址，用户点击后会进入 follow.it 的订阅确认页面。

样式方面与打赏按钮对齐：

```scss
.follow-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 120px;
  border-radius: 8px;
  background: var(--main-card-second-background);
  border: 1.5px solid var(--main-card-border);
  text-decoration: none;
  color: var(--main-font-color);
  transition: all 0.3s;
  &:hover {
    border-color: var(--main-color);
    color: var(--main-color);
  }
}
```

## 第五步：验证订阅是否生效

配置完成后，做以下检查：

1. **访问订阅页面**，输入邮箱并提交，确认能跳转到 follow.it 的确认页面
2. **检查确认邮件**，follow.it 会发一封确认邮件，点击确认链接
3. **发布一篇新文章**，确认订阅者能收到邮件通知
4. **检查 RSS 地址**，确保 `https://你的域名/rss.xml` 能正常返回 XML 内容

你也可以在 follow.it 的 Publisher Dashboard 中查看订阅者数量和发送记录。

## 总结

整个集成过程不需要任何后端代码，核心步骤：

| 步骤 | 操作 | 耗时 |
|------|------|------|
| 配置 Feed | 在 follow.it 添加博客 URL，设计表单 | 5 分钟 |
| 站点验证 | 添加 meta 标签到 VitePress config | 1 分钟 |
| 订阅页面 | 创建 Vue 组件 + 页面路由 | 15 分钟 |
| 关注按钮 | 文章页添加 follow 链接 | 5 分钟 |

follow.it 最大的优势就是**零后端成本**，特别适合静态博客。唯一的不足是免费版会有 follow.it 的品牌标识，但对于个人博客来说完全可以接受。
