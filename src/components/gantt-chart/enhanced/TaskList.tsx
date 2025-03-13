import React, { useState, useCallback, memo, useMemo } from 'react';
import { Task } from '../core/types';
import { VirtualizedList } from './VirtualizedList';

interface TaskListProps {
  tasks: Task[];
  criticalTasks: Set<string>;
  onTaskSelect: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

const ITEM_HEIGHT = 110; // 估计的任务项高度
const LIST_HEIGHT = 400; // 列表容器高度

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
    setEditingTaskId(task.id);
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

  // 渲染单个任务项
  const renderTaskItem = useCallback((task: Task, index: number) => {
    return (
      <TaskItem
        key={task.id}
        task={task}
        isCritical={criticalTasks.has(String(task.id))}
        isEditing={editingTaskId === task.id}
        editValue={editingTaskId === task.id ? editValue : ''}
        onSelect={() => editingTaskId !== task.id && onTaskSelect(task)}
        onEditStart={() => handleEditStart(task)}
        onEditComplete={() => handleEditComplete(task.id)}
        onEditCancel={() => setEditingTaskId(null)}
        onEditChange={setEditValue}
        onDelete={(e) => handleDelete(e, task.id)}
        showEditButton={!!onTaskUpdate && !editingTaskId}
        showDeleteButton={!!onTaskDelete && !editingTaskId}
      />
    );
  }, [criticalTasks, editingTaskId, editValue, handleDelete, handleEditComplete, handleEditStart, onTaskDelete, onTaskSelect, onTaskUpdate]);
  
  return (
    <div>
      <h3>项目任务列表</h3>
      {tasks.length === 0 ? (
        <div style={{ padding: '10px', textAlign: 'center', color: '#999' }}>
          暂无任务
        </div>
      ) : (
        <VirtualizedList
          items={tasks}
          renderItem={renderTaskItem}
          itemHeight={ITEM_HEIGHT}
          containerHeight={LIST_HEIGHT}
          overscan={2}
          style={{ border: '1px solid #f0f0f0', borderRadius: '4px' }}
        />
      )}
    </div>
  );
};

interface TaskItemProps {
  task: Task;
  isCritical: boolean;
  isEditing: boolean;
  editValue: string;
  onSelect: () => void;
  onEditStart: () => void;
  onEditComplete: () => void;
  onEditCancel: () => void;
  onEditChange: (value: string) => void;
  onDelete: (e: React.MouseEvent) => void;
  showEditButton: boolean;
  showDeleteButton: boolean;
}

