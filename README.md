# 甘特图组件 (Gantt Chart Component)

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/version-1.1.0-green.svg)](./CHANGELOG.md)
[![React Support](https://img.shields.io/badge/React-16.8+-61DAFB.svg?logo=react)](https://reactjs.org/)
[![Vue Support](https://img.shields.io/badge/Vue-3.0+-42b883.svg?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.5+-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)

一个功能强大、高性能的甘特图组件库，同时支持 React 和 Vue 框架，专为项目管理和任务进度可视化设计。

## 📑 目录

- [特性](#特性)
- [浏览器兼容性](#浏览器兼容性)
- [安装](#安装)
- [快速开始](#快速开始)
  - [React 中使用](#react-中使用)
  - [Vue 中使用](#vue-中使用)
- [兼容性检测](#兼容性检测)
- [API 文档](#api-文档)
  - [属性说明](#属性说明)
  - [事件](#事件)
  - [方法](#方法)
- [任务对象格式](#任务对象格式)
- [高级用法](#高级用法)
  - [自定义样式](#自定义样式)
  - [任务分组](#任务分组)
  - [依赖关系](#依赖关系)
- [常见问题](#常见问题)
- [贡献指南](#贡献指南)
- [版本信息](#版本信息)
- [许可证](#许可证)

## ✨ 特性

- **框架支持** - 同时支持 React 和 Vue 框架，API 设计一致
- **TypeScript** - 完全 TypeScript 实现，提供完整类型定义和智能提示
- **高性能** - 支持虚拟滚动，高效处理大量任务数据（10000+）
- **交互丰富** - 支持任务拖拽、调整大小、依赖线绘制等操作
- **视图多样** - 支持多种视图模式：日、周、月、季度、年
- **依赖关系** - 可视化显示任务间的依赖关系
- **主题定制** - 支持自定义样式和主题
- **兼容检测** - 提供浏览器兼容性自动检测
- **响应式** - 完全响应式设计，适应不同尺寸的容器
- **无外部依赖** - 核心功能零依赖，体积小巧

## 🌐 浏览器兼容性

本组件经过严格测试，支持以下浏览器环境：

| 浏览器  | 支持版本 |
| ------- | -------- |
| Chrome  | >= 90    |
| Firefox | >= 88    |
| Safari  | >= 14    |
| Edge    | >= 90    |

> ⚠️ **注意**：不支持 IE11 及以下版本

## 📦 安装

```bash
# 使用 npm
npm install gantt-chart-component

# 使用 yarn
yarn add gantt-chart-component

# 使用 pnpm
pnpm add gantt-chart-component
```

## 🚀 快速开始

### React 中使用

```jsx
import { GanttChartReact } from "gantt-chart-component"
import "gantt-chart-component/dist/style.css" // 导入样式

function App() {
  const tasks = [
    {
      id: 1,
      name: "需求分析",
      start: "2025-01-01",
      end: "2025-01-05",
      progress: 100,
    },
    {
      id: 2,
      name: "系统设计",
      start: "2025-01-03",
      end: "2025-01-08",
      progress: 60,
      dependsOn: [1],
    },
    {
      id: 3,
      name: "开发实现",
      start: "2025-01-08",
      end: "2025-01-20",
      progress: 30,
      dependsOn: [2],
    },
  ]

  return (
    <div style={{ height: "500px" }}>
      <GanttChartReact
        tasks={tasks}
        viewMode='week'
        onTaskClick={(task) => console.log("点击了任务:", task)}
        onTaskDrag={(task, newDates) =>
          console.log("拖拽任务:", task, newDates)
        }
      />
    </div>
  )
}
```

### Vue 中使用

```vue
<template>
  <div style="height: 500px">
    <GanttChartVue
      :tasks="tasks"
      viewMode="week"
      @task-click="onTaskClick"
      @task-drag="onTaskDrag"
    />
  </div>
</template>

<script>
import { GanttChartVue } from "gantt-chart-component"
import "gantt-chart-component/dist/style.css" // 导入样式

export default {
  components: { GanttChartVue },
  data() {
    return {
      tasks: [
        {
          id: 1,
          name: "需求分析",
          start: "2025-01-01",
          end: "2025-01-05",
          progress: 100,
        },
        {
          id: 2,
          name: "系统设计",
          start: "2025-01-03",
          end: "2025-01-08",
          progress: 60,
          dependsOn: [1],
        },
        {
          id: 3,
          name: "开发实现",
          start: "2025-01-08",
          end: "2025-01-20",
          progress: 30,
          dependsOn: [2],
        },
      ],
    }
  },
  methods: {
    onTaskClick(task) {
      console.log("点击了任务:", task)
    },
    onTaskDrag(task, newDates) {
      console.log("拖拽任务:", task, newDates)
    },
  },
}
</script>
```

## 🔍 兼容性检测

组件提供了完整的兼容性检测工具，可在运行时检测当前环境是否支持所有必要特性：

```js
import {
  isCompatible,
  getCompatibilityDetails,
  checkBrowserCompatibility,
  RECOMMENDED_BROWSERS,
} from "gantt-chart-component"

// 检查当前浏览器是否兼容
if (!isCompatible()) {
  console.warn("当前浏览器可能不完全支持甘特图组件")
  console.info("推荐使用以下浏览器:", RECOMMENDED_BROWSERS)
}

// 获取详细兼容性信息
const details = getCompatibilityDetails()
console.log("兼容性详情:", details)

// 自动检查并提供警告
checkBrowserCompatibility()
```

## 📚 API 文档

### 属性说明

| 属性             | 类型                                                          | 默认值    | 说明                 |
| ---------------- | ------------------------------------------------------------- | --------- | -------------------- |
| tasks            | `Task[]`                                                      | `[]`      | 任务数据数组         |
| startDate        | `Date \| string`                                              | 当前日期  | 甘特图开始日期       |
| endDate          | `Date \| string`                                              | 自动计算  | 甘特图结束日期       |
| viewMode         | `'hour' \| 'day' \| 'week' \| 'month' \| 'quarter' \| 'year'` | `'day'`   | 视图模式             |
| columnWidth      | `number`                                                      | `40`      | 列宽（像素）         |
| rowHeight        | `number`                                                      | `40`      | 行高（像素）         |
| headerHeight     | `number`                                                      | `50`      | 表头高度（像素）     |
| allowTaskDrag    | `boolean`                                                     | `true`    | 是否允许任务拖拽     |
| allowTaskResize  | `boolean`                                                     | `true`    | 是否允许调整任务大小 |
| showDependencies | `boolean`                                                     | `true`    | 是否显示依赖关系线   |
| showProgress     | `boolean`                                                     | `true`    | 是否显示进度条       |
| theme            | `object`                                                      | `{}`      | 主题配置对象         |
| locale           | `string`                                                      | `'zh-CN'` | 本地化设置           |
| className        | `string`                                                      | `''`      | 自定义 CSS 类名      |
| style            | `object`                                                      | `{}`      | 自定义内联样式       |

### 事件

| 事件名 (React / Vue)                  | 参数                                                       | 说明                 |
| ------------------------------------- | ---------------------------------------------------------- | -------------------- |
| onTaskClick / @task-click             | `(task: Task) => void`                                     | 任务点击事件         |
| onTaskDrag / @task-drag               | `(task: Task, newDates: {start: Date, end: Date}) => void` | 任务拖拽事件         |
| onTaskResize / @task-resize           | `(task: Task, newDates: {start: Date, end: Date}) => void` | 任务大小调整事件     |
| onViewChange / @view-change           | `(viewMode: string) => void`                               | 视图模式变更事件     |
| onDependencyClick / @dependency-click | `(dependency: Dependency) => void`                         | 依赖关系线点击事件   |
| onDateChange / @date-change           | `(start: Date, end: Date) => void`                         | 显示日期范围变更事件 |

### 方法

以下方法可通过 ref 访问：

```jsx
// React
const ganttRef = useRef()
// 使用方法
ganttRef.current.scrollToTask(taskId)

// Vue
const ganttRef = ref()
// 使用方法
ganttRef.value.scrollToTask(taskId)
```

| 方法名          | 参数                                           | 返回值    | 说明               |
| --------------- | ---------------------------------------------- | --------- | ------------------ |
| scrollToTask    | `(taskId: number \| string) => void`           | -         | 滚动到指定任务     |
| scrollToDate    | `(date: Date \| string) => void`               | -         | 滚动到指定日期     |
| setViewMode     | `(mode: string) => void`                       | -         | 设置视图模式       |
| exportAsPNG     | `(options?: ExportOptions) => Promise<string>` | 数据 URL  | 导出为 PNG 图片    |
| exportAsPDF     | `(options?: ExportOptions) => Promise<Blob>`   | Blob 对象 | 导出为 PDF 文档    |
| getVisibleTasks | `() => Task[]`                                 | 任务数组  | 获取当前可见的任务 |

## 📋 任务对象格式

```typescript
interface Task {
  id: number | string // 唯一标识符
  name: string // 任务显示名称
  start: Date | string // 开始日期
  end: Date | string // 结束日期
  progress?: number // 进度百分比 (0-100)
  type?: "task" | "milestone" | "project" // 任务类型
  color?: string // 任务条颜色
  dependsOn?: (number | string)[] // 依赖任务ID数组
  parentId?: number | string // 父任务ID (用于分组)
  assignee?: string // 任务负责人
  collapsed?: boolean // 子任务是否折叠 (适用于父任务)
  metadata?: any // 自定义元数据
}
```

## 🔧 高级用法

### 自定义样式

您可以通过以下方式自定义甘特图的样式：

1. **使用主题属性**

```jsx
const customTheme = {
  primary: "#1890ff",
  secondary: "#13c2c2",
  success: "#52c41a",
  warning: "#faad14",
  error: "#f5222d",
  textPrimary: "#000000d9",
  textSecondary: "#00000073",
  borderColor: "#d9d9d9",
  backgroundColor: "#ffffff",
  fontSize: "14px",
  fontFamily: "Arial, sans-serif",
}

;<GanttChartReact theme={customTheme} />
```

2. **使用 CSS 变量覆盖默认样式**

```css
:root {
  --gantt-primary-color: #1890ff;
  --gantt-secondary-color: #13c2c2;
  --gantt-row-height: 40px;
  --gantt-header-height: 50px;
  --gantt-border-color: #d9d9d9;
  --gantt-background-color: #ffffff;
  --gantt-task-color: #1890ff;
  --gantt-milestone-color: #722ed1;
  --gantt-project-color: #fa8c16;
  --gantt-dependency-line-color: #bfbfbf;
}
```

3. **使用 className 属性添加自定义类**

```jsx
<GanttChartReact className='custom-gantt' />
```

```css
.custom-gantt .gantt-task {
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-gantt .gantt-milestone {
  transform: rotate(45deg);
}
```

### 任务分组

通过设置 `parentId` 属性可以创建任务分组：

```javascript
const tasks = [
  {
    id: 1,
    name: "项目A",
    start: "2025-01-01",
    end: "2025-01-30",
    type: "project",
  },
  {
    id: 2,
    name: "需求分析",
    start: "2025-01-01",
    end: "2025-01-05",
    parentId: 1,
  },
  {
    id: 3,
    name: "系统设计",
    start: "2025-01-06",
    end: "2025-01-10",
    parentId: 1,
  },
  {
    id: 4,
    name: "开发阶段",
    start: "2025-01-11",
    end: "2025-01-25",
    parentId: 1,
  },
  {
    id: 5,
    name: "前端开发",
    start: "2025-01-11",
    end: "2025-01-18",
    parentId: 4,
  },
  {
    id: 6,
    name: "后端开发",
    start: "2025-01-11",
    end: "2025-01-20",
    parentId: 4,
  },
  { id: 7, name: "测试", start: "2025-01-21", end: "2025-01-25", parentId: 4 },
  {
    id: 8,
    name: "项目发布",
    start: "2025-01-30",
    end: "2025-01-30",
    type: "milestone",
    parentId: 1,
  },
]
```

### 依赖关系

通过设置 `dependsOn` 属性可以创建任务间的依赖关系：

```javascript
const tasks = [
  { id: 1, name: "任务1", start: "2025-01-01", end: "2025-01-05" },
  {
    id: 2,
    name: "任务2",
    start: "2025-01-06",
    end: "2025-01-10",
    dependsOn: [1],
  }, // 依赖任务1
  {
    id: 3,
    name: "任务3",
    start: "2025-01-11",
    end: "2025-01-15",
    dependsOn: [2],
  }, // 依赖任务2
  { id: 4, name: "任务4", start: "2025-01-06", end: "2025-01-10" },
  {
    id: 5,
    name: "任务5",
    start: "2025-01-11",
    end: "2025-01-20",
    dependsOn: [2, 4],
  }, // 同时依赖任务2和任务4
]
```

## ❓ 常见问题

### 任务无法拖拽？

确保 `allowTaskDrag` 属性设置为 `true`（默认值），并检查任务对象是否有只读属性：

```javascript
// 检查任务是否可拖拽
const task = {
  id: 1,
  name: "任务1",
  start: "2025-01-01",
  end: "2025-01-05",
  readonly: false, // 设置为true将禁止拖拽
}
```

### 如何实现自动布局？

```jsx
<GanttChartReact
  tasks={tasks}
  autoSchedule={true} // 启用自动布局
  respectDependencies={true} // 尊重依赖关系
  onAutoScheduleComplete={(newTasks) => console.log("自动布局完成", newTasks)}
/>
```

### 如何处理大量数据？

组件内置虚拟滚动支持，可有效处理大量任务数据。但是，您还可以实施以下优化：

```jsx
<GanttChartReact
  tasks={tasks}
  enableVirtualization={true} // 默认已启用
  bufferSize={10} // 可视区域外预渲染的行数
  batchSize={50} // 批量渲染的任务数
  optimizeRendering={true} // 启用渲染优化
/>
```

## 👥 贡献指南

我们欢迎任何形式的贡献，包括但不限于：

- 提交问题和功能请求
- 提交 Pull Requests
- 改进文档
- 编写教程和示例

贡献前请先查阅 [贡献指南](./CONTRIBUTING.md)。

## 📈 版本信息

- 当前版本: 1.1.0（发布日期: 2025-03-12）
- 详细更新记录请参阅 [CHANGELOG.md](./CHANGELOG.md)

## 📄 许可证

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

本项目采用 [MIT 许可证](./LICENSE)。

MIT 许可证是一种宽松的软件许可协议，允许用户自由地使用、修改、分发和私有化软件，无论是商业用途还是非商业用途，只要保留原始版权声明和许可声明。

### 主要条款

- 可自由使用、复制、修改、合并、出版发行、散布、再授权及贩售本软件
- 必须在软件的所有副本中包含上述版权声明和本许可声明
- 本软件按"原样"提供，不提供任何形式的保证

完整许可证文本请查看项目根目录下的 [LICENSE](./LICENSE) 文件。
