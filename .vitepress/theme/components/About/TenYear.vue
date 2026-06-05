<template>
  <div class="author-content" id="tenyear" v-if="data">
    <div class="create-site-post author-content-item single">
      <div class="author-content-item-tips">{{ data.tips }}</div>
      <div class="author-content-item-title">{{ data.title }}</div>
      <p>{{ data.text }}</p>
      <div class="tenyear-timeline">
        <div class="progress" :style="{ '--progress-percentage': progressPercentage }"></div>
        <div class="past-time" :style="{ '--past-time-percentage': progressPercentage }"></div>
        <div class="percentage-label" :style="{ left: `calc(${Math.min(Math.max(progress, 5), 95)}% - 35px)` }">{{ progress.toFixed(0) }}%</div>
      </div>
      <div class="time-labels">
        <div class="start-time" id="tenyear-start-time">{{ formatDate(data.start) }}</div>
        <div class="end-time" id="tenyear-end-time">{{ formatDate(data.end) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      tips: '',
      title: '',
      text: '',
      start: '',
      end: ''
    })
  }
});

const progress = ref(0);
const progressPercentage = ref('0%');

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN');
};

onMounted(() => {
  if (!props.data.start || !props.data.end) return;

  const startTime = new Date(props.data.start).getTime();
  const endTime = new Date(props.data.end).getTime();
  const currentTime = new Date().getTime();

  const totalDuration = endTime - startTime;
  const elapsed = currentTime - startTime;

  const progressValue = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  progress.value = progressValue;
  progressPercentage.value = progressValue + '%';
});
</script>

<style scoped lang="scss">
.author-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 0.5rem;
  gap: 0.5rem;
  width: 100%;
}

.author-content-item {
  width: 100%;
  border-radius: 12px;
  background: var(--efu-card-bg, var(--main-card-background));
  border: var(--style-border-always, 1px solid var(--main-card-border));
  box-shadow: var(--efu-shadow-lightblack, 0 4px 8px rgba(0, 0, 0, 0.1));
  position: relative;
  padding: 1rem 2rem;
  overflow: hidden;
}

.create-site-post {
  .author-content-item-tips {
    opacity: 0.8;
    font-size: 0.6rem;
    margin-bottom: 0.5rem;
    color: var(--efu-fontcolor, var(--main-font-color));
  }

  .author-content-item-title {
    font-size: 36px;
    font-weight: 700;
    line-height: 1.1;
    color: var(--efu-fontcolor, var(--main-font-color));
    display: block;
    margin-bottom: 1rem;
  }

  p {
    font-size: 16px;
    line-height: 1.8;
    color: var(--efu-fontcolor, var(--main-font-color));
    margin-bottom: 1.5rem;
  }
}

.percentage-label {
  position: absolute;
  left: 0;
  font-size: 14px;
  color: var(--efu-card-bg, var(--main-card-background));
  font-weight: bold;
  top: 10px;
  white-space: nowrap;
  transition: left 0.5s linear;
  visibility: visible;
}

.time-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;

  > div {
    font-size: 14px;
    color: var(--efu-fontcolor, var(--main-font-color));
  }
}

.tenyear-timeline {
  width: 100%;
  background-color: var(--efu-background, var(--main-site-background));
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
  border-radius: 0.5rem;
  height: 2.5rem;
}

.progress {
  width: 0;
  height: 100%;
  background-color: var(--efu-main, var(--main-color));
  position: absolute;
  animation-delay: -0.1s;
  border-radius: 0.5rem;
  animation: progressAnimation 2s linear forwards;
}

.past-time {
  animation: pastTimeAnimation 3s linear forwards;
  width: 2px;
  height: 20px;
  position: absolute;
  transform-origin: left;
  background: var(--efu-white, #fff);
  top: 50%;
  transform: translateY(-50%);
}

@keyframes progressAnimation {
  0% {
    width: 0;
  }
  100% {
    width: var(--progress-percentage, 0);
  }
}

@keyframes pastTimeAnimation {
  0% {
    left: 0;
  }
  100% {
    left: var(--past-time-percentage, 0);
  }
}
</style>
