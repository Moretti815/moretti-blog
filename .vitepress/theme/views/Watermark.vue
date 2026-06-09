<template>
  <div class="watermark-page">
    <!-- 标题 -->
    <div class="page-header">
      <svg class="header-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 18a2 2 0 0 1-1.932-1.482"/><path d="M10.424 4.679c.631-1.073.947-1.61 1.398-1.69a1 1 0 0 1 .356 0c.451.08.767.617 1.398 1.69l1.668 2.836a27.2 27.2 0 0 1 2.707 6.315c1.027 3.593-1.67 7.17-5.408 7.17h-1.086c-3.737 0-6.435-3.577-5.408-7.17a27.2 27.2 0 0 1 2.707-6.315z"/></g>
      </svg>
      <h1 class="header-title">图片水印</h1>
    </div>

    <!-- 控制面板 -->
    <div class="wm-card">
      <!-- 选择图片 + 重置按钮 -->
      <div class="form-row file-row">
        <div class="form-group flex-1">
          <label class="form-label">选择图片</label>
          <div class="file-input-wrapper">
            <input
              ref="fileInputRef"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              class="file-input"
              @change="handleFile"
            />
            <span class="file-placeholder">{{ fileName || '选择文件' }}</span>
          </div>
        </div>
        <button class="reset-btn" title="重置" @click="resetDefaults">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8s-3.58-8-8-8" />
          </svg>
        </button>
      </div>

      <!-- 水印文字 -->
      <div class="form-group">
        <label class="form-label">水印文字</label>
        <input v-model="watermarkText" type="text" class="text-input" placeholder="moretti" />
      </div>

      <!-- 类型选择 -->
      <div class="form-group">
        <label class="form-label">类型</label>
        <div class="select-wrapper">
          <select v-model="mode" class="custom-select">
            <option value="single">单个水印</option>
            <option value="tile">全屏平铺</option>
          </select>
          <svg class="select-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7 10l5 5l5-5z" />
          </svg>
        </div>
      </div>

      <!-- 字体大小 + 位置（双列） -->
      <div class="form-row two-col">
        <div class="form-group">
          <label class="form-label">字体大小 ({{ fontSize }})</label>
          <div class="slider-wrapper">
            <input
              v-model.number="fontSize"
              type="range"
              min="12"
              max="200"
              step="1"
              class="custom-slider"
            />
          </div>
        </div>
        <div v-if="mode === 'single'" class="form-group">
          <label class="form-label">位置</label>
          <div class="select-wrapper">
            <select v-model="position" class="custom-select">
              <option value="左上">左上</option>
              <option value="右上">右上</option>
              <option value="左下">左下</option>
              <option value="右下">右下</option>
            </select>
            <svg class="select-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="M7 10l5 5l5-5z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 不透明度 -->
      <div class="form-group">
        <label class="form-label">不透明度 ({{ opacity }}%)</label>
        <div class="slider-wrapper">
          <input
            v-model.number="opacity"
            type="range"
            min="5"
            max="100"
            step="1"
            class="custom-slider"
          />
        </div>
      </div>
    </div>

    <!-- 预览区域 -->
    <div v-if="imageSrc" class="preview-card">
      <img :src="processedUrl || imageSrc" alt="水印结果" class="preview-img" />
      <button v-if="processedUrl" class="download-btn" @click="handleDownload">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
          <path fill="currentColor" d="M5 20h14v-2H5zM19 9h-4V3H9v6H5l7 7z" />
        </svg>
        下载图片
      </button>
    </div>
  </div>
</template>

<script setup>
const imageSrc = ref(null);
const imageLoaded = ref(null);
const watermarkText = ref('');
const fontSize = ref(48);
const opacity = ref(30);
const position = ref('右下');
const mode = ref('single');
const processedUrl = ref(null);
const fileName = ref('');
const fileInputRef = ref(null);

function resetDefaults() {
  watermarkText.value = '';
  fontSize.value = 48;
  opacity.value = 30;
  position.value = '右下';
  mode.value = 'single';
}

function handleFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  fileName.value = file.name;
  const img = new Image();
  img.onload = () => { imageLoaded.value = img; };
  img.src = URL.createObjectURL(file);
  imageSrc.value = img.src;
}

