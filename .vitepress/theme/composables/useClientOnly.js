import { ref, onMounted } from 'vue';

/**
 * SSR Hydration 安全标记
 * 用于 Teleport / Canvas / window 等仅在客户端可用的场景
 * 返回响应式 isClient，服务端渲染时为 false，客户端 onMounted 后变为 true
 */
export function useClientOnly() {
  const isClient = ref(false);
  onMounted(() => {
    isClient.value = true;
  });
  return { isClient };
}
