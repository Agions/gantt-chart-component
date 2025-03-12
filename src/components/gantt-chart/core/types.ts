/**
 * 甘特图类型定义
 */

// 视图模式类型
export type ViewMode = "day" | "week" | "month" | "quarter" | "year"

// 任务类型
export interface Task {
  id: number | string
  name: string
  start: string | Date
  end: string | Date
  color?: string
  progress?: number // 进度百分比 0-100
  collapsed?: boolean // 是否折叠
  type?: "task" | "milestone" | "project" // 任务类型
  dependencies?: (number | string)[] // 兼容旧版本
  dependsOn?: (number | string)[] // 依赖任务ID
  parentId?: number | string // 父任务ID
  assignees?: string[] // 分配的资源ID
  assignee?: string // 单个资源ID，兼容单一分配情况
  children?: Task[] // 子任务
  draggable?: boolean // 是否可拖拽
  resizable?: boolean // 是否可调整大小
  readonly?: boolean // 是否只读
  metadata?: any // 自定义元数据
}

// 资源类型
export interface Resource {
  id: string
  name: string
  color?: string
  avatar?: string
}

// 依赖关系类型
export interface Dependency {
  fromId: number | string
  toId: number | string
  type:
    | "finish_to_start"
    | "start_to_start"
    | "finish_to_finish"
    | "start_to_finish"
}

// 甘特图选项
export interface GanttChartOptions {
  tasks: Task[]
  resources?: Resource[]
  dependencies?: Dependency[]
  startDate?: Date
  endDate?: Date
  viewMode?: ViewMode
  columnWidth?: number
  rowHeight?: number
  headerHeight?: number
  onTaskClick?: (task: Task, event: MouseEvent) => void
  onTaskDrag?: (
    task: Task,
    event: MouseEvent,
    newStart: Date,
    newEnd: Date
  ) => void
  onTaskResize?: (
    task: Task,
    event: MouseEvent,
    newStart: Date,
    newEnd: Date
  ) => void
  onTaskProgress?: (task: Task, event: MouseEvent, progress: number) => void
  onViewChange?: (viewMode: ViewMode) => void
  onDateChange?: (startDate: Date, endDate: Date) => void
  onTaskToggle?: (task: Task, collapsed: boolean) => void
  onTaskDoubleClick?: (task: Task, event: MouseEvent) => void
  onProgressChange?: (task: Task, progress: number) => void
  onDependencyClick?: (dependency: Dependency, event: MouseEvent) => void
  onAutoScheduleComplete?: (tasks: Task[]) => void
  enableDependencies?: boolean
  enableResources?: boolean
  enableDragging?: boolean
  enableResizing?: boolean
  enableProgress?: boolean
  enableGrouping?: boolean
  autoSchedule?: boolean
  respectDependencies?: boolean
  showWeekends?: boolean
  showToday?: boolean
  showRowLines?: boolean
  showColumnLines?: boolean
  showResourceView?: boolean
  virtualScrolling?: boolean
  visibleTaskCount?: number
  bufferSize?: number
  theme?: {
    primary?: string
    secondary?: string
    success?: string
    warning?: string
    error?: string
    textPrimary?: string
    textSecondary?: string
    borderColor?: string
    backgroundColor?: string
    fontSize?: string
    fontFamily?: string
    taskColor?: string
    milestoneColor?: string
    projectColor?: string
    dependencyLineColor?: string
    [key: string]: string | undefined
  }
  locale?: string
}

// 事件数据类型
export interface DragData {
  startX: number
  originalLeft: number
  originalWidth: number
  task: Task
  type: "move" | "resize_left" | "resize_right" | "progress"
  resizeType?: "left" | "right"
  bar: HTMLElement
}

// 虚拟滚动窗口
export interface VirtualWindow {
  startIndex: number
  endIndex: number
  startDate: Date
  endDate: Date
  visibleTasks: Task[]
}

// 导出选项
export interface ExportOptions {
  filename?: string
  width?: number
  height?: number
  scale?: number
  quality?: number
}
