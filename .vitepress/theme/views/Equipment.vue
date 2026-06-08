<!-- 装备页面 -->
<template>
  <div class="equipment-page">
    <div v-for="(category, categoryIndex) in equipmentData" :key="categoryIndex" class="equipment-category">
      <!-- 分类头部横幅 -->
      <div class="equipment-hero" :style="getHeroStyle(category.top_background)">
        <div class="card-content">
          <div class="equipment-tips">{{ category.class_name }}</div>
          <h1 class="equipment-title">{{ category.description }}</h1>
          <div class="content-bottom">
            <p class="tips">{{ category.tip }}</p>
          </div>
        </div>
      </div>

      <!-- 好物分类 -->
      <div v-for="(goodThing, goodIndex) in category.good_things" :key="goodIndex" class="goodthings-section">
        <h2 class="goodthings-title">{{ goodThing.title }}</h2>
        <p class="goodthings-description">{{ goodThing.description }}</p>

        <!-- 设备列表 -->
        <div class="equipment-grid">
          <div
            v-for="(item, itemIndex) in goodThing.equipment_list"
            :key="itemIndex"
            class="equipment-item-content-item"
          >
            <!-- 设备图片 -->
            <div class="equipment-item-content-item-cover">
              <img
                :src="item.image"
                :alt="item.name"
                class="equipment-item-content-item-image"
                loading="lazy"
                @error="handleImageError"
              />
            </div>

            <!-- 设备信息 -->
            <div class="equipment-item-content-item-info">
              <div
                class="equipment-item-content-item-name"
                :title="item.name"
                @click="copyName(item.name)"
              >
                {{ item.name }}
              </div>
              <div class="equipment-item-content-item-specification">{{ item.specification }}</div>
              <div class="equipment-item-content-item-description">{{ item.description }}</div>

              <!-- 操作栏 -->
              <div class="equipment-item-content-item-toolbar">
                <a
                  :href="item.link"
                  target="_blank"
                  rel="external nofollow noreferrer"
                  class="equipment-item-content-item-link"
                >
                  详情
                </a>
                <div
                  class="bber-reply"
                  @click="goToComment(item)"
                  title="评论"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M5 3h13a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-4.59l-3.7 3.71c-.18.18-.43.29-.71.29a1 1 0 0 1-1-1v-3H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3m13 1H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h4v4l4-4h5a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import equipmentData from '../assets/equipmentData.mjs';

// 获取头部横幅样式
const getHeroStyle = (background) => {
  if (!background) return {};
  return {
    background: `url(${background}) left 37% / cover no-repeat`,
  };
};

// 处理图片加载失败
const handleImageError = (e) => {
  e.target.src = '/images/friend_404.gif';
};

// 复制设备名称
const copyName = (name) => {
  navigator.clipboard.writeText(name).then(() => {
    // 显示复制成功提示
    if (typeof $message !== 'undefined') {
      $message.success(`已复制装备名称 【${name}】`);
    }
  });
};

// 跳转到评论并填充内容
const goToComment = (item) => {
  // 构建评论内容（带引用格式）
  const content = `> ${item.name} / ${item.specification} ${item.description}`;

  // 存储到 sessionStorage，供评论组件读取
  sessionStorage.setItem('equipment-comment', content);

  // 尝试多种方式查找评论区域
  const commentSelectors = [
    '#comment-dom',
    '.comment-content',
    '.twikoo',
    '#twikoo',
    '.comments',
    '[id*="comment"]'
  ];

  let commentDom = null;
  for (const selector of commentSelectors) {
    commentDom = document.querySelector(selector);
    if (commentDom) break;
  }

  if (commentDom) {
    // 找到评论区域，平滑滚动到它
    commentDom.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    // 如果评论组件还没加载，先滚动到页面底部附近
    // 使用 document.documentElement.scrollHeight 获取准确高度
    const scrollHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const targetScroll = scrollHeight - windowHeight;

    window.scrollTo({
      top: targetScroll > 0 ? targetScroll : scrollHeight,
      behavior: 'smooth'
    });
  }

  // 延迟填充评论（等待 Twikoo 加载和滚动完成）
  setTimeout(() => {
    fillTwikooComment();
  }, 1000);
};

