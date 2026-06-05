<template>
  <div class="author-content" v-if="data">
    <div class="author-content-item myInfoAndWittyWord">
      <div class="title1">{{ data.sup }}</div>
      <div class="title2">
        <span class="inline-word">{{ data.name }}</span>
      </div>
      <div class="title1">{{ data.title }}</div>
    </div>
    <div class="aboutsiteTips author-content-item">
      <div class="author-content-item-tips">{{ data.tip }}</div>
      <h2>
        <span class="inline-word" v-html="data.slogan"></span>
        <div class="mask">
          <span
            v-for="(item, index) in data.mask"
            :key="index"
            :class="{
              'first-tips': index === 0,
            }"
            :data-show="currentMask === index ? '' : null"
            :data-up="currentMask === (index - 1 + data.mask.length) % data.mask.length ? '' : null"
          >
            {{ item }}
          </span>
        </div>
      </h2>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      sup: '',
      name: '',
      title: '',
      tip: '',
      slogan: '',
      mask: []
    })
  }
});

const currentMask = ref(0);
let pursuitInterval = null;

onMounted(() => {
  pursuitInterval = setInterval(() => {
    currentMask.value = (currentMask.value + 1) % props.data.mask.length;
  }, 2000);
});

onUnmounted(() => {
  if (pursuitInterval) {
    clearInterval(pursuitInterval);
  }
});
</script>

<style scoped lang="scss">
.author-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: stretch;
  margin-top: 0.5rem;
  gap: 0.5rem;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.author-content-item {
  width: 49%;
  border-radius: 12px;
  background: var(--efu-card-bg, var(--main-card-background));
  border: var(--style-border-always, 1px solid var(--main-card-border));
  box-shadow: var(--efu-shadow-lightblack, 0 4px 8px rgba(0, 0, 0, 0.1));
  position: relative;
  padding: 1rem 2rem;
  overflow: hidden;
  min-height: 180px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
  }
}

.myInfoAndWittyWord {
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: var(--efu-white, #fff);
  background: linear-gradient(120deg, #5b27ff 0, #00d4ff 100%);
  background-size: 200%;
  animation: gradient 15s ease infinite;
  flex: 1;

  .title1 {
    opacity: 0.8;
    line-height: 1.3;
    font-size: 0.8rem;
  }

  .title2 {
    font-size: 36px;
    font-weight: 700;
    line-height: 1.1;
    margin: 0.5rem 0;
  }

  .inline-word {
    word-break: keep-all;
    white-space: nowrap;
  }
}

.aboutsiteTips {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
  flex: 1;

  h2 {
    margin-right: auto;
    width: 100%;
    font-size: 36px;
    line-height: 1.06;
    letter-spacing: -0.02em;
    color: var(--efu-fontcolor, var(--main-font-color));
    margin-top: 0;

    @media (max-width: 768px) {
      font-size: 28px;
    }
  }

  .mask {
    height: 36px;
    position: relative;
    overflow: hidden;
    margin-top: 4px;

    span {
      display: block;
      box-sizing: border-box;
      position: absolute;
      top: 36px;
      padding-bottom: var(--offset, 0);
      background-size: 100% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      background-repeat: no-repeat;
      transition: 0.5s transform ease-in-out;

      &[data-show] {
        transform: translateY(-100%);
      }

      &[data-up] {
        transform: translateY(-200%);
      }

      &:nth-child(1) {
        background-image: linear-gradient(45deg, #0ecffe 50%, #07a6f1);
      }

      &:nth-child(2) {
        background-image: linear-gradient(45deg, #18e198 50%, #0ec15d);
      }

      &:nth-child(3) {
        background-image: linear-gradient(45deg, #8a7cfb 50%, #633e9c);
      }

      &:nth-child(4) {
        background-image: linear-gradient(45deg, #fa7671 50%, #f45f7f);
      }
    }
  }
}

.author-content-item-tips {
  opacity: 0.8;
  font-size: 0.6rem;
  margin-bottom: 0.5rem;
  color: var(--efu-fontcolor, var(--main-font-color));
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
