<template>
  <div class="author-content">
    <!-- 统计卡片 - 左侧 -->
    <div class="about-statistic author-content-item" v-if="tj" :style="{ backgroundImage: `url(${tj.img})` }">
      <div class="card-content">
        <div class="author-content-item-tips">{{ tj.tip || '数据' }}</div>
        <span class="author-content-item-title">{{ tj.title || '访问统计' }}</span>
        <div id="statistic">
          <div v-for="(stat, key) in statsData" :key="key">
            <span>{{ stat.label }}</span>
            <span :id="key">{{ stat.value }}</span>
          </div>
        </div>
        <div class="post-tips" v-html="tj.desc"></div>
        <div v-if="tj.button" class="banner-button-group">
          <a class="banner-button" :href="tj.button_link">
            <span class="banner-button-text">{{ tj.button_text }}</span>
          </a>
        </div>
      </div>
    </div>

    <!-- 地图和个人信息 - 右侧 -->
    <div class="author-content-item-group column mapAndInfo" v-if="oneself">
      <div class="author-content-item map single" :style="{ backgroundImage: `url(${currentMapImage})` }">
        <span class="map-title">我现在住在 {{ oneself.location }}</span>
      </div>
      <div class="author-content-item selfInfo single">
        <div>
          <span class="selfInfo-title">生于</span>
          <span class="selfInfo-content" style="color: #43a6c6;">{{ oneself.birthYear }}</span>
        </div>
        <div>
          <span class="selfInfo-title">{{ oneself.university }}</span>
          <span class="selfInfo-content" style="color: #c69043;">{{ oneself.major }}</span>
        </div>
        <div>
          <span class="selfInfo-title">现在职业</span>
          <span class="selfInfo-content" style="color: #b04fe6;">{{ oneself.occupation }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { mainStore } from '@/store';

const store = mainStore();
const { themeValue } = storeToRefs(store);

const props = defineProps({
  tj: {
    type: Object,
    default: null
  },
  oneself: {
    type: Object,
    default: null
  }
});

const currentMapImage = computed(() => {
  if (!props.oneself?.map) return '';
  return themeValue.value === 'dark' ? props.oneself.map.dark : props.oneself.map.light;
});

const statsData = ref({
  today_uv: { label: '今日人数', value: '0' },
  today_pv: { label: '今日访问', value: '0' },
  yesterday_uv: { label: '昨日人数', value: '0' },
  yesterday_pv: { label: '昨日访问', value: '0' },
  last_month_pv: { label: '最近月访问', value: '0' }
});

// 获取日期范围
const getDateRange = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// 格式化数字
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// 获取 Umami 统计数据
const fetchUmamiStats = async () => {
  if (!props.tj?.url || !props.tj?.websiteId) return;

  try {
    const websiteId = props.tj.websiteId;
    const baseUrl = props.tj.url.replace(/\/$/, '');

    // 获取今日数据
    const todayRes = await fetch(`${baseUrl}/api/websites/${websiteId}/stats?startAt=${Date.now() - 86400000}&endAt=${Date.now()}`);
    const todayData = await todayRes.json();

    // 获取昨日数据
    const yesterdayStart = new Date();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const yesterdayRes = await fetch(`${baseUrl}/api/websites/${websiteId}/stats?startAt=${yesterdayStart.getTime()}&endAt=${yesterdayEnd.getTime()}`);
    const yesterdayData = await yesterdayRes.json();

    // 获取最近30天数据
    const monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 30);
    monthStart.setHours(0, 0, 0, 0);
    const monthRes = await fetch(`${baseUrl}/api/websites/${websiteId}/stats?startAt=${monthStart.getTime()}&endAt=${Date.now()}`);
    const monthData = await monthRes.json();

    // 更新统计数据
    statsData.value = {
      today_uv: { label: '今日人数', value: formatNumber(todayData?.visitors?.value || 0) },
      today_pv: { label: '今日访问', value: formatNumber(todayData?.pageviews?.value || 0) },
      yesterday_uv: { label: '昨日人数', value: formatNumber(yesterdayData?.visitors?.value || 0) },
      yesterday_pv: { label: '昨日访问', value: formatNumber(yesterdayData?.pageviews?.value || 0) },
      last_month_pv: { label: '最近月访问', value: formatNumber(monthData?.pageviews?.value || 0) }
    };
  } catch (err) {
    console.error('Failed to fetch Umami stats:', err);
  }
};

