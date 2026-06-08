<template>
  <div class="author-content" v-if="award && award.enable && rewardList && rewardList.length > 0">
    <div class="author-content-item single reward" id="about-reward">
      <div class="reward-header">
        <div class="reward-title-group">
          <div class="author-content-item-tips">{{ award.tips || '致谢' }}</div>
          <span class="author-content-item-title">赞赏名单</span>
          <div class="author-content-item-description">
            {{ award.description || '感谢因为有你们，让我更加有创作的动力。' }}
          </div>
        </div>
        <div class="about-reward">
          <div id="con"></div>
          <div id="TA-con" @click="showRewardConsole">
            <div id="text-con">
              <div id="linght"></div>
              <div id="TA">为TA充电</div>
            </div>
          </div>
          <div id="tube-con">
            <svg viewBox="0 0 1028 385" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 77H234.226L307.006 24H790" stroke="#e5e9ef" stroke-width="20"/>
              <path d="M0 140H233.035L329.72 71H1028" stroke="#e5e9ef" stroke-width="20"/>
              <path d="M1 255H234.226L307.006 307H790" stroke="#e5e9ef" stroke-width="20"/>
              <path d="M0 305H233.035L329.72 375H1028" stroke="#e5e9ef" stroke-width="20"/>
              <rect y="186" width="236" height="24" fill="#e5e9ef"/>
              <ellipse cx="790" cy="25.5" rx="25" ry="25.5" fill="#e5e9ef"/>
              <circle r="14" transform="matrix(1 0 0 -1 790 25)" fill="white"/>
              <ellipse cx="790" cy="307.5" rx="25" ry="25.5" fill="#e5e9ef"/>
              <circle r="14" transform="matrix(1 0 0 -1 790 308)" fill="white"/>
            </svg>
            <div id="mask">
              <svg viewBox="0 0 1028 385" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 77H234.226L307.006 24H790" stroke="#f25d8e" stroke-width="20"/>
                <path d="M0 140H233.035L329.72 71H1028" stroke="#f25d8e" stroke-width="20"/>
                <path d="M1 255H234.226L307.006 307H790" stroke="#f25d8e" stroke-width="20"/>
                <path d="M0 305H233.035L329.72 375H1028" stroke="#f25d8e" stroke-width="20"/>
                <rect y="186" width="236" height="24" fill="#f25d8e"/>
                <ellipse cx="790" cy="25.5" rx="25" ry="25.5" fill="#f25d8e"/>
                <circle r="14" transform="matrix(1 0 0 -1 790 25)" fill="white"/>
                <ellipse cx="790" cy="307.5" rx="25" ry="25.5" fill="#f25d8e"/>
                <circle r="14" transform="matrix(1 0 0 -1 790 308)" fill="white"/>
              </svg>
            </div>
            <div id="orange-mask">
              <svg viewBox="0 0 1028 385" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 77H234.226L307.006 24H790" stroke="#ffd52b" stroke-width="20"/>
                <path d="M0 140H233.035L329.72 71H1028" stroke="#ffd52b" stroke-width="20"/>
                <path d="M1 255H234.226L307.006 307H790" stroke="#ffd52b" stroke-width="20"/>
                <path d="M0 305H233.035L329.72 375H1028" stroke="#ffd52b" stroke-width="20"/>
                <rect y="186" width="236" height="24" fill="#ffd52b"/>
                <ellipse cx="790" cy="25.5" rx="25" ry="25.5" fill="#ffd52b"/>
                <circle r="14" transform="matrix(1 0 0 -1 790 25)" fill="white"/>
                <ellipse cx="790" cy="307.5" rx="25" ry="25.5" fill="#ffd52b"/>
                <circle r="14" transform="matrix(1 0 0 -1 790 308)" fill="white"/>
              </svg>
            </div>
            <p id="people">共 <b>{{ rewardList.length }}</b> 人</p>
          </div>
        </div>
      </div>
      <div class="reward-list-all">
        <div
          v-for="reward in sortedByAmount"
          :key="reward.name + reward.time"
          class="reward-list-item"
        >
          <div class="reward-list-item-name">{{ reward.name }}</div>
          <div class="reward-list-bottom-group">
            <div
              class="reward-list-item-money"
              :class="{ 'high-amount': Number(reward.money) >= 50 }"
            >
              ¥{{ reward.money }}{{ reward.suffix || '' }}
            </div>
            <div class="datatime reward-list-item-time" :datatime="formatDateTime(reward.time)">
              {{ formatTime(reward.time) }}
            </div>
          </div>
        </div>
      </div>
      <div class="reward-list-updateDate" v-if="sortedByDate.length > 0">
        最后更新于
        <time class="datatime reward-list-updateDate-time" :datatime="formatDateTime(sortedByDate[0].time)">
          {{ formatTime(sortedByDate[0].time) }}
        </time>
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

