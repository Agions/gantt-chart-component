# 甘特图组件 (gantt-chart-component) 使用示例

本文档展示了如何在 Vue 和 React 框架中使用固定命名为 `gantt-chart-component` 的甘特图组件。

## 基本信息

组件名称: `gantt-chart-component`
技术实现: Web Components
兼容框架: Vue、React

## Vue 使用示例

```vue
<template>
  <div class="gantt-container" style="height: 600px;">
    <!-- 使用Vue包装组件 -->
    <vue-gantt-chart
      ref="ganttChart"
      :data="chartData"
      :options="chartOptions"
      @taskClick="handleTaskClick"
      @taskUpdate="handleTaskUpdate"
      @dependencyCreate="handleDependencyCreate"
    />
    
    <!-- 导出按钮 -->
    <div class="export-buttons">
      <button @click="exportToPNG">导出为PNG</button>
      <button @click="exportToPDF">导出为PDF</button>
      <button @click="enterFullscreen">全屏显示</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { VueGanttChart } from '@/components/gantt-chart/vue/GanttChart.vue';
import type { Task, Dependency } from '@/components/gantt-chart/core/GanttChartComponent';

export default defineComponent({
  components: {
    VueGanttChart
  },
  
  setup() {
    const ganttChart = ref(null);
    
    // 甘特图数据
    const chartData = ref({
      tasks: [
        {
          id: 1,
          name: '需求分析',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-03-10'),
          progress: 100
        },
        {
          id: 2,
          name: '设计阶段',
          startDate: new Date('2024-03-11'),
          endDate: new Date('2024-03-20'),
          progress: 80
        },
        {
          id: 3,
          name: '开发阶段',
          startDate: new Date('2024-03-21'),
          endDate: new Date('2024-04-10'),
          progress: 30
        }
      ],
      dependencies: [
        {
          id: 1,
          predecessorId: 1,
          successorId: 2,
          type: 'FS'
        },
        {
          id: 2,
          predecessorId: 2,
          successorId: 3,
          type: 'FS'
        }
      ]
    });
    
    // 甘特图配置
    const chartOptions = ref({
      viewMode: 'week',
      allowTaskDrag: true,
      allowTaskResize: true,
      enableDependencies: true,
      showProgress: true,
      theme: {
        primary: '#4361ee',
        secondary: '#7209b7',
        success: '#2ecc71',
        warning: '#ff9f1c',
        error: '#e63946'
      }
    });
    
    // 事件处理
    const handleTaskClick = (task: Task) => {
      console.log('任务点击:', task);
    };
    
    const handleTaskUpdate = (task: Task) => {
      console.log('任务更新:', task);
    };
    
    const handleDependencyCreate = (dependency: Dependency) => {
      console.log('创建依赖关系:', dependency);
    };
    
    // 导出方法
    const exportToPNG = () => {
      if (ganttChart.value) {
        ganttChart.value.exportToPNG({
          fileName: '甘特图',
          includeHeader: true,
          headerText: '项目甘特图'
        });
      }
    };
    
    const exportToPDF = () => {
      if (ganttChart.value) {
        ganttChart.value.exportToPDF({
          fileName: '甘特图',
          includeHeader: true,
          headerText: '项目甘特图',
          orientation: 'landscape'
        });
      }
    };
    
    const enterFullscreen = () => {
      if (ganttChart.value) {
        ganttChart.value.enterFullscreen();
      }
    };
    
    return {
      ganttChart,
      chartData,
      chartOptions,
      handleTaskClick,
      handleTaskUpdate,
      handleDependencyCreate,
      exportToPNG,
      exportToPDF,
      enterFullscreen
    };
  }
});
</script>
```

## React 使用示例

