import React, { useState, useCallback, useMemo, memo } from 'react';

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

  // 使用useMemo缓存样式对象
  const styles = useMemo(() => ({
    buttonStyle: {
      padding: '8px 16px',
      margin: '0 5px',
      backgroundColor: '#1890ff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    disabledButtonStyle: {
      padding: '8px 16px',
      margin: '0 5px',
      backgroundColor: '#d9d9d9',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'not-allowed',
    },
    dangerButtonStyle: {
      padding: '8px 16px',
      margin: '0 5px',
      backgroundColor: '#ff4d4f',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    container: {
      display: 'flex', 
      marginBottom: '20px', 
      alignItems: 'center'
    },
    inputContainer: {
      display: 'flex', 
      flex: 1
    },
    input: {
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid #d9d9d9',
      marginRight: '10px',
      flex: 1,
    },
    buttonContainer: {
      display: 'flex', 
      marginLeft: '20px'
    }
  }), []);

  return (
    <div style={styles.container}>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={newTaskName}
          onChange={handleInputChange}
          placeholder="输入新任务名称"
          style={styles.input}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleAddTask}
          style={styles.buttonStyle}
        >
          添加任务
        </button>
      </div>

      <div style={styles.buttonContainer}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={canUndo ? styles.buttonStyle : styles.disabledButtonStyle}
          title="撤销"
          aria-label="撤销"
        >
          ↩️ 撤销
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          style={canRedo ? styles.buttonStyle : styles.disabledButtonStyle}
          title="重做"
          aria-label="重做"
        >
          ↪️ 重做
        </button>
        <button
          onClick={onReset}
          style={styles.dangerButtonStyle}
          title="重置所有数据"
          aria-label="重置"
        >
          🔄 重置
        </button>
      </div>
    </div>
  );
};

// 使用memo包装组件
export const TaskToolbar = memo(TaskToolbarComponent); 