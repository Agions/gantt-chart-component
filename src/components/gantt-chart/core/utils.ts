/**
 * 甘特图工具函数
 */
import { Task, Resource, ViewMode, Dependency } from './types';
// 预先导入这些库，避免动态导入问题
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';

/**
 * 格式化日期为 YYYY-MM-DD 字符串
 * @param {Date} date 
 * @returns {string}
 */
export const formatDate = (date: Date): string => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 解析日期字符串为 Date 对象
 * @param {string | Date} dateString 
 * @returns {Date}
 */
export const parseDate = (dateString: string | Date): Date => {
  if (!dateString) return new Date();
  if (dateString instanceof Date) return dateString;
  return new Date(dateString);
};

/**
 * 计算两个日期之间的天数
 * @param {Date|string} startDate 
 * @param {Date|string} endDate 
 * @returns {number}
 */
export const daysBetween = (startDate: Date | string, endDate: Date | string): number => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  // 移除时间部分，只保留日期
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  // 计算毫秒差并转换为天数
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * 添加天数到日期
 * @param {Date|string} date 
 * @param {number} days 
 * @returns {Date}
 */
export const addDays = (date: Date | string, days: number): Date => {
  const result = new Date(parseDate(date));
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * 获取日期所在的周数
 * @param {Date|string} date 
 * @returns {number}
 */
export const getWeekNumber = (date: Date | string): number => {
  const d = parseDate(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNumber;
};

/**
 * 获取月份名称
 * @param {Date|string} date 
 * @param {boolean} short 是否短格式
 * @returns {string}
 */
export const getMonthName = (date: Date | string, short: boolean = false): string => {
  const d = parseDate(date);
  return d.toLocaleString('default', { month: short ? 'short' : 'long' });
};

/**
 * 生成随机颜色
 * @returns {string}
 */
export const randomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * 自动计算合适的开始和结束日期
 * @param {Task[]} tasks 
 * @returns {Object} { startDate, endDate }
 */
export const calculateAutoDateRange = (tasks: Task[]): { startDate: Date, endDate: Date } => {
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

/**
 * 创建平面任务列表（处理任务层级）
 * @param {Task[]} tasks 
 * @returns {Task[]}
 */
export const flattenTasks = (tasks: Task[]): Task[] => {
  const result: Task[] = [];
  
  const processTasks = (taskList: Task[], level: number = 0) => {
    if (!taskList) return;
    
    taskList.forEach(task => {
      // 创建一个新的任务对象，添加层级信息
      const newTask = { ...task, level };
      
      // 添加到结果列表
      result.push(newTask);
      
      // 如果有子任务且未折叠，则递归处理
      if (task.children && task.children.length && !task.collapsed) {
        processTasks(task.children, level + 1);
      }
    });
  };
  
  processTasks(tasks);
  return result;
};

/**
 * 构建任务树（整理父子关系）
 * @param {Task[]} tasks 
 * @returns {Task[]}
 */
export const buildTaskTree = (tasks: Task[]): Task[] => {
  const taskMap: Record<string | number, Task> = {};
  const rootTasks: Task[] = [];
  
  // 首先创建所有任务的映射
  tasks.forEach(task => {
    taskMap[task.id] = { ...task, children: [] };
  });
  
  // 构建树结构
  tasks.forEach(task => {
    if (task.parentId && taskMap[task.parentId]) {
      if (!taskMap[task.parentId].children) {
        taskMap[task.parentId].children = [];
      }
      taskMap[task.parentId].children!.push(taskMap[task.id]);
    } else {
      rootTasks.push(taskMap[task.id]);
    }
  });
  
  return rootTasks;
};

/**
 * 根据视图模式获取列宽
 * @param {ViewMode} viewMode 
 * @returns {number}
 */
export const getColumnWidthByViewMode = (viewMode: ViewMode): number => {
  switch (viewMode) {
    case 'day': return 40;
    case 'week': return 60;
    case 'month': return 120;
    case 'quarter': return 150;
    case 'year': return 180;
    default: return 40;
  }
};

/**
 * 检查任务是否重叠（用于依赖关系）
 * @param {Task} task1 
 * @param {Task} task2 
 * @returns {boolean}
 */
export const tasksOverlap = (task1: Task, task2: Task): boolean => {
  const start1 = parseDate(task1.start);
  const end1 = parseDate(task1.end);
  const start2 = parseDate(task2.start);
  const end2 = parseDate(task2.end);
  
  return (start1 <= end2) && (end1 >= start2);
};

/**
 * 导出甘特图为图片
 * @param {HTMLElement} element 甘特图DOM元素
 * @param {string} filename 保存的文件名
 * @returns {Promise<string>} 数据URL
 */
export const exportToImage = async (element: HTMLElement, filename: string = 'gantt-chart.png'): Promise<string> => {
  try {
    const dataUrl = await htmlToImage.toPng(element);
    
    // 如果提供了文件名，则自动下载
    if (filename) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    }
    
    return dataUrl;
  } catch (error) {
    console.error('导出图片出错:', error);
    return Promise.reject(error);
  }
};

/**
 * 导出甘特图为PDF
 * @param {HTMLElement} element 甘特图DOM元素
 * @param {string} filename 保存的文件名
 * @param {Object} options 导出选项
 * @returns {Promise<Blob>} PDF Blob对象
 */
export const exportToPDF = async (element: HTMLElement, filename: string = 'gantt-chart.pdf', options: any = {}): Promise<Blob> => {
  try {
    const dataUrl = await htmlToImage.toPng(element);
    const pdf = new jsPDF('l', 'mm', options.format || 'a4');
    
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // 如果提供了文件名，则自动下载
    if (filename) {
      pdf.save(filename);
    }
    
    // 转换为Blob对象
    const pdfBlob = pdf.output('blob');
    return pdfBlob;
  } catch (error) {
    console.error('导出PDF出错:', error);
    return Promise.reject(error);
  }
};

export default {
  formatDate,
  parseDate,
  daysBetween,
  addDays,
  getWeekNumber,
  getMonthName,
  randomColor,
  calculateAutoDateRange,
  flattenTasks,
  buildTaskTree,
  getColumnWidthByViewMode,
  tasksOverlap,
  exportToImage,
  exportToPDF
}; 