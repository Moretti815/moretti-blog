<script setup>
import { ref, computed, onMounted } from 'vue';
import { buildTimetableViewModel, resolveCurrentWeek } from '../utils/timetableUtils.mjs';

// 课程表数据
const timetableData = ref(null);
const viewModel = ref(null);
const loading = ref(true);
const error = ref(null);

// 当前选中的周次
const selectedWeek = ref(1);
// 真正的当前周次（基于当前日期计算）
const actualCurrentWeek = ref(1);

// 是否是当前周
const isCurrentWeek = computed(() => {
  return selectedWeek.value === actualCurrentWeek.value;
});

// 节次分组 (每2节一组)
const nodeGroups = [
  { start: 1, end: 2, label: '第 1-2 节' },
  { start: 3, end: 4, label: '第 3-4 节' },
  { start: 5, end: 6, label: '第 5-6 节' },
  { start: 7, end: 8, label: '第 7-8 节' },
  { start: 9, end: 10, label: '第 9-10 节' },
  { start: 11, end: 12, label: '第 11-12 节' },
];

// 加载课程表数据
async function loadTimetableData() {
  try {
    loading.value = true;
    error.value = null;

    const response = await fetch('/大三下.json');
    if (!response.ok) {
      throw new Error('无法加载课程表数据');
    }

    const data = await response.json();
    timetableData.value = data;

    // 计算当前周次（基于当前日期）
    const currentWeek = resolveCurrentWeek(
      data.settings.startDate,
      data.settings.maxWeek
    );
    actualCurrentWeek.value = currentWeek;

    // 从 URL 获取选中的周次
    const urlParams = new URLSearchParams(window.location.search);
    const weekParam = parseInt(urlParams.get('week'));

    if (weekParam && weekParam >= 1 && weekParam <= data.settings.maxWeek) {
      selectedWeek.value = weekParam;
    } else {
      selectedWeek.value = currentWeek;
    }

    // 构建视图模型
    viewModel.value = buildTimetableViewModel(data, selectedWeek.value);
  } catch (err) {
    error.value = err.message;
    console.error('加载课程表失败:', err);
  } finally {
    loading.value = false;
  }
}

// 切换周次
function changeWeek(week) {
  if (week < 1 || week > viewModel.value.maxWeek) return;

  selectedWeek.value = week;

  // 更新 URL
  const url = new URL(window.location.href);
  url.searchParams.set('week', week);
  window.history.replaceState({}, '', url);

  // 重新构建视图模型
  viewModel.value = buildTimetableViewModel(timetableData.value, week);
}

// 上一周
function previousWeek() {
  changeWeek(selectedWeek.value - 1);
}

// 下一周
function nextWeek() {
  changeWeek(selectedWeek.value + 1);
}

// 解析 ARGB 颜色
function parseCourseColor(colorStr) {
  if (!colorStr || !colorStr.startsWith('#')) return colorStr;

  if (colorStr.length === 9) {
    const r = colorStr.slice(3, 5);
    const g = colorStr.slice(5, 7);
    const b = colorStr.slice(7, 9);
    return `#${r}${g}${b}`;
  }

  return colorStr;
}

// 获取课程背景色（带透明度）
function getCourseBgColor(colorStr) {
  const color = parseCourseColor(colorStr);
  if (!color) return 'rgba(60, 60, 60, 0.6)';

  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, 0.25)`;
}

// 获取课程边框色
function getCourseBorderColor(colorStr) {
  const color = parseCourseColor(colorStr);
  if (!color) return 'rgba(100, 100, 100, 0.5)';

  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, 0.8)`;
}

// 获取节次时间范围
function getNodeTimeRange(startNode, endNode) {
  if (!viewModel.value) return '';

  const startRow = viewModel.value.nodeRows.find(r => r.node === startNode);
  const endRow = viewModel.value.nodeRows.find(r => r.node === endNode);

  if (!startRow || !endRow) return '';

  return `${startRow.startTime} - ${endRow.endTime}`;
}

// 获取某节次组的课程
function getCoursesForNodeGroup(day, group) {
  if (!viewModel.value) return [];
  const courses = viewModel.value.coursesByDay[day] || [];
  return courses.filter(c => 
    (c.startNode <= group.end && c.endNode >= group.start) ||
    (c.startNode >= group.start && c.startNode <= group.end)
  );
}

