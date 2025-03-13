import React, { useState, useRef, useEffect } from 'react';
import { Task } from '../types';
import { ThemeConfig } from '../themes';

interface TaskCardProps {
  task: Task;
  theme: ThemeConfig;
  isDragging?: boolean;
  isResizing?: boolean;
  onDragStart?: (e: React.MouseEvent) => void;
  onResizeStart?: (e: React.MouseEvent, direction: 'left' | 'right') => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  theme,
  isDragging,
  isResizing,
  onDragStart,
  onResizeStart
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 任务类型样式映射
  const typeStyles = {
    task: {
      height: theme.spacing.rowHeight - theme.spacing.unit * 2,
      backgroundColor: theme.colors.taskBackground,
      borderColor: theme.colors.taskBorder,
      borderRadius: theme.spacing.unit / 2
    },
    milestone: {
      height: theme.spacing.rowHeight - theme.spacing.unit * 2,
      backgroundColor: theme.colors.milestoneColor,
      borderColor: theme.colors.milestoneColor,
      borderRadius: '50%',
      width: theme.spacing.rowHeight - theme.spacing.unit * 2
    },
    project: {
      height: theme.spacing.rowHeight - theme.spacing.unit * 2,
      backgroundColor: theme.colors.projectColor,
      borderColor: theme.colors.projectColor,
      borderRadius: theme.spacing.unit / 4
    }
  };
  
  // 动画和交互样式
  const interactionStyles = {
    transform: isDragging ? 'scale(1.02)' : 'scale(1)',
    boxShadow: isHovered || isDragging ? theme.shadows.medium : theme.shadows.small,
    transition: `all ${theme.animation.duration} ${theme.animation.easing}`,
    cursor: isDragging ? 'grabbing' : 'grab'
  };
  
  // 处理任务卡片点击
  const handleClick = () => {
    setShowDetails(!showDetails);
  };
  
  // 渲染进度条
  const renderProgress = () => {
    if (task.progress === undefined || task.type === 'milestone') return null;
    
    return (
      <div
        className="task-progress"
        style={{
          width: `${task.progress}%`,
          height: '4px',
          backgroundColor: theme.colors.primary,
          position: 'absolute',
          bottom: 0,
          left: 0,
          borderRadius: `0 0 ${theme.spacing.unit / 2}px ${theme.spacing.unit / 2}px`
        }}
      />
    );
  };
  
  // 渲染调整大小的手柄
  const renderResizeHandles = () => {
    if (task.type === 'milestone') return null;
    
    return (
      <>
        <div
          className="resize-handle left"
          onMouseDown={(e) => onResizeStart?.(e, 'left')}
          style={{
            width: theme.spacing.unit,
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            cursor: 'ew-resize'
          }}
        />
        <div
          className="resize-handle right"
          onMouseDown={(e) => onResizeStart?.(e, 'right')}
          style={{
            width: theme.spacing.unit,
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            cursor: 'ew-resize'
          }}
        />
      </>
    );
  };
  
  // 渲染任务详情
  const renderDetails = () => {
    if (!showDetails) return null;
    
    return (
      <div
        className="task-details"
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.unit * 2,
          borderRadius: theme.spacing.unit,
          boxShadow: theme.shadows.large,
          zIndex: 1000,
          minWidth: '200px'
        }}
      >
        <h3 style={{ margin: 0, color: theme.colors.text }}>{task.name}</h3>
        <div style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.small }}>
          <p>开始: {task.start}</p>
          <p>结束: {task.end}</p>
          {task.progress !== undefined && <p>进度: {task.progress}%</p>}
        </div>
      </div>
    );
  };
  
  return (
    <div
      ref={cardRef}
      className={`task-card ${task.type || 'task'}`}
      style={{
        ...typeStyles[task.type || 'task'],
        ...interactionStyles,
        position: 'relative',
        border: `1px solid ${typeStyles[task.type || 'task'].borderColor}`,
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
        color: theme.colors.text,
        fontSize: theme.typography.fontSize.medium,
        fontWeight: theme.typography.fontWeight.medium,
        userSelect: 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={onDragStart}
      onClick={handleClick}
    >
      <div className="task-content" style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.unit }}>
        {task.type !== 'milestone' && (
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task.name}
          </span>
        )}
      </div>
      {renderProgress()}
      {renderResizeHandles()}
      {renderDetails()}
    </div>
  );
}; 