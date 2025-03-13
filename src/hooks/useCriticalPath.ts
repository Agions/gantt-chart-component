import { useState, useEffect, useMemo } from 'react';
import { Task, Dependency } from '../components/gantt-chart/core/types';
import { createCriticalPathAnalyzer } from '../components/gantt-chart/core/CriticalPathAnalyzer';

// 创建一个函数来检查任务数组是否有实质性变化
const hasTasksChanged = (prevTasks: Task[], nextTasks: Task[]): boolean => {
  if (prevTasks.length !== nextTasks.length) return true;
  
  for (let i = 0; i < prevTasks.length; i++) {
    const prevTask = prevTasks[i];
    const nextTask = nextTasks[i];
    
    if (prevTask.id !== nextTask.id || 
        prevTask.start !== nextTask.start || 
        prevTask.end !== nextTask.end) {
      return true;
    }
  }
  
  return false;
};

// 创建一个函数来检查依赖数组是否有实质性变化
const hasDependenciesChanged = (prevDeps: Dependency[], nextDeps: Dependency[]): boolean => {
  if (prevDeps.length !== nextDeps.length) return true;
  
  for (let i = 0; i < prevDeps.length; i++) {
    const prevDep = prevDeps[i];
    const nextDep = nextDeps[i];
    
    if (prevDep.fromId !== nextDep.fromId || 
        prevDep.toId !== nextDep.toId || 
        prevDep.type !== nextDep.type) {
      return true;
    }
  }
  
  return false;
};

export const useCriticalPath = (tasks: Task[], dependencies: Dependency[]) => {
  // 使用useState存储关键路径和缓存版本
  const [criticalTasks, setCriticalTasks] = useState<Set<string>>(new Set());
  const [prevTasks, setPrevTasks] = useState<Task[]>([]);
  const [prevDependencies, setPrevDependencies] = useState<Dependency[]>([]);

  useEffect(() => {
    // 检查任务和依赖是否有实质性变化，如果没有变化，就不重新计算
    if (!hasTasksChanged(prevTasks, tasks) && !hasDependenciesChanged(prevDependencies, dependencies)) {
      return;
    }
    
    // 如果有实质性变化，重新计算关键路径
    const analyzer = createCriticalPathAnalyzer(tasks, dependencies);
    const result = analyzer.analyze();
    
    // 获取关键路径上的任务ID列表
    const criticalTasksSet = new Set(result.criticalTasks.map(String));
    setCriticalTasks(criticalTasksSet);
    
    // 更新缓存的任务和依赖
    setPrevTasks([...tasks]);
    setPrevDependencies([...dependencies]);
  }, [tasks, dependencies, prevTasks, prevDependencies]);

  // 使用useMemo记忆化计算的关键路径，避免不必要的重新渲染
  const criticalTasksMap = useMemo(() => criticalTasks, [criticalTasks]);

  return { criticalTasks: criticalTasksMap };
}; 