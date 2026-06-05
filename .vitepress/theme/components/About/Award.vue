<template>
  <div class="author-content" v-if="award && award.enable && rewardList && rewardList.length > 0">
    <div class="author-content-item single reward">
      <div class="author-content-item-tips">{{ award.tips || '感谢支持' }}</div>
      <span class="author-content-item-title">赞赏名单</span>
      <div class="author-content-item-description" v-html="award.description"></div>
      <div class="reward-list-all">
        <div
          v-for="(reward, index) in displayList"
          :key="index"
          class="reward-list-item"
        >
          <div class="reward-list-item-name">{{ reward.name }}</div>
          <div class="reward-list-bottom-group">
            <div class="reward-list-item-money" :style="{ backgroundColor: reward.color }">
              <i v-if="reward.icon" class="reward-icon">{{ reward.icon }}</i>
              ¥ {{ reward.money }}
            </div>
            <time class="reward-list-item-time" :datetime="formatDateTime(reward.time)">
              {{ formatTime(reward.time) }}
            </time>
          </div>
        </div>

        <!-- 查看更多 -->
        <a
          v-if="rewardList.length > award.limit"
          class="reward-list-item reward-list-item-more"
          :href="award.more"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="reward-list-item-name">查看更多</div>
          <div class="reward-list-bottom-group">
            <span class="more-icon">→</span>
          </div>
        </a>
      </div>
      <div class="reward-list-tips">
        <p>{{ award.tipsText ? award.tipsText.replace('{sum}', totalSum.toFixed(2)) : `共收到 ${totalSum.toFixed(2)} 元赞赏` }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  award: {
    type: Object,
    default: () => ({
      enable: false,
      description: '',
      tips: '',
      tipsText: '',
      limit: 6,
      more: ''
    })
  },
  rewardList: {
    type: Array,
    default: () => []
  }
});

const sortedRewards = computed(() => {
  return [...props.rewardList].sort((a, b) => b.time - a.time);
});

const displayList = computed(() => {
  return sortedRewards.value.slice(0, props.award.limit);
});

const totalSum = computed(() => {
  return props.rewardList.reduce((sum, reward) => sum + reward.money, 0);
});

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toISOString();
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

  &.single {
    &.reward {
      overflow: unset;

      .author-content-item-title {
        color: var(--efu-red, #ef4444);
      }

      .reward-list-updateDate {
        color: var(--efu-gray, #9ca3af);
        font-size: 14px;
      }

      .author-content-item-description {
        font-size: 16px;
        margin-top: 0.5rem;
        margin-bottom: 1rem;
        color: var(--efu-fontcolor, var(--main-font-color));
      }

      .reward-list-all {
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        margin: 1rem -0.125rem 0.5rem;

        .reward-list-item {
          padding: 1rem;
          border-radius: 12px;
          border: var(--style-border-always, 1px solid var(--main-card-border));
          width: calc((100% / 6) - 0.25rem);
          margin: 0 0.125rem 0.5rem 0.125rem;
          box-shadow: var(--efu-shadow-border, 0 2px 4px rgba(0, 0, 0, 0.05));
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: var(--efu-card-bg, var(--main-card-background));

          @media (max-width: 1200px) {
            width: calc((100% / 4) - 0.25rem);
          }

          @media (max-width: 900px) {
            width: calc((100% / 2) - 0.25rem);
          }

          @media (max-width: 768px) {
            width: calc((100% / 2) - 0.25rem);
          }

          .reward-list-item-name {
            font-size: 1rem;
            font-weight: 700;
            line-height: 1;
            margin-bottom: 0.25rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: var(--efu-fontcolor, var(--main-font-color));
          }

          .reward-list-bottom-group {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 0.5rem;
          }

          .reward-list-item-money {
            padding: 4px;
            background: var(--efu-fontcolor, var(--main-font-color));
            color: var(--efu-card-bg, var(--main-card-background));
            font-size: 12px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            margin-right: 2px;
            white-space: nowrap;

            .reward-icon {
              font-size: 14px;
              margin-right: 2px;
              font-style: normal;
            }
          }

          .reward-list-item-time {
            font-size: 12px;
            color: var(--efu-secondtext, var(--main-font-second-color));
            white-space: nowrap;
          }
        }

        .reward-list-item-more {
          display: flex;
          flex-direction: column;
          font-size: 18px;
          line-height: 1;
          font-weight: 700;
          background: var(--efu-purple, #8b5cf6);
          color: var(--efu-white, #fff);
          text-decoration: none;
          cursor: pointer;

          &:hover {
            background: var(--efu-main, var(--main-color));
            color: var(--efu-white, #fff);
          }

          .more-icon {
            font-size: 20px;
          }
        }
      }

      .reward-list-tips {
        p {
          font-size: 12px;
          color: var(--efu-secondtext, var(--main-font-second-color));
        }
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

.author-content-item-title {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--efu-fontcolor, var(--main-font-color));
  display: block;
  margin-bottom: 0.5rem;
}
</style>
