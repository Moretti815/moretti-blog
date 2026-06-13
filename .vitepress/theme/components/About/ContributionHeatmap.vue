<template>
  <div class="heatmap-card" v-if="loaded">
    <div class="heatmap-header">
      <div class="heatmap-title-row">
        <svg class="heatmap-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z" />
        </svg>
        <h3 class="heatmap-title">文章更新热力图</h3>
      </div>
      <span class="heatmap-total">共 {{ totalPosts }} 篇文章</span>
    </div>

    <!-- 热力图主体 -->
    <div class="heatmap-wrapper" ref="heatmapWrapper">
      <!-- 月份标签 -->
      <div class="month-labels" :style="{ paddingLeft: labelWidth + 'px' }">
        <span
          v-for="m in monthLabels"
          :key="m.key"
          class="month-label"
          :style="{ left: m.left + 'px' }"
        >{{ m.name }}</span>
      </div>

      <!-- 日期行标签 + 网格 -->
      <div class="heatmap-body">
        <!-- 左侧星期标签 -->
        <div class="day-labels">
          <span class="day-label" v-for="d in dayLabels" :key="d.idx" :style="{ top: d.idx * cellSize + 'px' }">{{ d.name }}</span>
        </div>

        <!-- 热力格子 -->
        <svg class="heatmap-svg" :width="svgWidth" :height="svgHeight">
          <rect
            v-for="cell in cells"
            :key="cell.key"
            :x="cell.x"
            :y="cell.y"
            :width="cellW"
            :height="cellH"
            :rx="2"
            :ry="2"
            :class="'heat-' + cell.level"
            @mouseenter="onHover($event, cell)"
            @mouseleave="hideTooltip"
          >
            <title>{{ cell.title }}</title>
          </rect>
        </svg>
      </div>
    </div>

    <!-- 图例 -->
    <div class="heatmap-footer">
      <span class="legend-text">少</span>
      <div class="legend-cells">
        <span class="legend-cell heat-0"></span>
        <span class="legend-cell heat-1"></span>
        <span class="legend-cell heat-2"></span>
        <span class="legend-cell heat-3"></span>
        <span class="legend-cell heat-4"></span>
      </div>
      <span class="legend-text">多</span>
    </div>

    <!-- Tooltip -->
    <Teleport v-if="isClient" to="body">
      <div
        v-if="tooltip.visible"
        class="heatmap-tooltip"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <strong>{{ tooltip.count }}</strong> 篇文章发布于 {{ tooltip.date }}
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useClientOnly } from "@/composables/useClientOnly";
const { isClient } = useClientOnly();

const loaded = ref(false);
const cells = ref([]);
const monthLabels = ref([]);
const totalPosts = ref(0);

const cellSize = 14;
const cellGap = 3;
const cellW = cellSize;
const cellH = cellSize;
const labelWidth = 28;

const dayLabels = [
  { idx: 1, name: '一' },
  { idx: 3, name: '三' },
  { idx: 5, name: '五' },
];

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

const svgWidth = ref(0);
const svgHeight = ref(7 * cellSize + 6 * cellGap);

const tooltip = ref({ visible: false, x: 0, y: 0, count: 0, date: '' });

const heatmapWrapper = ref(null);

function getLevel(count) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 3) return 3;
  return 4;
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateCN(d) {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function onHover(e, cell) {
  const rect = e.target.getBoundingClientRect();
  let x = rect.left + rect.width / 2;
  // 防止 tooltip 超出视口左右边界
  const min = 80;
  const max = window.innerWidth - 80;
  if (x < min) x = min;
  if (x > max) x = max;
  tooltip.value = {
    visible: true,
    x,
    y: rect.top - 36,
    count: cell.count,
    date: cell.dateStr,
  };
}

function hideTooltip() {
  tooltip.value.visible = false;
}

onMounted(async () => {
  try {
    const res = await fetch('/data/postData.json');
    if (!res.ok) return;
    const posts = await res.json();

    // 统计每天的文章数
    const dateCount = {};
    for (const post of posts) {
      const d = new Date(post.date);
      const key = formatDate(d);
      dateCount[key] = (dateCount[key] || 0) + 1;
    }
    totalPosts.value = posts.length;

    // 计算日期范围：取最近一年
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 找到起始日：往前推到上一个周日
    const start = new Date(today);
    start.setDate(start.getDate() - 364);
    // 再往前推到周日
    start.setDate(start.getDate() - start.getDay());

    const totalDays = Math.ceil((today - start) / (1000 * 60 * 60 * 24)) + 1;
    const weeks = Math.ceil(totalDays / 7);

    svgWidth.value = weeks * (cellW + cellGap) - cellGap;

    // 生成格子
    const newCells = [];
    const newMonths = [];
    let lastMonth = -1;

    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(date.getDate() + w * 7 + d);
        if (date > today) continue;

        const key = formatDate(date);
        const count = dateCount[key] || 0;
        const x = w * (cellW + cellGap);
        const y = d * (cellH + cellGap);

        newCells.push({
          key,
          x,
          y,
          count,
          level: getLevel(count),
          dateStr: formatDateCN(date),
          title: `${count} 篇 · ${key}`,
        });

        // 月份标签
        const month = date.getMonth();
        if (month !== lastMonth && d === 0) {
          newMonths.push({
            key: `${date.getFullYear()}-${month}`,
            name: MONTH_NAMES[month],
            left: x + labelWidth,
          });
          lastMonth = month;
        }
      }
    }

    cells.value = newCells;
    monthLabels.value = newMonths;
    loaded.value = true;

    nextTick(() => {
      if (heatmapWrapper.value) {
        heatmapWrapper.value.scrollLeft = heatmapWrapper.value.scrollWidth;
      }
    });
  } catch (e) {
    console.warn('加载热力图数据失败:', e);
  }
});
</script>

