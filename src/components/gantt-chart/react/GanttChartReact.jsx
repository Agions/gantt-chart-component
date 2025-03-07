import React, { useEffect, useRef, useState } from 'react';
import GanttChartCore from '../core/GanttChartCore';
import '../styles/gantt-chart.css';

/**
 * React 甘特图组件
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
  className = '',
  style = {},
}) => {
  const containerRef = useRef(null);
  const [ganttChart, setGanttChart] = useState(null);

  // 初始化甘特图
  useEffect(() => {
    if (containerRef.current) {
      const chart = new GanttChartCore({
        tasks,
        startDate,
        endDate,
        viewMode,
        columnWidth,
        rowHeight,
        headerHeight,
        onTaskClick,
        onTaskDrag,
      });
      
      chart.render(containerRef.current);
      setGanttChart(chart);
      
      return () => {
        // 清理函数
      };
    }
  }, []);

  // 更新任务
  useEffect(() => {
    if (ganttChart) {
      ganttChart.updateTasks(tasks);
    }
  }, [tasks, ganttChart]);

  // 更新配置
  useEffect(() => {
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
      });
    }
  }, [startDate, endDate, viewMode, columnWidth, rowHeight, headerHeight, onTaskClick, onTaskDrag, ganttChart]);

  return (
    <div 
      ref={containerRef}
      className={`gantt-chart-react ${className}`}
      style={{ width: '100%', height: '100%', ...style }}
    />
  );
};

export default GanttChartReact; 