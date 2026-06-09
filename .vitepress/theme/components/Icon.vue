<template>
  <img v-if="isUrl" :src="name" :alt="alt" class="smart-icon icon-img" />
  <span
    v-else-if="isIconify"
    ref="iconifyEl"
    :class="['iconify', className]"
    :data-icon="name"
    aria-hidden="true"
  />
  <i v-else :class="['iconfont', `icon-${name}`, className]" />
</template>

<script setup>
const props = defineProps({
  /** 图标标识：iconfont名称 / iconify格式(set:icon) / 图片URL */
  name: { type: String, required: true },
  alt: { type: String, default: '' },
  className: { type: String, default: '' },
});

const iconifyEl = ref(null);

/** 是否为外链图片 */
const isUrl = computed(() => /^https?:\/\//.test(props.name));
/** 是否为 Iconify 图标 (set:icon 格式) */
const isIconify = computed(() => /^[a-z0-9-]+:[a-z0-9-]+/.test(props.name));

// Iconify 脚本加载后扫描新元素
onMounted(() => {
  if (isIconify.value && typeof window !== 'undefined' && window.Iconify) {
    window.Iconify.scan(iconifyEl.value?.parentNode);
  }
});
</script>

<style scoped>
.smart-icon {
  width: 1em;
  height: 1em;
  object-fit: contain;
  vertical-align: middle;
}
</style>