<style lang="scss" scoped>
.heatmap-card {
  margin: 0.5rem 0;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  background: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  animation: slide-in 0.6s 0.5s backwards;
  max-width: 100%;
  overflow: hidden;
}

.heatmap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.heatmap-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  .heatmap-icon {
    color: var(--main-color);
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }
  .heatmap-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--main-font-color);
    margin: 0;
    line-height: 1;
  }
}

.heatmap-total {
  font-size: 0.75rem;
  color: var(--main-font-second-color);
}

/* 热力图主体 */
.heatmap-wrapper {
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 4px;
  scroll-behavior: smooth;
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--main-card-border);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: var(--main-color);
  }
}

.month-labels {
  position: relative;
  height: 18px;
  margin-bottom: 4px;
  .month-label {
    position: absolute;
    font-size: 0.7rem;
    color: var(--main-font-second-color);
    line-height: 18px;
    white-space: nowrap;
  }
}

.heatmap-body {
  position: relative;
  display: flex;
}

.day-labels {
  position: relative;
  width: 28px;
  flex-shrink: 0;
  .day-label {
    position: absolute;
    font-size: 0.7rem;
    color: var(--main-font-second-color);
    line-height: 14px;
    right: 4px;
  }
}

.heatmap-svg {
  display: block;
  flex-shrink: 0;
}

/* 热力颜色 - 浅色 */
:deep(.heat-0) { fill: var(--heat-0, #ebedf0); }
:deep(.heat-1) { fill: var(--heat-1, #9be9a8); }
:deep(.heat-2) { fill: var(--heat-2, #40c463); }
:deep(.heat-3) { fill: var(--heat-3, #30a14e); }
:deep(.heat-4) { fill: var(--heat-4, #216e39); }

/* 图例 */
.heatmap-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 0.75rem;
  .legend-text {
    font-size: 0.7rem;
    color: var(--main-font-second-color);
  }
  .legend-cells {
    display: flex;
    gap: 3px;
  }
  .legend-cell {
    display: block;
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }
  .legend-cell.heat-0 { background: var(--heat-0, #ebedf0); }
  .legend-cell.heat-1 { background: var(--heat-1, #9be9a8); }
  .legend-cell.heat-2 { background: var(--heat-2, #40c463); }
  .legend-cell.heat-3 { background: var(--heat-3, #30a14e); }
  .legend-cell.heat-4 { background: var(--heat-4, #216e39); }
}

/* 深色模式 */
:root[data-theme="dark"] {
  --heat-0: #161b22;
  --heat-1: #0e4429;
  --heat-2: #006d32;
  --heat-3: #26a641;
  --heat-4: #39d353;
}

/* Tooltip */
.heatmap-tooltip {
  position: fixed;
  z-index: 9999;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  line-height: 1.4;
  white-space: nowrap;
  color: #fff;
  background: rgba(0, 0, 0, 0.8);
  pointer-events: none;
  transform: translateX(-50%);
  strong {
    color: #4ade80;
  }
}

@keyframes slide-in {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* 响应式 */
@media (max-width: 768px) {
  .heatmap-card {
    padding: 1rem;
  }
}

@media (max-width: 640px) {
  .heatmap-card {
    padding: 0.75rem;
  }
  .day-labels {
    width: 22px;
    .day-label {
      font-size: 0.6rem;
      line-height: 12px;
    }
  }
  .month-label {
    font-size: 0.6rem;
  }
  .heatmap-footer {
    gap: 3px;
    .legend-cell {
      width: 10px;
      height: 10px;
    }
  }
}
</style>
