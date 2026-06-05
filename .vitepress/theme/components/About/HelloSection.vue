<template>
  <div class="hello-about" ref="helloContainer">
    <div class="cursor" ref="cursor"></div>
    <div class="shapes">
      <div class="shape shape-1" ref="shape1"></div>
      <div class="shape shape-2" ref="shape2"></div>
      <div class="shape shape-3" ref="shape3"></div>
    </div>
    <div class="content">
      <h1>Hello there!</h1>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useMouseTracking } from '../../composables/useAnimation'
import { useMediaQuery } from '../../composables/useUtils'

const helloContainer = ref()
const cursor = ref()
const shape1 = ref()
const shape2 = ref()
const shape3 = ref()

const { setupMouseTracking } = useMouseTracking()
const { isMobile } = useMediaQuery()

let cleanup

onMounted(() => {
  // 仅在非移动端启用鼠标跟踪
  if (!isMobile.value && helloContainer.value && cursor.value) {
    cleanup = setupMouseTracking(
      '.hello-about',
      '.cursor', 
      '.shape'
    )
  }
})

onUnmounted(() => {
  if (cleanup) {
    cleanup()
  }
})
</script>

<style scoped lang="scss">
/* Hello动画区域 - 适配博客主题 */
.hello-about {
  margin: 0.5rem 0;
  border-radius: 12px;
  background: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  user-select: none;
  height: 200px;
  animation: slide-in 0.6s 0.4s backwards;
  width: 100%;
}

.shapes {
  position: relative;
  height: 200px;
  width: 100%;
  background: #2128bd;
  overflow: hidden;
}

.shape {
  will-change: transform;
  position: absolute;
  border-radius: 50%;
}

.shape.shape-1 {
  background: #005ffe;
  width: 650px;
  height: 650px;
  margin: -325px 0 0 -325px;
}

.shape.shape-2 {
  background: #ffe5e3;
  width: 440px;
  height: 440px;
  margin: -220px 0 0 -220px;
}

.shape.shape-3 {
  background: #ffcc57;
  width: 270px;
  height: 270px;
  margin: -135px 0 0 -135px;
}

.hello-about .content {
  top: 0;
  left: 0;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
  background: transparent;
  pointer-events: none;
}

.hello-about h1 {
  font-size: calc(0.18 * 100vw + 20px);
  color: #fff;
  margin: 0;
  text-align: center;
  font-weight: 700;
  line-height: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.02em;
}

.cursor {
  position: absolute;
  background: #2128bd;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  will-change: transform;
  user-select: none;
  pointer-events: none;
  z-index: 3;
}

/* 动画效果 */
@keyframes slide-in {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hello-about {
    height: 160px;
  }
  
  .hello-about .shapes {
    height: 160px;
  }
  
  .hello-about .content {
    height: 160px;
  }
  
  .hello-about h1 {
    font-size: calc(0.15 * 100vw + 24px);
  }
  
  .cursor {
    display: none;
  }
}

@media (max-width: 480px) {
  .hello-about {
    height: 120px;
  }
  
  .hello-about .shapes {
    height: 120px;
  }
  
  .hello-about .content {
    height: 120px;
  }
  
  .hello-about h1 {
    font-size: calc(0.14 * 100vw + 20px);
  }
}

/* 暗色主题 */
[data-theme=dark] .hello-about {
  border-color: var(--main-card-border);
}

[data-theme=dark] .hello-about h1 {
  color: #fff;
}
</style>
