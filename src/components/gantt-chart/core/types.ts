/**
 * 甘特图类型定义文件
 * @module types
 * @description 定义甘特图组件使用的所有类型和接口
 */

/**
 * 视图模式类型
 * @description 定义甘特图的时间尺度显示模式
 */
export type ViewMode = "day" | "week" | "month" | "quarter" | "year";

/**
 * 任务ID类型
 */
export type TaskId = string;

/**
 * 任务类型枚举
 */
export type TaskType = "task" | "milestone" | "project";

/**
 * 依赖关系类型枚举
 */
export type DependencyType = 
  | "finish_to_start" // 前置任务结束后才能开始后置任务（最常用）
  | "start_to_start"  // 前置任务开始后才能开始后置任务
  | "finish_to_finish" // 前置任务结束后才能结束后置任务
  | "start_to_finish"; // 前置任务开始后才能结束后置任务（较少使用）

/**
 * 拖拽操作类型
 */
export type DragType = "move" | "resize_left" | "resize_right" | "progress";

/**
 * 调整大小类型
 */
export type ResizeType = "left" | "right";

/**
 * 基础任务接口
 * @description 定义任务的基本属性
 */
export interface BaseTask {
  id: TaskId;
  name: string;
  start: string | Date;
  end: string | Date;
}

/**
 * 任务自定义元数据接口
 */
export interface TaskMetadata {
  [key: string]: unknown;
}

/**
 * 完整任务接口
 * @description 包含任务的所有可能属性
 */
export interface Task extends BaseTask {
  color?: string;            // 任务颜色
  progress?: number;         // 进度百分比 0-100
  collapsed?: boolean;       // 是否折叠子任务
  type?: TaskType;           // 任务类型
  dependencies?: TaskId[];   // 兼容旧版本的依赖关系
  dependsOn?: TaskId[];      // 依赖任务ID列表
  parentId?: TaskId;         // 父任务ID
  assignees?: string[];      // 分配的资源ID列表
  assignee?: string;         // 单个资源ID，兼容单一分配情况
  children?: Task[];         // 子任务列表
  draggable?: boolean;       // 是否可拖拽
  resizable?: boolean;       // 是否可调整大小
  readonly?: boolean;        // 是否只读
  metadata?: TaskMetadata;   // 自定义元数据
}

/**
 * 依赖ID类型
 */
export type DependencyId = string;

/**
 * 资源ID类型
 */
export type ResourceId = string;

/**
 * 资源类型定义
 */
export interface Resource {
  /** 资源ID */
  id: ResourceId;
  /** 资源名称 */
  name: string;
  /** 资源颜色 */
  color?: string;
  /** 资源角色/职位 */
  role?: string;
  /** 资源成本（如每小时成本） */
  cost?: number;
  /** 资源可用性百分比（0-100） */
  availability?: number;
  /** 自定义资源属性 */
  [key: string]: any;
}

/**
 * 依赖关系定义
 * @description 定义任务间的依赖关系
 */
export interface Dependency {
  fromId: TaskId;            // 源任务ID
  toId: TaskId;              // 目标任务ID
  type: DependencyType;      // 依赖类型
  lag?: number;              // 延迟天数（正数）或提前天数（负数）
}

/**
 * 主题定义
 * @description 定义甘特图的UI主题
 */
export interface GanttChartTheme {
  primary?: string;          // 主色调
  secondary?: string;        // 次色调
  success?: string;          // 成功色
  warning?: string;          // 警告色
  error?: string;            // 错误色
  textPrimary?: string;      // 主文本色
  textSecondary?: string;    // 次文本色
  borderColor?: string;      // 边框色
  backgroundColor?: string;  // 背景色
  fontSize?: string;         // 字体大小
  fontFamily?: string;       // 字体族
  taskColor?: string;        // 任务颜色
  milestoneColor?: string;   // 里程碑颜色
  projectColor?: string;     // 项目颜色
  dependencyLineColor?: string; // 依赖线颜色
  todayLineColor?: string;   // 今日线颜色
  weekendBackgroundColor?: string; // 周末背景色
  [key: string]: string | undefined; // 其他自定义主题属性
}

/**
 * 甘特图事件回调集合
 * @description 定义甘特图的所有事件回调
 */
export interface GanttChartCallbacks {
  onTaskClick?: (task: Task, event: MouseEvent) => void;
  onTaskDrag?: (task: Task, event: MouseEvent, newStart: Date, newEnd: Date) => void;
  onTaskResize?: (task: Task, event: MouseEvent, newStart: Date, newEnd: Date) => void;
  onTaskProgress?: (task: Task, event: MouseEvent, progress: number) => void;
  onViewChange?: (viewMode: ViewMode) => void;
  onDateChange?: (startDate: Date, endDate: Date) => void;
  onTaskToggle?: (task: Task, collapsed: boolean) => void;
  onTaskDoubleClick?: (task: Task, event: MouseEvent) => void;
  onProgressChange?: (task: Task, progress: number) => void;
  onDependencyClick?: (dependency: Dependency, event: MouseEvent) => void;
  onAutoScheduleComplete?: (tasks: Task[]) => void;
  onZoom?: (zoomLevel: number) => void;
  onError?: (error: Error) => void;
  onSelectionChange?: (selectedTasks: Task[]) => void;
  onRender?: () => void;
}

