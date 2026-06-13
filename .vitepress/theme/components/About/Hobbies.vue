<template>
  <div class="author-content" v-if="games && games.length > 0">
    <div
      v-for="(game, index) in games"
      :key="`game-${index}`"
      class="author-content-item game"
      :class="`game-${index}`"
      :style="{ background: `url(${game.img}) no-repeat top`, backgroundSize: 'cover' }"
    >
      <div class="card-content">
        <div class="author-content-item-tips">{{ game.title }}</div>
        <span class="author-content-item-title">{{ game.subtitle }}</span>
        <div class="content-bottom">
          <div class="content-left">
            <div v-if="game.icon_group" class="icon-group">
              <span
                v-for="(icon, i) in game.icon_group"
                :key="i"
                class="icon-item"
                :class="{ 'is-emoji': isEmoji(icon) }"
                :style="!isEmoji(icon) ? { backgroundImage: `url(${icon})` } : {}"
              >{{ isEmoji(icon) ? icon : '' }}</span>
            </div>
            <div v-if="game.tips_left" class="tips">{{ game.tips_left }}</div>
          </div>
          <div v-if="game.tips_right" class="tips tips-right">{{ game.tips_right }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isClient = ref(false);

onMounted(() => {
  isClient.value = true;
});

defineProps({
  games: {
    type: Array,
    default: () => []
  }
});

// 判断是否为 emoji（SSR 安全）
const isEmoji = (icon) => {
  if (!isClient.value) return false; // 服务端默认当作图片处理
  return !icon.startsWith('http');
};
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
  border-radius: 12px;
  background: var(--efu-card-bg, var(--main-card-background));
  border: var(--style-border-always, 1px solid var(--main-card-border));
  box-shadow: var(--efu-shadow-lightblack, 0 4px 8px rgba(0, 0, 0, 0.1));
  position: relative;
  overflow: hidden;
}

.game {
  min-height: 300px;
  overflow: hidden;
  color: var(--efu-white, #fff);
  flex: 1;
  width: calc(33.333% - 0.35rem);

  @media (max-width: 992px) {
    width: calc(50% - 0.25rem);
  }

  @media (max-width: 768px) {
    width: 100%;
  }

  &::after {
    position: absolute;
    content: '';
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    box-shadow: 0 -69px 203px 11px #050b20 inset;
  }

  .card-content {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    padding: 1rem 2rem;
  }

  .author-content-item-tips {
    opacity: 0.8;
    font-size: 0.6rem;
    margin-bottom: 0.5rem;
    color: #fff;
  }

  .author-content-item-title {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.1;
    color: #fff;
  }

  .content-bottom {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    .content-left {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .icon-group {
      display: flex;
      gap: 0.5rem;

      .icon-item {
        width: 24px;
        height: 24px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        display: inline-block;

        &.is-emoji {
          font-size: 20px;
          line-height: 24px;
          text-align: center;
        }
      }
    }

    .tips {
      font-size: 0.875rem;
      opacity: 0.8;
    }

    .tips-right {
      text-align: right;
    }
  }
}
</style>
