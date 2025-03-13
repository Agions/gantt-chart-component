import { useState, useCallback, useReducer } from 'react';
import { Task, Dependency } from '../components/gantt-chart/core/types';

// 示例任务数据 - 产品研发流程项目示例
const initialTasks: Task[] = [
  // 项目整体
  {
    id: 'project_1',
    name: '产品研发与上线',
    start: '2023-06-01',
    end: '2023-08-15',
    progress: 65,
    type: 'project',
    color: '#4a6bdf'
  },
  
  // 需求分析阶段
  {
    id: 'phase_1',
    name: '需求分析',
    start: '2023-06-01',
    end: '2023-06-15',
    progress: 100,
    type: 'project',
    color: '#3366cc'
  },
  {
    id: 'task_1_1',
    name: '市场调研',
    start: '2023-06-01',
    end: '2023-06-05',
    progress: 100,
    type: 'task',
    parentId: 'phase_1'
  },
  {
    id: 'task_1_2',
    name: '用户访谈',
    start: '2023-06-03',
    end: '2023-06-07',
    progress: 100,
    type: 'task',
    parentId: 'phase_1'
  },
  {
    id: 'task_1_3',
    name: '竞品分析',
    start: '2023-06-05',
    end: '2023-06-10',
    progress: 100,
    type: 'task',
    parentId: 'phase_1'
  },
  {
    id: 'task_1_4',
    name: '需求文档编写',
    start: '2023-06-10',
    end: '2023-06-15',
    progress: 100,
    type: 'task',
    parentId: 'phase_1',
    critical: true
  },
  {
    id: 'milestone_1',
    name: '需求分析完成',
    start: '2023-06-15',
    end: '2023-06-15',
    progress: 100,
    type: 'milestone',
    color: '#9c27b0'
  },
  
  // 产品设计阶段
  {
    id: 'phase_2',
    name: '产品设计',
    start: '2023-06-16',
    end: '2023-07-05',
    progress: 100,
    type: 'project',
    color: '#3366cc'
  },
  {
    id: 'task_2_1',
    name: '信息架构设计',
    start: '2023-06-16',
    end: '2023-06-20',
    progress: 100,
    type: 'task',
    parentId: 'phase_2'
  },
  {
    id: 'task_2_2',
    name: '交互原型设计',
    start: '2023-06-20',
    end: '2023-06-30',
    progress: 100,
    type: 'task',
    parentId: 'phase_2',
    critical: true
  },
  {
    id: 'task_2_3',
    name: 'UI设计',
    start: '2023-06-25',
    end: '2023-07-05',
    progress: 100,
    type: 'task',
    parentId: 'phase_2'
  },
  {
    id: 'milestone_2',
    name: '设计评审完成',
    start: '2023-07-05',
    end: '2023-07-05',
    progress: 100,
    type: 'milestone',
    color: '#9c27b0'
  },
  
  // 开发阶段
  {
    id: 'phase_3',
    name: '开发阶段',
    start: '2023-07-06',
    end: '2023-07-31',
    progress: 70,
    type: 'project',
    color: '#3366cc'
  },
  {
    id: 'task_3_1',
    name: '前端开发',
    start: '2023-07-06',
    end: '2023-07-25',
    progress: 90,
    type: 'task',
    parentId: 'phase_3',
    critical: true
  },
  {
    id: 'task_3_2',
    name: '后端开发',
    start: '2023-07-06',
    end: '2023-07-25',
    progress: 85,
    type: 'task',
    parentId: 'phase_3',
    critical: true
  },
  {
    id: 'task_3_3',
    name: 'API集成',
    start: '2023-07-15',
    end: '2023-07-22',
    progress: 100,
    type: 'task',
    parentId: 'phase_3'
  },
  {
    id: 'task_3_4',
    name: '数据库优化',
    start: '2023-07-20',
    end: '2023-07-31',
    progress: 60,
    type: 'task',
    parentId: 'phase_3'
  },
  {
    id: 'task_3_5',
    name: '单元测试编写',
    start: '2023-07-18',
    end: '2023-07-28',
    progress: 40,
    type: 'task',
    parentId: 'phase_3'
  },
  
  // 测试阶段
  {
    id: 'phase_4',
    name: '测试阶段',
    start: '2023-07-25',
    end: '2023-08-10',
    progress: 30,
    type: 'project',
    color: '#3366cc'
  },
  {
    id: 'task_4_1',
    name: '集成测试',
    start: '2023-07-25',
    end: '2023-08-01',
    progress: 70,
    type: 'task',
    parentId: 'phase_4'
  },
  {
    id: 'task_4_2',
    name: '性能测试',
    start: '2023-07-29',
    end: '2023-08-05',
    progress: 40,
    type: 'task',
    parentId: 'phase_4'
  },
  {
    id: 'task_4_3',
    name: '用户验收测试',
    start: '2023-08-01',
    end: '2023-08-10',
    progress: 20,
    type: 'task',
    parentId: 'phase_4',
    critical: true
  },
  {
    id: 'milestone_3',
    name: '测试验收完成',
    start: '2023-08-10',
    end: '2023-08-10',
    progress: 0,
    type: 'milestone',
    color: '#9c27b0'
  },
  
  // 部署上线
  {
    id: 'phase_5',
    name: '部署上线',
    start: '2023-08-10',
    end: '2023-08-15',
    progress: 0,
    type: 'project',
    color: '#3366cc'
  },
  {
    id: 'task_5_1',
    name: '生产环境配置',
    start: '2023-08-10',
    end: '2023-08-11',
    progress: 0,
    type: 'task',
    parentId: 'phase_5'
  },
  {
    id: 'task_5_2',
    name: '数据迁移',
    start: '2023-08-12',
    end: '2023-08-13',
    progress: 0,
    type: 'task',
    parentId: 'phase_5'
  },
  {
    id: 'task_5_3',
    name: '应用部署',
    start: '2023-08-14',
    end: '2023-08-15',
    progress: 0,
    type: 'task',
    parentId: 'phase_5',
    critical: true
  },
  {
    id: 'milestone_4',
    name: '产品正式发布',
    start: '2023-08-15',
    end: '2023-08-15',
    progress: 0,
    type: 'milestone',
    color: '#ff5722'
  },
];

