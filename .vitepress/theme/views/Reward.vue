<template>
  <div class="reward-page">
    <!-- 页面标题 -->
    <div class="reward-header">
      <h1 class="reward-title">赞助支持</h1>
      <p class="reward-subtitle">感谢您的支持，您的赞助将帮助我持续创作优质内容</p>
    </div>

    <!-- 扫码赞助卡片 -->
    <div class="qr-card">
      <div class="qr-card-header">
        <h2 class="qr-title">扫码赞助</h2>
        <p class="qr-desc">选择您喜欢的支付方式</p>
      </div>

      <!-- Tab 切换 -->
      <div class="qr-tabs">
        <button
          :class="['tab-btn', { active: activeTab === 'wechat' }]"
          @click="activeTab = 'wechat'"
        >
          <svg class="tab-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.56 2.78 4.66L4 17l2.5-1.18C7.55 16.27 8.5 16.5 9.5 16.5c.17 0 .33 0 .5-.02C9.68 15.83 9.5 15.18 9.5 14.5c0-3.04 2.69-5.5 6-5.5.5 0 .99.06 1.46.15C16.37 6.08 13.22 4 9.5 4M7 9a1 1 0 1 1 0-2a1 1 0 0 1 0 2m5 0a1 1 0 1 1 0-2a1 1 0 0 1 0 2m3.5 3c-2.97 0-5.5 2.14-5.5 4.5s2.53 4.5 5.5 4.5c.83 0 1.62-.17 2.33-.44L20 21.5l-.64-1.93C20.95 18.54 22 17.11 22 15.5c0-2.36-2.53-4.5-5.5-4.5m-2 5a.75.75 0 1 1 0-1.5a.75.75 0 0 1 0 1.5m4 0a.75.75 0 1 1 0-1.5a.75.75 0 0 1 0 1.5" />
          </svg>
          微信支付
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'alipay' }]"
          @click="activeTab = 'alipay'"
        >
          <svg class="tab-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-7.5 5.5h2V7h1.5v1.5H17V10h-2v1.34c1 .46 2.06 1.12 2.82 1.82l-1.06 1.06c-.5-.5-1.12-.94-1.76-1.28V17h-1.5v-4.47c-.88.32-1.84.5-2.82.5V11.5c.98 0 1.94-.18 2.82-.5V10h-3V8.5h3z" />
          </svg>
          支付宝
        </button>
      </div>

      <!-- 二维码展示 -->
      <div class="qr-display">
        <Transition name="qr-fade" mode="out-in">
          <img
            v-if="activeTab === 'wechat'"
            key="wechat"
            src="/reward/weixin.avif"
            alt="微信支付二维码"
            class="qr-img"
          />
          <img
            v-else
            key="alipay"
            src="/reward/alipay.avif"
            alt="支付宝二维码"
            class="qr-img"
          />
        </Transition>
      </div>
    </div>

    <!-- 赞助名单 -->
    <div class="sponsor-section">
      <h2 class="sponsor-title">赞助名单</h2>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner" />
        <span>加载中...</span>
      </div>

      <div v-else-if="sponsors.length === 0" class="empty-card">
        暂无赞助记录
      </div>

      <div v-else class="sponsor-grid">
        <div
          v-for="(s, i) in sponsors"
          :key="i"
          class="sponsor-card"
        >
          <div class="sponsor-avatar">
            <img
              v-if="s.avatar && !failedAvatars.has(i)"
              :src="s.avatar"
              :alt="s.name"
              @error="failedAvatars.add(i)"
            />
            <div v-else class="avatar-fallback">
              {{ s.name?.charAt(0) || '?' }}
            </div>
          </div>
          <div class="sponsor-info">
            <div class="sponsor-name">{{ s.name }}</div>
            <div class="sponsor-date">{{ s.date }}</div>
          </div>
          <div class="sponsor-amount">{{ s.amount }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { theme } = useData();

const activeTab = ref('wechat');
const sponsors = ref([]);
const loading = ref(true);
const failedAvatars = reactive(new Set());

onMounted(async () => {
  try {
    const res = await fetch('/sponsors.json');
    if (res.ok) {
      sponsors.value = await res.json();
    }
  } catch (e) {
    console.error('加载赞助数据失败:', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.reward-page {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
}

/* ============ 页面标题 ============ */
.reward-header {
  text-align: center;
  margin-bottom: 2.5rem;
}
.reward-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--main-font-color);
  margin: 0 0 0.6rem;
}
.reward-subtitle {
  font-size: 1rem;
  color: var(--main-font-second-color);
  margin: 0;
}

/* ============ 扫码赞助卡片 ============ */
.qr-card {
  padding: 1.5rem;
  border-radius: 16px;
  background-color: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  box-shadow: 0 8px 16px -4px var(--main-border-shadow);
  margin-bottom: 2.5rem;
}
.qr-card-header {
  margin-bottom: 1.2rem;
}
.qr-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--main-font-color);
  margin: 0 0 4px;
}
.qr-desc {
  font-size: 0.85rem;
  color: var(--main-font-second-color);
  margin: 0;
}

/* Tab 按钮 */
.qr-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 1.5rem;
}
.tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid var(--main-card-border);
  background: var(--main-card-second-background);
  color: var(--main-font-color);
  font-size: 0.9rem;
  font-family: var(--main-font-family);
  cursor: pointer;
  transition: all 0.25s;
  .tab-icon {
    color: var(--main-font-second-color);
    transition: color 0.25s;
  }
  &.active {
    background: var(--main-color);
    border-color: var(--main-color);
    color: #fff;
    .tab-icon {
      color: #fff;
    }
  }
  &:hover:not(.active) {
    border-color: var(--main-color);
  }
}