// 响应式 canvas 水印处理
watch(
  () => [imageLoaded.value, watermarkText.value, fontSize.value, opacity.value, position.value, mode.value],
  () => {
    const img = imageLoaded.value;
    const text = watermarkText.value.trim();
    if (!img || !text) { processedUrl.value = null; return; }

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const fs = fontSize.value;
    const op = opacity.value;
    ctx.font = `bold ${fs}px sans-serif`;
    ctx.fillStyle = op >= 100 ? '#ffffff' : `rgba(255,255,255,${op / 100})`;
    ctx.textBaseline = 'bottom';

    const textWidth = ctx.measureText(text).width;
    const padding = 20;

    if (mode.value === 'tile') {
      const spacingX = textWidth + 60;
      const spacingY = fs + 60;
      for (let y = padding; y < canvas.height; y += spacingY) {
        for (let x = padding; x < canvas.width; x += spacingX) {
          ctx.fillText(text, x, y);
        }
      }
    } else {
      let x, y;
      switch (position.value) {
        case '左上': x = padding; y = fs + padding; break;
        case '右上': x = canvas.width - textWidth - padding; y = fs + padding; break;
        case '左下': x = padding; y = canvas.height - padding; break;
        default: x = canvas.width - textWidth - padding; y = canvas.height - padding;
      }
      ctx.fillText(text, x, y);
    }

    processedUrl.value = canvas.toDataURL('image/png');
  },
);

function handleDownload() {
  if (!processedUrl.value) return;
  const a = document.createElement('a');
  a.href = processedUrl.value;
  a.download = 'watermarked.png';
  a.click();
}
</script>

<style lang="scss" scoped>
.watermark-page {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  padding: 1rem 0 2rem;
}

/* ============ 标题 ============ */
.page-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1.2rem;
  .header-icon {
    color: var(--main-color);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    position: relative;
    top: -6.5px;
    svg {
      display: block;
    }
  }
  .header-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--main-font-color);
    margin: 0;
    line-height: 1;
  }
}

/* ============ 控制面板卡片 ============ */
.wm-card {
  padding: 1.5rem;
  border-radius: 16px;
  background-color: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  box-shadow: 0 8px 16px -4px var(--main-border-shadow);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

/* ============ 表单元素 ============ */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  &.flex-1 { flex: 1; min-width: 0; }
}
.form-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--main-font-second-color);
}

/* 文件选择 */
.form-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.file-input-wrapper {
  position: relative;
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--main-card-border);
  background: var(--main-card-second-background);
  overflow: hidden;
  display: flex;
  align-items: center;
  .file-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    z-index: 1;
  }
  .file-placeholder {
    padding: 0 14px;
    font-size: 0.875rem;
    color: var(--main-font-second-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
  }
}

/* 重置按钮 */
.reset-btn {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 10px;
  border: 1px solid var(--main-card-border);
  background: var(--main-card-second-background);
  color: var(--main-font-second-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s;
  &:hover {
    color: var(--main-color);
    border-color: var(--main-color);
  }
}

/* 文字输入 */
.text-input {
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--main-card-border);
  background: var(--main-card-second-background);
  color: var(--main-font-color);
  font-size: 0.875rem;
  font-family: var(--main-font-family);
  outline: none;
  transition: border-color 0.25s;
  &::placeholder {
    color: var(--main-font-second-color);
    opacity: 0.5;
  }
  &:focus {
    border-color: var(--main-color);
  }
}

/* 下拉选择 */
.select-wrapper {
  position: relative;
}
.custom-select {
  width: 100%;
  height: 40px;
  padding: 0 36px 0 14px;
  border-radius: 10px;
  border: 1px solid var(--main-card-border);
  background: var(--main-card-second-background);
  color: var(--main-font-color);
  font-size: 0.875rem;
  font-family: var(--main-font-family);
  appearance: none;
  cursor: pointer;
  outline: none;
  transition: border-color 0.25s;
  &:focus {
    border-color: var(--main-color);
  }
}
.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--main-font-second-color);
}

/* 双列布局 */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* 滑动条 */
.slider-wrapper {
  padding: 4px 0;
}
.custom-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--main-card-border);
  outline: none;
  cursor: pointer;
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--main-color);
    border: 2px solid var(--main-card-background);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
    cursor: pointer;
    transition: transform 0.15s;
    &:hover {
      transform: scale(1.15);
    }
  }
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--main-color);
    border: 2px solid var(--main-card-background);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
    cursor: pointer;
  }
}

/* ============ 预览区域 ============ */
.preview-card {
  margin-top: 1.2rem;
  padding: 1rem;
  border-radius: 16px;
  background-color: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  box-shadow: 0 8px 16px -4px var(--main-border-shadow);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.preview-img {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--main-card-border);
  display: block;
}

/* 下载按钮 */
.download-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 42px;
  border: none;
  border-radius: 10px;
  background: var(--main-color);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: var(--main-font-family);
  cursor: pointer;
  transition: opacity 0.25s;
  svg { color: #fff; }
  &:hover {
    opacity: 0.88;
  }
  &:active {
    opacity: 0.75;
  }
}

/* ============ 响应式 ============ */
@media (max-width: 520px) {
  .watermark-page {
    padding: 0.5rem 0 1.5rem;
  }
  .wm-card {
    padding: 1.2rem;
  }
  .two-col {
    grid-template-columns: 1fr;
  }
}
</style>
