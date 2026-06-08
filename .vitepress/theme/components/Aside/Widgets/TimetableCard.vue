<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vitepress';
import { buildTimetableViewModel, resolveCurrentWeek } from '../../../utils/timetableUtils.mjs';

const router = useRouter();

// 状态
const timetableData = ref(null);
const viewModel = ref(null);
const loading = ref(true);
const error = ref(null);
// 使用 null 初始值，避免 SSR 水合不匹配
const currentTime = ref(null);

// 定时器
let timer = null;

// 星期标签
const WEEKDAY_LABELS = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  7: '周日'
};

// 当前是星期几 (1-7)
const currentDay = computed(() => {
  if (!currentTime.value) return 1;
  const day = currentTime.value.getDay();
  return day === 0 ? 7 : day;
});

// 当前时间（分钟数，从0点开始）
const currentMinute = computed(() => {
  if (!currentTime.value) return 0;
  return currentTime.value.getHours() * 60 + currentTime.value.getMinutes();
});

// 今天的课程
const todayCourses = computed(() => {
  if (!viewModel.value) return [];
  const courses = viewModel.value.coursesByDay[currentDay.value] || [];
  return courses.sort((a, b) => a.startNode - b.startNode);
});

// 获取明天的课程
const tomorrowCourses = computed(() => {
  if (!viewModel.value) return [];
  const tomorrowDay = currentDay.value === 7 ? 1 : currentDay.value + 1;
  const courses = viewModel.value.coursesByDay[tomorrowDay] || [];
  return courses.sort((a, b) => a.startNode - b.startNode);
});

// 获取明天第一节课
const tomorrowFirstCourse = computed(() => {
  const courses = tomorrowCourses.value;
  return courses.length > 0 ? courses[0] : null;
});

// 计算到明天第一节课的时间
const timeToTomorrowCourse = computed(() => {
  const course = tomorrowFirstCourse.value;
  if (!course || !viewModel.value) return null;

  const now = currentTime.value;

  // 获取课程开始时间
  const startRow = viewModel.value.nodeRows.find(r => r.node === course.startNode);
  if (!startRow) return null;

  const startTimeParts = startRow.startTime.split(':');
  if (startTimeParts.length !== 2) return null;

  const courseHour = parseInt(startTimeParts[0], 10);
  const courseMinute = parseInt(startTimeParts[1], 10);

  // 计算明天的日期时间
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + 1);
  targetDate.setHours(courseHour, courseMinute, 0, 0);

  // 计算剩余秒数
  const diffMs = targetDate.getTime() - now.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds <= 0) return null;

  return {
    days: Math.floor(diffSeconds / 86400),
    hours: Math.floor((diffSeconds % 86400) / 3600),
    minutes: Math.floor((diffSeconds % 3600) / 60),
    seconds: diffSeconds % 60,
    totalSeconds: diffSeconds
  };
});

// 获取下周第一节课
const nextWeekFirstCourse = computed(() => {
  if (!viewModel.value || !timetableData.value) return null;

  const currentWeek = viewModel.value.currentWeek;
  const maxWeek = viewModel.value.maxWeek;

  // 如果已经是最后一周，没有下周了
  if (currentWeek >= maxWeek) return null;

  // 构建下周的视图模型
  const nextWeekViewModel = buildTimetableViewModel(timetableData.value, currentWeek + 1);

  // 查找下周周一的课程
  const mondayCourses = nextWeekViewModel.coursesByDay[1] || [];
  if (mondayCourses.length === 0) return null;

  // 返回第一节课
  return mondayCourses.sort((a, b) => a.startNode - b.startNode)[0];
});

// 计算到下周第一节课的时间
const timeToNextWeekCourse = computed(() => {
  const course = nextWeekFirstCourse.value;
  if (!course || !viewModel.value) return null;

  // 计算到下周周一第一节课开始的时间
  const now = currentTime.value;

  // 计算当前是周几 (1-7)
  const currentDayOfWeek = currentDay.value;

  // 计算距离下周一的天数
  const daysUntilMonday = currentDayOfWeek === 7 ? 1 : 8 - currentDayOfWeek;

  // 获取课程开始时间
  const startRow = viewModel.value.nodeRows.find(r => r.node === course.startNode);
  if (!startRow) return null;

  const startTimeParts = startRow.startTime.split(':');
  if (startTimeParts.length !== 2) return null;

  const courseHour = parseInt(startTimeParts[0], 10);
  const courseMinute = parseInt(startTimeParts[1], 10);

  // 计算目标日期时间
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + daysUntilMonday);
  targetDate.setHours(courseHour, courseMinute, 0, 0);

  // 计算剩余秒数
  const diffMs = targetDate.getTime() - now.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds <= 0) return null;

  return {
    days: Math.floor(diffSeconds / 86400),
    hours: Math.floor((diffSeconds % 86400) / 3600),
    minutes: Math.floor((diffSeconds % 3600) / 60),
    seconds: diffSeconds % 60,
    totalSeconds: diffSeconds
  };
});

