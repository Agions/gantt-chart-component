<template>
  <div 
    ref="ganttContainer" 
    class="gantt-chart-vue"
    :class="className"
    :style="computedStyle"
  ></div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, PropType, watch } from 'vue';
import GanttChartCore from '../core/GanttChartCore';
import { Task, ViewMode, Resource, Dependency, GanttChartOptions } from '../core/types';
import '../styles/gantt-chart.css';

export default defineComponent({
  name: 'GanttChartVue',
  props: {
    tasks: {
      type: Array as PropType<Task[]>,
      default: () => []
    },
    resources: {
      type: Array as PropType<Resource[]>,
      default: () => []
    },
    dependencies: {
      type: Array as PropType<Dependency[]>,
      default: () => []
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    viewMode: {
      type: String as PropType<ViewMode>,
      default: 'day',
      validator: (value: string) => ['day', 'week', 'month', 'quarter', 'year'].includes(value)
    },
    columnWidth: {
      type: Number,
      default: 40
    },
    rowHeight: {
      type: Number,
      default: 40
    },
    headerHeight: {
      type: Number,
      default: 50
    },
    enableDependencies: {
      type: Boolean,
      default: false
    },
    enableResources: {
      type: Boolean,
      default: false
    },
    enableDragging: {
      type: Boolean,
      default: true
    },
    enableResizing: {
      type: Boolean,
      default: true
    },
    enableProgress: {
      type: Boolean,
      default: true
    },
    enableGrouping: {
      type: Boolean,
      default: false
    },
    showWeekends: {
      type: Boolean,
      default: true
    },
    showToday: {
      type: Boolean,
      default: true
    },
    showRowLines: {
      type: Boolean,
      default: true
    },
    showColumnLines: {
      type: Boolean,
      default: true
    },
    showResourceView: {
      type: Boolean,
      default: false
    },
    virtualScrolling: {
      type: Boolean,
      default: false
    },
    visibleTaskCount: {
      type: Number,
      default: 50
    },
    bufferSize: {
      type: Number,
      default: 10
    },
    className: {
      type: String,
      default: ''
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: () => ({})
    }
  },
  
  emits: [
    'taskClick', 
    'taskDrag', 
    'taskDoubleClick',
    'dateChange',
    'progressChange',
    'viewChange',
    'taskToggle'
  ],
  
  setup(props, { emit }) {
    const ganttContainer = ref<HTMLElement | null>(null);
    const ganttChart = ref<GanttChartCore | null>(null);
    
    const computedStyle = computed(() => ({
      width: '100%',
      height: '100%',
      overflow: 'auto',
      ...props.style
    }));
    
    // 创建甘特图选项对象
    const createChartOptions = (): GanttChartOptions => ({
      tasks: props.tasks,
      resources: props.resources,
      dependencies: props.dependencies,
      startDate: props.startDate,
      endDate: props.endDate,
      viewMode: props.viewMode,
      columnWidth: props.columnWidth,
      rowHeight: props.rowHeight,
      headerHeight: props.headerHeight,
      onTaskClick: (task: Task, event: MouseEvent) => {
        emit('taskClick', task, event);
      },
      onTaskDrag: (task: Task, event: MouseEvent, newStart: Date, newEnd: Date) => {
        emit('taskDrag', task, event, newStart, newEnd);
      },
      onTaskDoubleClick: (task: Task, event: MouseEvent) => {
        emit('taskDoubleClick', task, event);
      },
      onDateChange: (startDate: Date, endDate: Date) => {
        emit('dateChange', startDate, endDate);
      },
      onProgressChange: (task: Task, progress: number) => {
        emit('progressChange', task, progress);
      },
      onViewChange: (viewMode: ViewMode) => {
        emit('viewChange', viewMode);
      },
      onTaskToggle: (task: Task, collapsed: boolean) => {
        emit('taskToggle', task, collapsed);
      },
      enableDependencies: props.enableDependencies,
      enableResources: props.enableResources,
      enableDragging: props.enableDragging,
      enableResizing: props.enableResizing,
      enableProgress: props.enableProgress,
      enableGrouping: props.enableGrouping,
      showWeekends: props.showWeekends,
      showToday: props.showToday,
      showRowLines: props.showRowLines,
      showColumnLines: props.showColumnLines,
      showResourceView: props.showResourceView,
      virtualScrolling: props.virtualScrolling,
      visibleTaskCount: props.visibleTaskCount,
      bufferSize: props.bufferSize
    });
    
    // 初始化甘特图
    onMounted(() => {
      if (ganttContainer.value) {
        ganttChart.value = new GanttChartCore(createChartOptions());
        ganttChart.value.render(ganttContainer.value);
      }
    });
    
    // 当属性变化时更新甘特图
    watch(
      () => [
        props.tasks,
        props.resources, 
        props.dependencies,
        props.viewMode,
        props.columnWidth,
        props.rowHeight,
        props.enableDragging,
        props.enableResizing,
        props.enableProgress,
        props.showWeekends,
        props.showToday
      ],
      () => {
        if (ganttChart.value) {
          ganttChart.value.updateOptions(createChartOptions());
        }
      },
      { deep: true }
    );
    
    // 组件销毁时清理
    onUnmounted(() => {
      if (ganttContainer.value) {
        ganttContainer.value.innerHTML = '';
      }
    });
    
    return {
      ganttContainer,
      computedStyle
    };
  }
});
</script>

<style scoped>
.gantt-chart-vue {
  display: block;
  position: relative;
}
</style>