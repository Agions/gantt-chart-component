import React, { useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import '../core/GanttChartComponent';
import type { GanttChartData, GanttChartOptions, Task, Dependency } from '../core/GanttChartComponent';

interface GanttChartProps {
  data: GanttChartData;
  options?: GanttChartOptions;
  onTaskClick?: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
  onDependencyCreate?: (dependency: Dependency) => void;
}

export interface GanttChartRef {
  exportToPNG: () => Promise<string>;
  exportToPDF: () => Promise<string>;
  enterFullscreen: () => void;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gantt-chart-component': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        data?: string;
        options?: string;
      };
    }
  }
}

export const GanttChart = forwardRef<GanttChartRef, GanttChartProps>(({
  data,
  options = {},
  onTaskClick,
  onTaskUpdate,
  onDependencyCreate
}, ref) => {
  const chartRef = useRef<HTMLElement>(null);

  // 将数据转换为字符串
  const stringifiedData = useMemo(() => JSON.stringify(data), [data]);
  const stringifiedOptions = useMemo(() => JSON.stringify(options), [options]);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    exportToPNG: async (): Promise<string> => {
      if (!chartRef.current) {
        throw new Error('甘特图组件未初始化');
      }
      return (chartRef.current as any).exportToPNG();
    },
    exportToPDF: async (): Promise<string> => {
      if (!chartRef.current) {
        throw new Error('甘特图组件未初始化');
      }
      return (chartRef.current as any).exportToPDF();
    },
    enterFullscreen: (): void => {
      if (!chartRef.current) {
        throw new Error('甘特图组件未初始化');
      }
      (chartRef.current as any).enterFullscreen();
    }
  }));

  // 设置事件监听
  useEffect(() => {
    const element = chartRef.current;
    if (!element) return;

    const handleTaskClick = (e: CustomEvent) => onTaskClick?.(e.detail);
    const handleTaskUpdate = (e: CustomEvent) => onTaskUpdate?.(e.detail);
    const handleDependencyCreate = (e: CustomEvent) => onDependencyCreate?.(e.detail);

    element.addEventListener('task-click', handleTaskClick as EventListener);
    element.addEventListener('task-update', handleTaskUpdate as EventListener);
    element.addEventListener('dependency-create', handleDependencyCreate as EventListener);

    return () => {
      element.removeEventListener('task-click', handleTaskClick as EventListener);
      element.removeEventListener('task-update', handleTaskUpdate as EventListener);
      element.removeEventListener('dependency-create', handleDependencyCreate as EventListener);
    };
  }, [onTaskClick, onTaskUpdate, onDependencyCreate]);

  // 更新数据
  useEffect(() => {
    if (chartRef.current) {
      (chartRef.current as any).updateData(data);
    }
  }, [data]);

  // 更新选项
  useEffect(() => {
    if (chartRef.current) {
      (chartRef.current as any).updateOptions(options);
    }
  }, [options]);

  return (
    <div className="gantt-chart-wrapper" style={{ width: '100%', height: '100%', minHeight: '400px' }}>
      <gantt-chart-component
        ref={chartRef}
        data={stringifiedData}
        options={stringifiedOptions}
      />
    </div>
  );
});

export type { GanttChartData, GanttChartOptions, Task, Dependency }; 