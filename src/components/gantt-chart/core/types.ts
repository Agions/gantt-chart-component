/**
 * 甘特图类型定义
 */

// 视图模式类型
export type ViewMode = 'day' | 'week' | 'month' | 'quarter' | 'year';

// 任务类型
export interface Task {
  id: number | string;
  name: string;
  start: string | Date;
  end: string | Date;
  color?: string;
  progress?: number;  // 进度百分比 0-100
  collapsed?: boolean; // 是否折叠
  type?: 'task' | 'milestone' | 'project'; // 任务类型
  dependencies?: (number | string)[]; // 依赖任务ID
  parentId?: number | string; // 父任务ID
  assignees?: string[]; // 分配的资源ID
  children?: Task[]; // 子任务
  draggable?: boolean; // 是否可拖拽
  resizable?: boolean; // 是否可调整大小
}

// 资源类型
export interface Resource {
  id: string;
  name: string;
  color?: string;
  avatar?: string;
}

// 依赖关系类型
export interface Dependency {
  fromId: number | string;
  toId: number | string;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
}

// 甘特图选项
export interface GanttChartOptions {
  tasks: Task[];
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
  onTaskResize?: (task: Task, event: MouseEvent, newStart: Date, newEnd: Date) => void;
  onTaskProgress?: (task: Task, event: MouseEvent, progress: number) => void;
  onViewChange?: (viewMode: ViewMode) => void;
  onDateChange?: (startDate: Date, endDate: Date) => void;
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
}

// 事件数据类型
export interface DragData {
  startX: number;
  originalLeft: number;
  originalWidth: number;
  task: Task;
  type: 'move' | 'resize_left' | 'resize_right' | 'progress';
}

// 虚拟滚动窗口
export interface VirtualWindow {
  startIndex: number;
  endIndex: number;
  startDate: Date;
  endDate: Date;
  visibleTasks: Task[];
} 