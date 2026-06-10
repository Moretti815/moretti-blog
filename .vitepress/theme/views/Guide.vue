<template>
  <div class="guide-page">
    <!-- 页面标题 -->
    <div class="guide-header">
      <div class="header-icon-row">
        <Icon name="material-symbols:explore" class-name="header-icon" />
        <h1 class="guide-title">导航</h1>
      </div>
      <p class="guide-subtitle">本站页面快捷入口，点击即可跳转</p>
    </div>

    <!-- 分组列表 -->
    <div v-for="(group, gi) in guideGroups" :key="gi" class="guide-group">
      <div class="group-header">
        <Icon :name="group.icon" class-name="group-icon" />
        <span class="group-title">{{ group.title }}</span>
      </div>
      <div class="group-items">
        <a
          v-for="(item, ii) in group.items"
          :key="ii"
          :href="item.href"
          class="guide-item"
          :target="item.external ? '_blank' : '_self'"
        >
          <div class="item-icon-wrap">
            <Icon :name="item.icon" class-name="item-icon" />
          </div>
          <div class="item-text">
            <span class="item-title">{{ item.title }}</span>
            <span class="item-desc">{{ item.desc }}</span>
          </div>
          <span class="item-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6l-6 6z" />
            </svg>
          </span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { guideGroups } from '../assets/guideData.mjs';
</script>

<style lang="scss" scoped>
.guide-page {
  max-width: 680px;
  margin: 0 auto;
  padding: 2rem 0;
}

.guide-header {
  margin-bottom: 2rem;
  .header-icon-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    .header-icon {
      font-size: 1.6rem;
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
  }
  .guide-title {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--main-font-color);
    margin: 0;
  }
  .guide-subtitle {
    font-size: 0.88rem;
    color: var(--main-font-second-color);
    margin: 0;
    line-height: 1.6;
  }
}

.guide-group {
  margin-bottom: 1.8rem;
  &:last-child {
    margin-bottom: 0;
  }
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.7rem;
  padding-left: 0.2rem;
  .group-icon {
    font-size: 1.15rem;
    color: var(--main-color);
  }
  .group-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--main-font-color);
  }
}

.group-items {
  background: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 12px -2px var(--main-border-shadow);
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem 1.2rem;
  text-decoration: none;
  border-bottom: 1px solid var(--main-card-border);
  transition: background-color 0.25s;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: var(--main-card-second-background);
    .item-title {
      color: var(--main-color);
    }
    .item-icon-wrap {
      background: var(--main-color);
      .item-icon {
        color: #fff;
      }
    }
    .item-arrow {
      opacity: 1;
      color: var(--main-color);
      transform: translateX(2px);
    }
  }
}

.item-icon-wrap {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--main-card-second-background);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.25s;
  .item-icon {
    font-size: 1.15rem;
    color: var(--main-color);
    transition: color 0.25s;
  }
}

.item-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  .item-title {
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--main-font-color);
    transition: color 0.25s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .item-desc {
    font-size: 0.78rem;
    color: var(--main-font-second-color);
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.item-arrow {
  flex-shrink: 0;
  color: var(--main-font-second-color);
  opacity: 0.4;
  transition: all 0.25s;
  svg {
    display: block;
  }
}

@media (max-width: 768px) {
  .guide-page {
    padding: 1rem 0;
  }
  .guide-header .guide-title {
    font-size: 1.3rem;
  }
  .guide-item {
    padding: 0.8rem 1rem;
    gap: 0.6rem;
  }
  .item-icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    .item-icon {
      font-size: 1rem;
    }
  }
  .item-text {
    .item-title {
      font-size: 0.88rem;
    }
    .item-desc {
      font-size: 0.74rem;
    }
  }
}
</style>
