/**
 * StateManager.js
 * 甘特图状态管理类，实现状态管理、缓存优化和历史记录功能
 * 
 * @author 甘特图团队
 * @version 1.0.0
 */

/**
 * 默认配置项
 */
const DEFAULT_CONFIG = {
  historyLimit: 10,       // 历史记录最大数量
  taskHeight: 40,         // 任务行高
  visibleCount: 50,       // 可见任务数量
  bufferSize: 20,         // 缓冲区大小
  defaultMode: 'day'      // 默认视图模式
};

/**
 * 创建默认状态
 * @param {Object} initialData - 初始数据
 * @returns {Object} - 默认状态
 */
function createDefaultState(initialData = {}) {
  return {
    tasks: initialData.tasks || [],
    dependencies: initialData.dependencies || [],
    viewSettings: {
      mode: initialData.viewSettings?.mode || DEFAULT_CONFIG.defaultMode,
      scrollPosition: initialData.viewSettings?.scrollPosition || 0,
      ...(initialData.viewSettings || {})
    },
    virtualScroll: {
      startIndex: 0,
      endIndex: 0,
      visibleCount: DEFAULT_CONFIG.visibleCount,
      bufferSize: DEFAULT_CONFIG.bufferSize,
      totalHeight: 0,
      ...(initialData.virtualScroll || {})
    }
  };
}

/**
 * 状态管理器类
 */
class StateManager {
  /**
   * 构造函数
   * @param {Object} initialState - 初始状态
   * @param {Object} options - 配置选项
   */
  constructor(initialState = {}, options = {}) {
    // 合并默认配置和用户配置
    this._config = {
      ...DEFAULT_CONFIG,
      ...options
    };

    // 初始化状态
    this.state = createDefaultState(initialState);

    // 初始化内部缓存和订阅者
    this._subscribers = new Set();
    this._taskCache = new Map();
    this._dependencyCache = new Map();
    this._layoutCache = new Map();
    
    // 初始化历史记录
    this._history = [];
    this._future = [];
    
    // 初始化缓存
    this._initializeCache();
  }

  //===========================
  // 缓存管理部分
  //===========================
  
  /**
   * 初始化所有缓存
   * @private
   */
  _initializeCache() {
    this._clearCache();
    this._updateTaskCache();
    this._updateDependencyCache();
    this._calculateVirtualScrollMetrics();
  }

  /**
   * 清除所有缓存
   * @private
   */
  _clearCache() {
    this._taskCache.clear();
    this._dependencyCache.clear();
    this._layoutCache.clear();
  }

  /**
   * 更新任务缓存
   * @private
   */
  _updateTaskCache() {
    try {
      // 初始化任务缓存
      this.state.tasks.forEach(task => {
        this._taskCache.set(task.id, {
          ...task,
          dependencies: [],
          dependents: [],
          level: 0,
          visible: true
        });
      });

      // 更新依赖关系信息
      this.state.dependencies.forEach(dep => {
        const fromTask = this._taskCache.get(dep.fromId);
        const toTask = this._taskCache.get(dep.toId);

        if (fromTask && toTask) {
          if (!fromTask.dependencies.includes(toTask.id)) {
            fromTask.dependencies.push(toTask.id);
          }
          
          if (!toTask.dependents.includes(fromTask.id)) {
            toTask.dependents.push(fromTask.id);
          }
        } else {
          console.warn(`依赖关系包含不存在的任务: ${dep.fromId} -> ${dep.toId}`);
        }
      });

      // 计算任务层级关系
      this._calculateTaskLevels();
    } catch (error) {
      console.error('更新任务缓存时出错:', error);
    }
  }

  /**
   * 更新依赖关系缓存
   * @private
   */
  _updateDependencyCache() {
    try {
      this.state.dependencies.forEach(dep => {
        const key = `${dep.fromId}-${dep.toId}`;
        this._dependencyCache.set(key, dep);
      });
    } catch (error) {
      console.error('更新依赖关系缓存时出错:', error);
    }
  }

  /**
   * 计算任务层级
   * @private
   */
  _calculateTaskLevels() {
    const visited = new Set();
    const visiting = new Set();

    const visit = (taskId, level = 0) => {
      // 检测循环依赖
      if (visiting.has(taskId)) {
        console.warn(`检测到循环依赖，涉及任务ID: ${taskId}`);
        return;
      }

      // 如果已访问过且层级不更深，则跳过
      if (visited.has(taskId)) {
        const task = this._taskCache.get(taskId);
        if (task && task.level >= level) {
          return;
        }
      }

      visiting.add(taskId);
      const task = this._taskCache.get(taskId);
      
      if (task) {
        task.level = Math.max(task.level || 0, level);

        // 递归处理依赖的任务
        if (Array.isArray(task.dependencies)) {
          task.dependencies.forEach(depId => {
            visit(depId, level + 1);
          });
        }
      }

      visiting.delete(taskId);
      visited.add(taskId);
    };

    // 从所有任务开始遍历
    this.state.tasks.forEach(task => {
      if (!visited.has(task.id)) {
        visit(task.id);
      }
    });
  }