// 填充 Twikoo 评论框
const fillTwikooComment = () => {
  const content = sessionStorage.getItem('equipment-comment');
  if (!content) return;

  // 查找 Twikoo 输入框
  const commentInput = document.querySelector('.tk-input textarea, .tk-input .el-textarea__inner, textarea.tk-textarea');
  if (commentInput) {
    commentInput.value = content + '\n\n';
    commentInput.focus();
    // 触发 input 事件以更新 Vue 绑定
    commentInput.dispatchEvent(new Event('input', { bubbles: true }));
    // 清除存储
    sessionStorage.removeItem('equipment-comment');
  }
};
</script>

<style lang="scss" scoped>
.equipment-page {
  width: 100%;
  animation: fade-up 0.6s 0.1s backwards;
}

.equipment-category {
  margin-bottom: 3rem;
}

/* 头部横幅 */
.equipment-hero {
  position: relative;
  width: 100%;
  height: 280px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, var(--main-color) 0%, var(--main-color-dark) 100%);
  margin-bottom: 2rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
  }

  .card-content {
    position: relative;
    z-index: 1;
    text-align: center;
    color: white;
    padding: 2rem;
  }

  .equipment-tips {
    font-size: 0.85rem;
    opacity: 0.9;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .equipment-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.75rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .content-bottom {
    .tips {
      font-size: 0.95rem;
      opacity: 0.9;
    }
  }
}

/* 好物分类 */
.goodthings-section {
  margin-bottom: 2rem;
}

.goodthings-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0 0 0.25rem;
  line-height: 1;
  color: var(--main-font-color);
}

.goodthings-description {
  font-size: 0.9rem;
  color: var(--main-font-second-color);
  margin-bottom: 1rem;
}

/* 设备网格 */
.equipment-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 -8px;
}

.equipment-item-content-item {
  width: calc(25% - 16px);
  border-radius: 12px;
  border: 1px solid var(--main-card-border);
  overflow: hidden;
  margin: 8px;
  background: var(--main-card-background);
  box-shadow: var(--main-border-shadow);
  min-height: 400px;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--main-color);
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.15);
  }
}

/* 设备图片 - 深色背景 */
.equipment-item-content-item-cover {
  width: 100%;
  height: 200px;
  background: #1a1a1a;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.equipment-item-content-item-image {
  object-fit: contain;
  height: 80%;
  width: 80%;
  transition: transform 0.3s ease;

  .equipment-item-content-item:hover & {
    transform: scale(1.03);
  }
}

/* 设备信息 */
.equipment-item-content-item-info {
  padding: 8px 16px 16px 16px;
  margin-top: 12px;
}

.equipment-item-content-item-name {
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: fit-content;
  cursor: pointer;
  color: var(--main-font-color);
  transition: color 0.3s ease;

  &:hover {
    color: var(--main-color);
  }
}

.equipment-item-content-item-specification {
  font-size: 12px;
  color: var(--main-font-second-color);
  line-height: 16px;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.equipment-item-content-item-description {
  line-height: 20px;
  color: var(--main-font-second-color);
  height: 60px;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  font-size: 14px;
}

/* 操作栏 */
.equipment-item-content-item-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: 12px;
  left: 0;
  width: 100%;
  padding: 0 16px;
}

.equipment-item-content-item-link {
  font-size: 12px;
  background: var(--main-card-second-background);
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  color: var(--main-font-color);
  transition: all 0.3s ease;

  &:hover {
    background: var(--main-color);
    color: white;
  }
}

.bber-reply {
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: var(--main-font-second-color);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--main-card-second-background);
    color: var(--main-color);
  }

  svg {
    display: block;
  }
}

/* 响应式 */
@media (max-width: 1200px) {
  .equipment-item-content-item {
    width: calc(33.333% - 16px);
  }
}

@media (max-width: 900px) {
  .equipment-item-content-item {
    width: calc(50% - 16px);
  }

  .equipment-hero {
    height: 240px;

    .equipment-title {
      font-size: 1.6rem;
    }
  }
}

@media (max-width: 768px) {
  .equipment-item-content-item {
    width: 100%;
  }

  .equipment-hero {
    height: 200px;

    .equipment-title {
      font-size: 1.3rem;
    }

    .equipment-tips {
      font-size: 0.75rem;
    }
  }

  .goodthings-title {
    font-size: 1.1rem;
  }

  .equipment-item-content-item-cover {
    height: 160px;
  }
}

/* 夜间模式 */
:global([data-theme="dark"]) {
  .equipment-hero {
    &::before {
      background: rgba(0, 0, 0, 0.5);
    }
  }

  .equipment-cover {
    background: #0d0d0d;
  }
}
</style>
