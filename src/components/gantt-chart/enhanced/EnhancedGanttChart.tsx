/**
 * 增强型甘特图组件
 * 封装了常用操作和工具函数，提供更简单的API接口
 * 
 * @module EnhancedGanttChart
 */
import React, { useEffect, useRef, useState, useCallback, useImperativeHandle } from 'react';
import { Task, Dependency, Resource, ViewMode, ExportOptions } from '../core/types';
import utils, { daysBetween, addDays, formatDate } from '../core/utils';
import createStateManager, { ViewSettings } from '../core/StateManager';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// 从utils中提取需要的工具
const { ExampleGenerator } = utils;

/** 日期范围接口 */
interface DateRange {
  startDate: string;
  endDate: string;
}

/** 甘特图配置选项 */
interface GanttOptions {
  viewMode?: ViewMode;
  theme?: any;
  allowTaskResize?: boolean;
  allowTaskDrag?: boolean;
  readOnly?: boolean;
  [key: string]: any;
}

/** 增强型甘特图接口 */
export interface EnhancedGanttChartProps {
  /** 任务列表 */
  tasks?: Task[];
  /** 依赖关系列表 */
  dependencies?: Dependency[];
  /** 资源列表 */
  resources?: Resource[];
  /** 甘特图配置项 */
  options?: GanttOptions;
  /** 展示模式 */
  viewMode?: ViewMode;
  /** 示例数据数量（如果不提供tasks，将生成示例数据） */
  sampleCount?: number;
  /** 当任务变更时的回调 */
  onTasksChange?: (tasks: Task[]) => void;
  /** 当依赖关系变更时的回调 */
  onDependenciesChange?: (dependencies: Dependency[]) => void;
  /** 当任务被点击时的回调 */
  onTaskClick?: (task: Task) => void;
  /** 当任务被双击时的回调 */
  onTaskDoubleClick?: (task: Task) => void;
  /** 日期范围变更时的回调 */
  onDateRangeChange?: (range: DateRange) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 增强型甘特图组件
 * 封装了常用操作和实用功能，使用更加简单
 */
export const EnhancedGanttChart = React.forwardRef<any, EnhancedGanttChartProps>((props, ref) => {
  const {
    tasks: propsTasks,
    dependencies: propsDependencies,
    options = {},
    viewMode = 'day',
    sampleCount = 10,
    onTasksChange,
    onDependenciesChange,
    onTaskClick,
    onTaskDoubleClick,
    onDateRangeChange,
  } = props;

  // 引用甘特图实例
  const ganttRef = useRef<any>(null);
  
  // 引用状态管理器
  const stateManagerRef = useRef<ReturnType<typeof createStateManager> | null>(null);
  
  // 内部状态
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(viewMode);
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [resizingTask, setResizingTask] = useState<{ task: Task; type: 'left' | 'right' } | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [visibleTasks, setVisibleTasks] = useState<Task[]>([]);
  
  // refs
  const containerRef = useRef<HTMLDivElement>(null);
  const mainAreaRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const tasksRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // 初始化示例数据（如果没有提供任务）
  useEffect(() => {
    if (!propsTasks || propsTasks.length === 0) {
      const sampleTasks = ExampleGenerator.generateTasks(sampleCount);
      const sampleDependencies = ExampleGenerator.generateDependencies(sampleTasks, Math.floor(sampleCount / 2));
      setTasks(sampleTasks);
      setDependencies(sampleDependencies);
    } else {
      setTasks(propsTasks);
      setDependencies(propsDependencies || []);
    }
  }, [propsTasks, propsDependencies, sampleCount]);
  
  // 初始化状态管理器
  useEffect(() => {
    if (tasks.length > 0 && !stateManagerRef.current) {
      stateManagerRef.current = createStateManager({
        tasks,
        dependencies
      });
      
      // 手动更新视图设置
      stateManagerRef.current.updateViewSettings({
        mode: currentViewMode,
      } as ViewSettings);
      
      // 订阅状态变更
      const unsubTasksListener = stateManagerRef.current.subscribe((state) => {
        setTasks([...state.tasks]);
        if (onTasksChange) onTasksChange([...state.tasks]);
      });
      
      const unsubDepsListener = stateManagerRef.current.subscribe((state) => {
        setDependencies([...state.dependencies]);
        if (onDependenciesChange) onDependenciesChange([...state.dependencies]);
      });
      
      const unsubRangeListener = stateManagerRef.current.subscribe((state) => {
        if (onDateRangeChange) {
          // 从任务中计算日期范围
          const dates = state.tasks.map(t => [new Date(t.start), new Date(t.end)]).flat();
          const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
          const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
          
          onDateRangeChange({
            startDate: formatDate(minDate),
            endDate: formatDate(maxDate)
          });
        }
      });
      
      // 返回清理函数
      return () => {
        unsubTasksListener();
        unsubDepsListener();
        unsubRangeListener();
      };
    }
    
    return undefined;
  }, [tasks.length, dependencies.length, onTasksChange, onDependenciesChange, onDateRangeChange, tasks, dependencies, currentViewMode]);
  
  // 更新视图模式
  useEffect(() => {
    if (currentViewMode !== viewMode) {
      setCurrentViewMode(viewMode);
      if (ganttRef.current) {
        ganttRef.current.setViewMode(viewMode);
      }
      
      if (stateManagerRef.current) {
        stateManagerRef.current.updateViewSettings({
          mode: viewMode
        } as ViewSettings);
      }
    }
  }, [viewMode, currentViewMode]);
  
  // 更新任务状态的回调
  const handleTaskUpdate = useCallback((updatedTask: Task) => {
    if (stateManagerRef.current) {
      // 找到并更新特定任务
      const currentTasks = [...tasks];
      const taskIndex = currentTasks.findIndex(t => t.id === updatedTask.id);
      if (taskIndex !== -1) {
        currentTasks[taskIndex] = updatedTask;
        stateManagerRef.current.updateTasks(currentTasks);
      }
    }
  }, [tasks]);
  
  // 更新依赖关系的回调
  const handleDependencyUpdate = useCallback((updatedDependency: Dependency) => {
    if (stateManagerRef.current) {
      // 找到并更新特定依赖关系
      const currentDependencies = [...dependencies];
      const depIndex = currentDependencies.findIndex(
        d => d.fromId === updatedDependency.fromId && d.toId === updatedDependency.toId
      );
      if (depIndex !== -1) {
        currentDependencies[depIndex] = updatedDependency;
        stateManagerRef.current.updateDependencies(currentDependencies);
      }
    }
  }, [dependencies]);
  
  // 添加新任务
  const handleAddTask = useCallback((task: Partial<Task>) => {
    if (stateManagerRef.current) {
      const newTask: Task = {
        id: `task_${Date.now()}`,
        name: task.name || '新任务',
        start: task.start || formatDate(new Date()),
        end: task.end || formatDate(addDays(new Date(), 1)),
        progress: task.progress || 0,
        type: task.type || 'task',
        ...task
      };
      
      const updatedTasks = [...tasks, newTask];
      stateManagerRef.current.updateTasks(updatedTasks);
    }
  }, [tasks]);
  
  // 删除任务
  const handleRemoveTask = useCallback((taskId: string) => {
    if (stateManagerRef.current) {
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      stateManagerRef.current.updateTasks(updatedTasks);
    }
  }, [tasks]);
  
  // 导出为图片
  const handleExportImage = useCallback(async (options?: ExportOptions) => {
    console.log("EnhancedGanttChart: 开始导出PNG", options);
    if (!containerRef.current) {
      console.error("EnhancedGanttChart: 容器引用不存在");
      throw new Error('甘特图容器未初始化');
    }
    
    try {
      const defaultOptions = {
        fileName: '甘特图',
        backgroundColor: '#ffffff',
        scale: 2,
        includeHeader: true,
        headerText: '项目甘特图'
      };
      
      const exportOptions = { ...defaultOptions, ...options };
      const { fileName, backgroundColor, scale, includeHeader, headerText } = exportOptions;
      
      let targetElement = containerRef.current;
      let tempContainer: HTMLDivElement | null = null;
      
      if (includeHeader) {
        console.log("EnhancedGanttChart: 创建带有标题的临时容器");
        tempContainer = document.createElement('div');
        tempContainer.style.background = backgroundColor || '#ffffff';
        tempContainer.style.padding = '20px';
        tempContainer.style.width = `${containerRef.current.scrollWidth}px`;
        
        // 添加标题
        const header = document.createElement('div');
        header.style.fontSize = '24px';
        header.style.fontWeight = 'bold';
        header.style.marginBottom = '15px';
        header.style.textAlign = 'center';
        header.textContent = headerText || '项目甘特图';
        
        tempContainer.appendChild(header);
        
        // 克隆甘特图
        const ganttClone = containerRef.current.cloneNode(true) as HTMLElement;
        tempContainer.appendChild(ganttClone);
        
        // 临时添加到DOM
        document.body.appendChild(tempContainer);
        targetElement = tempContainer;
      }
      
      console.log("EnhancedGanttChart: 使用html2canvas捕获图像");
      // 使用html2canvas捕获图像
      const canvas = await html2canvas(targetElement, {
        backgroundColor: backgroundColor || '#ffffff',
        scale: scale || 2,
        useCORS: true,
        allowTaint: true,
        logging: true
      });
      
      // 如果创建了临时容器，移除它
      if (tempContainer) {
        document.body.removeChild(tempContainer);
      }
      
      console.log("EnhancedGanttChart: 图像生成成功，准备下载");
      // 导出图像
      const link = document.createElement('a');
      link.download = `${fileName || 'gantt-chart'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      return link.href;
    } catch (error) {
      console.error("EnhancedGanttChart: 导出PNG失败", error);
      throw error;
    }
  }, []);
  
  // 导出为PDF
  const handleExportPDF = useCallback(async (options?: ExportOptions) => {
    console.log("EnhancedGanttChart: 开始导出PDF", options);
    if (!containerRef.current) {
      console.error("EnhancedGanttChart: 容器引用不存在");
      throw new Error('甘特图容器未初始化');
    }
    
    try {
      const defaultOptions = {
        fileName: '甘特图',
        backgroundColor: '#ffffff',
        scale: 2,
        includeHeader: true,
        headerText: '项目甘特图',
        orientation: 'landscape'
      };
      
      const exportOptions = { ...defaultOptions, ...options };
      const { fileName, backgroundColor, scale, includeHeader, headerText, orientation } = exportOptions;
      
      let targetElement = containerRef.current;
      let tempContainer: HTMLDivElement | null = null;
      
      if (includeHeader) {
        console.log("EnhancedGanttChart: 创建带有标题的临时容器");
        tempContainer = document.createElement('div');
        tempContainer.style.background = backgroundColor || '#ffffff';
        tempContainer.style.padding = '20px';
        tempContainer.style.width = `${containerRef.current.scrollWidth}px`;
        
        // 添加标题
        const header = document.createElement('div');
        header.style.fontSize = '24px';
        header.style.fontWeight = 'bold';
        header.style.marginBottom = '15px';
        header.style.textAlign = 'center';
        header.textContent = headerText || '项目甘特图';
        
        tempContainer.appendChild(header);
        
        // 克隆甘特图
        const ganttClone = containerRef.current.cloneNode(true) as HTMLElement;
        tempContainer.appendChild(ganttClone);
        
        // 临时添加到DOM
        document.body.appendChild(tempContainer);
        targetElement = tempContainer;
      }
      
      console.log("EnhancedGanttChart: 使用html2canvas捕获图像用于PDF");
      // 使用html2canvas捕获图像
      const canvas = await html2canvas(targetElement, {
        backgroundColor: backgroundColor || '#ffffff',
        scale: scale || 2,
        useCORS: true,
        allowTaint: true,
        logging: true
      });
      
      // 如果创建了临时容器，移除它
      if (tempContainer) {
        document.body.removeChild(tempContainer);
      }
      
      console.log("EnhancedGanttChart: 图像生成成功，创建PDF");
      // 创建PDF
      const pdf = new jsPDF({
        orientation: orientation === 'portrait' ? 'portrait' : 'landscape',
        unit: 'mm'
      });
      
      // 计算PDF尺寸
      const imgWidth = orientation === 'portrait' ? 210 - 20 : 297 - 20; // A4尺寸减去边距
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // 添加图像到PDF
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        10, // x坐标
        10, // y坐标
        imgWidth, 
        imgHeight
      );
      
      console.log("EnhancedGanttChart: PDF创建成功，准备下载");
      // 保存PDF
      pdf.save(`${fileName || 'gantt-chart'}.pdf`);
      
      // 返回PDF的数据URI
      return pdf.output('datauristring');
    } catch (error) {
      console.error("EnhancedGanttChart: 导出PDF失败", error);
      throw error;
    }
  }, []);
  
  // 撤销操作
  const handleUndo = useCallback(() => {
    if (stateManagerRef.current) {
      stateManagerRef.current.undo();
    }
  }, []);
  
  // 重做操作
  const handleRedo = useCallback(() => {
    if (stateManagerRef.current) {
      stateManagerRef.current.redo();
    }
  }, []);
  
  // 滚动到指定任务
  const handleScrollToTask = useCallback((taskId: string) => {
    if (ganttRef.current) {
      ganttRef.current.scrollToTask(taskId);
    }
  }, []);
  
  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    // 原始甘特图方法
    setViewMode: (mode: ViewMode) => {
      if (ganttRef.current) {
        ganttRef.current.setViewMode(mode);
        setCurrentViewMode(mode);
      }
    },
    scrollToTask: handleScrollToTask,
    
    // 导出和全屏方法
    exportAsPNG: handleExportImage,
    exportAsPDF: handleExportPDF,
    enterFullscreen: () => {
      if (!containerRef.current) {
        throw new Error('甘特图容器未初始化');
      }
      
      try {
        // 请求全屏
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
          (containerRef.current as any).msRequestFullscreen();
        } else {
          console.warn('浏览器不支持全屏API');
        }
      } catch (error) {
        console.error('进入全屏失败:', error);
        throw error;
      }
    },
    
    // 增强的方法
    addTask: handleAddTask,
    updateTask: handleTaskUpdate,
    removeTask: handleRemoveTask,
    updateDependency: handleDependencyUpdate,
    undo: handleUndo,
    redo: handleRedo,
    canUndo: () => (stateManagerRef.current && stateManagerRef.current.undoStackSize > 0) || false,
    canRedo: () => (stateManagerRef.current && stateManagerRef.current.redoStackSize > 0) || false,
    getStateManager: () => stateManagerRef.current
  }));
  
  // 默认选项与用户选项合并
  const defaultOptions = {
    allowTaskDrag: true,
    allowTaskResize: true,
    enableDependencies: true,
    showProgress: true,
    readOnly: false,
    showWeekends: true,
    showToday: true,
    theme: {
      primary: '#1890ff',
      secondary: '#13c2c2',
      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d',
      taskBackground: '#e6f7ff',
      taskBorder: '#91d5ff',
      milestoneColor: '#722ed1',
      criticalTaskBackground: '#fff2f0',
      criticalTaskBorder: '#ff4d4f',
      gridLine: '#f0f0f0',
      fontFamily: 'sans-serif',
      fontSize: 12
    }
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    theme: {
      ...defaultOptions.theme,
      ...(options.theme || {})
    }
  };
  
  // 计算日期范围
  useEffect(() => {
    // 根据任务找出最早和最晚的日期
    if (tasks.length > 0) {
      let earliest = new Date();
      let latest = new Date();
      
      tasks.forEach(task => {
        const start = typeof task.start === 'string' ? new Date(task.start) : task.start;
        const end = typeof task.end === 'string' ? new Date(task.end) : task.end;
        
        if (start < earliest) {
          earliest = new Date(start);
        }
        
        if (end > latest) {
          latest = new Date(end);
        }
      });
      
      // 添加一些缓冲
      earliest.setDate(earliest.getDate() - 7);
      latest.setDate(latest.getDate() + 7);
      
      setStartDate(earliest);
      setEndDate(latest);
    } else {
      // 默认显示当前月
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      setStartDate(firstDay);
      setEndDate(lastDay);
    }
  }, [tasks]);
  
  // 根据视图模式和日期范围渲染任务
  useEffect(() => {
    setVisibleTasks(tasks);
  }, [tasks, startDate, endDate, viewMode]);
  
  // 计算日期在甘特图上的位置
  const calculateOffsetFromDate = (date: Date): number => {
    const days = daysBetween(startDate, date);
    let columnWidth = 30; // 默认像素宽度
    
    switch (viewMode) {
      case 'day':
        columnWidth = 40;
        break;
      case 'week':
        columnWidth = 150;
        break;
      case 'month':
        columnWidth = 300;
        break;
    }
    
    return days * columnWidth;
  };
  
  // 根据偏移计算日期
  const calculateDateFromOffset = (offset: number): Date => {
    let columnWidth = 30; // 默认像素宽度
    
    switch (viewMode) {
      case 'day':
        columnWidth = 40;
        break;
      case 'week':
        columnWidth = 150;
        break;
      case 'month':
        columnWidth = 300;
        break;
    }
    
    const days = Math.floor(offset / columnWidth);
    const result = new Date(startDate);
    result.setDate(result.getDate() + days);
    
    return result;
  };
  
  // 计算任务宽度
  const calculateTaskWidth = (task: Task): number => {
    const start = typeof task.start === 'string' ? new Date(task.start) : task.start;
    const end = typeof task.end === 'string' ? new Date(task.end) : task.end;
    const days = daysBetween(start, end) + 1; // 包括结束日
    
    let columnWidth = 30; // 默认像素宽度
    
    switch (viewMode) {
      case 'day':
        columnWidth = 40;
        break;
      case 'week':
        columnWidth = 150;
        break;
      case 'month':
        columnWidth = 300;
        break;
    }
    
    return days * columnWidth;
  };
  
  // 渲染时间线
  const renderTimeline = () => {
    const days = daysBetween(startDate, endDate);
    let columnWidth = 30; // 默认像素宽度
    
    switch (viewMode) {
      case 'day':
        columnWidth = 40;
        break;
      case 'week':
        columnWidth = 150;
        break;
      case 'month':
        columnWidth = 300;
        break;
    }
    
    const items = [];
    
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      let label = '';
      
      switch (viewMode) {
        case 'day':
          label = `${date.getDate()}/${date.getMonth() + 1}`;
          break;
        case 'week':
          // 对于周视图，仅在周一显示日期
          if (date.getDay() === 1) { // 周一
            label = `${date.getDate()}/${date.getMonth() + 1}`;
          }
          break;
        case 'month':
          // 对于月视图，仅在月初显示日期
          if (date.getDate() === 1) {
            const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
            label = monthNames[date.getMonth()];
          }
          break;
      }
      
      if (label) {
        items.push(
          <div 
            key={`timeline-${i}`}
            style={{
              position: 'absolute',
              left: i * columnWidth,
              top: 0,
              width: columnWidth,
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: mergedOptions.theme.fontSize,
              fontFamily: mergedOptions.theme.fontFamily,
              color: '#666',
              borderRight: `1px solid ${mergedOptions.theme.gridLine}`,
              boxSizing: 'border-box'
            }}
          >
            {label}
          </div>
        );
      }
    }
    
    return (
      <div 
        ref={timelineRef}
        style={{
          position: 'relative',
          height: 40,
          width: (days + 1) * columnWidth,
          overflowX: 'hidden',
          backgroundColor: '#f9f9f9',
          borderBottom: '1px solid #e8e8e8'
        }}
      >
        {items}
      </div>
    );
  };
  
  // 渲染网格
  const renderGrid = () => {
    const days = daysBetween(startDate, endDate);
    let columnWidth = 30; // 默认像素宽度
    
    switch (viewMode) {
      case 'day':
        columnWidth = 40;
        break;
      case 'week':
        columnWidth = 150;
        break;
      case 'month':
        columnWidth = 300;
        break;
    }
    
    const verticalLines = [];
    
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // 周末使用不同颜色
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      verticalLines.push(
        <div 
          key={`grid-${i}`}
          style={{
            position: 'absolute',
            left: i * columnWidth,
            top: 0,
            width: columnWidth,
            height: '100%',
            backgroundColor: isWeekend && mergedOptions.showWeekends ? '#f9f9f9' : 'transparent',
            borderRight: `1px solid ${mergedOptions.theme.gridLine}`,
            boxSizing: 'border-box'
          }}
        />
      );
    }
    
    // 今天线
    if (mergedOptions.showToday) {
      const today = new Date();
      if (today >= startDate && today <= endDate) {
        const todayOffset = calculateOffsetFromDate(today);
        
        verticalLines.push(
          <div 
            key="today-line"
            style={{
              position: 'absolute',
              left: todayOffset,
              top: 0,
              width: 2,
              height: '100%',
              backgroundColor: mergedOptions.theme.primary,
              pointerEvents: 'none',
              zIndex: 9
            }}
          />
        );
      }
    }
    
    return (
      <div 
        ref={gridRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: (days + 1) * columnWidth,
          height: visibleTasks.length * 40,
          minHeight: '100%'
        }}
      >
        {verticalLines}
        
        {/* 任务行背景 */}
        {visibleTasks.map((task, index) => (
          <div
            key={`row-${task.id}`}
            style={{
              position: 'absolute',
              left: 0,
              top: index * 40,
              width: '100%',
              height: 40,
              borderBottom: `1px solid ${mergedOptions.theme.gridLine}`,
              boxSizing: 'border-box'
            }}
          />
        ))}
      </div>
    );
  };
  
  // 渲染任务
  const renderTasks = () => {
    return (
      <div 
        ref={tasksRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%'
        }}
      >
        {visibleTasks.map((task, index) => {
          const start = typeof task.start === 'string' ? new Date(task.start) : task.start;
          const left = calculateOffsetFromDate(start);
          const width = calculateTaskWidth(task);
          
          if (task.type === 'milestone') {
            // 渲染里程碑
            return (
              <div
                key={`task-${task.id}`}
                style={{
                  position: 'absolute',
                  left: left - 10, // 调整里程碑中心点
                  top: index * 40 + 10,
                  cursor: mergedOptions.readOnly ? 'default' : 'pointer'
                }}
                className="gantt-milestone"
                onClick={() => onTaskClick?.(task)}
                onDoubleClick={() => onTaskDoubleClick?.(task)}
              >
                <div className="gantt-milestone-label">{task.name}</div>
              </div>
            );
          } else {
            // 渲染普通任务
            return (
              <div
                key={`task-${task.id}`}
                style={{
                  position: 'absolute',
                  left,
                  top: index * 40 + 8,
                  width,
                  backgroundColor: mergedOptions.theme.taskBackground,
                  borderColor: mergedOptions.theme.taskBorder,
                  cursor: mergedOptions.readOnly ? 'default' : 'move'
                }}
                className="gantt-task"
                onClick={() => onTaskClick?.(task)}
                onDoubleClick={() => onTaskDoubleClick?.(task)}
                onMouseDown={e => {
                  if (mergedOptions.readOnly || !mergedOptions.allowTaskDrag) return;
                  e.preventDefault();
                  setDraggingTask(task);
                }}
              >
                <div 
                  className="gantt-task-progress" 
                  style={{ 
                    width: `${task.progress || 0}%`,
                    backgroundColor: mergedOptions.theme.primary
                  }}
                />
                
                <div className="gantt-task-label">{task.name}</div>
                
                {mergedOptions.allowTaskResize && !mergedOptions.readOnly && (
                  <>
                    <div 
                      className="gantt-task-resize-handle left"
                      onMouseDown={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        setResizingTask({ task, type: 'left' });
                      }}
                    />
                    <div 
                      className="gantt-task-resize-handle right"
                      onMouseDown={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        setResizingTask({ task, type: 'right' });
                      }}
                    />
                  </>
                )}
              </div>
            );
          }
        })}
      </div>
    );
  };
  
  // 渲染依赖线
  const renderDependencies = () => {
    if (!mergedOptions.enableDependencies || !svgRef.current) {
      return null;
    }
    
    return (
      <svg 
        ref={svgRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          pointerEvents: 'none'
        }}
        className="gantt-dependencies"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 6 3, 0 6" fill="#8c8c8c" />
          </marker>
        </defs>
        
        {dependencies.map(dep => {
          const sourceTask = tasks.find(t => t.id === dep.fromId);
          const targetTask = tasks.find(t => t.id === dep.toId);
          
          if (!sourceTask || !targetTask) {
            return null;
          }
          
          const sourceIndex = visibleTasks.findIndex(t => t.id === sourceTask.id);
          const targetIndex = visibleTasks.findIndex(t => t.id === targetTask.id);
          
          if (sourceIndex === -1 || targetIndex === -1) {
            return null;
          }
          
          const sourceStart = typeof sourceTask.start === 'string' 
            ? new Date(sourceTask.start) 
            : sourceTask.start;
            
          const sourceEnd = typeof sourceTask.end === 'string'
            ? new Date(sourceTask.end)
            : sourceTask.end;
            
          const targetStart = typeof targetTask.start === 'string'
            ? new Date(targetTask.start)
            : targetTask.start;
          
          const sourceLeft = calculateOffsetFromDate(sourceStart);
          const sourceRight = sourceLeft + calculateTaskWidth(sourceTask);
          const sourceY = sourceIndex * 40 + 20; // 中心点
          
          const targetLeft = calculateOffsetFromDate(targetStart);
          const targetY = targetIndex * 40 + 20; // 中心点
          
          // 依赖类型
          let startX = sourceRight;
          let startY = sourceY;
          let midX = (sourceRight + targetLeft) / 2;
          
          return (
            <path
              key={`dep-${dep.fromId}-${dep.toId}`}
              d={`M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${targetY} L ${targetLeft} ${targetY}`}
              className="gantt-dependency-line"
            />
          );
        })}
      </svg>
    );
  };
  
  // 处理任务拖拽
  useEffect(() => {
    if (!draggingTask) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!mainAreaRef.current) return;
      
      const rect = mainAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + mainAreaRef.current.scrollLeft;
      
      // 计算新的开始日期
      const newStart = calculateDateFromOffset(x);
      
      // 更新任务的位置
      const updatedTasks = tasks.map(t => {
        if (t.id === draggingTask.id) {
          const oldStart = typeof t.start === 'string' ? new Date(t.start) : t.start;
          const oldEnd = typeof t.end === 'string' ? new Date(t.end) : t.end;
          
          // 计算天数差额
          const daysDiff = daysBetween(oldStart, newStart);
          
          // 更新结束日期，保持持续时间不变
          const newEnd = new Date(oldEnd);
          newEnd.setDate(newEnd.getDate() + daysDiff);
          
          return {
            ...t,
            start: newStart,
            end: newEnd
          };
        }
        return t;
      });
      
      setVisibleTasks(updatedTasks);
    };
    
    const handleMouseUp = () => {
      if (draggingTask) {
        // 提交变更
        onTasksChange?.(visibleTasks);
        setDraggingTask(null);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingTask, tasks, visibleTasks, onTasksChange]);
  
  // 处理任务大小调整
  useEffect(() => {
    if (!resizingTask) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!mainAreaRef.current) return;
      
      const rect = mainAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + mainAreaRef.current.scrollLeft;
      
      // 计算新的日期
      const newDate = calculateDateFromOffset(x);
      
      // 根据调整类型更新任务
      const updatedTasks = visibleTasks.map(t => {
        if (t.id === resizingTask.task.id) {
          if (resizingTask.type === 'left') {
            // 确保开始日期不能晚于结束日期
            if (new Date(newDate) >= new Date(t.end)) {
              return t;
            }
            
            return {
              ...t,
              start: newDate
            };
          } else if (resizingTask.type === 'right') {
            // 确保结束日期不能早于开始日期
            if (new Date(newDate) <= new Date(t.start)) {
              return t;
            }
            
            return {
              ...t,
              end: newDate
            };
          }
        }
        return t;
      });
      
      setVisibleTasks(updatedTasks);
    };
    
    const handleMouseUp = () => {
      if (resizingTask) {
        // 提交变更
        onTasksChange?.(visibleTasks);
        setResizingTask(null);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingTask, calculateDateFromOffset, visibleTasks, onTasksChange]);
  
  // 渲染甘特图
  return (
    <div 
      ref={containerRef}
      className="gantt-chart-container"
      style={{ height: '100%' }}
    >
      <div 
        ref={mainAreaRef}
        className="gantt-chart-main"
        style={{ 
          position: 'relative',
          height: '100%',
          overflowX: 'auto',
          overflowY: 'auto'
        }}
      >
        {renderTimeline()}
        
        <div style={{ position: 'relative' }}>
          {renderGrid()}
          {renderTasks()}
          {renderDependencies()}
        </div>
      </div>
    </div>
  );
});

// 添加displayName
EnhancedGanttChart.displayName = 'EnhancedGanttChart'; 