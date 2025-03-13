import React, { useMemo, memo } from 'react';

interface ViewModeSelectorProps {
  currentMode: 'day' | 'week' | 'month';
  onModeChange: (mode: 'day' | 'week' | 'month') => void;
}

const ViewModeSelectorComponent: React.FC<ViewModeSelectorProps> = ({
  currentMode,
  onModeChange
}) => {
  // 使用useMemo记忆化模式数组
  const modes = useMemo(() => [
    { id: 'day', label: '日视图' },
    { id: 'week', label: '周视图' },
    { id: 'month', label: '月视图' }
  ] as const, []);
  
  return (
    <div className="view-controls">
      {modes.map(({ id, label }) => (
        <button 
          key={id}
          className={`view-control-button ${currentMode === id ? 'active' : ''}`}
          onClick={() => onModeChange(id)}
          aria-pressed={currentMode === id}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

// 使用memo记忆化整个组件
export const ViewModeSelector = memo(ViewModeSelectorComponent); 