---
title: 博客课程表功能实现详解
description: 详细介绍如何在 VitePress 博客中实现课程表页面和侧边栏组件，包括数据解析、视图模型构建和实时状态更新
date: 2026-06-05
categories: [开发教程]
tags: [VitePress,Vue ,课程表, 组件开发]
---

# 博客课程表功能实现详解

最近给博客添加了一个课程表功能，包括完整的课程表页面和侧边栏实时组件。这篇文章将详细介绍实现过程。

## 功能概述

课程表功能包含两个主要部分：

1. **课程表页面** (`/pages/timetable`) - 完整的周视图课程表
2. **侧边栏组件** - 显示今日课程状态和倒计时

## 数据格式

课程表数据采用 JSON 格式存储，参考了 Android 课程表应用的数据结构：

```json
{
  "settings": {
    "startDate": "2025-02-17",
    "maxWeek": 18,
    "nodes": 11,
    "weekendDisplay": {
      "enabled": true,
      "weeks": [10, 13, 14],
      "days": ["sat"]
    }
  },
  "timeTable": [
    { "node": 1, "startTime": "08:00", "endTime": "08:45" },
    { "node": 2, "startTime": "08:50", "endTime": "09:35" }
  ],
  "courseList": [
    { "id": 1, "courseName": "高等数学", "color": "#FF7589" }
  ],
  "scheduleList": [
    {
      "id": 1,
      "day": 1,
      "startNode": 1,
      "step": 2,
      "startWeek": 1,
      "endWeek": 18,
      "teacher": "张老师",
      "room": "A101"
    }
  ]
}
```

### 字段说明

- **settings** - 基础设置
  - `startDate`: 学期开始日期
  - `maxWeek`: 最大周数
  - `nodes`: 每天节数
  - `weekendDisplay`: 控制特定周次显示周末

- **timeTable** - 每节课的时间安排

- **courseList** - 课程定义列表

- **scheduleList** - 课程安排（包含时间、地点、周次范围）

## 核心工具函数

### 1. 数据解析器

```javascript
// timetableUtils.mjs
export function parseTimetableData(jsonData) {
  return {
    settings: jsonData.settings,
    timeTable: jsonData.timeTable,
    courses: jsonData.courseList,
    schedules: jsonData.scheduleList
  };
}
```

### 2. 当前周次计算

```javascript
export function resolveCurrentWeek(startDate, maxWeek) {
  const start = new Date(startDate);
  const now = new Date();
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const week = Math.floor(diffDays / 7) + 1;
  return Math.min(Math.max(1, week), maxWeek);
}
```

### 3. 视图模型构建

```javascript
export function buildTimetableViewModel(data, selectedWeek) {
  const { settings, timeTable, courses, schedules } = data;
  
  // 过滤当前周的课程
  const weekSchedules = schedules.filter(s => 
    selectedWeek >= s.startWeek && selectedWeek <= s.endWeek
  );
  
  // 按星期分组
  const coursesByDay = {};
  for (let day = 1; day <= 7; day++) {
    coursesByDay[day] = weekSchedules
      .filter(s => s.day === day)
      .map(s => ({
        ...s,
        courseName: courses.find(c => c.id === s.id)?.courseName,
        color: courses.find(c => c.id === s.id)?.color,
        timeText: getTimeText(timeTable, s.startNode, s.step)
      }))
      .sort((a, b) => a.startNode - b.startNode);
  }
  
  return {
    currentWeek: selectedWeek,
    maxWeek: settings.maxWeek,
    coursesByDay,
    nodeRows: timeTable
  };
}
```

## 课程表页面实现

### 页面结构

