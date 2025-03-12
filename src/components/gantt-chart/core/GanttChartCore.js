/**
 * GanttChartCore.js
 * 甘特图核心功能类，处理数据和渲染逻辑
 */

// 导入StateManager的工厂函数
import createStateManager from './StateManager';

class GanttChartCore {
  constructor(options = {}) {
    this.stateManager = createStateManager({
      tasks: options.tasks || [],
      dependencies: options.dependencies || [],
      viewSettings: {
        mode: options.viewMode || 'day',
        scrollPosition: 0
      }
    });
    this.tasks = options.tasks || [];
    this.dependencies = options.dependencies || [];
    this.startDate = options.startDate || new Date();
    this.endDate = options.endDate || this._calculateEndDate();
    this.element = null;
    this.svgElement = null;
    this.onTaskClick = options.onTaskClick || (() => {});
    this.onTaskDrag = options.onTaskDrag || (() => {});
    this.onTaskDoubleClick = options.onTaskDoubleClick || (() => {});
    this.onDateChange = options.onDateChange || (() => {});
    this.onProgressChange = options.onProgressChange || (() => {});
    this.onViewChange = options.onViewChange || (() => {});
    this.viewMode = options.viewMode || 'day';
    this.columnWidth = options.columnWidth || 40;
    this.rowHeight = options.rowHeight || 40;
    this.headerHeight = options.headerHeight || 50;
    this.theme = options.theme || 'default';
    this.responsive = options.responsive || true;
    this._initializeCache();
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

    // 创建SVG图层
    this.svgElement = this._createSvgLayer();
    ganttContainer.appendChild(this.svgElement);
    
    element.appendChild(ganttContainer);
    
    // 绑定事件
    this._bindEvents();

    // 渲染网格线
    this._renderGrid();

    // 渲染依赖关系
    if (this.dependencies) {
      this._renderDependencies();
    }
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
    
    // 创建虚拟滚动容器
    const virtualContainer = document.createElement('div');
    virtualContainer.className = 'gantt-virtual-container';
    virtualContainer.style.height = `${this.stateManager.state.virtualScroll.totalHeight}px`;
    
    // 只渲染可见区域的任务
    const visibleTasks = this.stateManager.getVisibleTasks();
    
    visibleTasks.forEach((task, index) => {
      const taskRow = document.createElement('div');
      taskRow.className = 'gantt-task-row';
      taskRow.style.position = 'absolute';
      taskRow.style.top = `${(task.index || index) * this.rowHeight}px`;
      taskRow.style.width = '100%';
      taskRow.style.height = `${this.rowHeight}px`;
      
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
      
      // 添加进度条
      if (typeof task.progress === 'number') {
        const progressBar = document.createElement('div');
        progressBar.className = 'gantt-task-progress';
        progressBar.style.width = `${task.progress}%`;
        taskBar.appendChild(progressBar);
      }
      
      // 添加任务信息提示
      taskBar.title = `${task.name}\n开始: ${task.start}\n结束: ${task.end}`;
      if (task.progress) {
        taskBar.title += `\n进度: ${task.progress}%`;
      }
      
      taskRow.appendChild(taskLabel);
      taskRow.appendChild(taskBar);
      taskContainer.appendChild(taskRow);
      
      // 缓存已渲染的任务
      this._cache.renderedTasks.add(task.id);
    });
    
    // 添加滚动事件监听
    taskContainer.addEventListener('scroll', this._handleScroll.bind(this));
    
    taskContainer.appendChild(virtualContainer);
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
  /**
   * 处理滚动事件
   */
  _handleScroll(event) {
    const scrollTop = event.target.scrollTop;
    if (Math.abs(scrollTop - this._cache.lastScrollPosition) < 10) return;

    this._cache.lastScrollPosition = scrollTop;
    this.stateManager.updateScrollPosition(scrollTop);
    this._updateVisibleTasks();
  }

  /**
   * 更新可见任务
   */
  _updateVisibleTasks() {
    const visibleTasks = this.stateManager.getVisibleTasks();
    const taskContainer = this.element.querySelector('.gantt-task-container');
    
    // 移除不可见的任务
    Array.from(taskContainer.children).forEach(child => {
      if (child.classList.contains('gantt-task-row')) {
        const taskId = child.querySelector('.gantt-task-bar').getAttribute('data-task-id');
        if (!visibleTasks.find(t => t.id.toString() === taskId)) {
          taskContainer.removeChild(child);
          this._cache.renderedTasks.delete(taskId);
        }
      }
    });

    // 添加新的可见任务
    visibleTasks.forEach((task, index) => {
      if (!this._cache.renderedTasks.has(task.id)) {
        const taskRow = this._createTaskRow(task, index);
        taskContainer.appendChild(taskRow);
        this._cache.renderedTasks.add(task.id);
      }
    });
  }

  /**
   * 创建任务行
   */
  _createTaskRow(task, index) {
    const taskRow = document.createElement('div');
    taskRow.className = 'gantt-task-row';
    taskRow.style.position = 'absolute';
    taskRow.style.top = `${(task.index || index) * this.rowHeight}px`;
    taskRow.style.width = '100%';
    taskRow.style.height = `${this.rowHeight}px`;

    const taskLabel = document.createElement('div');
    taskLabel.className = 'gantt-task-label';
    taskLabel.textContent = task.name;

    const taskBar = document.createElement('div');
    taskBar.className = 'gantt-task-bar';
    taskBar.style.left = `${this._getTaskOffset(task)}px`;
    taskBar.style.width = `${this._getTaskWidth(task)}px`;
    taskBar.style.backgroundColor = task.color || '#4e85c5';
    taskBar.setAttribute('data-task-id', task.id);

    if (typeof task.progress === 'number') {
      const progressBar = document.createElement('div');
      progressBar.className = 'gantt-task-progress';
      progressBar.style.width = `${task.progress}%`;
      taskBar.appendChild(progressBar);
    }

    taskBar.title = `${task.name}\n开始: ${task.start}\n结束: ${task.end}`;
    if (task.progress) {
      taskBar.title += `\n进度: ${task.progress}%`;
    }

    taskRow.appendChild(taskLabel);
    taskRow.appendChild(taskBar);

    return taskRow;
  }

  /**
   * 绑定事件
   */
  _bindEvents() {
    if (!this.element) return;

    const taskContainer = this.element.querySelector('.gantt-task-container');

    // 任务点击事件委托
    taskContainer.addEventListener('click', (e) => {
      const taskBar = e.target.closest('.gantt-task-bar');
      if (taskBar) {
        const taskId = taskBar.getAttribute('data-task-id');
        const task = this.tasks.find(t => t.id.toString() === taskId);
        if (task) {
          this.onTaskClick(task, e);
        }
      }
    });

    // 任务双击事件
    taskContainer.addEventListener('dblclick', (e) => {
      const taskBar = e.target.closest('.gantt-task-bar');
      if (taskBar) {
        const taskId = taskBar.getAttribute('data-task-id');
        const task = this.tasks.find(t => t.id.toString() === taskId);
        if (task) {
          this.onTaskDoubleClick(task, e);
        }
      }
    });

    // 任务拖拽事件
    taskContainer.addEventListener('mousedown', (e) => {
      const taskBar = e.target.closest('.gantt-task-bar');
      if (taskBar) {
        const taskId = taskBar.getAttribute('data-task-id');
        const task = this.tasks.find(t => t.id.toString() === taskId);
        if (task) {
          this._initTaskDrag(task, e, taskBar);
        }
      }
    });

    // 响应式处理
    if (this.responsive) {
      window.addEventListener('resize', this._handleResize.bind(this));
    }
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
   * 初始化缓存
   */
  _initializeCache() {
    this._cache = {
      taskPositions: new Map(),
      renderedTasks: new Set(),
      visibleRange: { start: 0, end: 0 },
      lastScrollPosition: 0,
      gridCache: null
    };
  }

  /**
   * 创建SVG图层
   */
  _createSvgLayer() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'gantt-svg-layer');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    return svg;
  }

