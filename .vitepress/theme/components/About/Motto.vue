<template>
  <div class="author-content">
    <!-- 座右铭 -->
    <div class="author-content-item maxim" v-if="motto">
      <div class="author-content-item-tips">{{ motto.title }}</div>
      <span class="maxim-title">
        <span>{{ motto.prefix }}</span>
        <span>{{ motto.content }}</span>
      </span>
    </div>

    <!-- 专长 -->
    <div class="author-content-item buff" v-if="expertise">
      <div class="card-content">
        <div class="author-content-item-tips">{{ expertise.title }}</div>
        <span class="buff-title">
          <span>
            {{ expertise.prefix }}
            <span class="inline-word">{{ expertise.specialist }}</span>
          </span>
          <span>
            {{ expertise.content }}
            <span class="inline-word">{{ expertise.level }}</span>
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  motto: {
    type: Object,
    default: null
  },
  expertise: {
    type: Object,
    default: null
  }
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

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.author-content-item {
  width: 49%;
  border-radius: 12px;
  border: var(--style-border-always, 1px solid var(--main-card-border));
  box-shadow: var(--efu-shadow-lightblack, 0 4px 8px rgba(0, 0, 0, 0.1));
  position: relative;
  padding: 1rem 2rem;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
  }
}

.maxim {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.1;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: center;
  background: var(--efu-card-bg, var(--main-card-background));
  min-height: 200px;

  .maxim-title {
    display: flex;
    flex-direction: column;

    span:first-child {
      opacity: 0.6;
      margin-bottom: 8px;
      font-size: 0.6rem;
    }
  }

  .author-content-item-tips {
    opacity: 0.8;
    font-size: 0.6rem;
    margin-bottom: 0.5rem;
  }
}

.buff {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.1;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(120deg, #ff27e8 0, #ff8000 100%);
  color: var(--efu-white, #fff);
  background-size: 200%;
  animation: gradient 15s ease infinite;
  min-height: 200px;
  height: fit-content;

  .card-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .buff-title {
    display: flex;
    flex-direction: column;

    span:first-child {
      opacity: 0.6;
      margin-bottom: 8px;
    }
  }

  .author-content-item-tips {
    opacity: 0.8;
    font-size: 0.6rem;
    margin-bottom: 0.5rem;
  }

  .inline-word {
    word-break: keep-all;
    white-space: nowrap;
  }
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