onMounted(() => {
  loadTimetableData();
});
</script>

<template>
  <div class="timetable-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载课程表中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <i class="iconfont icon-error"></i>
      <p>{{ error }}</p>
    </div>

    <!-- 课程表内容 -->
    <div v-else-if="viewModel" class="timetable-container">
      <!-- 头部信息 -->
      <div class="timetable-header">
        <div class="header-left">
          <h1 class="timetable-title">{{ viewModel.tableName }}</h1>
          <p class="timetable-subtitle">共 {{ viewModel.maxWeek }} 周</p>
        </div>
      </div>

      <!-- 周次选择器 -->
      <div class="week-selector">
        <button
          class="week-btn"
          :disabled="selectedWeek <= 1"
          @click="previousWeek"
          title="上一周"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <span class="week-display">
          第 {{ selectedWeek }} 周
          <span v-if="isCurrentWeek" class="current-week-badge">当前周</span>
        </span>

        <button
          class="week-btn"
          :disabled="selectedWeek >= viewModel.maxWeek"
          @click="nextWeek"
          title="下一周"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <!-- 桌面端课程表 -->
      <div class="timetable-desktop">
        <!-- 表头 -->
        <div class="timetable-header-row">
          <div class="header-cell time-header">节次</div>
          <div
            v-for="day in viewModel.dayColumns"
            :key="day.day"
            class="header-cell day-header"
          >
            {{ day.label }}
          </div>
        </div>

        <!-- 课程行 -->
        <div
          v-for="group in nodeGroups"
          :key="group.start"
          class="timetable-row"
        >
          <!-- 节次信息 -->
          <div class="time-cell">
            <div class="node-label">{{ group.label }}</div>
            <div class="node-time">{{ getNodeTimeRange(group.start, group.end) }}</div>
          </div>

          <!-- 每天的课程 -->
          <div
            v-for="day in viewModel.dayColumns"
            :key="day.day"
            class="day-cell"
          >
            <div
              v-for="course in getCoursesForNodeGroup(day.day, group)"
              :key="course.courseId + '-' + course.startNode"
              class="course-card"
              :style="{
                backgroundColor: getCourseBgColor(course.color),
                borderColor: getCourseBorderColor(course.color)
              }"
            >
              <div class="course-name">{{ course.courseName }}</div>
              <div class="course-meta">
                <div class="course-week">{{ course.startWeek }}-{{ course.endWeek }}周</div>
                <div class="course-room">教室：{{ course.room }}</div>
                <div class="course-teacher">教师：{{ course.teacher }}</div>
              </div>
            </div>
            <div
              v-if="getCoursesForNodeGroup(day.day, group).length === 0"
              class="empty-cell"
            >—</div>
          </div>
        </div>
      </div>

      <!-- 移动端课程表 -->
      <div class="timetable-mobile">
        <div
          v-for="day in viewModel.dayColumns"
          :key="day.day"
          class="day-section"
        >
          <div class="day-header">{{ day.label }}</div>
          <div class="day-courses">
            <div
              v-for="course in (viewModel.coursesByDay[day.day] || [])"
              :key="course.courseId + '-' + course.startNode"
              class="mobile-course-card"
              :style="{
                backgroundColor: getCourseBgColor(course.color),
                borderColor: getCourseBorderColor(course.color)
              }"
            >
              <div class="mobile-course-name">{{ course.courseName }}</div>
              <div class="mobile-course-info">
                <div class="mobile-course-time">
                  <span class="label">时间：</span>
                  {{ course.nodeText }} ({{ course.timeText }})
                </div>
                <div class="mobile-course-week">
                  <span class="label">周次：</span>
                  {{ course.startWeek }}-{{ course.endWeek }}周
                </div>
                <div class="mobile-course-room">
                  <span class="label">教室：</span>
                  {{ course.room }}
                </div>
                <div class="mobile-course-teacher">
                  <span class="label">教师：</span>
                  {{ course.teacher }}
                </div>
              </div>
            </div>
            <div
              v-if="!(viewModel.coursesByDay[day.day] || []).length"
              class="mobile-empty"
            >
              今日无课
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.timetable-page {
  padding: 20px 0;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--main-font-second-color);

  i {
    font-size: 3rem;
    margin-bottom: 16px;
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--main-card-border);
  border-top-color: var(--main-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 头部样式 */
.timetable-header {
  margin-bottom: 24px;

  .timetable-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--main-font-color);
    margin-bottom: 8px;
  }

  .timetable-subtitle {
    font-size: 0.9rem;
    color: var(--main-font-second-color);
  }
}