// 按金额排序
const sortedByAmount = computed(() => {
  return [...props.rewardList].sort((a, b) => {
    const moneyA = Number(a.money) || 0;
    const moneyB = Number(b.money) || 0;
    return moneyB - moneyA;
  });
});

// 按日期排序（用于最后更新）
const sortedByDate = computed(() => {
  return [...props.rewardList].sort((a, b) => new Date(b.time) - new Date(a.time));
});

const formatTime = (time) => {
  // 如果已经是日期字符串格式，直接返回
  if (typeof time === 'string' && time.includes('-')) {
    return time;
  }
  // 兼容时间戳格式
  const date = new Date(time);
  return date.toISOString().slice(0, 10);
};

const formatDateTime = (time) => {
  // 如果已经是日期字符串格式，添加时间部分
  if (typeof time === 'string' && time.includes('-')) {
    return time + 'T00:00:00.000Z';
  }
  // 兼容时间戳格式
  const date = new Date(time);
  return date.toISOString();
};

const showRewardConsole = () => {
  // 触发赞赏弹窗
  if (window.anzhiyu && window.anzhiyu.rewardShowConsole) {
    window.anzhiyu.rewardShowConsole();
  }
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
  width: 49%;
  border-radius: 24px;
  background: var(--anzhiyu-card-bg, var(--main-card-background));
  border: var(--style-border-always, 1px solid var(--main-card-border));
  box-shadow: var(--anzhiyu-shadow-border, 0 4px 8px rgba(0, 0, 0, 0.1));
  position: relative;
  padding: 1rem 2rem;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
  }

  &.single {
    width: 100%;

    &.reward {
      overflow: unset;

      .author-content-item-title {
        color: var(--anzhiyu-red, #ef4444);
      }

      .author-content-item-description {
        font-size: 16px;
        margin-top: 0.5rem;
        margin-bottom: 1rem;
        color: var(--anzhiyu-fontcolor, var(--main-font-color));
      }
    }
  }
}

.author-content-item-tips {
  opacity: 0.8;
  font-size: 12px;
  margin-bottom: 0.5rem;
  color: var(--anzhiyu-fontcolor, var(--main-font-color));
}

.author-content-item-title {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
  color: var(--anzhiyu-fontcolor, var(--main-font-color));
  display: block;
  margin-bottom: 0.5rem;
}

// 赞赏列表样式
.reward-list-all {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  margin-left: -0.25rem;
  margin-right: -0.25rem;
}

