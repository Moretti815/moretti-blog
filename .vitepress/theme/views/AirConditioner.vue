<template>
  <div class="ac-page" ref="pageRef">
    <!-- 星空背景 Canvas (仅客户端渲染，避免 SSR hydration 不匹配) -->
    <canvas v-if="isClient" ref="canvasRef" class="ac-canvas"></canvas>

    <!-- 顶部温度通知 -->
    <Transition name="ac-banner">
      <div v-if="bannerVisible" class="ac-banner" :class="bannerType">
        <span class="banner-icon">
          <svg v-if="bannerType === 'max'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1s1-.45 1-1V3c0-.55-.45-1-1-1zm5.14 2.86c-.39-.39-1.02-.39-1.41 0c-.39.39-.39 1.02 0 1.41c2.34 2.34 2.34 6.14 0 8.49c-1.17 1.17-2.71 1.76-4.24 1.76c-1.54 0-3.07-.59-4.24-1.76c-2.34-2.34-2.34-6.14 0-8.49c.39-.39.39-1.02 0-1.41c-.39-.39-1.02-.39-1.41 0c-3.12 3.12-3.12 8.2 0 11.32c1.56 1.56 3.61 2.34 5.66 2.34s4.1-.78 5.66-2.34c3.12-3.12 3.12-8.2-.02-11.32z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M11 2v3.27L8.36 3.09l-.72 1.23L10.28 6H7V4H5v2h2v3.28L4.36 7.1l-.72 1.23L6.28 10H3v2h3.28L3.64 13.1l.72 1.23L7 12.72V16H5v2h2v-2h3.28l-2.64 1.67.72 1.23L11 17.73V21h2v-3.27l2.64 1.67.72-1.23L13.72 16H17v2h2v-2h-2v-3.28l2.64 1.67.72-1.23L17.72 12H21v-2h-3.28l2.64-1.67-.72-1.23L17 8.72V5.44h2V4h-2v2h-3.28l2.64-1.68-.72-1.23L13 5.27V2h-2zm1 6.72l2 1.28l-2 1.28l-2-1.28l2-1.28zM9 12l2-1.28L13 12l-2 1.28L9 12zm6 0l2-1.28L19 12l-2 1.28L15 12z"/>
          </svg>
        </span>
        <span class="banner-text">{{ bannerText }}</span>
      </div>
    </Transition>

    <!-- 内容层 -->
    <div class="ac-content">
      <!-- 标题 -->
      <h1 class="ac-title">便携小空调</h1>
      <p class="ac-tip">
        Tip: 为你的夏日带去<span class="ac-tip-highlight">清凉!</span>
      </p>

      <!-- 空调控制面板 -->
      <div class="ac-panel">
        <!-- 左侧：能效标识 -->
        <div class="ac-efficiency">
          <div class="efficiency-label">
            <div class="efficiency-bar" style="background: #4ade80; width: 90%"></div>
            <div class="efficiency-bar" style="background: #22d3ee; width: 70%"></div>
            <div class="efficiency-bar" style="background: #3b82f6; width: 50%"></div>
            <div class="efficiency-bar" style="background: #a855f7; width: 35%"></div>
            <div class="efficiency-bar" style="background: #f43f5e; width: 20%"></div>
          </div>
          <span class="efficiency-text">能效等级</span>
          <span class="efficiency-level">一级</span>
        </div>

        <!-- 右侧：温度显示 -->
        <div class="ac-temp-display">
          <svg
            class="snowflake-icon"
            :class="{ spinning: mode === 'cool' && isOn }"
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M11 2v3.27L8.36 3.09l-.72 1.23L10.28 6H7V4H5v2h2v3.28L4.36 7.1l-.72 1.23L6.28 10H3v2h3.28L3.64 13.1l.72 1.23L7 12.72V16H5v2h2v-2h3.28l-2.64 1.67.72 1.23L11 17.73V21h2v-3.27l2.64 1.67.72-1.23L13.72 16H17v2h2v-2h-2v-3.28l2.64 1.67.72-1.23L17.72 12H21v-2h-3.28l2.64-1.67-.72-1.23L17 8.72V5.44h2V4h-2v2h-3.28l2.64-1.68-.72-1.23L13 5.27V2h-2zm1 6.72l2 1.28l-2 1.28l-2-1.28l2-1.28zM9 12l2-1.28L13 12l-2 1.28L9 12zm6 0l2-1.28L19 12l-2 1.28L15 12z"
            />
          </svg>
          <span class="temp-value">{{ temperature }}°C</span>
        </div>
      </div>

      <!-- 模式按钮 -->
      <div class="ac-modes">
        <button
          class="mode-btn mode-cool"
          :class="{ active: mode === 'cool' && isOn }"
          @click="setMode('cool')"
          title="制冷"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M11 2v3.27L8.36 3.09l-.72 1.23L10.28 6H7V4H5v2h2v3.28L4.36 7.1l-.72 1.23L6.28 10H3v2h3.28L3.64 13.1l.72 1.23L7 12.72V16H5v2h2v-2h3.28l-2.64 1.67.72 1.23L11 17.73V21h2v-3.27l2.64 1.67.72-1.23L13.72 16H17v2h2v-2h-2v-3.28l2.64 1.67.72-1.23L17.72 12H21v-2h-3.28l2.64-1.67-.72-1.23L17 8.72V5.44h2V4h-2v2h-3.28l2.64-1.68-.72-1.23L13 5.27V2h-2zm1 6.72l2 1.28l-2 1.28l-2-1.28l2-1.28zM9 12l2-1.28L13 12l-2 1.28L9 12zm6 0l2-1.28L19 12l-2 1.28L15 12z"
            />
          </svg>
        </button>

        <button
          class="mode-btn mode-power"
          :class="{ active: isOn }"
          @click="togglePower"
          title="开关"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1s1-.45 1-1V3c0-.55-.45-1-1-1zm5.14 2.86c-.39-.39-1.02-.39-1.41 0c-.39.39-.39 1.02 0 1.41c2.34 2.34 2.34 6.14 0 8.49c-1.17 1.17-2.71 1.76-4.24 1.76c-1.54 0-3.07-.59-4.24-1.76c-2.34-2.34-2.34-6.14 0-8.49c.39-.39.39-1.02 0-1.41c-.39-.39-1.02-.39-1.41 0c-3.12 3.12-3.12 8.2 0 11.32c1.56 1.56 3.61 2.34 5.66 2.34s4.1-.78 5.66-2.34c3.12-3.12 3.12-8.2-.02-11.32z"
            />
          </svg>
        </button>

        <button
          class="mode-btn mode-fan"
          :class="{ active: mode === 'fan' && isOn }"
          @click="setMode('fan')"
          title="送风"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.05 19c-.33 0-.65-.05-.96-.15c-1.03-.33-1.77-1.14-2.05-2.23L8 12.5H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h5.5c1.1 0 2 .9 2 2v2.52c1.87-.55 3.95.06 5.2 1.73c.74.98.98 2.2.66 3.38c-.14.54-.39 1.03-.72 1.45l-.03.03l-1.83 2.2c-.44.54-1.05.92-1.73 1.07c-.17.04-.35.06-.52.08c-.13.02-.26.04-.39.04M10.5 5H5v5.5h3l1.27 5.08c.08.32.3.56.61.66c.11.03.23.05.35.04c.19-.02.37-.1.51-.24l1.83-2.2c.1-.12.17-.26.21-.41c.1-.37.02-.75-.21-1.06c-.45-.6-1.24-.79-1.89-.44l-1.18.64z"
            />
          </svg>
        </button>
      </div>

      <!-- 温度调节按钮 -->
      <div class="ac-temp-controls">
        <button
          class="temp-btn"
          :disabled="!isOn"
          @click="changeTemp(-1)"
          title="降温"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7 10l5 5l5-5z" />
          </svg>
        </button>
        <button
          class="temp-btn"
          :disabled="!isOn"
          @click="changeTemp(1)"
          title="升温"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7 14l5-5l5 5z" />
          </svg>
        </button>
      </div>

      <!-- 状态提示 -->
      <p class="ac-status" v-if="!isOn">空调已关闭</p>
      <p class="ac-status" v-else>
        {{ mode === 'cool' ? '制冷模式' : '送风模式' }} · {{ temperature }}°C
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';

