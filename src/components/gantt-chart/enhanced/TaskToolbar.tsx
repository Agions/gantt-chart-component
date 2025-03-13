import React, { useState, useCallback, memo } from 'react';
import '../../../App.css';

interface TaskToolbarProps {
  onAddTask: (taskName: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const TaskToolbarComponent: React.FC<TaskToolbarProps> = ({
  onAddTask,
  onUndo,
  onRedo,
  onReset,
  canUndo,
  canRedo
}) => {
  const [newTaskName, setNewTaskName] = useState('');

  const handleAddTask = useCallback(() => {
    if (newTaskName.trim()) {
      onAddTask(newTaskName.trim());
      setNewTaskName('');
    }
  }, [newTaskName, onAddTask]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTaskName(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  }, [handleAddTask]);

  return (
    <div className="toolbar-container">
      <div className="task-input-group">
        <input
          type="text"
          value={newTaskName}
          onChange={handleInputChange}
          placeholder="输入新任务名称"
          className="task-input"
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleAddTask}
          className="add-task-button"
        >
          添加
        </button>
      </div>

      <div className="toolbar-actions">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`toolbar-button ${!canUndo ? 'disabled' : ''}`}
          title="撤销"
          aria-label="撤销"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 10H16C19.866 10 23 13.134 23 17C23 20.866 19.866 24 16 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 10L9 15M4 10L9 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>撤销</span>
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`toolbar-button ${!canRedo ? 'disabled' : ''}`}
          title="重做"
          aria-label="重做"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 10H8C4.134 10 1 13.134 1 17C1 20.866 4.134 24 8 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 10L15 15M20 10L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>重做</span>
        </button>
        <button
          onClick={onReset}
          className="toolbar-button danger"
          title="重置所有数据"
          aria-label="重置"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C7.5 2 3.5 5 2.5 10M2 2V8H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>重置</span>
        </button>
      </div>
    </div>
  );
};

// 使用memo包装组件
export const TaskToolbar = memo(TaskToolbarComponent); 