// 获取自定义统计数据
const fetchCustomStats = async () => {
  if (!props.tj?.url) return;

  try {
    const res = await fetch(props.tj.url);
    const data = await res.json();

    const titleMap = {
      today_uv: '今日人数',
      today_pv: '今日访问',
      yesterday_uv: '昨日人数',
      yesterday_pv: '昨日访问',
      last_month_pv: '最近月访问'
    };

    for (let key in data) {
      if (data.hasOwnProperty(key) && titleMap[key]) {
        statsData.value[key] = {
          label: titleMap[key],
          value: data[key]
        };
      }
    }
  } catch (err) {
    console.error('Failed to fetch custom stats:', err);
  }
};

onMounted(() => {
  if (!props.tj) return;

  if (props.tj.provider === 'umami') {
    fetchUmamiStats();
  } else if (props.tj.provider === 'custom' && props.tj.url) {
    fetchCustomStats();
  }
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

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.author-content-item {
  border-radius: 12px;
  background: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  .card-content {
    z-index: 2;
    position: relative;
  }
}

.about-statistic {
  min-height: 380px;
  background-size: cover !important;
  background-position: center !important;
  color: #fff;
  width: 33.333%;
  flex-shrink: 0;
  padding: 1rem 2rem;

  @media (max-width: 768px) {
    width: 100%;
    min-height: 300px;
  }

  &::after {
    box-shadow: 0 -159px 173px 71px #0f1114 inset;
    position: absolute;
    content: '';
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  #statistic {
    font-size: 16px;
    border-radius: 15px;
    width: 100%;
    color: #fff;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 4px;
    margin-bottom: 2rem;

    div {
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      width: 50%;
      margin-bottom: 0.5rem;

      span:first-child {
        opacity: 0.8;
        font-size: 0.6rem;
      }

      span:last-child {
        font-weight: 700;
        font-size: 34px;
        line-height: 1;
        white-space: nowrap;
      }
    }
  }

  .banner-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #fff;
    text-decoration: none;
    transition: 0.3s;

    &:hover {
      background: var(--main-color);
    }
  }
}

.author-content-item-group {
  &.column {
    display: flex;
    flex-direction: column;
    width: 66.666%;
    justify-content: space-between;
    gap: 0.5rem;

    @media (max-width: 768px) {
      width: 100%;
    }
  }

  &.mapAndInfo {
    flex: none;
  }
}

.map {
  min-height: 160px;
  max-height: 400px;
  position: relative;
  overflow: hidden;
  height: 60%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: 1s ease-in-out;
  padding: 0;

  .map-title {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.4);
    padding: 0.5rem 2rem;
    backdrop-filter: saturate(180%) blur(20px);
    transition: 1s ease-in-out;
    font-size: 20px;
    transform: translateZ(0);
    color: #fff;

    @media (max-width: 768px) {
      padding: 1rem;
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 0;
  }

  &:hover {
    background-size: 120%;
    transition: 4s ease-in-out;

    .map-title {
      bottom: -100%;
    }
  }
}

.selfInfo {
  display: flex;
  min-height: 100px;
  max-height: 400px;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  height: 40%;
  padding: 1rem 2rem;
  background: var(--main-card-background);

  @media (max-width: 1300px) {
    height: auto;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  div {
    display: flex;
    flex-direction: column;
    margin: 0.5rem 2rem 0.5rem 0;
  }

  .selfInfo-title {
    opacity: 0.8;
    font-size: 0.6rem;
    line-height: 1;
    margin-bottom: 8px;
    color: var(--main-font-color);
  }

  .selfInfo-content {
    font-weight: 700;
    font-size: 34px;
    line-height: 1;
  }
}

.author-content-item-tips {
  opacity: 0.8;
  font-size: 0.6rem;
  margin-bottom: 0.5rem;
  color: #fff;
}

.author-content-item-title {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.1;
  color: #fff;
  display: block;
  margin-bottom: 0.5rem;
}

.post-tips {
  font-size: 0.875rem;
  margin-bottom: 1rem;
  color: #fff;
  opacity: 0.8;
}
</style>