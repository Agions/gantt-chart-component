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

  // 使用useMemo缓存容器样式
  const containerStyle = useMemo(() => ({
    marginBottom: '15px' 
  }), []);
  
  return (
    <div style={containerStyle}>
      {modes.map(({ id, label }) => (
        <ModeButton 
          key={id}
          id={id}
          label={label}
          isActive={currentMode === id}
          onClick={() => onModeChange(id)}
        />
      ))}
    </div>
  );
};

interface ModeButtonProps {
  id: 'day' | 'week' | 'month';
  label: string;
  isActive: boolean;
  onClick: () => void;
}

// 使用memo优化按钮组件，减少重渲染
const ModeButton = memo(({ id, label, isActive, onClick }: ModeButtonProps) => {
  // 使用useMemo缓存按钮样式
  const buttonStyle = useMemo(() => ({
    padding: '8px 16px',
    marginRight: '10px',
    backgroundColor: isActive ? '#1890ff' : '#f0f0f0',
    color: isActive ? 'white' : 'black',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }), [isActive]);

  return (
    <button 
      onClick={onClick}
      style={buttonStyle}
      aria-pressed={isActive}
    >
      {label}
    </button>
  );
});

// 使用memo记忆化整个组件
export const ViewModeSelector = memo(ViewModeSelectorComponent); 