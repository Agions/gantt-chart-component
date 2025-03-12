/**
 * StateManager.ts
 * 甘特图状态管理类，用于优化性能和数据处理
 */

import { Task, Dependency } from './types';

// 视图设置类型
export interface ViewSettings {
  mode: 'day' | 'week' | 'month' | 'quarter' | 'year';
  scrollPosition: number;
}

// 虚拟滚动配置类型
export interface VirtualScrollConfig {
  startIndex: number;
  endIndex: number;
  visibleCount: number;
  bufferSize: number;
  totalHeight: number;
}

// 状态类型
export interface GanttState {
  tasks: Task[];
  dependencies: Dependency[];
  viewSettings: ViewSettings;
  virtualScroll: VirtualScrollConfig;
}

// 缓存的任务类型
export interface CachedTask extends Task {
  dependencies: (string | number)[];
  dependents: (string | number)[];
  level: number;
  visible: boolean;
}

// 状态订阅回调类型
export type StateSubscriber = (state: GanttState) => void;

class StateManager {
  state: GanttState;
  private _subscribers: Set<StateSubscriber>;
  private _taskCache: Map<string | number, CachedTask>;
  private _dependencyCache: Map<string, Dependency>;
  private _layoutCache: Map<string | number, any>; // 可根据实际布局信息类型进一步完善

  constructor(initialState: Partial<GanttState> = {}) {
    this.state = {
      tasks: initialState.tasks || [],
      dependencies: initialState.dependencies || [],
      viewSettings: initialState.viewSettings || {
        mode: 'day',
        scrollPosition: 0
      },
      virtualScroll: initialState.virtualScroll || {
        startIndex: 0,
        endIndex: 0,
        visibleCount: 50,
        bufferSize: 20,
        totalHeight: 0
      }
    };

    this._subscribers = new Set();
    this._taskCache = new Map();
    this._dependencyCache = new Map();
    this._layoutCache = new Map();
    
    this._initializeCache();
  }

  /**
   * 初始化缓存
   */
  private _initializeCache(): void {
    this._updateTaskCache();
    this._updateDependencyCache();
    this._calculateVirtualScrollMetrics();
  }

  /**
   * 更新任务缓存
   */
  private _updateTaskCache(): void {
    this.state.tasks.forEach(task => {
      this._taskCache.set(task.id, {
        ...task,
        dependencies: [],
        dependents: [],
        level: 0,
        visible: true
      });
    });

    // 更新依赖关系
    this.state.dependencies.forEach(dep => {
      const fromTask = this._taskCache.get(dep.fromId);
      const toTask = this._taskCache.get(dep.toId);

      if (fromTask && toTask) {
        fromTask.dependencies.push(toTask.id);
        toTask.dependents.push(fromTask.id);
      }
    });

    // 计算任务层级
    this._calculateTaskLevels();
  }

  /**
   * 更新依赖关系缓存
   */
  private _updateDependencyCache(): void {
    this.state.dependencies.forEach(dep => {
      this._dependencyCache.set(`${dep.fromId}-${dep.toId}`, dep);
    });
  }

  /**
   * 计算任务层级
   */
  private _calculateTaskLevels(): void {
    const visited = new Set<string | number>();
    const visiting = new Set<string | number>();

    const visit = (taskId: string | number, level: number = 0): void => {
      if (visiting.has(taskId)) {
        throw new Error('检测到循环依赖');
      }

      if (visited.has(taskId)) {
        return;
      }

      visiting.add(taskId);
      const task = this._taskCache.get(taskId);
      if (task) {
        task.level = Math.max(task.level, level);

        task.dependencies.forEach(depId => {
          visit(depId, level + 1);
        });
      }

      visiting.delete(taskId);
      visited.add(taskId);
    };

    this.state.tasks.forEach(task => {
      if (!visited.has(task.id)) {
        visit(task.id);
      }
    });
  }

  /**
   * 计算虚拟滚动指标
   */
  private _calculateVirtualScrollMetrics(): void {
    const { virtualScroll } = this.state;
    const totalTasks = this.state.tasks.length;
    
    virtualScroll.totalHeight = totalTasks * 40; // 假设每个任务高度为40px
    
    // 更新可见范围
    const scrollTop = this.state.viewSettings.scrollPosition;
    const visibleStartIndex = Math.max(0, Math.floor(scrollTop / 40) - virtualScroll.bufferSize);
    const visibleEndIndex = Math.min(
      totalTasks,
      visibleStartIndex + virtualScroll.visibleCount + 2 * virtualScroll.bufferSize
    );

    virtualScroll.startIndex = visibleStartIndex;
    virtualScroll.endIndex = visibleEndIndex;
  }

  /**
   * 获取可见任务
   */
  getVisibleTasks(): (Task & Partial<CachedTask>)[] {
    const { startIndex, endIndex } = this.state.virtualScroll;
    return this.state.tasks.slice(startIndex, endIndex).map(task => ({
      ...task,
      ...(this._taskCache.get(task.id) || {})
    }));
  }

  /**
   * 更新滚动位置
   */
  updateScrollPosition(scrollTop: number): void {
    this.state.viewSettings.scrollPosition = scrollTop;
    this._calculateVirtualScrollMetrics();
    this._notifySubscribers();
  }

  /**
   * 更新任务
   */
  updateTasks(tasks: Task[]): void {
    this.state.tasks = tasks;
    this._initializeCache();
    this._notifySubscribers();
  }

  /**
   * 更新依赖关系
   */
  updateDependencies(dependencies: Dependency[]): void {
    this.state.dependencies = dependencies;
    this._initializeCache();
    this._notifySubscribers();
  }

  /**
   * 订阅状态变化
   */
  subscribe(callback: StateSubscriber): () => void {
    this._subscribers.add(callback);
    return () => this._subscribers.delete(callback);
  }

  /**
   * 通知订阅者
   */
  private _notifySubscribers(): void {
    this._subscribers.forEach(callback => callback(this.state));
  }
}

export default StateManager; 