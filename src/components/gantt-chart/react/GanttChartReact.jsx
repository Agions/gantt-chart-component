import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import GanttChartCore from '../core/GanttChartCore';
import '../styles/gantt-chart.css';

/**
 * React 甘特图组件
 * @param {Object} props 组件属性
 */
const GanttChartReact = ({
  tasks = [],
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
  enableDependencies = false,
  enableDragging = true,
  enableResizing = true,
  enableProgress = true,
  showWeekends = true,
  showToday = true,
  virtualScrolling = false,
  visibleTaskCount = 50,
  bufferSize = 10,
  className = '',
  style = {},
}) => {
  const containerRef = useRef(null);
  const [ganttChart, setGanttChart] = useState(null);

  // 使用useMemo优化配置对象创建
  const chartOptions = useMemo(() => ({
    tasks,
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
    enableDependencies,
    enableDragging,
    enableResizing,
    enableProgress,
    showWeekends,
    showToday,
    virtualScrolling,
    visibleTaskCount,
    bufferSize,
  }), [
    tasks,
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
    enableDependencies,
    enableDragging,
    enableResizing,
    enableProgress,
    showWeekends,
    showToday,
    virtualScrolling,
    visibleTaskCount,
    bufferSize,
  ]);

  // 初始化甘特图
  useEffect(() => {
    if (containerRef.current) {
      const chart = new GanttChartCore(chartOptions);
      
      chart.render(containerRef.current);
      setGanttChart(chart);
      
      return () => {
        // 清理函数
        if (chart.resizeObserver) {
          chart.resizeObserver.disconnect();
        }
      };
    }
  }, []);

  // 使用useCallback优化任务更新函数
  const updateTasks = useCallback(() => {
    if (ganttChart) {
      ganttChart.updateTasks(tasks);
    }
  }, [tasks, ganttChart]);
  
  // 更新任务
  useEffect(() => {
    updateTasks();
  }, [updateTasks]);

  // 使用useCallback优化配置更新函数
  const updateOptions = useCallback(() => {
    if (ganttChart) {
      ganttChart.updateOptions({
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
        enableDependencies,
        enableDragging,
        enableResizing,
        enableProgress,
        showWeekends,
        showToday,
        virtualScrolling,
        visibleTaskCount,
        bufferSize,
      });
    }
  }, [
    ganttChart,
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
    enableDependencies,
    enableDragging,
    enableResizing,
    enableProgress,
    showWeekends,
    showToday,
    virtualScrolling,
    visibleTaskCount,
    bufferSize,
  ]);
  
  // 更新配置
  useEffect(() => {
    updateOptions();
  }, [updateOptions]);

  return (
    <div 
      ref={containerRef}
      className={`gantt-chart-react ${className}`}
      style={{ width: '100%', height: '100%', ...style }}
    />
  );
};

export default GanttChartReact;