  /**
   * 渲染网格线
   */
  _renderGrid() {
    if (!this.svgElement) return;
    
    // 使用缓存优化网格线渲染
    if (this._cache.gridCache) {
      this.svgElement.innerHTML = this._cache.gridCache;
      return;
    }

    const gridLines = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gridLines.setAttribute('class', 'grid-lines');

    // 添加垂直网格线
    const days = this._getDaysBetween(this.startDate, this.endDate);
    for (let i = 0; i <= days; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', `${i * this.columnWidth}`);
      line.setAttribute('y1', '0');
      line.setAttribute('x2', `${i * this.columnWidth}`);
      line.setAttribute('y2', '100%');
      line.setAttribute('stroke', '#e0e0e0');
      line.setAttribute('stroke-width', '1');
      gridLines.appendChild(line);
    }

    this.svgElement.appendChild(gridLines);
    this._cache.gridCache = this.svgElement.innerHTML;
  }

  /**
   * 渲染依赖关系
   */
  _renderDependencies() {
    if (!this.svgElement || !this.dependencies.length) return;

    const dependencyLines = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    dependencyLines.setAttribute('class', 'dependency-lines');

    this.dependencies.forEach(dep => {
      const fromTask = this.tasks.find(t => t.id === dep.fromId);
      const toTask = this.tasks.find(t => t.id === dep.toId);

      if (fromTask && toTask) {
        const fromPos = this._getTaskPosition(fromTask);
        const toPos = this._getTaskPosition(toTask);

        const path = this._createDependencyPath(fromPos, toPos);
        dependencyLines.appendChild(path);
      }
    });

    this.svgElement.appendChild(dependencyLines);
  }

  /**
   * 创建依赖关系路径
   */
  _createDependencyPath(fromPos, toPos) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const offset = 4;
    
    const startX = fromPos.right;
    const startY = fromPos.center;
    const endX = toPos.left;
    const endY = toPos.center;
    
    const controlPoint1X = startX + offset;
    const controlPoint2X = endX - offset;
    
    const d = `M ${startX} ${startY} 
              C ${controlPoint1X} ${startY} ${controlPoint2X} ${endY} ${endX} ${endY}`;
    
    path.setAttribute('d', d);
    path.setAttribute('stroke', '#999');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    
    return path;
  }

  /**
   * 获取任务位置信息
   */
  _getTaskPosition(task) {
    if (this._cache.taskPositions.has(task.id)) {
      return this._cache.taskPositions.get(task.id);
    }

    const left = this._getTaskOffset(task);
    const width = this._getTaskWidth(task);
    const top = this.tasks.indexOf(task) * this.rowHeight;
    
    const position = {
      left,
      right: left + width,
      top,
      bottom: top + this.rowHeight,
      center: top + this.rowHeight / 2
    };

    this._cache.taskPositions.set(task.id, position);
    return position;
  }

  /**
   * 更新配置
   */
  updateOptions(options) {
    Object.assign(this, options);
    this._initializeCache();
    if (this.element) {
      this.render(this.element);
    }
  }
}

export default GanttChartCore;