```tsx
import React, { useRef, useState } from 'react';
import { GanttChart } from '@/components/gantt-chart/react/GanttChart';
import type { GanttChartRef, Task, Dependency } from '@/components/gantt-chart/react/GanttChart';

const GanttChartExample: React.FC = () => {
  const ganttRef = useRef<GanttChartRef>(null);
  
  // 甘特图数据
  const [chartData, setChartData] = useState({
    tasks: [
      {
        id: 1,
        name: '需求分析',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-10'),
        progress: 100
      },
      {
        id: 2,
        name: '设计阶段',
        startDate: new Date('2024-03-11'),
        endDate: new Date('2024-03-20'),
        progress: 80
      },
      {
        id: 3,
        name: '开发阶段',
        startDate: new Date('2024-03-21'),
        endDate: new Date('2024-04-10'),
        progress: 30
      }
    ],
    dependencies: [
      {
        id: 1,
        predecessorId: 1,
        successorId: 2,
        type: 'FS'
      },
      {
        id: 2,
        predecessorId: 2,
        successorId: 3,
        type: 'FS'
      }
    ]
  });
  
  // 甘特图配置
  const chartOptions = {
    viewMode: 'week',
    allowTaskDrag: true,
    allowTaskResize: true,
    enableDependencies: true,
    showProgress: true,
    theme: {
      primary: '#4361ee',
      secondary: '#7209b7',
      success: '#2ecc71',
      warning: '#ff9f1c',
      error: '#e63946'
    }
  };
  
  // 事件处理
  const handleTaskClick = (task: Task) => {
    console.log('任务点击:', task);
  };
  
  const handleTaskUpdate = (task: Task) => {
    console.log('任务更新:', task);
    // 更新任务
    setChartData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === task.id ? task : t)
    }));
  };
  
  const handleDependencyCreate = (dependency: Dependency) => {
    console.log('创建依赖关系:', dependency);
    // 添加依赖关系
    setChartData(prev => ({
      ...prev,
      dependencies: [...prev.dependencies, dependency]
    }));
  };
  
  // 导出方法
  const exportToPNG = () => {
    if (ganttRef.current) {
      ganttRef.current.exportToPNG();
    }
  };
  
  const exportToPDF = () => {
    if (ganttRef.current) {
      ganttRef.current.exportToPDF();
    }
  };
  
  const enterFullscreen = () => {
    if (ganttRef.current) {
      ganttRef.current.enterFullscreen();
    }
  };
  
  return (
    <div className="gantt-container" style={{ height: '600px' }}>
      {/* 使用React包装组件 */}
      <GanttChart
        ref={ganttRef}
        data={chartData}
        options={chartOptions}
        onTaskClick={handleTaskClick}
        onTaskUpdate={handleTaskUpdate}
        onDependencyCreate={handleDependencyCreate}
      />
      
      {/* 导出按钮 */}
      <div className="export-buttons">
        <button onClick={exportToPNG}>导出为PNG</button>
        <button onClick={exportToPDF}>导出为PDF</button>
        <button onClick={enterFullscreen}>全屏显示</button>
      </div>
    </div>
  );
};

export default GanttChartExample;
```

## 直接使用 Web Component

如果您需要直接使用原生 Web Component，可以这样使用：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>甘特图组件示例</title>
  <script src="path/to/gantt-chart-component.js"></script>
  <style>
    .gantt-container {
      height: 600px;
      width: 100%;
    }
  </style>
</head>
<body>
  <h1>甘特图组件示例</h1>
  
  <div class="gantt-container">
    <gantt-chart-component id="ganttChart"></gantt-chart-component>
  </div>
  
  <div class="export-buttons">
    <button id="exportPng">导出为PNG</button>
    <button id="exportPdf">导出为PDF</button>
    <button id="fullscreen">全屏显示</button>
  </div>
  
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const ganttChart = document.getElementById('ganttChart');
      
      // 设置数据
      const data = {
        tasks: [
          {
            id: 1,
            name: '需求分析',
            startDate: new Date('2024-03-01'),
            endDate: new Date('2024-03-10'),
            progress: 100
          },
          {
            id: 2,
            name: '设计阶段',
            startDate: new Date('2024-03-11'),
            endDate: new Date('2024-03-20'),
            progress: 80
          },
          {
            id: 3,
            name: '开发阶段',
            startDate: new Date('2024-03-21'),
            endDate: new Date('2024-04-10'),
            progress: 30
          }
        ],
        dependencies: [
          {
            id: 1,
            predecessorId: 1,
            successorId: 2,
            type: 'FS'
          },
          {
            id: 2,
            predecessorId: 2,
            successorId: 3,
            type: 'FS'
          }
        ]
      };
      
      // 设置选项
      const options = {
        viewMode: 'week',
        allowTaskDrag: true,
        allowTaskResize: true,
        enableDependencies: true,
        showProgress: true,
        theme: {
          primary: '#4361ee',
          secondary: '#7209b7',
          success: '#2ecc71',
          warning: '#ff9f1c',
          error: '#e63946'
        }
      };
      
      // 更新甘特图
      ganttChart.setAttribute('data', JSON.stringify(data));
      ganttChart.setAttribute('options', JSON.stringify(options));
      
      // 绑定事件
      ganttChart.addEventListener('task-click', (e) => {
        console.log('任务点击:', e.detail);
      });
      
      // 导出按钮事件
      document.getElementById('exportPng').addEventListener('click', () => {
        ganttChart.exportToPNG();
      });
      
      document.getElementById('exportPdf').addEventListener('click', () => {
        ganttChart.exportToPDF();
      });
      
      document.getElementById('fullscreen').addEventListener('click', () => {
        ganttChart.enterFullscreen();
      });
    });
  </script>
</body>
</html>
```

## 注意事项

1. 确保导入路径正确指向您项目中的组件位置
2. 组件名称现在固定为 `gantt-chart-component`
3. 在 Vue 和 React 中，通过相应的包装组件使用
4. 组件提供导出 PNG、PDF 和全屏显示功能 