// 示例依赖关系 - 更丰富的项目依赖示例
const initialDependencies: Dependency[] = [
  // 阶段间依赖
  { fromId: 'milestone_1', toId: 'phase_2', type: 'finish_to_start' },
  { fromId: 'milestone_2', toId: 'phase_3', type: 'finish_to_start' },
  { fromId: 'phase_3', toId: 'phase_4', type: 'start_to_start', lag: 19 }, // 测试在开发开始19天后开始
  { fromId: 'milestone_3', toId: 'phase_5', type: 'finish_to_start' },
  
  // 需求分析阶段内部依赖
  { fromId: 'task_1_1', toId: 'task_1_3', type: 'finish_to_start' },
  { fromId: 'task_1_2', toId: 'task_1_3', type: 'finish_to_start' },
  { fromId: 'task_1_3', toId: 'task_1_4', type: 'finish_to_start' },
  { fromId: 'task_1_4', toId: 'milestone_1', type: 'finish_to_start' },
  
  // 设计阶段内部依赖
  { fromId: 'task_2_1', toId: 'task_2_2', type: 'finish_to_start' },
  { fromId: 'task_2_2', toId: 'task_2_3', type: 'start_to_start', lag: 5 }, // UI设计在交互设计开始5天后启动
  { fromId: 'task_2_3', toId: 'milestone_2', type: 'finish_to_start' },
  
  // 开发阶段内部依赖
  { fromId: 'task_3_1', toId: 'task_3_3', type: 'start_to_start', lag: 9 }, // API集成在前端开发开始9天后开始
  { fromId: 'task_3_2', toId: 'task_3_3', type: 'start_to_start', lag: 9 }, // API集成在后端开发开始9天后开始
  { fromId: 'task_3_2', toId: 'task_3_4', type: 'start_to_start', lag: 14 }, // 数据库优化在后端开发开始14天后开始
  { fromId: 'task_3_1', toId: 'task_3_5', type: 'start_to_start', lag: 12 }, // 单元测试在前端开发开始12天后开始
  { fromId: 'task_3_2', toId: 'task_3_5', type: 'start_to_start', lag: 12 }, // 单元测试在后端开发开始12天后开始
  
  // 测试阶段内部依赖
  { fromId: 'task_4_1', toId: 'task_4_2', type: 'start_to_start', lag: 4 }, // 性能测试在集成测试开始4天后开始
  { fromId: 'task_4_1', toId: 'task_4_3', type: 'start_to_start', lag: 7 }, // 用户验收测试在集成测试开始7天后开始
  { fromId: 'task_4_3', toId: 'milestone_3', type: 'finish_to_start' },
  
  // 部署阶段内部依赖
  { fromId: 'task_5_1', toId: 'task_5_2', type: 'finish_to_start' },
  { fromId: 'task_5_2', toId: 'task_5_3', type: 'finish_to_start' },
  { fromId: 'task_5_3', toId: 'milestone_4', type: 'finish_to_start' },
  
  // 关键路径依赖
  { fromId: 'task_1_4', toId: 'task_2_2', type: 'finish_to_start' },
  { fromId: 'task_2_2', toId: 'task_3_1', type: 'finish_to_start' },
  { fromId: 'task_2_2', toId: 'task_3_2', type: 'finish_to_start' },
  { fromId: 'task_3_1', toId: 'task_4_1', type: 'finish_to_start' },
  { fromId: 'task_3_2', toId: 'task_4_1', type: 'finish_to_start' },
  { fromId: 'task_4_3', toId: 'task_5_1', type: 'finish_to_start' },
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