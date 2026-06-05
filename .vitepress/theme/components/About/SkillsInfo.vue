<template>
  <div class="author-content">
    <!-- 技能卡片 -->
    <div class="author-content-item skills" v-if="skills">
      <div class="card-content">
        <div class="author-content-item-tips">{{ skills.title }}</div>
        <span class="author-content-item-title">{{ skills.subtitle }}</span>
        <div class="skills-style-group">
          <div class="tags-group-all">
            <div class="tags-group-wrapper">
              <div
                v-for="(pair, pairIndex) in skillPairs"
                :key="`pair-${pairIndex}`"
                class="tags-group-icon-pair"
              >
                <div
                  v-for="(item, itemIndex) in pair"
                  :key="`item-${pairIndex}-${itemIndex}`"
                  class="tags-group-icon"
                  :style="{ background: item.color }"
                >
                  <img v-if="item.img" :src="item.img" :title="item.title" />
                  <i
                    v-else-if="item.icon"
                    :class="item.icon"
                    :title="item.title"
                    :style="{ color: item.icon_color || '' }"
                  ></i>
                </div>
              </div>
            </div>
          </div>
          <div class="skills-list">
            <div v-for="(tag, index) in skills.tags.slice(0, 6)" :key="`skill-${index}`" class="skill-info">
              <div class="skill-icon" :style="{ background: tag.color }">
                <img v-if="tag.img" :src="tag.img" :title="tag.title" />
                <i
                  v-else-if="tag.icon"
                  :class="tag.icon"
                  :title="tag.title"
                  :style="{ color: tag.icon_color || '' }"
                ></i>
              </div>
              <div class="skill-name">
                <span>{{ tag.title }}</span>
              </div>
            </div>
            <div v-if="skills.tags.length > 6" class="etc">...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 职业卡片 -->
    <div class="author-content-item careers" v-if="careers">
      <div class="card-content">
        <div class="author-content-item-tips">{{ careers.title }}</div>
        <span class="author-content-item-title">{{ careers.subtitle }}</span>
        <div class="careers-group">
          <div v-for="(item, index) in careers.items" :key="`career-${index}`" class="careers-item">
            <div class="circle" :style="{ background: item.color }"></div>
            <div class="name">{{ item.school }}, {{ item.major }}</div>
          </div>
        </div>
        <!-- 代码实现的时间轴 -->
        <div class="timeline-container">
          <div class="timeline-wrapper">
            <!-- 时间轴线 -->
            <div class="timeline-line"></div>
            <!-- 年份标记 -->
            <div class="timeline-years">
              <span class="year-mark">2023</span>
              <span class="year-mark">2024</span>
              <span class="year-mark">2025</span>
              <span class="year-mark">2026</span>
              <span class="year-mark">2027</span>
              <span class="year-mark">2028</span>
            </div>
            <!-- 事件条 -->
            <div class="timeline-events">
              <!-- 大学阶段 -->
              <div class="timeline-event edu">
                <div class="event-label">EDU</div>
                <div class="event-bar">
                  <span class="event-name">大学阶段</span>
                </div>
                <div class="event-dots">
                  <div class="dot start"></div>
                  <div class="dot end"></div>
                </div>
              </div>
              <!-- 博客之旅 -->
              <div class="timeline-event blog">
                <div class="event-label">BLOG</div>
                <div class="event-bar">
                  <span class="event-name">博客之旅</span>
                </div>
                <div class="event-dots">
                  <div class="dot start"></div>
                  <div class="dot end"></div>
                </div>
                <div class="event-now">至今</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  skills: {
    type: Object,
    default: null
  },
  careers: {
    type: Object,
    default: null
  }
});

// 将技能标签分成对 - 参考 AstraBay 的循环逻辑
const skillPairs = computed(() => {
  if (!props.skills || !props.skills.tags) return [];
  const pairs = [];
  // 循环8次创建足够的图标对用于滚动
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < props.skills.tags.length; j += 2) {
      const pair = [];
      if (props.skills.tags[j]) pair.push(props.skills.tags[j]);
      if (props.skills.tags[j + 1]) pair.push(props.skills.tags[j + 1]);
      if (pair.length === 2) pairs.push(pair);
    }
  }
  return pairs;
});
</script>

<style scoped lang="scss">
.author-content {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: stretch;
  margin-top: 0.5rem;
  gap: 0.5rem;
  width: 100%;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
    flex-wrap: wrap;
  }
}

.author-content-item {
  border-radius: 12px;
  background: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  width: 50%;

  @media (max-width: 768px) {
    width: 100%;
  }
}