const TaskItem = memo(({
  task,
  isCritical,
  isEditing,
  editValue,
  onSelect,
  onEditStart,
  onEditComplete,
  onEditCancel,
  onEditChange,
  onDelete,
  showEditButton,
  showDeleteButton
}: TaskItemProps) => {
  // 使用useMemo缓存样式对象
  const styles = useMemo(() => ({
    container: {
      padding: '10px', 
      marginBottom: '10px', 
      backgroundColor: isCritical ? '#ffecec' : '#f9f9f9',
      border: isCritical ? '1px solid #ff4d4f' : '1px solid #d9d9d9',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      height: '100%',
      boxSizing: 'border-box'
    },
    flexRow: {
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center'
    },
    contentCol: {
      flex: 1
    },
    actionsCol: {
      display: 'flex', 
      alignItems: 'center'
    },
    dateInfo: {
      fontSize: '12px', 
      color: '#666', 
      marginTop: '5px'
    },
    progressText: {
      width: '40px', 
      textAlign: 'right', 
      marginRight: '15px',
      color: task.progress === 100 ? '#52c41a' : '#1890ff',
      fontWeight: 'bold'
    },
    progressBarContainer: {
      height: '6px', 
      backgroundColor: '#f0f0f0', 
      borderRadius: '3px', 
      marginTop: '10px',
      overflow: 'hidden'
    },
    progressBar: {
      height: '100%', 
      width: `${task.progress}%`, 
      backgroundColor: task.progress === 100 ? '#52c41a' : '#1890ff',
      transition: 'width 0.3s ease'
    },
    editButton: {
      marginRight: '5px',
      padding: '4px 8px',
      backgroundColor: '#1890ff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    deleteButton: {
      padding: '4px 8px',
      backgroundColor: '#ff4d4f',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    editInput: {
      flex: 1,
      padding: '4px 8px',
      borderRadius: '4px',
      border: '1px solid #d9d9d9'
    },
    confirmButton: {
      marginLeft: '5px',
      padding: '4px 8px',
      backgroundColor: '#52c41a',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    cancelButton: {
      marginLeft: '5px',
      padding: '4px 8px',
      backgroundColor: '#ff4d4f',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }
  }), [isCritical, task.progress]);

  return (
    <li
      style={styles.container}
      onClick={onSelect}
    >
      <div style={styles.flexRow}>
        <div style={styles.contentCol}>
          {isEditing ? (
            <div style={styles.flexRow}>
              <input
                type="text"
                value={editValue}
                onChange={(e) => onEditChange(e.target.value)}
                style={styles.editInput}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onEditComplete();
                  } else if (e.key === 'Escape') {
                    onEditCancel();
                  }
                }}
                autoFocus
              />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEditComplete();
                }}
                style={styles.confirmButton}
              >
                ✓
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCancel();
                }}
                style={styles.cancelButton}
              >
                ✕
              </button>
            </div>
          ) : (
            <div>
              <strong>{task.name}</strong>
              {isCritical && (
                <span style={{ color: 'red', marginLeft: '5px' }}>(关键任务)</span>
              )}
            </div>
          )}
          <div style={styles.dateInfo}>
            {typeof task.start === 'string' ? task.start : task.start.toLocaleDateString()} 至{' '}
            {typeof task.end === 'string' ? task.end : task.end.toLocaleDateString()}
          </div>
        </div>
        
        <div style={styles.actionsCol}>
          <div style={styles.progressText}>
            {task.progress}%
          </div>
          
          {showEditButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditStart();
              }}
              style={styles.editButton}
              title="编辑任务"
            >
              ✎
            </button>
          )}
          
          {showDeleteButton && (
            <button
              onClick={onDelete}
              style={styles.deleteButton}
              title="删除任务"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {/* 进度条 */}
      <div style={styles.progressBarContainer}>
        <div style={styles.progressBar} />
      </div>
    </li>
  );
});

// 与 criticalTasks 的 Set 类型有关的深度比较函数
const areTaskListPropsEqual = (prevProps: TaskListProps, nextProps: TaskListProps) => {
  // 比较 tasks 数组
  if (prevProps.tasks.length !== nextProps.tasks.length) return false;
  
  // 比较 criticalTasks 集合
  const prevCriticalIds = Array.from(prevProps.criticalTasks);
  const nextCriticalIds = Array.from(nextProps.criticalTasks);
  if (prevCriticalIds.length !== nextCriticalIds.length) return false;
  
  // 集合内容比较
  for (const id of prevCriticalIds) {
    if (!nextProps.criticalTasks.has(id)) return false;
  }
  
  // 逐个比较任务是否变化
  for (let i = 0; i < prevProps.tasks.length; i++) {
    const prevTask = prevProps.tasks[i];
    const nextTask = nextProps.tasks[i];
    
    if (prevTask.id !== nextTask.id || 
        prevTask.name !== nextTask.name ||
        prevTask.progress !== nextTask.progress ||
        prevTask.start !== nextTask.start ||
        prevTask.end !== nextTask.end) {
      return false;
    }
  }
  
  // 其他回调函数引用比较
  return (
    prevProps.onTaskSelect === nextProps.onTaskSelect &&
    prevProps.onTaskDelete === nextProps.onTaskDelete &&
    prevProps.onTaskUpdate === nextProps.onTaskUpdate
  );
};

export const TaskList = memo(TaskListComponent, areTaskListPropsEqual); 