/**
 * 甘特图配置选项
 * @description 定义甘特图的所有配置选项
 */
export interface GanttChartOptions extends GanttChartCallbacks {
  tasks: Task[];                    // 任务列表（必需）
  resources?: Resource[];           // 资源列表
  dependencies?: Dependency[];      // 依赖关系列表
  startDate?: Date;                 // 显示的开始日期
  endDate?: Date;                   // 显示的结束日期
  viewMode?: ViewMode;              // 视图模式
  columnWidth?: number;             // 列宽（天/周/月等时间单位的宽度）
  rowHeight?: number;               // 行高
  headerHeight?: number;            // 表头高度
  enableDependencies?: boolean;     // 是否启用依赖关系
  enableResources?: boolean;        // 是否启用资源视图
  enableDragging?: boolean;         // 是否启用拖拽
  enableResizing?: boolean;         // 是否启用调整大小
  enableProgress?: boolean;         // 是否启用进度条调整
  enableGrouping?: boolean;         // 是否启用分组
  autoSchedule?: boolean;           // 是否自动调度
  respectDependencies?: boolean;    // 是否尊重依赖关系（移动任务时）
  showWeekends?: boolean;           // 是否显示周末
  showToday?: boolean;              // 是否显示今天线
  showRowLines?: boolean;           // 是否显示行线
  showColumnLines?: boolean;        // 是否显示列线
  showResourceView?: boolean;       // 是否显示资源视图
  virtualScrolling?: boolean;       // 是否启用虚拟滚动
  visibleTaskCount?: number;        // 可见任务数（虚拟滚动）
  bufferSize?: number;              // 缓冲区大小（虚拟滚动）
  theme?: GanttChartTheme;          // 主题配置
  locale?: string;                  // 本地化设置
  timelineWidth?: number;           // 时间线宽度
  taskListWidth?: number;           // 任务列表宽度
  zoomLevel?: number;               // 缩放级别
  showCriticalPath?: boolean;       // 是否显示关键路径
  enableTimelineDragging?: boolean; // 是否启用时间线拖拽
  enableKeyboardNavigation?: boolean; // 是否启用键盘导航
  enableTaskSelection?: boolean;    // 是否启用任务选择
  enableMultiSelection?: boolean;   // 是否启用多选
}

/**
 * 拖拽数据接口
 * @description 存储拖拽过程中的临时数据
 */
export interface DragData {
  startX: number;          // 起始X坐标
  originalLeft: number;    // 原始左边距
  originalWidth: number;   // 原始宽度
  task: Task;              // 相关任务
  type: DragType;          // 拖拽类型
  resizeType?: ResizeType; // 调整大小类型
  bar: HTMLElement;        // 对应DOM元素
}

/**
 * 虚拟滚动窗口接口
 * @description 定义虚拟滚动的视窗信息
 */
export interface VirtualWindow {
  startIndex: number;    // 开始索引
  endIndex: number;      // 结束索引
  startDate: Date;       // 开始日期
  endDate: Date;         // 结束日期
  visibleTasks: Task[];  // 可见任务
}

/**
 * 导出选项接口
 * @description 定义甘特图导出为图片/PDF的选项
 */
export interface ExportOptions {
  filename?: string;     // 文件名
  width?: number;        // 宽度
  height?: number;       // 高度
  scale?: number;        // 缩放比例
  quality?: number;      // 质量（0-1）
  format?: 'png' | 'jpeg' | 'pdf'; // 导出格式
  showTaskList?: boolean; // 是否包含任务列表
  margin?: number;       // 边距
}

/**
 * 错误类型
 */
export enum ErrorType {
  VALIDATION = 'validation_error',
  DEPENDENCY = 'dependency_error',
  RENDER = 'render_error',
  IMPORT = 'import_error',
  EXPORT = 'export_error',
  GENERAL = 'general_error'
}

/**
 * 甘特图状态
 * @description 用于状态管理和撤销/重做功能
 */
export interface GanttState {
  tasks: Task[];
  dependencies: Dependency[];
  resources: Resource[];
  startDate: Date;
  endDate: Date;
  viewMode: ViewMode;
  selectedTasks: TaskId[];
}

/**
 * 甘特图动作类型
 */
export enum ActionType {
  ADD_TASK = 'add_task',
  UPDATE_TASK = 'update_task',
  DELETE_TASK = 'delete_task',
  MOVE_TASK = 'move_task',
  ADD_DEPENDENCY = 'add_dependency',
  DELETE_DEPENDENCY = 'delete_dependency',
  CHANGE_VIEW = 'change_view',
  SET_DATES = 'set_dates',
  SELECT_TASK = 'select_task',
  DESELECT_TASK = 'deselect_task'
}

/**
 * 甘特图动作接口
 */
export interface GanttAction {
  type: ActionType;
  payload: any;
}
