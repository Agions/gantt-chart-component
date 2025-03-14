# 甘特图组件gantt-chart-component


一个功能强大、高性能的甘特图组件，支持任务管理、依赖关系、多种视图模式和丰富的交互功能。

## 特性

- 🚀 **高性能渲染**：使用虚拟滚动和缓存优化，轻松处理数千条任务数据
- 📊 **多视图模式**：支持日、周、月、季度和年视图
- 🔄 **拖拽与调整**：拖动任务或调整任务时长
- 🔗 **依赖关系**：支持任务间的多种依赖关系
- 🔙 **撤销/重做**：完整的操作历史记录
- 💾 **导出功能**：支持导出为PNG、PDF或Excel
- 🎨 **主题定制**：可完全自定义样式和主题
- 📱 **响应式设计**：适配各种屏幕尺寸
- 🌍 **国际化支持**：支持多语言和本地化
- 🧩 **框架无关**：可用于React、Vue等主流框架

## 快速开始

### 安装

```bash
npm install gantt-chart-component
# 或
yarn add gantt-chart-component
```

### 基础使用

```jsx
import React, { useRef } from 'react';
import { EnhancedGanttChart } from gantt-chart-component';

function App() {
  const ganttRef = useRef(null);
  
  // 示例任务数据
  const tasks = [
    {
      id: '1',
      name: '需求分析',
      start: '2023-03-01',
      end: '2023-03-05',
      progress: 100,
      type: 'task'
    },
    {
      id: '2',
      name: '设计阶段',
      start: '2023-03-06',
      end: '2023-03-10',
      progress: 80,
      type: 'task'
    }
  ];
  
  // 示例依赖关系
  const dependencies = [
    {
      fromId: '1',
      toId: '2',
      type: 'finish_to_start'
    }
  ];

  return (
    <div style={{ height: '500px' }}>
      <EnhancedGanttChart
        ref={ganttRef}
        tasks={tasks}
        dependencies={dependencies}
        viewMode="week"
        onTaskClick={(task) => console.log('任务点击:', task)}
      />
      
      {/* 示例工具栏 */}
      <div>
        <button onClick={() => ganttRef.current.undo()}>撤销</button>
        <button onClick={() => ganttRef.current.redo()}>重做</button>
        <button onClick={() => ganttRef.current.exportAsPNG()}>导出PNG</button>
      </div>
    </div>
  );
}
```

## 核心API

### `<EnhancedGanttChart>` 属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `tasks` | Task[] | [] | 任务数据列表 |
| `dependencies` | Dependency[] | [] | 依赖关系列表 |
| `resources` | Resource[] | [] | 资源列表 |
| `viewMode` | 'day'\|'week'\|'month' | 'day' | 视图模式 |
| `sampleCount` | number | 10 | 如果不提供tasks，则生成的示例任务数量 |
| `options` | GanttOptions | {} | 详细配置选项 |
| `onTasksChange` | (tasks: Task[]) => void | - | 任务变更回调 |
| `onDependenciesChange` | (deps: Dependency[]) => void | - | 依赖变更回调 |
| `onTaskClick` | (task: Task) => void | - | 任务点击回调 |
| `onTaskDoubleClick` | (task: Task) => void | - | 任务双击回调 |
| `onDateRangeChange` | (range: DateRange) => void | - | 日期范围变更回调 |

### `GanttOptions` 配置项

```typescript
{
  // 主题设置
  theme: {
    primary: '#1890ff',
    secondary: '#13c2c2',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    taskBackground: '#e6f7ff',
    taskBorder: '#91d5ff',
    milestoneColor: '#722ed1',
    gridLine: '#f0f0f0',
    fontFamily: 'sans-serif',
    fontSize: 12
  },
  
  // 功能开关
  allowTaskDrag: true,        // 允许任务拖拽
  allowTaskResize: true,      // 允许任务调整大小
  readOnly: false,            // 只读模式
  enableDependencies: true,   // 启用依赖关系
  showProgress: true,         // 显示进度条
  showWeekends: true,         // 显示周末
  showToday: true,            // 显示今天线
  
  // 其他配置
  dateFormat: 'YYYY-MM-DD',   // 日期格式
  columnWidth: 40,            // 列宽(像素)
  rowHeight: 40,              // 行高(像素)
  workingDays: [1,2,3,4,5],   // 工作日(1-5表示周一至周五)
}
```

### 方法

通过 `ref` 访问组件实例可以使用以下方法：

- `addTask(task: Partial<Task>)`: 添加新任务
- `updateTask(task: Task)`: 更新任务
- `removeTask(taskId: string)`: 删除任务
- `setViewMode(mode: ViewMode)`: 设置视图模式
- `scrollToTask(taskId: string)`: 滚动到指定任务
- `exportAsPNG(options?: ExportOptions)`: 导出为PNG
- `exportAsPDF(options?: ExportOptions)`: 导出为PDF
- `undo()`: 撤销操作
- `redo()`: 重做操作

## 数据结构

### Task (任务)

```typescript
interface Task {
  id: string;              // 唯一标识符
  name: string;            // 任务名称
  start: string;           // 开始日期 (YYYY-MM-DD)
  end: string;             // 结束日期 (YYYY-MM-DD)
  progress: number;        // 进度 (0-100)
  type: TaskType;          // 任务类型: 'task' | 'milestone' | 'project'
  parentId?: string;       // 父任务ID (可选)
  color?: string;          // 自定义颜色 (可选)
  collapsed?: boolean;     // 是否折叠子任务 (可选)
  metadata?: any;          // 自定义元数据 (可选)
}
```

### Dependency (依赖关系)

```typescript
interface Dependency {
  fromId: string;           // 源任务ID
  toId: string;             // 目标任务ID
  type: DependencyType;     // 依赖类型: 'finish_to_start' | 'start_to_start' | 
                            // 'finish_to_finish' | 'start_to_finish'
  metadata?: any;           // 自定义元数据 (可选)
}
```

### Resource (资源)

```typescript
interface Resource {
  id: string;               // 唯一标识符
  name: string;             // 资源名称
  color?: string;           // 自定义颜色 (可选)
  capacity?: number;        // 资源容量 (可选, 0-100)
  metadata?: any;           // 自定义元数据 (可选)
}
```

## 示例

详细示例请查看 `src/components/gantt-chart/examples/` 目录下的示例文件。

## 浏览器兼容性

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)
- IE11 (需要polyfills)

## 许可证

MIT

## GitHub Pages 部署

此项目已配置为自动部署到GitHub Pages。每当推送到`main`分支时，GitHub Actions将自动构建并部署到GitHub Pages。

### 如何配置

1. 在GitHub上fork或克隆此仓库
2. 更新`package.json`中的`homepage`字段，替换为你的GitHub用户名和仓库名
   ```json
   "homepage": "https://[你的GitHub用户名].github.io/[你的仓库名]"
   ```
3. 更新`.github/workflows/deploy.yml`中的分支名称（如果你的默认分支不是`main`）
4. 推送代码到GitHub，自动触发部署
5. 在GitHub仓库设置中启用GitHub Pages，并选择来源为`gh-pages`分支

### 手动部署

你也可以手动部署到GitHub Pages：

```bash
npm run deploy
```

这将构建项目并推送到`gh-pages`分支。
