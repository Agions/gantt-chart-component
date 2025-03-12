import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { GanttChartCore } from '../core/GanttChartCore';
import { Task, ViewMode, Resource, Dependency, GanttChartOptions, ExportOptions } from '../core/types';
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
 * React 甘特图组件引用类型
 */
export interface GanttChartReactRef {
  exportAsPNG: (options?: ExportOptions) => Promise<string>;
  exportAsPDF: (options?: ExportOptions) => Promise<Blob>;
  scrollToTask: (taskId: string) => void;
  setViewMode: (mode: ViewMode) => void;
  getVisibleTasks: () => Task[];
  getInstanceCore: () => GanttChartCore | null;
}

/**
 * React 甘特图组件
 */
const GanttChartReact = React.forwardRef<GanttChartReactRef, GanttChartReactProps>((props, ref) => {
  const {
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
  } = props;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttChart = useRef<GanttChartCore | null>(null);

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
    if (containerRef.current && !ganttChart.current) {
      // GanttChartCore 的构造函数只接受一个 options 参数
      ganttChart.current = new GanttChartCore(chartOptions);
      
      // 渲染到容器
      if (ganttChart.current && containerRef.current) {
        ganttChart.current.render(containerRef.current);
      }
      
      // 注册事件
      if (onTaskClick && ganttChart.current) {
        ganttChart.current.on('task:click', onTaskClick);
      }
      
      if (onTaskDoubleClick && ganttChart.current) {
        ganttChart.current.on('task:dblclick', onTaskDoubleClick);
      }
      
      if (onTaskDrag && ganttChart.current) {
        ganttChart.current.on('task:drag', onTaskDrag);
      }
      
      if (onTaskToggle && ganttChart.current) {
        ganttChart.current.on('task:toggle', onTaskToggle);
      }
    }
    
    return () => {
      if (ganttChart.current) {
        ganttChart.current.destroy();
        ganttChart.current = null;
      }
    };
  }, []);
  
  // 更新数据
  useEffect(() => {
    if (ganttChart.current) {
      ganttChart.current.updateTasks(tasks);
    }
  }, [tasks]);
  
  // 更新依赖关系和资源数据
  useEffect(() => {
    if (ganttChart.current) {
      ganttChart.current.updateOptions({
        dependencies,
        resources
      });
    }
  }, [dependencies, resources]);
  
  // 更新选项
  useEffect(() => {
    if (ganttChart.current) {
      ganttChart.current.updateOptions(chartOptions);
    }
  }, [chartOptions]);
  
  // 暴露方法给父组件
  React.useImperativeHandle(ref, () => ({
    exportAsPNG: (options?: ExportOptions) => {
      return ganttChart.current ? ganttChart.current.exportAsPNG(options) : Promise.reject('甘特图未初始化');
    },
    exportAsPDF: (options?: ExportOptions) => {
      return ganttChart.current ? ganttChart.current.exportAsPDF(options) : Promise.reject('甘特图未初始化');
    },
    scrollToTask: (taskId: string) => {
      if (ganttChart.current) {
        ganttChart.current.scrollToTask(taskId);
      }
    },
    setViewMode: (mode: ViewMode) => {
      if (ganttChart.current) {
        ganttChart.current.setViewMode(mode);
      }
    },
    getVisibleTasks: () => {
      return ganttChart.current ? ganttChart.current.getVisibleTasks() : [];
    },
    getInstanceCore: () => ganttChart.current
  }));

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
});

GanttChartReact.displayName = 'GanttChartReact';

export default GanttChartReact; 