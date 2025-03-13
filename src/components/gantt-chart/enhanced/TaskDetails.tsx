import React, { useMemo, memo } from 'react';
import { Task } from '../core/types';

interface TaskDetailsProps {
  task: Task;
  isCritical: boolean;
}

const formatDate = (date: string | Date): string => {
  if (typeof date === 'string') return date;
  return date.toLocaleDateString();
};

const getTaskTypeLabel = (type: string | undefined): string => {
  if (!type) return '普通任务';
  switch (type) {
    case 'milestone':
      return '里程碑';
    case 'project':
      return '项目';
    default:
      return '普通任务';
  }
};

const TaskDetailsComponent: React.FC<TaskDetailsProps> = ({ task, isCritical }) => {
  // 使用useMemo缓存容器样式
  const containerStyle = useMemo(() => ({
    padding: '15px', 
    backgroundColor: '#f9f9f9', 
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    marginBottom: '20px'
  }), []);

  // 使用useMemo缓存格式化的日期
  const formattedStartDate = useMemo(() => formatDate(task.start), [task.start]);
  const formattedEndDate = useMemo(() => formatDate(task.end), [task.end]);
  
  // 使用useMemo缓存任务类型标签
  const taskTypeLabel = useMemo(() => getTaskTypeLabel(task.type), [task.type]);

  return (
    <div style={containerStyle}>
      <h3>选中的任务</h3>
      <p><strong>名称:</strong> {task.name}</p>
      <p><strong>时间段:</strong> {formattedStartDate} 至 {formattedEndDate}</p>
      <p><strong>进度:</strong> {task.progress}%</p>
      <p><strong>类型:</strong> {taskTypeLabel}</p>
      <p><strong>是否为关键任务:</strong> {isCritical ? '是' : '否'}</p>
    </div>
  );
};

// 深度比较函数，避免不必要的重渲染
const arePropsEqual = (prevProps: TaskDetailsProps, nextProps: TaskDetailsProps) => {
  const { task: prevTask, isCritical: prevIsCritical } = prevProps;
  const { task: nextTask, isCritical: nextIsCritical } = nextProps;
  
  return (
    prevTask.id === nextTask.id &&
    prevTask.name === nextTask.name &&
    prevTask.start === nextTask.start &&
    prevTask.end === nextTask.end &&
    prevTask.progress === nextTask.progress &&
    prevTask.type === nextTask.type &&
    prevIsCritical === nextIsCritical
  );
};

// 使用memo包装组件，并提供自定义比较函数
export const TaskDetails = memo(TaskDetailsComponent, arePropsEqual); 