.reward-list-item {
  padding: 1rem;
  border-radius: 12px;
  border: var(--style-border-always, 1px solid var(--main-card-border));
  width: calc((100% / 5) - 0.5rem);
  margin: 0 0.25rem 0.5rem 0.25rem;
  box-shadow: var(--anzhiyu-shadow-border, 0 2px 4px rgba(0, 0, 0, 0.05));
  background: var(--anzhiyu-card-bg, var(--main-card-background));

  @media (max-width: 1200px) {
    width: calc((100% / 3) - 0.5rem);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
}

.reward-list-item .reward-list-item-name {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.5rem;
  color: var(--anzhiyu-fontcolor, var(--main-font-color));
}

.reward-list-item .reward-list-bottom-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.reward-list-item .reward-list-item-money {
  padding: 4px;
  background: var(--anzhiyu-fontcolor, var(--main-font-color, #333));
  color: var(--anzhiyu-card-bg, var(--main-card-background, #fff));
  font-size: 12px;
  line-height: 1;
  border-radius: 4px;
  margin-right: 4px;
  white-space: nowrap;
  display: inline-block;
  min-width: 30px;
  text-align: center;

  &.high-amount {
    background: var(--anzhiyu-yellow, #f59e0b);
  }
}

.reward-list-item .reward-list-item-time {
  font-size: 12px;
  color: var(--anzhiyu-secondtext, var(--main-font-second-color));
  white-space: nowrap;
}

// 最后更新时间
.reward-list-updateDate {
  color: var(--anzhiyu-gray, #999);
  font-size: 14px;
  margin-top: 0.5rem;
}

// 头部布局
.reward-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
}

.reward-title-group {
  flex: 1;
}

// 充电样式 - 完全还原安知鱼主题
.about-reward {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 0;
  min-width: 320px;
  margin-right: 0.5rem;

  @media (max-width: 768px) {
    min-width: 100%;
    justify-content: center;
    margin-right: 0;
  }
}

#con {
  width: 320px;
  height: 75px;
  position: relative;
  border-radius: 4px;

  @media (max-width: 768px) {
    width: 280px;
    height: 70px;
  }
}

#TA-con {
  width: 130px;
  height: 42px;
  background-color: #f25d8e;
  box-shadow: 0 4px 4px rgba(255, 112, 159, 0.3);
  position: absolute;
  top: 50%;
  left: 18%;
  transform: translateY(-50%);
  border-radius: 4px;
  cursor: pointer;
  z-index: 2;

  @media (max-width: 768px) {
    width: 110px;
    height: 36px;
    left: 40px;
  }

  &:hover {
    background-color: #ff6b9a;
  }
}

#text-con {
  width: 90px;
  height: 100%;
  margin: 0 auto;
  position: relative;

  @media (max-width: 768px) {
    width: 80px;
  }
}

#linght {
  width: 0;
  height: 0;
  position: absolute;
  top: 32%;
  left: 2px;
  border-color: transparent;
  border-style: solid;
  border-width: 8px;
  border-top: 8px solid #fff;
  border-radius: 3px;
  transform: rotate(-55deg);

  @media (max-width: 768px) {
    border-width: 7px;
    border-top: 7px solid #fff;
    top: 30%;
  }

  &::after {
    position: absolute;
    top: -11px;
    left: -9px;
    content: "";
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
    border-width: 8px;
    border-top: 8px solid #fff;
    transform: rotate(180deg);
    border-radius: 3px;

    @media (max-width: 768px) {
      border-width: 7px;
      border-top: 7px solid #fff;
      top: -10px;
      left: -8px;
    }
  }
}

#TA {
  float: right;
  line-height: 42px;
  font-size: 14px;
  color: #fff;
  font-weight: 500;

  @media (max-width: 768px) {
    line-height: 36px;
    font-size: 13px;
  }
}

#tube-con {
  width: 130px;
  height: 46px;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);

  @media (max-width: 768px) {
    width: 110px;
    height: 40px;
  }

  svg {
    width: 100%;
    height: 100%;
  }
}

#mask {
  width: 0px;
  height: 100%;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  transition: all 0.5s;

  svg {
    width: 130px;
    height: 46px;

    @media (max-width: 768px) {
      width: 110px;
      height: 40px;
    }
  }
}

#TA-con:hover + #tube-con > #mask,
#tube-con:hover > #mask {
  width: 130px;

  @media (max-width: 768px) {
    width: 110px;
  }
}

#TA-con:hover + #tube-con > #orange-mask,
#tube-con:hover > #orange-mask {
  animation: move1 0.5s linear 0.2s infinite;
}

#TA-con:hover + #tube-con > #orange-mask svg,
#tube-con:hover > #orange-mask svg {
  animation: movetwo 0.5s linear 0.2s infinite;
}

#orange-mask {
  width: 15px;
  height: 100%;
  overflow: hidden;
  position: absolute;
  left: -12px;
  top: 0px;

  @media (max-width: 768px) {
    width: 12px;
    left: -10px;
  }

  svg {
    position: absolute;
    top: 0;
    left: 12px;
    width: 130px;
    height: 46px;

    @media (max-width: 768px) {
      left: 10px;
      width: 110px;
      height: 40px;
    }
  }
}

@keyframes move1 {
  0% {
    transform: translateX(-12px);
  }
  100% {
    transform: translateX(115px);
  }
}

@keyframes movetwo {
  0% {
    transform: translateX(12px);
  }
  100% {
    transform: translateX(-115px);
  }
}

#people {
  position: absolute;
  right: 8px;
  top: 8px;
  font-size: 11px;
  font-family: "Microsoft YaHei", "雅黑", sans-serif;
  color: #aaa;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 10px;
    right: 6px;
    top: 6px;
  }

  b {
    color: #777;
  }
}
</style>