  /**
   * 计算虚拟滚动相关指标
   * @private
   */
  _calculateVirtualScrollMetrics() {
    try {
      const { virtualScroll } = this.state;
      const totalTasks = this.state.tasks.length;
      const taskHeight = this._config.taskHeight;
      
      // 计算总高度
      virtualScroll.totalHeight = totalTasks * taskHeight;
      
      // 根据滚动位置计算可见范围
      const scrollTop = this.state.viewSettings.scrollPosition;
      const visibleStartIndex = Math.max(0, Math.floor(scrollTop / taskHeight) - virtualScroll.bufferSize);
      const visibleEndIndex = Math.min(
        totalTasks,
        visibleStartIndex + virtualScroll.visibleCount + 2 * virtualScroll.bufferSize
      );

      virtualScroll.startIndex = visibleStartIndex;
      virtualScroll.endIndex = visibleEndIndex;
    } catch (error) {
      console.error('计算虚拟滚动指标时出错:', error);
    }
  }

  //===========================
  // 历史记录管理部分
  //===========================

  /**
   * 保存当前状态到历史记录
   * @private
   */
  _saveToHistory() {
    try {
      // 克隆当前状态
      const currentState = JSON.parse(JSON.stringify(this.state));
      
      // 添加到历史记录
      this._history.push(currentState);
      
      // 超出最大历史记录数时，移除最旧的记录
      if (this._history.length > this._config.historyLimit) {
        this._history.shift();
      }
      
      // 清空未来记录
      this._future = [];
    } catch (error) {
      console.error('保存历史记录时出错:', error);
    }
  }

  /**
   * 撤销操作
   * @returns {boolean} 是否成功撤销
   */
  undo() {
    if (this._history.length === 0) {
      return false;
    }
    
    try {
      // 保存当前状态用于重做
      const currentState = JSON.parse(JSON.stringify(this.state));
      this._future.push(currentState);
      
      // 恢复上一个状态
      const previousState = this._history.pop();
      this.state = previousState;
      
      // 更新缓存
      this._initializeCache();
      
      // 通知订阅者
      this._notifySubscribers();
      
      return true;
    } catch (error) {
      console.error('撤销操作时出错:', error);
      return false;
    }
  }

  /**
   * 重做操作
   * @returns {boolean} 是否成功重做
   */
  redo() {
    if (this._future.length === 0) {
      return false;
    }
    
    try {
      // 保存当前状态用于撤销
      const currentState = JSON.parse(JSON.stringify(this.state));
      this._history.push(currentState);
      
      // 恢复下一个状态
      const nextState = this._future.pop();
      this.state = nextState;
      
      // 更新缓存
      this._initializeCache();
      
      // 通知订阅者
      this._notifySubscribers();
      
      return true;
    } catch (error) {
      console.error('重做操作时出错:', error);
      return false;
    }
  }

  /**
   * 获取撤销栈大小
   * @returns {number} 撤销栈大小
   */
  get undoStackSize() {
    return this._history.length;
  }

  /**
   * 获取重做栈大小
   * @returns {number} 重做栈大小
   */
  get redoStackSize() {
    return this._future.length;
  }

  //===========================
  // 状态查询部分
  //===========================

  /**
   * 获取可见任务
   * @returns {Array} 可见任务数组
   */
  getVisibleTasks() {
    try {
      const { startIndex, endIndex } = this.state.virtualScroll;
      return this.state.tasks.slice(startIndex, endIndex).map(task => {
        const cachedTask = this._taskCache.get(task.id);
        return {
          ...task,
          ...(cachedTask || {})
        };
      });
    } catch (error) {
      console.error('获取可见任务时出错:', error);
      return [];
    }
  }

  /**
   * 获取任务缓存
   * @param {string|number} taskId - 任务ID
   * @returns {Object|undefined} 任务缓存数据
   */
  getTaskCache(taskId) {
    return this._taskCache.get(taskId);
  }

  /**
   * 获取依赖关系缓存
   * @param {string|number} fromId - 源任务ID
   * @param {string|number} toId - 目标任务ID
   * @returns {Object|undefined} 依赖关系缓存数据
   */
  getDependencyCache(fromId, toId) {
    return this._dependencyCache.get(`${fromId}-${toId}`);
  }

  //===========================
  // 状态更新部分
  //===========================