const pageRef = ref(null);
const canvasRef = ref(null);
const isClient = ref(false);

const temperature = ref(26);
const mode = ref('cool'); // 'cool' | 'fan'
const isOn = ref(true);

// 顶部通知
const bannerVisible = ref(false);
const bannerType = ref('max'); // 'max' | 'min'
const bannerText = ref('');
let bannerTimer = null;

function showBanner(type) {
  if (bannerTimer) clearTimeout(bannerTimer);
  bannerType.value = type;
  bannerText.value = type === 'max' ? '已达到最大温度啦' : '已经是最小温度啦';
  bannerVisible.value = true;
  bannerTimer = setTimeout(() => {
    bannerVisible.value = false;
  }, 2500);
}

let animationId = null;
let particles = [];
let stars = [];

function changeTemp(delta) {
  if (!isOn.value) return;
  const next = temperature.value + delta;
  if (next < 16) {
    showBanner('min');
    return;
  }
  if (next > 30) {
    showBanner('max');
    return;
  }
  temperature.value = next;
}

function setMode(m) {
  if (!isOn.value) {
    isOn.value = true;
  }
  mode.value = m;
}

function togglePower() {
  isOn.value = !isOn.value;
}

// 星空粒子系统
function initCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const parent = canvas.parentElement;

  function resize() {
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  }
  resize();

  // 生成星星
  stars = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.8 + 0.2,
    speed: Math.random() * 0.02 + 0.005,
    direction: Math.random() > 0.5 ? 1 : -1,
  }));

  // 生成金色粒子
  particles = Array.from({ length: 30 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    alpha: Math.random() * 0.6 + 0.2,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    life: Math.random() * 200 + 100,
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制星星
    for (const star of stars) {
      star.alpha += star.speed * star.direction;
      if (star.alpha >= 1) { star.alpha = 1; star.direction = -1; }
      if (star.alpha <= 0.1) { star.alpha = 0.1; star.direction = 1; }

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.fill();
    }

    // 绘制金色粒子
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      if (p.life <= 0 || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
        p.x = Math.random() * canvas.width;
        p.y = Math.random() * canvas.height;
        p.life = Math.random() * 200 + 100;
        p.alpha = Math.random() * 0.6 + 0.2;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(242, 185, 75, ${p.alpha * (p.life / 200)})`;
      ctx.fill();
    }

    animationId = requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', resize);
  return () => window.removeEventListener('resize', resize);
}

let cleanup;

onMounted(() => {
  // 标记客户端渲染，使 canvas 在 hydration 完成后才渲染
  isClient.value = true;
  nextTick(() => {
    cleanup = initCanvas();
  });
});

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId);
  if (bannerTimer) clearTimeout(bannerTimer);
  if (cleanup) cleanup();
});
</script>

<style lang="scss" scoped>
.ac-page {
  position: relative;
  width: 100%;
  min-height: 520px;
  background: linear-gradient(135deg, #0c0e1a 0%, #1a1c2e 50%, #0f1120 100%);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
}

.ac-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.ac-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 1.5rem;
  width: 100%;
  max-width: 420px;
}

/* 标题 */
.ac-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.5rem;
  text-align: center;
  letter-spacing: 0.05em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
}

.ac-tip {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 2rem;
  text-align: center;
  .ac-tip-highlight {
    color: #60a5fa;
    font-weight: 600;
  }
}

/* 控制面板 */
.ac-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  margin-bottom: 1.5rem;
}

/* 能效标识 */
.ac-efficiency {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  .efficiency-label {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 6px 8px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    width: 52px;
    .efficiency-bar {
      height: 5px;
      border-radius: 2px;
    }
  }
  .efficiency-text {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 2px;
  }
  .efficiency-level {
    font-size: 0.75rem;
    color: #4ade80;
    font-weight: 600;
  }
}

/* 温度显示 */
.ac-temp-display {
  display: flex;
  align-items: center;
  gap: 8px;
  .snowflake-icon {
    color: #60a5fa;
    flex-shrink: 0;
    transition: color 0.3s;
    &.spinning {
      animation: snowflake-spin 3s linear infinite;
    }
  }
  .temp-value {
    font-size: 2.8rem;
    font-weight: 200;
    color: #fff;
    font-family: 'Courier New', 'Consolas', monospace;
    letter-spacing: 0.05em;
    line-height: 1;
    text-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
  }
}

@keyframes snowflake-spin {
  to {
    transform: rotate(360deg);
  }
}

/* 模式按钮 */
.ac-modes {
  display: flex;
  gap: 1.2rem;
  margin-bottom: 1.2rem;
}

.mode-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
  }

  &.mode-cool.active {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    box-shadow: 0 0 16px rgba(59, 130, 246, 0.3);
  }

  &.mode-power.active {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
    box-shadow: 0 0 16px rgba(34, 197, 94, 0.3);
  }

  &.mode-fan.active {
    border-color: #f97316;
    background: rgba(249, 115, 22, 0.2);
    color: #fb923c;
    box-shadow: 0 0 16px rgba(249, 115, 22, 0.3);
  }
}

/* 温度调节 */
.ac-temp-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.temp-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;

  &:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  &:active:not(:disabled) {
    transform: scale(0.92);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

/* 顶部通知条 */
.ac-banner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  border-radius: 16px 16px 0 0;
  .banner-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
  &.max {
    background: linear-gradient(135deg, #f59e0b, #f97316);
    color: #fff;
    .banner-icon { color: #fff; }
  }
  &.min {
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    color: #fff;
    .banner-icon { color: #bfdbfe; }
  }
}

/* 通知动画 */
.ac-banner-enter-active {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.ac-banner-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 1, 0.45);
}
.ac-banner-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}
.ac-banner-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* 状态文字 */
.ac-status {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  text-align: center;
  letter-spacing: 0.05em;
}

/* 响应式 */
@media (max-width: 480px) {
  .ac-page {
    min-height: 460px;
    border-radius: 12px;
  }
  .ac-content {
    padding: 2rem 1rem;
  }
  .ac-title {
    font-size: 1.5rem;
  }
  .temp-value {
    font-size: 2.2rem !important;
  }
  .ac-panel {
    padding: 1rem;
  }
}
</style>
