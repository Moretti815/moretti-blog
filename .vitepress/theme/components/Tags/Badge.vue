<!-- Badge 徽章标签组件 -->
<template>
  <a
    v-if="link"
    :href="link"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener noreferrer' : undefined"
    :title="tooltip"
    class="badge"
    :class="{ 'badge-round': isRound }"
  >
    <img v-if="iconUrl" class="badge-icon" :src="iconUrl" alt="" />
    <span class="badge-text">{{ text }}</span>
  </a>
  <span
    v-else
    class="badge"
    :class="{ 'badge-round': isRound }"
  >
    <img v-if="iconUrl" class="badge-icon" :src="iconUrl" alt="" />
    <span class="badge-text">{{ text }}</span>
  </span>
</template>

<script setup>
import { getDomain, isExternalLink } from '@/utils/linkIcons.mjs';

const props = defineProps({
  /** 显示文本 */
  text: { type: String, default: '' },
  /** 链接地址 */
  link: { type: String, default: '' },
  /** 自定义图片 URL */
  img: { type: String, default: '' },
  /** 强制圆形 */
  round: { type: Boolean, default: false },
  /** 强制方形 */
  square: { type: Boolean, default: false },
});

/** 是否为外部链接 */
const isExternal = computed(() => isExternalLink(props.link));

/** 自动获取图标 URL */
const iconUrl = computed(() => {
  // 1. 手动指定图片
  if (props.img) return props.img;
  if (!props.link) return '';

  // 2. GitHub 头像
  const ghMatch = props.link.match(/github\.com\/([^/]+)/);
  if (ghMatch) {
    return `https://github.com/${ghMatch[1]}.png?size=48`;
  }

  // 3. 外部链接 favicon
  if (isExternalLink(props.link)) {
    const domain = getDomain(props.link);
    if (domain) {
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    }
  }

  return '';
});

/** 圆角判断：有图默认圆形（除非 square），无图默认方形（除非 round） */
const isRound = computed(() => {
  if (iconUrl.value) return !props.square;
  return props.round;
});

/** 悬停提示 */
const tooltip = computed(() => {
  if (!props.link) return '';
  return getDomain(props.link) || props.link;
});
</script>

<style lang="scss" scoped>
.badge {
  display: inline-flex;
  align-items: baseline;
  margin: 0.1em;
  border: 1px solid var(--main-card-border);
  border-radius: 4px;
  box-sizing: content-box;
  background-color: var(--main-card-second-background);
  font-size: 0.875em;
  text-decoration: none;
  color: inherit;
  transition: color 0.2s;
  vertical-align: middle;

  @supports (color: color-mix(in srgb, transparent, transparent)) {
    border-color: color-mix(in srgb, currentcolor 10%, transparent);
    background-color: color-mix(in srgb, currentcolor 5%, transparent);
    color: color-mix(in srgb, currentcolor 80%, transparent);
  }

  &[href]:hover {
    color: var(--main-font-color);
  }

  &.badge-round,
  &.badge-round > .badge-icon {
    border-radius: 0.8em;
  }

  &::before {
    display: none !important;
  }
}

.badge-icon {
  align-self: normal;
  height: 1.6em;
  width: auto !important;
  border-radius: 3.5px;
  flex-shrink: 0;
  object-fit: cover;
  box-shadow: none !important;
  margin: 0 !important;

  + .badge-text {
    margin-inline-start: -0.1em;
  }
}

.badge-text {
  padding: 0.2em 0.4em;
  line-height: 1.2;

  &:empty {
    display: none;
  }
}
</style>
