import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import GanttChartCore from '../core/GanttChartCore';
import { Task, ViewMode, Resource, Dependency, GanttChartOptions } from '../core/types';
import '../styles/gantt-chart.css';

/**
 * React 甘特图组件属性
 */
export interface GanttChartReactProps {
  tasks?: Task[];
  resources?: Resource[];
  dependencies?: Dependency[];
  startDate?: Date;
  endDate?: Date;
  viewMode?: ViewMode;
  columnWidth?: number;
  rowHeight?: number;
  headerHeight?: number;
  onTaskClick?: (task: Task, event: MouseEvent) => void;
  onTaskDrag?: (task: Task, event: MouseEvent, newStart: Date, newEnd: Date) => void;
  onTaskDoubleClick?: (task: Task, event: MouseEvent) => void;
  onDateChange?: (startDate: Date, endDate: Date) => void;
  onProgressChange?: (task: Task, progress: number) => void;
  onViewChange?: (viewMode: ViewMode) => void;
  onTaskToggle?: (task: Task, collapsed: boolean) => void;
  enableDependencies?: boolean;
  enableResources?: boolean;
  enableDragging?: boolean;
  enableResizing?: boolean;
  enableProgress?: boolean;
  enableGrouping?: boolean;
  showWeekends?: boolean;
  showToday?: boolean;
  showRowLines?: boolean;
  showColumnLines?: boolean;
  showResourceView?: boolean;
  virtualScrolling?: boolean;
  visibleTaskCount?: number;
  bufferSize?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * React 甘特图组件
 */
const GanttChartReact: React.FC<GanttChartReactProps> = ({
  tasks = [],
  resources = [],
  dependencies = [],
  startDate,
  endDate,
  viewMode = 'day',
  columnWidth = 40,
  rowHeight = 40,
  headerHeight = 50,
  onTaskClick,
  onTaskDrag,
  onTaskDoubleClick,
  onDateChange,
  onProgressChange,
  onViewChange,
  onTaskToggle,
  enableDependencies = false,
  enableResources = false,
  enableDragging = true,
  enableResizing = true,
  enableProgress = true,
  enableGrouping = false,
  showWeekends = true,
  showToday = true,
  showRowLines = true,
  showColumnLines = true,
  showResourceView = false,
  virtualScrolling = false,
  visibleTaskCount = 50,
  bufferSize = 10,
  className = '',
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ganttChart, setGanttChart] = useState<GanttChartCore | null>(null);

  // 使用useMemo优化配置对象创建
  const chartOptions = useMemo<GanttChartOptions>(() => ({
    tasks,
    resources,
    dependencies,
    startDate,
    endDate,
    viewMode,
    columnWidth,
    rowHeight,
    headerHeight,
    onTaskClick,
    onTaskDrag,
    onTaskDoubleClick,
    onDateChange,
    onProgressChange,
    onViewChange,
    onTaskToggle,
    enableDependencies,
    enableResources,
    enableDragging,
    enableResizing,
    enableProgress,
    enableGrouping,
    showWeekends,
    showToday,
    showRowLines,
    showColumnLines,
    showResourceView,
    virtualScrolling,
    visibleTaskCount,
    bufferSize
  }), [
    tasks, resources, dependencies, startDate, endDate, viewMode, columnWidth, rowHeight, headerHeight,
    onTaskClick, onTaskDrag, onTaskDoubleClick, onDateChange, onProgressChange, onViewChange, onTaskToggle,
    enableDependencies, enableResources, enableDragging, enableResizing, enableProgress, enableGrouping,
    showWeekends, showToday, showRowLines, showColumnLines, showResourceView,
    virtualScrolling, visibleTaskCount, bufferSize
  ]);

  // 初始化甘特图
  useEffect(() => {
    if (containerRef.current) {
      const chart = new GanttChartCore(chartOptions);
      chart.render(containerRef.current);
      setGanttChart(chart);

      return () => {
        // 清理代码（如有必要）
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      };
    }
  }, []);

  // 当选项变化时更新甘特图
  useEffect(() => {
    if (ganttChart) {
      // 假设GanttChartCore有updateOptions方法
      ganttChart.updateOptions?.(chartOptions);
    }
  }, [chartOptions, ganttChart]);

  // 处理视图模式切换
  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    if (onViewChange) {
      onViewChange(newMode);
    }
  }, [onViewChange]);

  return (
    <div 
      ref={containerRef} 
      className={`gantt-chart-container ${className}`}
      style={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'auto',
        ...style 
      }}
    />
  );
};

export default GanttChartReact; 