  /**
   * 更新滚动位置
   * @param {number} scrollTop - 新的滚动位置
   */
  updateScrollPosition(scrollTop) {
    if (typeof scrollTop !== 'number' || isNaN(scrollTop)) {
      console.warn('更新滚动位置参数无效:', scrollTop);
      return;
    }

    try {
      // 滚动位置更新不需要记录到历史记录中
      this.state.viewSettings.scrollPosition = scrollTop;
      this._calculateVirtualScrollMetrics();
      this._notifySubscribers();
    } catch (error) {
      console.error('更新滚动位置时出错:', error);
    }
  }

  /**
   * 更新任务列表
   * @param {Array} tasks - 新的任务列表
   */
  updateTasks(tasks) {
    if (!Array.isArray(tasks)) {
      console.warn('更新任务参数必须是数组');
      return;
    }

    try {
      this._saveToHistory();
      this.state.tasks = [...tasks];
      this._initializeCache();
      this._notifySubscribers();
    } catch (error) {
      console.error('更新任务时出错:', error);
    }
  }

  /**
   * 更新依赖关系列表
   * @param {Array} dependencies - 新的依赖关系列表
   */
  updateDependencies(dependencies) {
    if (!Array.isArray(dependencies)) {
      console.warn('更新依赖关系参数必须是数组');
      return;
    }

    try {
      this._saveToHistory();
      this.state.dependencies = [...dependencies];
      this._initializeCache();
      this._notifySubscribers();
    } catch (error) {
      console.error('更新依赖关系时出错:', error);
    }
  }

  /**
   * 更新视图设置
   * @param {Object} settings - 视图设置更新
   */
  updateViewSettings(settings) {
    if (!settings || typeof settings !== 'object') {
      console.warn('更新视图设置参数必须是对象');
      return;
    }

    try {
      this._saveToHistory();
      this.state.viewSettings = {
        ...this.state.viewSettings,
        ...settings
      };
      this._calculateVirtualScrollMetrics();
      this._notifySubscribers();
    } catch (error) {
      console.error('更新视图设置时出错:', error);
    }
  }

  /**
   * 批量更新状态
   * @param {Object} updates - 包含要更新的状态字段
   */
  batchUpdate(updates) {
    if (!updates || typeof updates !== 'object') {
      console.warn('批量更新参数必须是对象');
      return;
    }

    try {
      this._saveToHistory();
      
      const { tasks, dependencies, viewSettings } = updates;
      
      if (Array.isArray(tasks)) {
        this.state.tasks = [...tasks];
      }
      
      if (Array.isArray(dependencies)) {
        this.state.dependencies = [...dependencies];
      }
      
      if (viewSettings && typeof viewSettings === 'object') {
        this.state.viewSettings = {
          ...this.state.viewSettings,
          ...viewSettings
        };
      }
      
      this._initializeCache();
      this._notifySubscribers();
    } catch (error) {
      console.error('批量更新状态时出错:', error);
    }
  }

  //===========================
  // 订阅管理部分
  //===========================

  /**
   * 订阅状态变化
   * @param {Function} callback - 状态变化时的回调函数
   * @returns {Function} 取消订阅的函数
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      console.warn('订阅回调必须是函数');
      return () => {};
    }

    try {
      this._subscribers.add(callback);
      
      // 返回取消订阅的函数
      return () => {
        this._subscribers.delete(callback);
      };
    } catch (error) {
      console.error('添加订阅时出错:', error);
      return () => {};
    }
  }

  /**
   * 取消所有订阅
   */
  unsubscribeAll() {
    this._subscribers.clear();
  }

  /**
   * 通知所有订阅者
   * @private
   */
  _notifySubscribers() {
    try {
      const stateSnapshot = this.state; // 不克隆，提高性能
      this._subscribers.forEach(callback => {
        try {
          callback(stateSnapshot);
        } catch (callbackError) {
          console.error('执行订阅回调时出错:', callbackError);
        }
      });
    } catch (error) {
      console.error('通知订阅者时出错:', error);
    }
  }

  //===========================
  // 资源释放部分
  //===========================

  /**
   * 销毁实例，释放资源
   */
  destroy() {
    this.unsubscribeAll();
    this._clearCache();
    this._history = [];
    this._future = [];
  }
}

/**
 * 创建状态管理器实例的工厂函数
 * @param {Object} initialState - 初始状态
 * @param {Object} options - 配置选项
 * @returns {StateManager} - 状态管理器实例
 */
function createStateManager(initialState = {}, options = {}) {
  return new StateManager(initialState, options);
}

// 导出工厂函数作为默认导出
export default createStateManager;

// 导出类定义、工具函数和常量供需要的地方使用
export { 
  StateManager,
  createDefaultState,
  DEFAULT_CONFIG
};