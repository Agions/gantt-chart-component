# 甘特图组件

这是一个同时支持React和Vue的甘特图组件，可用于项目管理和任务进度展示。

## 功能特点

- 支持React和Vue框架
- 自定义视图模式（日、周、月）
- 可定制样式和颜色
- 支持任务点击事件
- 响应式设计

## 安装

```bash
# 如果您使用npm
npm install --save gantt-chart-component

# 如果您使用yarn
yarn add gantt-chart-component
```

## 使用方法

### React中使用

```jsx
import React from 'react';
import { GanttChartReact } from '../components/gantt-chart';
// 或者直接导入
// import GanttChartReact from '../components/gantt-chart';

const tasks = [
  {
    id: 1,
    name: '项目规划',
    start: '2023-05-01',
    end: '2023-05-10',
    color: '#4e85c5'
  },
  {
    id: 2,
    name: '需求分析',
    start: '2023-05-11',
    end: '2023-05-20',
    color: '#de5454'
  },
  {
    id: 3,
    name: '设计阶段',
    start: '2023-05-21',
    end: '2023-06-10',
    color: '#f2bd53'
  }
];

function App() {
  const handleTaskClick = (task) => {
    console.log('点击了任务:', task);
  };

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <GanttChartReact
        tasks={tasks}
        startDate={new Date('2023-05-01')}
        endDate={new Date('2023-06-15')}
        viewMode="day"
        onTaskClick={handleTaskClick}
      />
    </div>
  );
}

export default App;
```

### Vue中使用

```vue
<template>
  <div style="height: 500px; width: 100%;">
    <GanttChartVue
      :tasks="tasks"
      :startDate="startDate"
      :endDate="endDate"
      viewMode="day"
      @task-click="handleTaskClick"
    />
  </div>
</template>

<script>
import { GanttChartVue } from '../components/gantt-chart/vue/GanttChartVue.vue';

export default {
  components: {
    GanttChartVue
  },
  data() {
    return {
      tasks: [
        {
          id: 1,
          name: '项目规划',
          start: '2023-05-01',
          end: '2023-05-10',
          color: '#4e85c5'
        },
        {
          id: 2,
          name: '需求分析',
          start: '2023-05-11',
          end: '2023-05-20',
          color: '#de5454'
        },
        {
          id: 3,
          name: '设计阶段',
          start: '2023-05-21',
          end: '2023-06-10',
          color: '#f2bd53'
        }
      ],
      startDate: new Date('2023-05-01'),
      endDate: new Date('2023-06-15')
    };
  },
  methods: {
    handleTaskClick(task) {
      console.log('点击了任务:', task);
    }
  }
};
</script>
```

## 属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| tasks | Array | [] | 任务数据数组 |
| startDate | Date | 当前日期 | 甘特图开始日期 |
| endDate | Date | 自动计算 | 甘特图结束日期 |
| viewMode | String | 'day' | 视图模式，可选 'day', 'week', 'month' |
| columnWidth | Number | 40 | 列宽（像素） |
| rowHeight | Number | 40 | 行高（像素） |
| headerHeight | Number | 50 | 表头高度（像素） |
| onTaskClick/(@task-click) | Function | - | 任务点击事件回调 |
| onTaskDrag/(@task-drag) | Function | - | 任务拖拽事件回调 |
| className | String | '' | 自定义CSS类名 |
| style | Object | {} | 自定义内联样式 |

## 任务对象格式

```javascript
{
  id: 1,              // 唯一标识符
  name: '任务名称',    // 任务显示名称
  start: '2023-05-01', // 开始日期（字符串或Date对象）
  end: '2023-05-10',   // 结束日期（字符串或Date对象）
  color: '#4e85c5'     // 任务条颜色（可选）
}
```

## 自定义样式

您可以通过修改 `gantt-chart.css` 文件来自定义甘特图的样式，或者在使用组件时通过 `className` 和 `style` 属性添加自定义样式。 