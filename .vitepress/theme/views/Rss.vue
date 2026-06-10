<template>
  <div class="rss-page">
    <!-- 页面标题 -->
    <div class="rss-header">
      <h1 class="rss-title">欢迎您订阅本站!</h1>
      <p class="rss-subtitle">
        您可以通过以下方式订阅本站的最新文章，第一时间获取更新通知
      </p>
    </div>

    <!-- 邮件订阅 -->
    <div class="subscribe-card">
      <div class="card-header">
        <span class="card-number">1</span>
        <div class="card-header-text">
          <h2 class="card-title">邮件订阅</h2>
          <p class="card-desc">通过 GitHub Issues 订阅，下次本站更新文章将收到邮件推送</p>
        </div>
      </div>
      <div class="subscribe-form">
        <input
          v-model="emailInput"
          type="email"
          required
          placeholder="请输入您的邮箱地址"
          class="email-input"
          @keydown.enter="subscribeEmail"
        />
        <button class="submit-btn" :disabled="!isValidEmail" @click="subscribeEmail">
          订阅
        </button>
      </div>
      <ul class="subscribe-tips">
        <li>标题格式：<code>[邮箱订阅]your@email.com</code></li>
        <li>提交后请在 GitHub 上确认 Issue 标题无误后点击 Submit</li>
        <li>如需退订，可在 Issue 详情页删除该 Issue</li>
      </ul>
    </div>

    <!-- follow.it 邮件订阅 -->
    <div class="subscribe-card">
      <div class="card-header">
        <span class="card-number">2</span>
        <div class="card-header-text">
          <h2 class="card-title">邮件订阅（follow.it）</h2>
          <p class="card-desc">通过 follow.it 邮件服务订阅，无需 GitHub 账号</p>
        </div>
      </div>
      <form
        class="subscribe-form"
        action="https://api.follow.it/subscription-form/OVRJUlUyaHZ0M1pSa2crNU1aQXFuYWJldVNla3VoZWRldCtKaEtqaytmK0VrcWtUSm9KMXJ4MzRCang0MEdPMkFYS1A2dExQWnhtNTVDSk9SNTRvOERsdDNqSGJNVDk3cTVZWHpTV3JCU3ZsVW1Bdk9BQ05HYUxIWExzZjB6QVh8SUZBQWpoaGxaUzJjalczUnBsKzdEaUhpR1B4WjFOaEZCbDViYkJUWVZMdz0=/8"
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

    <!-- RSS 订阅 -->
    <div class="subscribe-card">
      <div class="card-header">
        <span class="card-number">3</span>
        <div class="card-header-text">
          <h2 class="card-title">RSS 订阅</h2>
          <p class="card-desc">您可通过 RSS 订阅来获取本站的更新，此方法您需自备 RSS 阅读器</p>
        </div>
      </div>
      <div class="rss-url-box">
        <span class="rss-url-text" ref="rssUrlText">{{ rssUrl }}</span>
        <button class="copy-btn" :class="{ copied: isCopied }" @click="copyRssUrl">
          <svg v-if="!isCopied" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z" />
          </svg>
          {{ isCopied ? '已复制' : '复制' }}
        </button>
      </div>
      <div class="rss-tips">
        <p>常用 RSS 阅读器推荐：</p>
        <div class="reader-list">
          <a href="https://feedly.com" target="_blank" rel="noopener" class="reader-tag">Feedly</a>
          <a href="https://inoreader.com" target="_blank" rel="noopener" class="reader-tag">Inoreader</a>
          <a href="https://netnewswire.com" target="_blank" rel="noopener" class="reader-tag">NetNewsWire</a>
          <a href="https://www.qirui.net" target="_blank" rel="noopener" class="reader-tag">QuiteRSS</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emailInput = ref('');
const isValidEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value));

const subscribeEmail = () => {
  if (!isValidEmail.value) {
    if (typeof $message !== 'undefined') {
      $message.error('请输入有效的邮箱地址');
    }
    return;
  }
  const title = `[邮箱订阅]${emailInput.value}`;
  const url = `https://github.com/Moretti815/Friend-Circle-Lite/issues/new?template=%E9%82%AE%E7%AE%B1%E8%AE%A2%E9%98%85.md&title=${encodeURIComponent(title)}`;
  window.open(url, '_blank');
};

const rssUrl = 'https://b.2005815.xyz/rss.xml';
const isCopied = ref(false);