/* 周次选择器 */
.week-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--main-card-background);
  border-radius: 12px;
  border: 1px solid var(--main-card-border);

  .week-btn {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: 1px solid var(--main-card-border);
    background: var(--main-card-second-background);
    color: var(--main-font-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    padding: 0;

    &:hover:not(:disabled) {
      background: var(--main-color);
      color: white;
      border-color: var(--main-color);
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    svg {
      display: block;
    }
  }

  .week-display {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--main-font-color);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .current-week-badge {
    font-size: 0.75rem;
    padding: 2px 8px;
    background: var(--main-color);
    color: white;
    border-radius: 4px;
  }
}

/* 桌面端课程表 - 新样式 */
.timetable-desktop {
  background: var(--main-card-background);
  border-radius: 12px;
  border: 1px solid var(--main-card-border);
  overflow: hidden;

  @media (max-width: 768px) {
    display: none;
  }
}

.timetable-header-row {
  display: flex;
  background: var(--main-card-second-background);
  border-bottom: 1px solid var(--main-card-border);

  .header-cell {
    padding: 16px 12px;
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--main-font-color);
    text-align: center;

    &.time-header {
      width: 100px;
      flex-shrink: 0;
      text-align: left;
      padding-left: 16px;
    }

    &.day-header {
      flex: 1;
      min-width: 120px;
    }
  }
}

.timetable-row {
  display: flex;
  border-bottom: 1px solid var(--main-card-border);
  min-height: 100px;

  &:last-child {
    border-bottom: none;
  }

  .time-cell {
    width: 100px;
    flex-shrink: 0;
    padding: 16px;
    background: var(--main-card-second-background);
    border-right: 1px solid var(--main-card-border);
    display: flex;
    flex-direction: column;
    justify-content: center;

    .node-label {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--main-font-color);
      margin-bottom: 4px;
    }

    .node-time {
      font-size: 0.75rem;
      color: var(--main-font-second-color);
    }
  }

  .day-cell {
    flex: 1;
    min-width: 120px;
    padding: 10px;
    border-right: 1px solid var(--main-card-border);
    display: flex;
    flex-direction: column;
    gap: 8px;

    &:last-child {
      border-right: none;
    }
  }
}

.course-card {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid;
  transition: all 0.3s ease;
  flex: 1;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .course-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--main-font-color);
    margin-bottom: 8px;
    line-height: 1.4;
  }

  .course-meta {
    font-size: 0.75rem;
    color: var(--main-font-second-color);
    line-height: 1.6;

    > div {
      margin-bottom: 2px;
    }
  }
}

.empty-cell {
  text-align: center;
  color: var(--main-font-second-color);
  font-size: 1rem;
  padding: 20px 0;
  opacity: 0.5;
}

/* 移动端课程表 */
.timetable-mobile {
  display: none;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.day-section {
  background: var(--main-card-background);
  border-radius: 12px;
  border: 1px solid var(--main-card-border);
  overflow: hidden;
}

.day-header {
  padding: 14px 16px;
  background: var(--main-card-second-background);
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--main-font-color);
  border-bottom: 1px solid var(--main-card-border);
}

.day-courses {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-course-card {
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid;

  .mobile-course-name {
    font-weight: 600;
    font-size: 1rem;
    color: var(--main-font-color);
    margin-bottom: 10px;
  }

  .mobile-course-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.85rem;
    color: var(--main-font-second-color);

    .label {
      color: var(--main-font-color);
      font-weight: 500;
    }
  }
}

.mobile-empty {
  text-align: center;
  padding: 30px;
  color: var(--main-font-second-color);
  font-size: 0.9rem;
}
</style>