/* 二维码展示 */
.qr-display {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
}
.qr-img {
  width: 240px;
  height: 240px;
  border-radius: 12px;
  border: 1px solid var(--main-card-border);
  object-fit: contain;
  background: #fff;
}

/* Tab 切换动画 */
.qr-fade-enter-active,
.qr-fade-leave-active {
  transition: opacity 0.2s ease;
}
.qr-fade-enter-from,
.qr-fade-leave-to {
  opacity: 0;
}

/* ============ 赞助名单 ============ */
.sponsor-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--main-font-color);
  margin: 0 0 1.2rem;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 3rem 0;
  color: var(--main-font-second-color);
  font-size: 0.9rem;
}
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--main-card-border);
  border-top-color: var(--main-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-card {
  text-align: center;
  padding: 3rem 0;
  color: var(--main-font-second-color);
  font-size: 0.9rem;
  background: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  border-radius: 16px;
}

/* 赞助者网格 */
.sponsor-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.sponsor-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  background: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  box-shadow: 0 4px 8px -2px var(--main-border-shadow);
  transition: border-color 0.25s;
  &:hover {
    border-color: var(--main-color);
  }
}

/* 头像 */
.sponsor-avatar {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    display: block;
  }
}
.avatar-fallback {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--main-card-second-background);
  border: 1px solid var(--main-card-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  color: var(--main-font-second-color);
}

/* 信息 */
.sponsor-info {
  flex: 1;
  min-width: 0;
}
.sponsor-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--main-font-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sponsor-date {
  font-size: 0.75rem;
  color: var(--main-font-second-color);
  margin-top: 2px;
}
.sponsor-amount {
  flex-shrink: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--main-color);
  white-space: nowrap;
}

/* ============ 响应式 ============ */
@media (max-width: 768px) {
  .reward-page {
    padding: 1rem 0 2rem;
  }
  .reward-title {
    font-size: 1.6rem;
  }
  .sponsor-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .qr-img {
    width: 200px;
    height: 200px;
  }
}
@media (max-width: 480px) {
  .sponsor-grid {
    grid-template-columns: 1fr;
  }
}
</style>
