// 课程表工具函数

const WEEKDAY_LABELS = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  7: '周日'
};

/**
 * 解析 ARGB 颜色格式
 * @param {string} raw - ARGB 格式颜色值，如 "#ffff0000"
 * @returns {string|null} - 返回 RGB 格式或 null
 */
export function parseArgbColor(raw) {
  if (!raw || !raw.startsWith('#')) return null;

  // 处理 #AARRGGBB 格式
  if (raw.length === 9) {
    const r = raw.slice(3, 5);
    const g = raw.slice(5, 7);
    const b = raw.slice(7, 9);
    return `#${r}${g}${b}`;
  }

  // 处理 #RRGGBB 格式
  if (raw.length === 7) {
    return raw;
  }

  return null;
}

/**
 * 生成课程颜色
 * @param {string} courseName - 课程名称
 * @param {number} courseId - 课程ID
 * @param {string} rawColor - 原始颜色值
 * @returns {string} - 返回颜色值
 */
function buildCourseColor(courseName, courseId, rawColor) {
  const parsed = parseArgbColor(rawColor);
  if (parsed) return parsed;

  // 使用课程名和ID生成哈希值
  let hash = 0;
  const str = `${courseName}-${courseId}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  hash = Math.abs(hash);

  const hue = hash % 360;
  return `hsl(${hue} 78% 68%)`;
}

/**
 * 解析日期字符串
 * @param {string} ymd - 日期字符串，如 "2026-3-2"
 * @returns {Date|null}
 */
function parseDateFromYmd(ymd) {
  const parts = ymd.split('-').map(part => Number(part));
  if (parts.length !== 3 || parts.some(part => !Number.isFinite(part))) {
    return null;
  }
  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
}

/**
 * 计算当前周次
 * @param {string} startDateText - 开始日期
 * @param {number} maxWeek - 最大周次
 * @param {Date} now - 当前日期
 * @returns {number}
 */
export function resolveCurrentWeek(startDateText, maxWeek, now = new Date()) {
  const startDate = parseDateFromYmd(startDateText);
  if (!startDate) {
    return 1;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((now.getTime() - startDate.getTime()) / msPerDay);
  const week = Math.floor(diffDays / 7) + 1;

  if (week < 1) {
    return 1;
  }
  if (week > maxWeek) {
    return maxWeek;
  }
  return week;
}

/**
 * 检查某周是否应该显示某天
 * @param {number} week - 当前周次
 * @param {number} day - 星期几 (1-7)
 * @param {object} weekendDisplay - 周末显示配置
 * @param {boolean} defaultShow - 默认是否显示
 * @returns {boolean}
 */
function shouldShowDay(week, day, weekendDisplay, defaultShow) {
  // 如果不是周末，直接返回默认设置
  if (day !== 6 && day !== 7) {
    return true;
  }

  // 如果有 weekendDisplay 配置，优先使用
  if (weekendDisplay && weekendDisplay.enabled) {
    const dayMap = { 6: 'sat', 7: 'sun' };
    const dayKey = dayMap[day];

    // 检查是否在指定天数列表中
    if (weekendDisplay.days && weekendDisplay.days.includes(dayKey)) {
      // 检查是否在指定周次列表中
      if (weekendDisplay.weeks && weekendDisplay.weeks.length > 0) {
        return weekendDisplay.weeks.includes(week);
      }
      return true;
    }
    return false;
  }

  // 使用默认设置
  if (day === 6) return defaultShow;
  if (day === 7) return defaultShow;
  return true;
}

/**
 * 构建节次行数据
 * @param {object} data - 课程表数据
 * @returns {Array}
 */
function buildNodeRows(data) {
  const { timeTable, settings } = data;
  const { nodes } = settings;

  if (timeTable && timeTable.length > 0) {
    return timeTable
      .filter(item => item.node >= 1 && item.node <= nodes)
      .sort((a, b) => a.node - b.node)
      .map(item => ({
        node: item.node,
        startTime: item.startTime,
        endTime: item.endTime
      }));
  }

  // 默认节次
  return Array.from({ length: nodes }, (_, index) => ({
    node: index + 1,
    startTime: '--:--',
    endTime: '--:--'
  }));
}

/**
 * 构建星期列数据
 * @param {object} data - 课程表数据
 * @param {number} currentWeek - 当前周次
 * @returns {Array}
 */
function buildDayColumns(data, currentWeek) {
  const { settings } = data;
  const { showSat, showSun, weekendDisplay } = settings;

  const columns = [
    { day: 1, label: WEEKDAY_LABELS[1] },
    { day: 2, label: WEEKDAY_LABELS[2] },
    { day: 3, label: WEEKDAY_LABELS[3] },
    { day: 4, label: WEEKDAY_LABELS[4] },
    { day: 5, label: WEEKDAY_LABELS[5] }
  ];

  // 检查是否显示周六
  if (shouldShowDay(currentWeek, 6, weekendDisplay, showSat)) {
    columns.push({ day: 6, label: WEEKDAY_LABELS[6] });
  }

  // 检查是否显示周日
  if (shouldShowDay(currentWeek, 7, weekendDisplay, showSun)) {
    columns.push({ day: 7, label: WEEKDAY_LABELS[7] });
  }

  return columns;
}

/**
 * 构建课程视图
 * @param {object} schedule - 课程安排
 * @param {string} courseName - 课程名称
 * @param {string} color - 课程颜色
 * @param {Array} nodeRows - 节次行数据
 * @returns {object}
 */
function buildCourseView(schedule, courseName, color, nodeRows) {
  const durationNodes = schedule.step || 2;
  const maxNode = Math.max(...nodeRows.map(row => row.node), schedule.startNode);
  const endNode = Math.min(schedule.startNode + durationNodes - 1, maxNode);

  const startNodeRow = nodeRows.find(row => row.node === schedule.startNode);
  const endNodeRow = nodeRows.find(row => row.node === endNode);

  const startTime = startNodeRow?.startTime ?? '--:--';
  const endTime = endNodeRow?.endTime ?? '--:--';

  return {
    courseId: schedule.id,
    courseName,
    color,
    teacher: schedule.teacher?.trim() || '未填写',
    room: schedule.room?.trim() || '未填写',
    day: schedule.day,
    startNode: schedule.startNode,
    endNode,
    durationNodes,
    startWeek: schedule.startWeek,
    endWeek: schedule.endWeek,
    nodeText: `第 ${schedule.startNode}-${endNode} 节`,
    timeText: `${startTime} - ${endTime}`
  };
}

/**
 * 构建课程表视图模型
 * @param {object} data - 课程表数据
 * @param {number} selectedWeek - 选中的周次
 * @returns {object}
 */
export function buildTimetableViewModel(data, selectedWeek) {
  const { settings, courses, schedules } = data;
  const maxWeek = Math.max(1, settings.maxWeek || 1);
  const week = Math.min(Math.max(1, selectedWeek), maxWeek);

  const nodeRows = buildNodeRows(data);
  const dayColumns = buildDayColumns(data, week);

  // 构建课程映射
  const courseMap = new Map(courses.map(course => [course.id, course]));

  // 初始化每天的课程数组
  const coursesByDay = {};
  for (const column of dayColumns) {
    coursesByDay[column.day] = [];
  }

  // 填充课程数据
  for (const schedule of schedules) {
    // 检查星期几是否在显示范围内
    if (schedule.day < 1 || schedule.day > 7) {
      continue;
    }

    // 检查当前周次是否在课程范围内
    if (week < schedule.startWeek || week > schedule.endWeek) {
      continue;
    }

    // 检查该天是否应该显示
    if (!(schedule.day in coursesByDay)) {
      continue;
    }

    const courseDef = courseMap.get(schedule.id);
    const courseName = courseDef?.courseName ?? `课程 #${schedule.id}`;
    const color = buildCourseColor(courseName, schedule.id, courseDef?.color);

    coursesByDay[schedule.day].push(
      buildCourseView(schedule, courseName, color, nodeRows)
    );
  }

  // 对每天的课程按节次排序
  for (const day of Object.keys(coursesByDay)) {
    coursesByDay[Number(day)].sort(
      (a, b) => a.startNode - b.startNode || a.courseName.localeCompare(b.courseName)
    );
  }

  return {
    tableName: settings.tableName || '课表',
    maxWeek,
    currentWeek: week,
    weeks: Array.from({ length: maxWeek }, (_, index) => index + 1),
    dayColumns,
    nodeRows,
    coursesByDay
  };
}

/**
 * 获取课程在表格中的行范围
 * @param {object} course - 课程视图
 * @returns {object} - { startRow, rowSpan }
 */
export function getCourseRowRange(course) {
  // 每4节课为一行（1-4, 5-8, 9-11）
  const rowSize = 4;
  const startRow = Math.floor((course.startNode - 1) / rowSize) + 1;
  const endRow = Math.floor((course.endNode - 1) / rowSize) + 1;
  const rowSpan = endRow - startRow + 1;

  return { startRow, rowSpan };
}