// 技能卡片样式 - 完全复刻 AstraBay
.skills {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  min-height: auto;
  flex: 1;
  padding: 1rem 2rem 0.5rem;

  .card-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .tags-group-all {
    display: flex;
    transform: rotate(0);
    transition: 0.3s;
  }

  .tags-group-wrapper {
    margin-top: 20px;
    display: flex;
    flex-wrap: nowrap;
    animation: rowleft-quarter 30s linear infinite;
  }

  .skills-style-group {
    position: relative;
    width: 100%;
    min-height: 100px;
  }

  .skills-list {
    display: flex;
    opacity: 0;
    transition: 0.3s;
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
    flex-wrap: wrap;
    flex-direction: row;
    margin-top: 10px;
    z-index: 10;
  }

  &:hover {
    .skills-style-group {
      .tags-group-all {
        opacity: 0;
      }

      .skills-list {
        opacity: 1;
      }
    }
  }

  .skill-info {
    display: flex;
    align-items: center;
    margin-right: 10px;
    margin-top: 10px;
    background: var(--main-site-background);
    border-radius: 40px;
    padding: 4px 12px 4px 8px;
    border: 1px solid var(--main-card-border);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .etc {
    margin-right: 10px;
    margin-top: 10px;
  }

  .skill-icon {
    width: 32px;
    height: 32px;
    border-radius: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    user-select: none;

    img {
      width: 18px;
      height: 18px;
    }
  }

  .skill-name {
    font-weight: 700;
    line-height: 1;
  }
}

// 图标对样式
.tags-group-icon-pair {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-right: 16px;
}

// 图标样式 - 60x60 大图标
.tags-group-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 36px;
    height: 36px;
    object-fit: contain;
  }

  i {
    font-size: 32px;
  }
}

// 职业卡片样式 - 完全复刻 AstraBay
.careers {
  min-height: auto;
  flex: 1;
  padding: 1rem 2rem 0.5rem;
  display: flex;
  flex-direction: column;

  .card-content {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .careers-group {
    margin-top: 8px;
    margin-bottom: 8px;

    .careers-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      .circle {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        border-radius: 16px;
      }

      .name {
        color: var(--main-font-second-color);
      }
    }
  }

  // 时间轴样式
  .timeline-container {
    margin-top: 0;
    padding: 10px 0 20px;
    width: 100%;
    overflow: visible;
  }

  .timeline-wrapper {
    position: relative;
    width: 100%;
    height: 110px;
  }

  // 时间轴线
  .timeline-line {
    position: absolute;
    top: 55px;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--main-card-border);
    border-radius: 2px;
  }

  // 年份标记
  .timeline-years {
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 10px;

    .year-mark {
      font-size: 12px;
      color: var(--main-font-second-color);
      background: var(--main-card-background);
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid var(--main-card-border);
    }
  }

  // 事件条容器
  .timeline-events {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
  }

  // 单个事件
  .timeline-event {
    position: absolute;
    height: 32px;

    &.edu {
      top: 20px;
      left: 8%;
      right: 15%;

      .event-label {
        color: #3b82f6;
      }

      .event-bar {
        background: #3b82f6;
      }

      .dot {
        background: #3b82f6;
      }
    }

    &.blog {
      top: 70px;
      left: 35%;
      right: 30%;

      .event-label {
        color: #f59e0b;
      }

      .event-bar {
        background: #f59e0b;
      }

      .dot {
        background: #f59e0b;
      }

      .event-now {
        position: absolute;
        right: -10px;
        top: 38px;
        font-size: 11px;
        color: #f59e0b;
        background: var(--main-card-background);
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid var(--main-card-border);
      }
    }

    .event-label {
      position: absolute;
      top: -18px;
      font-size: 13px;
      font-weight: bold;
    }

    .event-bar {
      height: 24px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;

      .event-name {
        color: white;
        font-size: 12px;
        font-weight: 500;
      }
    }

    .event-dots {
      position: absolute;
      top: 26px;
      left: 0;
      right: 0;
      height: 16px;

      .dot {
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        top: 50%;
        transform: translateY(-50%);

        &.start {
          left: 0;
        }

        &.end {
          right: 0;
        }
      }
    }
  }
}

.author-content-item-tips {
  opacity: 0.8;
  font-size: 0.6rem;
  margin-bottom: 0.5rem;
  color: var(--main-font-color);
}

.author-content-item-title {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--main-font-color);
}

@keyframes rowleft-quarter {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
