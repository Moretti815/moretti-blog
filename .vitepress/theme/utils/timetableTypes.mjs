// 课程表数据类型定义（使用 JSDoc）

/**
 * @typedef {Object} TimetableConfig
 * @property {number} courseLen
 * @property {number} id
 * @property {string} name
 * @property {boolean} sameBreakLen
 * @property {boolean} sameLen
 * @property {number} theBreakLen
 * @property {TimeTableItem[]} timeTable
 * @property {TimetableSettings} settings
 * @property {Course[]} courses
 * @property {Schedule[]} schedules
 */

/**
 * @typedef {Object} TimeTableItem
 * @property {string} endTime
 * @property {number} node
 * @property {string} startTime
 * @property {number} timeTable
 */

/**
 * @typedef {Object} TimetableSettings
 * @property {string} background
 * @property {number} courseTextColor
 * @property {number} id
 * @property {number} itemAlpha
 * @property {number} itemHeight
 * @property {number} itemTextSize
 * @property {number} maxWeek
 * @property {number} nodes
 * @property {string} school
 * @property {boolean} showOtherWeekCourse
 * @property {boolean} showSat
 * @property {boolean} showSun
 * @property {Object} [weekendDisplay]
 * @property {boolean} weekendDisplay.enabled
 * @property {number[]} weekendDisplay.weeks
 * @property {string[]} weekendDisplay.days
 * @property {boolean} showTime
 * @property {string} startDate
 * @property {number} strokeColor
 * @property {boolean} sundayFirst
 * @property {string} tableName
 * @property {number} textColor
 * @property {string} tid
 * @property {number} timeTable
 * @property {number} type
 * @property {number} updateTime
 * @property {number} widgetCourseTextColor
 * @property {number} widgetItemAlpha
 * @property {number} widgetItemHeight
 * @property {number} widgetItemTextSize
 * @property {number} widgetStrokeColor
 * @property {number} widgetTextColor
 */

/**
 * @typedef {Object} Course
 * @property {string} color
 * @property {string} courseName
 * @property {number} credit
 * @property {number} id
 * @property {string} note
 * @property {number} tableId
 */

/**
 * @typedef {Object} Schedule
 * @property {number} day
 * @property {string} endTime
 * @property {number} endWeek
 * @property {number} id
 * @property {number} level
 * @property {boolean} ownTime
 * @property {string} room
 * @property {number} startNode
 * @property {string} startTime
 * @property {number} startWeek
 * @property {number} step
 * @property {number} tableId
 * @property {string} teacher
 * @property {number} type
 */

/**
 * @typedef {Object} TimetableViewModel
 * @property {string} tableName
 * @property {number} maxWeek
 * @property {number} currentWeek
 * @property {number[]} weeks
 * @property {DayColumn[]} dayColumns
 * @property {NodeRow[]} nodeRows
 * @property {Object.<number, CourseView[]>} coursesByDay
 */

/**
 * @typedef {Object} DayColumn
 * @property {number} day
 * @property {string} label
 */

/**
 * @typedef {Object} NodeRow
 * @property {number} node
 * @property {string} startTime
 * @property {string} endTime
 */

/**
 * @typedef {Object} CourseView
 * @property {number} courseId
 * @property {string} courseName
 * @property {string} color
 * @property {string} teacher
 * @property {string} room
 * @property {number} day
 * @property {number} startNode
 * @property {number} endNode
 * @property {number} durationNodes
 * @property {number} startWeek
 * @property {number} endWeek
 * @property {string} nodeText
 * @property {string} timeText
 */

// 导出空对象，因为 JSDoc 类型只是注释
export default {};
