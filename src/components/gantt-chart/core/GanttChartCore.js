/**
 * GanttChartCore.js
 * 甘特图核心功能类，处理数据和渲染逻辑
 */

class GanttChartCore {
  constructor(options = {}) {
    this.tasks = options.tasks || [];
    this.startDate = options.startDate || new Date();
    this.endDate = options.endDate || this._calculateEndDate();
    this.element = null;
    this.onTaskClick = options.onTaskClick || (() => {});
    this.onTaskDrag = options.onTaskDrag || (() => {});
    this.viewMode = options.viewMode || 'day'; // day, week, month
    this.columnWidth = options.columnWidth || 40;
    this.rowHeight = options.rowHeight || 40;
    this.headerHeight = options.headerHeight || 50;
  }

  /**
   * 计算最后结束日期
   */
  _calculateEndDate() {
    if (!this.tasks.length) {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    }

    return this.tasks.reduce((max, task) => {
      const end = new Date(task.end);
      return end > max ? end : max;
    }, new Date(this.tasks[0].end));
  }

  /**
   * 渲染甘特图到指定DOM元素
   */
  render(element) {
    if (!element) return;
    this.element = element;
    
    // 清空容器
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }

    // 创建甘特图容器
    const ganttContainer = document.createElement('div');
    ganttContainer.className = 'gantt-container';
    
    // 添加表头
    const header = this._createHeader();
    ganttContainer.appendChild(header);
    
    // 添加任务区域
    const taskContainer = this._createTaskContainer();
    ganttContainer.appendChild(taskContainer);
    
    element.appendChild(ganttContainer);
    
    // 绑定事件
    this._bindEvents();
  }

  /**
   * 创建表头
   */
  _createHeader() {
    const header = document.createElement('div');
    header.className = 'gantt-header';
    
    // 时间轴标签
    const timeLine = document.createElement('div');
    timeLine.className = 'gantt-timeline';
    
    // 根据视图模式生成标签
    const days = this._getDaysBetween(this.startDate, this.endDate);
    
    for (let i = 0; i <= days; i++) {
      const date = new Date(this.startDate);
      date.setDate(date.getDate() + i);
      
      const dayLabel = document.createElement('div');
      dayLabel.className = 'gantt-day';
      dayLabel.style.width = `${this.columnWidth}px`;
      
      if (this.viewMode === 'day') {
        dayLabel.textContent = date.getDate();
      } else if (this.viewMode === 'week') {
        dayLabel.textContent = this._getWeek(date);
      } else if (this.viewMode === 'month') {
        dayLabel.textContent = date.toLocaleString('default', { month: 'short' });
      }
      
      timeLine.appendChild(dayLabel);
    }
    
    header.appendChild(timeLine);
    return header;
  }

  /**
   * 创建任务容器
   */
  _createTaskContainer() {
    const taskContainer = document.createElement('div');
    taskContainer.className = 'gantt-task-container';
    
    this.tasks.forEach(task => {
      const taskRow = document.createElement('div');
      taskRow.className = 'gantt-task-row';
      
      // 任务标签
      const taskLabel = document.createElement('div');
      taskLabel.className = 'gantt-task-label';
      taskLabel.textContent = task.name;
      
      // 任务条
      const taskBar = document.createElement('div');
      taskBar.className = 'gantt-task-bar';
      taskBar.style.left = `${this._getTaskOffset(task)}px`;
      taskBar.style.width = `${this._getTaskWidth(task)}px`;
      taskBar.style.backgroundColor = task.color || '#4e85c5';
      taskBar.setAttribute('data-task-id', task.id);
      
      taskRow.appendChild(taskLabel);
      taskRow.appendChild(taskBar);
      taskContainer.appendChild(taskRow);
    });
    
    return taskContainer;
  }

  /**
   * 计算任务开始偏移量
   */
  _getTaskOffset(task) {
    const daysDiff = this._getDaysBetween(this.startDate, new Date(task.start));
    return daysDiff * this.columnWidth;
  }

  /**
   * 计算任务宽度
   */
  _getTaskWidth(task) {
    const taskStart = new Date(task.start);
    const taskEnd = new Date(task.end);
    const daysDiff = this._getDaysBetween(taskStart, taskEnd);
    return (daysDiff + 1) * this.columnWidth;
  }

  /**
   * 获取两个日期之间的天数
   */
  _getDaysBetween(start, end) {
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);
    
    return Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
  }

  /**
   * 获取日期所在周数
   */
  _getWeek(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - firstDayOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((date.getDay() + 1 + days) / 7);
  }

  /**
   * 绑定事件
   */
  _bindEvents() {
    if (!this.element) return;
    
    // 任务点击事件
    const taskBars = this.element.querySelectorAll('.gantt-task-bar');
    taskBars.forEach(bar => {
      bar.addEventListener('click', (e) => {
        const taskId = e.target.getAttribute('data-task-id');
        const task = this.tasks.find(t => t.id.toString() === taskId);
        if (task) {
          this.onTaskClick(task, e);
        }
      });
    });
    
    // 这里可以添加拖拽事件等更复杂的交互
  }

  /**
   * 更新任务数据
   */
  updateTasks(tasks) {
    this.tasks = tasks;
    this.endDate = this._calculateEndDate();
    if (this.element) {
      this.render(this.element);
    }
  }

  /**
   * 更新配置
   */
  updateOptions(options) {
    Object.assign(this, options);
    if (this.element) {
      this.render(this.element);
    }
  }
}

export default GanttChartCore; 