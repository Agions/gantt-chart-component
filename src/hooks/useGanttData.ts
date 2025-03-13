import { useState, useCallback, useReducer } from 'react';
import { Task, Dependency } from '../components/gantt-chart/core/types';

// 示例任务数据
const initialTasks: Task[] = [
  {
    id: '1',
    name: '需求分析',
    start: '2023-06-01',
    end: '2023-06-10',
    progress: 100,
    type: 'task'
  },
  {
    id: '2',
    name: '设计阶段',
    start: '2023-06-11',
    end: '2023-06-25',
    progress: 80,
    type: 'task'
  },
  {
    id: '3',
    name: '开发阶段',
    start: '2023-06-26',
    end: '2023-07-15',
    progress: 60,
    type: 'task'
  },
  {
    id: '4',
    name: '测试阶段',
    start: '2023-07-16',
    end: '2023-07-25',
    progress: 30,
    type: 'task'
  },
  {
    id: '5',
    name: '项目发布',
    start: '2023-07-26',
    end: '2023-07-26',
    progress: 0,
    type: 'milestone'
  }
];

// 示例依赖关系
const initialDependencies: Dependency[] = [
  { fromId: '1', toId: '2', type: 'finish_to_start' },
  { fromId: '2', toId: '3', type: 'finish_to_start' },
  { fromId: '3', toId: '4', type: 'finish_to_start' },
  { fromId: '4', toId: '5', type: 'finish_to_start' }
];

// 定义历史记录状态接口
interface HistoryState {
  past: Array<{tasks: Task[], dependencies: Dependency[]}>;
  present: {tasks: Task[], dependencies: Dependency[]};
  future: Array<{tasks: Task[], dependencies: Dependency[]}>;
}

// 定义可能的操作类型
type ActionType = 
  | { type: 'UPDATE_TASKS', tasks: Task[] }
  | { type: 'UPDATE_DEPENDENCIES', dependencies: Dependency[] }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET', tasks: Task[], dependencies: Dependency[] };

// 创建reducer函数
const historyReducer = (state: HistoryState, action: ActionType): HistoryState => {
  switch (action.type) {
    case 'UPDATE_TASKS':
      return {
        past: [...state.past, state.present],
        present: { ...state.present, tasks: action.tasks },
        future: []
      };
    case 'UPDATE_DEPENDENCIES':
      return {
        past: [...state.past, state.present],
        present: { ...state.present, dependencies: action.dependencies },
        future: []
      };
    case 'UNDO':
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, state.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future]
      };
    case 'REDO':
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture
      };
    case 'RESET':
      return {
        past: [],
        present: { tasks: action.tasks, dependencies: action.dependencies },
        future: []
      };
    default:
      return state;
  }
};

export const useGanttData = () => {
  // 使用useReducer代替useState来管理状态
  const [state, dispatch] = useReducer(historyReducer, {
    past: [],
    present: { tasks: initialTasks, dependencies: initialDependencies },
    future: []
  });

  const { tasks, dependencies } = state.present;

  // 处理任务变更
  const handleTasksChange = useCallback((updatedTasks: Task[]) => {
    dispatch({ type: 'UPDATE_TASKS', tasks: updatedTasks });
  }, []);

  // 处理依赖关系变更
  const handleDependenciesChange = useCallback((updatedDeps: Dependency[]) => {
    dispatch({ type: 'UPDATE_DEPENDENCIES', dependencies: updatedDeps });
  }, []);

  // 添加新任务
  const addTask = useCallback((task: Partial<Task>) => {
    const newTask: Task = {
      id: String(Date.now()), // 生成唯一ID
      name: task.name || '新任务',
      start: task.start || new Date().toISOString().split('T')[0],
      end: task.end || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: task.progress || 0,
      type: task.type || 'task'
    };
    
    handleTasksChange([...tasks, newTask]);
    return newTask;
  }, [tasks, handleTasksChange]);

  // 删除任务
  const deleteTask = useCallback((taskId: string) => {
    // 移除该任务相关的所有依赖
    const filteredDependencies = dependencies.filter(
      dep => dep.fromId !== taskId && dep.toId !== taskId
    );
    
    // 如果依赖关系发生变化，更新依赖
    if (filteredDependencies.length !== dependencies.length) {
      handleDependenciesChange(filteredDependencies);
    }
    
    // 移除任务
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    handleTasksChange(filteredTasks);
  }, [tasks, dependencies, handleTasksChange, handleDependenciesChange]);

  // 更新任务
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, ...updates };
      }
      return task;
    });
    
    handleTasksChange(updatedTasks);
  }, [tasks, handleTasksChange]);

  // 添加依赖关系
  const addDependency = useCallback((fromId: string, toId: string, type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish' = 'finish_to_start') => {
    // 检查是否已存在相同的依赖
    const exists = dependencies.some(
      dep => dep.fromId === fromId && dep.toId === toId
    );
    
    if (!exists) {
      handleDependenciesChange([...dependencies, { fromId, toId, type }]);
    }
  }, [dependencies, handleDependenciesChange]);

  // 撤销操作
  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  // 重做操作
  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  // 重置数据
  const resetData = useCallback(() => {
    dispatch({ 
      type: 'RESET', 
      tasks: initialTasks, 
      dependencies: initialDependencies 
    });
  }, []);

  // 是否可以撤销
  const canUndo = state.past.length > 0;
  
  // 是否可以重做
  const canRedo = state.future.length > 0;

  return {
    tasks,
    dependencies,
    handleTasksChange,
    handleDependenciesChange,
    initialTasks,
    initialDependencies,
    addTask,
    deleteTask,
    updateTask,
    addDependency,
    undo,
    redo,
    resetData,
    canUndo,
    canRedo
  };
}; 