// 解析时间文本为分钟数
function parseTimeToMinute(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length !== 2) return null;
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  if (isNaN(hour) || isNaN(minute)) return null;
  return hour * 60 + minute;
}

// 获取课程时间范围
function getCourseTimeRange(course) {
  if (!viewModel.value) return null;
  const startRow = viewModel.value.nodeRows.find(r => r.node === course.startNode);
  const endRow = viewModel.value.nodeRows.find(r => r.node === course.endNode);
  if (!startRow || !endRow) return null;

  const startMinute = parseTimeToMinute(startRow.startTime);
  const endMinute = parseTimeToMinute(endRow.endTime);
  if (startMinute === null || endMinute === null) return null;

  return { startMinute, endMinute };
}

// 课程状态
const courseStatus = computed(() => {
  const now = currentMinute.value;
  const courses = todayCourses.value;

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    const timeRange = getCourseTimeRange(course);
    if (!timeRange) continue;

    // 上课中
    if (now >= timeRange.startMinute && now < timeRange.endMinute) {
      const remainMinutes = timeRange.endMinute - now;
      return {
        type: 'in-class',
        course,
        remainMinutes,
        nextCourse: courses[i + 1] || null
      };
    }

    // 课间
    if (i < courses.length - 1) {
      const nextCourse = courses[i + 1];
      const nextTimeRange = getCourseTimeRange(nextCourse);
      if (nextTimeRange && now >= timeRange.endMinute && now < nextTimeRange.startMinute) {
        const remainMinutes = nextTimeRange.startMinute - now;
        return {
          type: 'break',
          course: nextCourse,
          remainMinutes,
          prevCourse: course
        };
      }
    }
  }

  // 检查是否在课前
  if (courses.length > 0) {
    const firstCourse = courses[0];
    const timeRange = getCourseTimeRange(firstCourse);
    if (timeRange && now < timeRange.startMinute) {
      const remainMinutes = timeRange.startMinute - now;
      return {
        type: 'before',
        course: firstCourse,
        remainMinutes
      };
    }
  }

  // 今日课毕或无课
  return {
    type: 'finished',
    courses: todayCourses.value
  };
});

// 格式化剩余时间
function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${mins}分钟`;
}

// 解析颜色
function parseCourseColor(colorStr) {
  if (!colorStr || !colorStr.startsWith('#')) return colorStr;
  if (colorStr.length === 9) {
    return `#${colorStr.slice(3)}`;
  }
  return colorStr;
}

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

    // 计算当前周次
    const currentWeek = resolveCurrentWeek(
      data.settings.startDate,
      data.settings.maxWeek
    );

    // 构建视图模型
    viewModel.value = buildTimetableViewModel(data, currentWeek);
  } catch (err) {
    error.value = err.message;
    console.error('加载课程表失败:', err);
  } finally {
    loading.value = false;
  }
}

// 跳转到课程表页面
function goToTimetable() {
  router.go('/pages/timetable');
}

// 更新当前时间
function updateTime() {
  currentTime.value = new Date();
}

