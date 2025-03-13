import React, { useState, useCallback, memo, useMemo } from 'react';
import { Task } from '../core/types';
import { VirtualizedList } from './VirtualizedList';
import '../styles/TaskList.css';

interface TaskListProps {
  tasks: Task[];
  criticalTasks: Set<string>;
  onTaskSelect: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

const ITEM_HEIGHT = 180; // 调整后的任务项高度
const LIST_HEIGHT = 480; // 调整后的列表容器高度

const TaskListComponent: React.FC<TaskListProps> = ({
  tasks,
  criticalTasks,
  onTaskSelect,
  onTaskDelete,
  onTaskUpdate
}) => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const handleEditStart = useCallback((task: Task) => {
    setEditingTaskId(String(task.id));
    setEditValue(task.name);
  }, []);
  
  const handleEditComplete = useCallback((taskId: string) => {
    if (onTaskUpdate && editValue.trim()) {
      onTaskUpdate(taskId, { name: editValue.trim() });
    }
    setEditingTaskId(null);
  }, [editValue, onTaskUpdate]);
  
  const handleDelete = useCallback((e: React.MouseEvent, taskId: string) => {
    e.stopPropagation(); // 阻止事件冒泡，不会触发任务选择
    if (onTaskDelete) {
      if (window.confirm('确定要删除此任务吗？')) {
        onTaskDelete(taskId);
      }
    }
  }, [onTaskDelete]);

  // 格式化日期函数
  const formatDate = (dateValue: string | Date) => {
    if (!dateValue) return '';
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // 渲染单个任务项
  const renderTaskItem = useCallback((task: Task, index: number) => {
    const isCritical = criticalTasks.has(String(task.id));
    const isComplete = task.progress === 100;
    
    return (
      <div 
        key={task.id}
        className={`task-item ${isCritical ? 'task-item-critical' : isComplete ? 'task-item-completed' : 'task-item-normal'}`}
        onClick={() => editingTaskId !== String(task.id) && onTaskSelect(task)}
      >
        {editingTaskId === String(task.id) ? (
          <div className="task-edit-form" onClick={(e) => e.stopPropagation()}>
            <input 
              type="text" 
              value={editValue} 
              onChange={(e) => setEditValue(e.target.value)}
              className="task-edit-input"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditComplete(String(task.id));
                if (e.key === 'Escape') setEditingTaskId(null);
              }}
            />
            <div className="task-edit-actions">
              <button 
                className="task-edit-btn cancel"
                onClick={() => setEditingTaskId(null)}
              >
                取消
              </button>
              <button 
                className="task-edit-btn save"
                onClick={() => handleEditComplete(String(task.id))}
              >
                保存
              </button>
            </div>
          </div>
        ) : (
          <div className="task-item-content">
            <div className="task-item-header">
              <h4 className="task-item-name">{task.name}</h4>
              <span className={`task-item-badge ${isCritical ? 'critical' : isComplete ? 'completed' : 'normal'}`}>
                {isCritical ? '关键任务' : isComplete ? '已完成' : '普通任务'}
              </span>
            </div>
            
            <div className="task-item-dates">
              <div className="task-item-date">
                <span className="icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span>开始: {formatDate(task.start)}</span>
              </div>
              <div className="task-item-date">
                <span className="icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span>结束: {formatDate(task.end)}</span>
              </div>
            </div>
            
            <div className="task-item-progress-container">
              <div 
                className={`task-item-progress-bar ${isCritical ? 'critical' : isComplete ? 'completed' : 'normal'}`} 
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
            
            <div className="task-item-footer">
              <span className={`task-item-progress-text ${isCritical ? 'critical' : isComplete ? 'completed' : 'normal'}`}>
                进度: {task.progress}%
              </span>
              
              <div className="task-item-actions">
                {onTaskUpdate && (
                  <button 
                    className="task-item-btn edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStart(task);
                    }}
                    title="编辑任务"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C2.89543 4 2 4.89543 2 6V20C2 21.1046 2.89543 22 4 22H18C19.1046 22 20 21.1046 20 20V13M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
                
                {onTaskDelete && (
                  <button 
                    className="task-item-btn delete"
                    onClick={(e) => handleDelete(e, String(task.id))}
                    title="删除任务"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, [criticalTasks, editingTaskId, editValue, handleDelete, handleEditComplete, handleEditStart, onTaskDelete, onTaskSelect, onTaskUpdate]);
  
  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h3>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path d="M9 6H20M9 12H20M9 18H20M5 6V6.01M5 12V12.01M5 18V18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          项目任务列表
        </h3>
        <span className="badge">{tasks.length}</span>
      </div>
      
      <div className="task-list-body">
        {tasks.length === 0 ? (
          <div className="task-list-empty">
            <span className="icon">📋</span>
            <p>暂无任务</p>
            <p>添加新任务开始您的项目规划</p>
          </div>
        ) : (
          <VirtualizedList
            items={tasks}
            renderItem={renderTaskItem}
            itemHeight={ITEM_HEIGHT}
            containerHeight={LIST_HEIGHT}
            overscan={2}
          />
        )}
      </div>
    </div>
  );
};

const areTaskListPropsEqual = (prevProps: TaskListProps, nextProps: TaskListProps) => {
  // 任务数组长度不同，肯定需要重新渲染
  if (prevProps.tasks.length !== nextProps.tasks.length) {
    return false;
  }
  
  // 检查任务数组内容是否相同
  const prevTaskIds = prevProps.tasks.map(task => task.id).join(',');
  const nextTaskIds = nextProps.tasks.map(task => task.id).join(',');
  if (prevTaskIds !== nextTaskIds) {
    return false;
  }
  
  // 检查任务的属性是否有变化
  for (let i = 0; i < prevProps.tasks.length; i++) {
    const prevTask = prevProps.tasks[i];
    const nextTask = nextProps.tasks[i];
    
    if (
      prevTask.name !== nextTask.name ||
      prevTask.start !== nextTask.start ||
      prevTask.end !== nextTask.end ||
      prevTask.progress !== nextTask.progress
    ) {
      return false;
    }
  }
  
  // 检查关键路径任务是否有变化
  const prevCriticalSize = prevProps.criticalTasks.size;
  const nextCriticalSize = nextProps.criticalTasks.size;
  
  if (prevCriticalSize !== nextCriticalSize) {
    return false;
  }
  
  // 更深入检查关键任务是否有变化
  if (prevCriticalSize > 0) {
    const prevCritical = Array.from(prevProps.criticalTasks).sort().join(',');
    const nextCritical = Array.from(nextProps.criticalTasks).sort().join(',');
    
    if (prevCritical !== nextCritical) {
      return false;
    }
  }
  
  return true;
};

// 使用memo包装组件
export const TaskList = memo(TaskListComponent, areTaskListPropsEqual); 