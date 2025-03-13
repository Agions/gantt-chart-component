<!-- GanttChart.vue -->
<template>
  <div ref="chartContainer" class="gantt-chart-wrapper">
    <gantt-chart-component
      ref="ganttChart"
      :data="stringifiedData"
      :options="stringifiedOptions"
      @task-click="handleTaskClick"
      @task-update="handleTaskUpdate"
      @dependency-create="handleDependencyCreate"
    ></gantt-chart-component>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, watch, ref } from 'vue';
import '../core/GanttChartComponent';
import type { GanttChartData, GanttChartOptions, Task, Dependency } from '../core/GanttChartComponent';

export default defineComponent({
  name: 'VueGanttChart',
  
  props: {
    data: {
      type: Object as () => GanttChartData,
      required: true
    },
    options: {
      type: Object as () => GanttChartOptions,
      default: () => ({})
    }
  },

  emits: ['taskClick', 'taskUpdate', 'dependencyCreate'],

  setup(props, { emit, expose }) {
    const ganttChart = ref<HTMLElement | null>(null);
    
    // 将数据转换为字符串以传递给 Web Component
    const stringifiedData = computed(() => JSON.stringify(props.data));
    const stringifiedOptions = computed(() => JSON.stringify(props.options));

    // 事件处理
    const handleTaskClick = (event: CustomEvent) => {
      emit('taskClick', event.detail);
    };

    const handleTaskUpdate = (event: CustomEvent) => {
      emit('taskUpdate', event.detail);
    };

    const handleDependencyCreate = (event: CustomEvent) => {
      emit('dependencyCreate', event.detail);
    };

    // 监听属性变化
    watch(() => props.data, (newData) => {
      if (ganttChart.value) {
        (ganttChart.value as any).updateData(newData);
      }
    }, { deep: true });

    watch(() => props.options, (newOptions) => {
      if (ganttChart.value) {
        (ganttChart.value as any).updateOptions(newOptions);
      }
    }, { deep: true });

    // 导出方法
    const exportToPNG = async (): Promise<string> => {
      if (!ganttChart.value) {
        throw new Error('甘特图组件未初始化');
      }
      return (ganttChart.value as any).exportToPNG();
    };

    const exportToPDF = async (): Promise<string> => {
      if (!ganttChart.value) {
        throw new Error('甘特图组件未初始化');
      }
      return (ganttChart.value as any).exportToPDF();
    };

    const enterFullscreen = (): void => {
      if (!ganttChart.value) {
        throw new Error('甘特图组件未初始化');
      }
      (ganttChart.value as any).enterFullscreen();
    };

    // 暴露方法给父组件
    expose({
      exportToPNG,
      exportToPDF,
      enterFullscreen
    });

    return {
      ganttChart,
      stringifiedData,
      stringifiedOptions,
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

<style scoped>
.gantt-chart-wrapper {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style> 