onMounted(() => {
  // 客户端初始化时间，避免 SSR 水合不匹配
  currentTime.value = new Date();
  loadTimetableData();
  // 每秒更新一次时间
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<template>
  <div class="timetable-card weidgets" @click="goToTimetable">
    <div class="title">
      <i class="iconfont icon-calendar"></i>
      <span class="title-name">今日课程</span>
      <span class="week-label">{{ WEEKDAY_LABELS[currentDay] }}</span>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-state">
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <i class="iconfont icon-error"></i>
      <span>加载失败</span>
    </div>

    <!-- 上课中 -->
    <div v-else-if="courseStatus.type === 'in-class'" class="status-content">
      <div class="status-badge in-class">上课中</div>
      <div class="course-info">
        <div class="course-name" :style="{ color: parseCourseColor(courseStatus.course.color) }">
          {{ courseStatus.course.courseName }}
        </div>
        <div class="course-detail">
          <span class="room">{{ courseStatus.course.room }}</span>
          <span class="teacher">{{ courseStatus.course.teacher }}</span>
        </div>
      </div>
      <div class="countdown">
        <span class="countdown-label">距下课还有</span>
        <span class="countdown-time">{{ formatDuration(courseStatus.remainMinutes) }}</span>
      </div>
      <div v-if="courseStatus.nextCourse" class="next-course">
        下节：{{ courseStatus.nextCourse.courseName }}
      </div>
    </div>

    <!-- 课间 -->
    <div v-else-if="courseStatus.type === 'break'" class="status-content">
      <div class="status-badge break">课间</div>
      <div class="course-info">
        <div class="course-name" :style="{ color: parseCourseColor(courseStatus.course.color) }">
          {{ courseStatus.course.courseName }}
        </div>
        <div class="course-detail">
          <span class="room">{{ courseStatus.course.room }}</span>
          <span class="teacher">{{ courseStatus.course.teacher }}</span>
        </div>
      </div>
      <div class="countdown">
        <span class="countdown-label">距上课还有</span>
        <span class="countdown-time">{{ formatDuration(courseStatus.remainMinutes) }}</span>
      </div>
    </div>

    <!-- 课前 -->
    <div v-else-if="courseStatus.type === 'before'" class="status-content">
      <div class="status-badge before">课前</div>
      <div class="course-info">
        <div class="course-name" :style="{ color: parseCourseColor(courseStatus.course.color) }">
          {{ courseStatus.course.courseName }}
        </div>
        <div class="course-detail">
          <span class="room">{{ courseStatus.course.room }}</span>
          <span class="teacher">{{ courseStatus.course.teacher }}</span>
        </div>
      </div>
      <div class="countdown">
        <span class="countdown-label">距上课还有</span>
        <span class="countdown-time">{{ formatDuration(courseStatus.remainMinutes) }}</span>
      </div>
    </div>

    <!-- 今日课毕/无课 -->
    <div v-else class="status-content">
      <!-- 优先显示明天的课程 -->
      <div v-if="tomorrowFirstCourse && timeToTomorrowCourse" class="next-week-info">
        <div class="status-badge tomorrow">今日课毕</div>
        <div class="next-week-course">
          <span class="label">明天首节：</span>
          <span class="course-name" :style="{ color: parseCourseColor(tomorrowFirstCourse.color) }">
            {{ tomorrowFirstCourse.courseName }} - {{ tomorrowFirstCourse.room }}
          </span>
        </div>
        <div class="countdown">
          <span class="countdown-label">距上课还有</span>
          <span class="countdown-time">{{ timeToTomorrowCourse.hours }}时，{{ timeToTomorrowCourse.minutes }}分，{{ timeToTomorrowCourse.seconds }}秒</span>
        </div>
      </div>
      <!-- 明天没课，显示下周首节 -->
      <div v-else-if="nextWeekFirstCourse && timeToNextWeekCourse" class="next-week-info">
        <div class="status-badge next-week">本周课毕</div>
        <div class="next-week-course">
          <span class="label">下周首节：</span>
          <span class="course-name" :style="{ color: parseCourseColor(nextWeekFirstCourse.color) }">
            {{ nextWeekFirstCourse.courseName }} - {{ nextWeekFirstCourse.room }}
          </span>
        </div>
        <div class="countdown">
          <span class="countdown-label">距上课还有</span>
          <span class="countdown-time">{{ timeToNextWeekCourse.days }}天，{{ timeToNextWeekCourse.hours }}时，{{ timeToNextWeekCourse.minutes }}分，{{ timeToNextWeekCourse.seconds }}秒</span>
        </div>
      </div>
      <!-- 否则显示今日无课或课毕 -->
      <div v-else-if="todayCourses.length === 0" class="no-course">
        <i class="iconfont icon-coffee"></i>
        <span>今日无课</span>
      </div>
      <div v-else class="finished">
        <i class="iconfont icon-check"></i>
        <span>今日课毕</span>
        <div class="finished-courses">
          共 {{ todayCourses.length }} 节课
        </div>
      </div>
    </div>

    <!-- 今日课程列表预览 -->
    <div v-if="!loading && !error && todayCourses.length > 0" class="course-preview">
      <div
        v-for="course in todayCourses.slice(0, 3)"
        :key="course.courseId"
        class="preview-item"
        :class="{ active: courseStatus.type === 'in-class' && courseStatus.course.courseId === course.courseId }"
      >
        <div class="preview-dot" :style="{ backgroundColor: parseCourseColor(course.color) }"></div>
        <div class="preview-info">
          <span class="preview-name">{{ course.courseName }}</span>
          <span class="preview-time">{{ course.timeText }}</span>
        </div>
      </div>
      <div v-if="todayCourses.length > 3" class="more-courses">
        +{{ todayCourses.length - 3 }} 节课
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.timetable-card {
  background: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--main-color);
  }

  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-weight: 600;
    color: var(--main-font-color);

    .iconfont {
      font-size: 1.1rem;
      color: var(--main-color);
    }

    .week-label {
      margin-left: auto;
      font-size: 0.75rem;
      padding: 2px 8px;
      background: var(--main-card-second-background);
      border-radius: 4px;
      color: var(--main-font-second-color);
    }
  }

  // 加载状态
  .loading-state {
    .skeleton-line {
      height: 16px;
      background: linear-gradient(90deg, var(--main-card-second-background) 25%, var(--main-card-border) 50%, var(--main-card-second-background) 75%);
      background-size: 200% 100%;
      border-radius: 4px;
      margin-bottom: 8px;
      animation: shimmer 1.5s infinite;

      &.short {
        width: 60%;
      }
    }
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  // 错误状态
  .error-state {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--main-font-second-color);
    padding: 12px 0;

    i {
      color: #f56c6c;
    }
  }

  // 状态内容
  .status-content {
    margin-bottom: 12px;

    .status-badge {
      display: inline-block;
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 4px;
      margin-bottom: 8px;
      font-weight: 500;

      &.in-class {
        background: rgba(103, 194, 58, 0.2);
        color: #67c23a;
      }

      &.break {
        background: rgba(230, 162, 60, 0.2);
        color: #e6a03c;
      }

      &.before {
        background: rgba(144, 147, 153, 0.2);
        color: #909399;
      }

      &.next-week {
        background: rgba(64, 158, 255, 0.2);
        color: #409eff;
      }

      &.tomorrow {
        background: rgba(230, 162, 60, 0.2);
        color: #e6a03c;
      }
    }

    .next-week-info {
      .next-week-course {
        margin-bottom: 8px;
        font-size: 0.9rem;

        .label {
          color: var(--main-font-second-color);
        }

        .course-name {
          font-weight: 600;
        }
      }
    }

    .course-info {
      margin-bottom: 8px;

      .course-name {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .course-detail {
        display: flex;
        gap: 12px;
        font-size: 0.8rem;
        color: var(--main-font-second-color);

        .room, .teacher {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    .countdown {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;

      .countdown-label {
        color: var(--main-font-second-color);
      }

      .countdown-time {
        font-weight: 600;
        color: var(--main-color);
      }
    }

    .next-course {
      margin-top: 8px;
      font-size: 0.8rem;
      color: var(--main-font-second-color);
      padding-top: 8px;
      border-top: 1px dashed var(--main-card-border);
    }
  }

  // 无课/课毕状态
  .no-course, .finished {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 0;
    color: var(--main-font-second-color);

    i {
      font-size: 2rem;
      margin-bottom: 8px;
      color: var(--main-color);
    }

    span {
      font-size: 1rem;
      font-weight: 500;
    }

    .finished-courses {
      margin-top: 4px;
      font-size: 0.8rem;
      opacity: 0.7;
    }
  }

  // 课程预览列表
  .course-preview {
    border-top: 1px solid var(--main-card-border);
    padding-top: 12px;

    .preview-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
      font-size: 0.8rem;

      &.active {
        background: var(--main-card-second-background);
        margin: 0 -8px;
        padding: 6px 8px;
        border-radius: 6px;
      }

      .preview-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .preview-info {
        display: flex;
        flex-direction: column;
        min-width: 0;

        .preview-name {
          color: var(--main-font-color);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .preview-time {
          font-size: 0.7rem;
          color: var(--main-font-second-color);
        }
      }
    }

    .more-courses {
      text-align: center;
      font-size: 0.75rem;
      color: var(--main-font-second-color);
      padding-top: 8px;
    }
  }
}

// 暗色模式适配
[data-theme="dark"] {
  .timetable-card {
    .status-badge {
      &.in-class {
        background: rgba(103, 194, 58, 0.15);
      }

      &.break {
        background: rgba(230, 162, 60, 0.15);
      }

      &.before {
        background: rgba(144, 147, 153, 0.15);
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .timetable-card {
    .course-info {
      .course-detail {
        flex-direction: column;
        gap: 4px !important;
      }
    }

    .countdown {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 4px !important;
    }
  }
}
</style>
