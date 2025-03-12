/**
 * 甘特图工具函数
 */

/**
 * 格式化日期为 YYYY-MM-DD 字符串
 * @param {Date} date 
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '';
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 解析日期字符串为 Date 对象
 * @param {string} dateString 
 * @returns {Date}
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  return new Date(dateString);
};

/**
 * 计算两个日期之间的天数
 * @param {Date|string} startDate 
 * @param {Date|string} endDate 
 * @returns {number}
 */
export const daysBetween = (startDate, endDate) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  // 移除时间部分，只保留日期
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  // 计算毫秒差并转换为天数
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * 添加天数到日期
 * @param {Date|string} date 
 * @param {number} days 
 * @returns {Date}
 */
export const addDays = (date, days) => {
  const result = new Date(parseDate(date));
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * 获取日期所在的周数
 * @param {Date|string} date 
 * @returns {number}
 */
export const getWeekNumber = (date) => {
  const d = parseDate(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNumber;
};

/**
 * 生成随机颜色
 * @returns {string}
 */
export const randomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * 自动计算合适的开始和结束日期
 * @param {Array} tasks 
 * @returns {Object} { startDate, endDate }
 */
export const calculateAutoDateRange = (tasks) => {
  if (!tasks.length) {
    const today = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(today.getMonth() + 1);
    return { startDate: today, endDate: oneMonthLater };
  }

  let minDate = parseDate(tasks[0].start);
  let maxDate = parseDate(tasks[0].end);

  tasks.forEach(task => {
    const taskStart = parseDate(task.start);
    const taskEnd = parseDate(task.end);

    if (taskStart < minDate) minDate = taskStart;
    if (taskEnd > maxDate) maxDate = taskEnd;
  });

  // 添加一些边距（前后各7天）
  minDate = addDays(minDate, -7);
  maxDate = addDays(maxDate, 7);

  return { startDate: minDate, endDate: maxDate };
};

// 定义默认导出对象
const utilsExport = {
  formatDate,
  parseDate,
  daysBetween,
  addDays,
  getWeekNumber,
  randomColor,
  calculateAutoDateRange
};

// 导出默认对象
export default utilsExport; 