const copyRssUrl = async () => {
  try {
    await navigator.clipboard.writeText(rssUrl);
    isCopied.value = true;
    if (typeof $message !== 'undefined') {
      $message.success('RSS 地址已复制到剪贴板');
    }
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch {
    // fallback
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

<style lang="scss" scoped>
.rss-page {
  max-width: 680px;
  margin: 0 auto;
  padding: 2rem 0;
}

.rss-header {
  text-align: center;
  margin-bottom: 2.5rem;
  .rss-title {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--main-font-color);
    margin: 0 0 0.6rem;
  }
  .rss-subtitle {
    font-size: 0.9rem;
    color: var(--main-font-second-color);
    margin: 0;
    line-height: 1.6;
  }
}

.subscribe-card {
  background: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  border-radius: 14px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 12px -2px var(--main-border-shadow);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
  .card-number {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--main-color);
    color: #fff;
    font-size: 0.85rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .card-header-text {
    flex: 1;
  }
  .card-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--main-font-color);
    margin: 0 0 0.25rem;
  }
  .card-desc {
    font-size: 0.82rem;
    color: var(--main-font-second-color);
    margin: 0;
    line-height: 1.5;
  }
}

.subscribe-form {
  display: flex;
  gap: 0.6rem;
  .email-input {
    flex: 1;
    height: 42px;
    padding: 0 1rem;
    border: 1.5px solid var(--main-card-border);
    border-radius: 10px;
    background: var(--main-card-second-background);
    color: var(--main-font-color);
    font-size: 0.88rem;
    outline: none;
    transition: border-color 0.3s;
    &::placeholder {
      color: var(--main-font-second-color);
      opacity: 0.7;
    }
    &:focus {
      border-color: var(--main-color);
    }
  }
  .submit-btn {
    flex-shrink: 0;
    height: 42px;
    padding: 0 1.6rem;
    border: none;
    border-radius: 10px;
    background: var(--main-color);
    color: #fff;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.3s, transform 0.2s;
    &:hover {
      opacity: 0.88;
    }
    &:active {
      transform: scale(0.97);
    }
    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }
}

.card-footer {
  margin-top: 0.6rem;
  text-align: center;
  span {
    font-size: 0.75rem;
    color: var(--main-font-second-color);
    opacity: 0.7;
  }
}
.subscribe-tips {
  margin: 0.8rem 0 0;
  padding-left: 1.2rem;
  li {
    font-size: 0.75rem;
    color: var(--main-font-second-color);
    line-height: 1.8;
  }
  code {
    padding: 0.1em 0.4em;
    border-radius: 4px;
    background: var(--main-card-second-background);
    font-size: 0.72rem;
  }
}

.rss-url-box {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  background: var(--main-card-second-background);
  border: 1.5px solid var(--main-card-border);
  border-radius: 10px;
  margin-bottom: 1rem;
  .rss-url-text {
    flex: 1;
    font-size: 0.85rem;
    color: var(--main-color);
    font-family: 'Courier New', monospace;
    word-break: break-all;
    user-select: all;
    line-height: 1.4;
  }
  .copy-btn {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.35rem 0.8rem;
    border: 1.5px solid var(--main-card-border);
    border-radius: 8px;
    background: var(--main-card-background);
    color: var(--main-font-color);
    font-size: 0.78rem;
    cursor: pointer;
    transition: all 0.3s;
    svg { display: block; }
    &:hover {
      border-color: var(--main-color);
      color: var(--main-color);
    }
    &.copied {
      border-color: var(--main-success-color);
      color: var(--main-success-color);
    }
  }
}

.rss-tips {
  p {
    font-size: 0.82rem;
    color: var(--main-font-second-color);
    margin: 0 0 0.6rem;
  }
  .reader-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .reader-tag {
    display: inline-block;
    padding: 0.3rem 0.75rem;
    border-radius: 8px;
    background: var(--main-card-second-background);
    border: 1px solid var(--main-card-border);
    color: var(--main-font-color);
    font-size: 0.78rem;
    text-decoration: none;
    transition: all 0.3s;
    &:hover {
      border-color: var(--main-color);
      color: var(--main-color);
    }
  }
}

@media (max-width: 768px) {
  .rss-page {
    padding: 1rem 0;
  }
  .rss-header .rss-title {
    font-size: 1.3rem;
  }
  .subscribe-card {
    padding: 1.2rem;
  }
  .subscribe-form {
    flex-direction: column;
    .submit-btn {
      width: 100%;
    }
  }
}
</style>