```vue
<template>
  <div class="timetable-page">
    <!-- 周次选择器 -->
    <div class="week-selector">
      <button @click="previousWeek" :disabled="selectedWeek <= 1">
        <svg>...</svg>
      </button>
      <span>第 {{ selectedWeek }} 周</span>
      <span v-if="isCurrentWeek" class="current-badge">当前周</span>
      <button @click="nextWeek" :disabled="selectedWeek >= maxWeek">
        <svg>...</svg>
      </button>
    </div>
    
    <!-- 课程表网格 -->
    <table class="timetable-grid">
      <thead>
        <tr>
          <th>节次</th>
          <th v-for="day in dayColumns" :key="day.day">{{ day.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in nodeGroups" :key="row.startNode">
          <td>
            <div>第 {{ row.startNode }}-{{ row.endNode }} 节</div>
            <div class="time-range">{{ row.timeText }}</div>
          </td>
          <td v-for="day in dayColumns" :key="day.day">
            <div v-for="course in getCourses(day.day, row.startNode)" 
                 :key="course.id"
                 class="course-card"
                 :style="{ borderColor: course.color }">
              <div class="course-name">{{ course.courseName }}</div>
              <div class="course-info">
                <span>{{ course.room }}</span>
                <span>{{ course.teacher }}</span>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

### 样式特点

- 使用 CSS Grid 布局课程卡片
- 课程颜色作为左边框标识
- 响应式设计：桌面端表格视图，移动端列表视图
- 支持深色模式

## 侧边栏组件实现

侧边栏组件是课程的亮点，提供实时状态更新：

### 状态类型

1. **课前** - 显示第一节课倒计时
2. **上课中** - 显示当前课程和剩余时间
3. **课间** - 显示下节课倒计时
4. **今日课毕** - 显示明天/下周第一节课

### 核心逻辑

```vue
<script setup>
const courseStatus = computed(() => {
  const now = currentMinute.value;
  const courses = todayCourses.value;
  
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    const timeRange = getCourseTimeRange(course);
    
    // 上课中
    if (now >= timeRange.start && now < timeRange.end) {
      return {
        type: 'in-class',
        course,
        remainMinutes: timeRange.end - now
      };
    }
    
    // 课间
    if (i < courses.length - 1) {
      const nextCourse = courses[i + 1];
      const nextRange = getCourseTimeRange(nextCourse);
      if (now >= timeRange.end && now < nextRange.start) {
        return {
          type: 'break',
          course: nextCourse,
          remainMinutes: nextRange.start - now
        };
      }
    }
  }
  
  // 今日课毕
  return { type: 'finished' };
});
</script>
```

### 智能下一节课提示

今日课毕后，组件会智能判断：

1. 如果明天有课 → 显示明天第一节课
2. 如果明天没课 → 显示下周第一节课
3. 精确到秒的倒计时

```javascript
const tomorrowFirstCourse = computed(() => {
  const tomorrowDay = currentDay.value === 7 ? 1 : currentDay.value + 1;
  const courses = viewModel.value.coursesByDay[tomorrowDay] || [];
  return courses.sort((a, b) => a.startNode - b.startNode)[0];
});
```

## 技术亮点

### 1. 实时更新

使用 `setInterval` 每秒更新当前时间，实现动态倒计时：

```javascript
let timer = null;

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});
```

### 2. 计算属性缓存

利用 Vue 的计算属性自动缓存，避免重复计算：

```javascript
const todayCourses = computed(() => {
  // 只在 viewModel 变化时重新计算
  return viewModel.value.coursesByDay[currentDay.value] || [];
});
```

### 3. 时间解析

解析课程时间文本为分钟数，便于比较：

```javascript
function parseTimeToMinute(timeStr) {
  const [hour, minute] = timeStr.split(':').map(Number);
  return hour * 60 + minute;
}
```

## 使用方式

### 1. 准备数据

将课程数据保存为 `public/大三下.json`：

```json
{
  "settings": { ... },
  "timeTable": [ ... ],
  "courseList": [ ... ],
  "scheduleList": [ ... ]
}
```

### 2. 访问页面

- 完整课程表：`/pages/timetable`
- 支持 URL 参数：`/pages/timetable?week=10`

### 3. 侧边栏自动显示

组件会自动加载数据并显示今日课程状态。

## 总结

通过这个项目，我实现了：

1. **完整的数据解析流程** - 从 JSON 到视图模型
2. **灵活的周次切换** - 支持任意周次查看
3. **实时状态组件** - 自动判断课前/课中/课后状态
4. **智能下一节课提示** - 优先显示明天课程，其次下周
5. **响应式设计** - 适配桌面端和移动端

代码已开源，欢迎参考使用。
