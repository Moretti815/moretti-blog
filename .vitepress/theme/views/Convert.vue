<template>
  <div class="convert-page">
    <!-- 标题 -->
    <div class="page-header">
      <svg class="header-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="currentColor" d="M10 17h4v-2h-4zm0-4h7v-2h-7zM7 9h10V7H7zM2 22v-2h2.55q-1.2-.575-1.937-1.7t-.738-2.55q0-1.975 1.388-3.363T6.625 11v2q-1.125 0-1.937.8t-.813 1.95q0 .975.6 1.725t1.525.95V16h2v6zm8-1v-2h9V5H5v4H3V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21z" />
      </svg>
      <h1 class="header-title">图片转换</h1>
    </div>

    <!-- 控制面板 -->
    <div class="wm-card">
      <!-- 选择图片（多选） -->
      <div class="form-group">
        <label class="form-label">选择图片</label>
        <div class="file-input-wrapper">
          <input
            ref="fileInputRef"
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/bmp,image/avif"
            class="file-input"
            @change="handleFile"
          />
          <span class="file-placeholder">
            {{ files.length ? `已选择 ${files.length} 个文件` : '选择文件' }}
          </span>
        </div>
      </div>

      <!-- 目标格式 -->
      <div class="form-group">
        <label class="form-label">目标格式</label>
        <div class="select-wrapper">
          <select v-model="targetFormat" class="custom-select">
            <option v-for="fmt in FORMATS" :key="fmt.mime" :value="fmt.mime">
              {{ fmt.label }}
            </option>
          </select>
          <svg class="select-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7 10l5 5l5-5z" />
          </svg>
        </div>
      </div>

      <!-- 转换按钮 -->
      <button
        class="convert-btn"
        :disabled="!files.length || converting"
        @click="convertAll"
      >
        <!-- 加载旋转图标 -->
        <svg
          v-if="converting"
          class="spin-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8" opacity=".3" />
          <path fill="currentColor" d="M20 12h2A10 10 0 0 0 12 2V4a8 8 0 0 1 8 8" />
        </svg>
        <!-- 转换图标 -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <path fill="currentColor" d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99zM9 3L5 6.99h3V14h2V6.99h3z" />
        </svg>
        <span class="btn-text">
          {{ converting
            ? `转换中 ${currentIndex}/${totalCount}`
            : `转换 ${files.length} 个文件为 ${getFormatLabel(targetFormat)}`
          }}
        </span>
      </button>
    </div>

    <!-- 文件缩略图预览 -->
    <div v-if="files.length" class="preview-card">
      <p class="file-summary">
        已选择 {{ files.length }} 个文件，{{ doneCount }} 个已完成
      </p>
      <div class="thumb-grid">
        <div
          v-for="(f, i) in files"
          :key="i"
          class="thumb-item"
          :class="{ done: f.done }"
        >
          <img :src="f.src" :alt="f.name" loading="lazy" />
          <div class="thumb-label">{{ f.name }}</div>
          <!-- 完成勾选标记 -->
          <svg
            v-if="f.done"
            class="check-badge"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
          >
            <path fill="currentColor" d="m9 16.17l-3.88-3.88a1 1 0 0 0-1.41 1.42l4.59 4.58a1 1 0 0 0 1.41 0L20.3 7.71a1 1 0 0 0-1.41-1.42z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const FORMATS = [
  { mime: 'image/png', ext: 'png', label: 'PNG' },
  { mime: 'image/jpeg', ext: 'jpg', label: 'JPEG' },
  { mime: 'image/webp', ext: 'webp', label: 'WebP' },
  { mime: 'image/bmp', ext: 'bmp', label: 'BMP' },
  { mime: 'image/avif', ext: 'avif', label: 'AVIF' },
];

const files = ref([]);
const targetFormat = ref('image/png');
const converting = ref(false);
const currentIndex = ref(0);
const totalCount = ref(0);
const fileInputRef = ref(null);

const doneCount = computed(() => files.value.filter((f) => f.done).length);

function getFormatLabel(mime) {
  return FORMATS.find((f) => f.mime === mime)?.label || mime;
}

function handleFile(e) {
  const input = e.target;
  if (!input.files?.length) return;

  const itemList = [];
  let loaded = 0;
  const total = input.files.length;

  for (const f of input.files) {
    const name = f.name.replace(/\.[^.]+$/, '');
    const item = { name, src: '', convertedUrl: null, done: false };
    itemList.push(item);
    const reader = new FileReader();
    reader.onload = () => {
      item.src = reader.result;
      loaded++;
      if (loaded === total) {
        files.value = [...files.value, ...itemList];
      }
    };
    reader.readAsDataURL(f);
  }
  input.value = '';
}

function convertAll() {
  const pending = files.value.filter((f) => !f.done);
  if (!pending.length) return;
  converting.value = true;
  totalCount.value = pending.length;
  currentIndex.value = 0;
  processNext(pending);
}

function processNext(pending) {
  if (currentIndex.value >= pending.length) {
    converting.value = false;
    return;
  }
  const item = pending[currentIndex.value];
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const mime = targetFormat.value;
    const quality =
      mime === 'image/jpeg' || mime === 'image/webp' || mime === 'image/avif'
        ? 0.92
        : undefined;

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          item.convertedUrl = url;
          item.done = true;
          // 触发响应式更新
          files.value = [...files.value];
          // 自动下载
          const ext = FORMATS.find((f) => f.mime === targetFormat.value)?.ext || 'png';
          const a = document.createElement('a');
          a.href = url;
          a.download = `${item.name}.${ext}`;
          a.click();
        }
        currentIndex.value++;
        setTimeout(() => processNext(pending), 100);
      },
      mime,
      quality,
    );
  };
  img.src = item.src;
}
</script>

<style lang="scss" scoped>
.convert-page {
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
}
.form-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--main-font-second-color);
}

/* 文件选择 */
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

/* ============ 转换按钮 ============ */
.convert-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: var(--main-color);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: var(--main-font-family);
  cursor: pointer;
  transition:
    opacity 0.25s,
    background-color 0.25s;
  svg {
    color: #fff;
    flex-shrink: 0;
  }
  &:hover:not(:disabled) {
    opacity: 0.88;
  }
  &:active:not(:disabled) {
    opacity: 0.75;
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

/* 旋转动画 */
.spin-icon {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ============ 缩略图预览区域 ============ */
.preview-card {
  margin-top: 1.2rem;
  padding: 1rem;
  border-radius: 16px;
  background-color: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  box-shadow: 0 8px 16px -4px var(--main-border-shadow);
}
.file-summary {
  font-size: 0.8rem;
  color: var(--main-font-second-color);
  margin: 0 0 12px;
}
.thumb-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.thumb-item {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid var(--main-card-border);
  aspect-ratio: 1;
  transition: border-color 0.3s;
  &.done {
    border-color: var(--main-success-color);
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}
.thumb-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 10px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.check-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  color: var(--main-success-color);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

/* ============ 响应式 ============ */
@media (max-width: 520px) {
  .convert-page {
    padding: 0.5rem 0 1.5rem;
  }
  .wm-card {
    padding: 1.2rem;
  }
  .thumb-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
