// DependencyWorker.ts
import { Task } from '../types';

interface DependencyMessage {
  type: 'calculate';
  tasks: Task[];
}

interface DependencyResult {
  criticalPath: string[];
  taskDurations: { [key: string]: number };
  earliestStarts: { [key: string]: string };
  latestStarts: { [key: string]: string };
}

// 计算两个日期之间的工作日数
function calculateWorkingDays(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  let days = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 排除周末
      days++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

// 计算关键路径
function calculateCriticalPath(tasks: Task[]): DependencyResult {
  const taskDurations: { [key: string]: number } = {};
  const earliestStarts: { [key: string]: string } = {};
  const latestStarts: { [key: string]: string } = {};
  const criticalPath: string[] = [];
  
  // 计算每个任务的持续时间
  tasks.forEach(task => {
    taskDurations[task.id] = calculateWorkingDays(task.start, task.end);
    earliestStarts[task.id] = task.start;
  });
  
  // 前向遍历：计算最早开始时间
  tasks.forEach(task => {
    if (task.dependencies) {
      task.dependencies.forEach(depId => {
        const depTask = tasks.find(t => t.id === depId);
        if (depTask) {
          const depEndDate = new Date(depTask.end);
          const currentStartDate = new Date(earliestStarts[task.id]);
          if (depEndDate > currentStartDate) {
            earliestStarts[task.id] = depEndDate.toISOString().split('T')[0];
          }
        }
      });
    }
  });
  
  // 后向遍历：计算最晚开始时间和关键路径
  const reversedTasks = [...tasks].reverse();
  reversedTasks.forEach(task => {
    const taskEndDate = new Date(task.end);
    latestStarts[task.id] = task.start;
    
    const dependentTasks = tasks.filter(t => 
      t.dependencies?.includes(task.id)
    );
    
    dependentTasks.forEach(depTask => {
      const depStartDate = new Date(depTask.start);
      const currentEndDate = new Date(task.end);
      if (depStartDate < currentEndDate) {
        latestStarts[task.id] = new Date(
          depStartDate.getTime() - taskDurations[task.id] * 24 * 60 * 60 * 1000
        ).toISOString().split('T')[0];
      }
    });
    
    // 如果最早开始时间等于最晚开始时间，则该任务在关键路径上
    if (earliestStarts[task.id] === latestStarts[task.id]) {
      criticalPath.push(task.id);
    }
  });
  
  return {
    criticalPath,
    taskDurations,
    earliestStarts,
    latestStarts
  };
}

// 监听主线程消息
self.addEventListener('message', (e: MessageEvent<DependencyMessage>) => {
  if (e.data.type === 'calculate') {
    const result = calculateCriticalPath(e.data.tasks);
    self.postMessage(result);
  }
});

export {}; 