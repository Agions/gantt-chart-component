/**
 * Vue组件入口文件
 * 由于Rollup配置问题，我们需要一个JS文件来导出Vue组件
 */
// 手动创建组件对象而不是导入.vue文件
import GanttChartCore from '../core/GanttChartCore';
import { ref, defineComponent, onMounted, onUnmounted, computed, watch } from 'vue';
import '../styles/gantt-chart.css';

// 创建Vue组件
const GanttChartVue = defineComponent({
  name: 'GanttChartVue',
  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    resources: {
      type: Array,
      default: () => []
    },
    dependencies: {
      type: Array,
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
      type: String,
      default: 'day',
      validator: (value) => ['day', 'week', 'month', 'quarter', 'year'].includes(value)
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
    const ganttContainer = ref(null);
    const ganttChart = ref(null);
    
    const computedStyle = computed(() => ({
      width: '100%',
      height: '100%',
      overflow: 'auto'
    }));
    
    // 创建甘特图选项对象
    const createChartOptions = () => ({
      tasks: props.tasks,
      resources: props.resources,
      dependencies: props.dependencies,
      startDate: props.startDate,
      endDate: props.endDate,
      viewMode: props.viewMode,
      columnWidth: props.columnWidth,
      rowHeight: props.rowHeight,
      headerHeight: props.headerHeight,
      onTaskClick: (task, event) => {
        emit('taskClick', task, event);
      },
      onTaskDrag: (task, event, newStart, newEnd) => {
        emit('taskDrag', task, event, newStart, newEnd);
      },
      onTaskDoubleClick: (task, event) => {
        emit('taskDoubleClick', task, event);
      }
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
        props.rowHeight
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
  },
  // 定义模板
  template: `
    <div 
      ref="ganttContainer" 
      class="gantt-chart-vue"
      :style="computedStyle"
    ></div>
  `
});

export default GanttChartVue; 