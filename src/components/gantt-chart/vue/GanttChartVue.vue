<template>
  <div 
    ref="ganttContainer" 
    class="gantt-chart-vue"
    :class="className"
    :style="computedStyle"
  ></div>
</template>

<script>
import GanttChartCore from '../core/GanttChartCore';
import '../styles/gantt-chart.css';

export default {
  name: 'GanttChartVue',
  props: {
    tasks: {
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
      validator: (value) => ['day', 'week', 'month'].includes(value)
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
    className: {
      type: String,
      default: ''
    },
    style: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      ganttChart: null
    };
  },
  computed: {
    computedStyle() {
      return {
        width: '100%',
        height: '100%',
        ...this.style
      };
    }
  },
  mounted() {
    this.initGanttChart();
  },
  methods: {
    initGanttChart() {
      if (this.$refs.ganttContainer) {
        this.ganttChart = new GanttChartCore({
          tasks: this.tasks,
          startDate: this.startDate,
          endDate: this.endDate,
          viewMode: this.viewMode,
          columnWidth: this.columnWidth,
          rowHeight: this.rowHeight,
          headerHeight: this.headerHeight,
          onTaskClick: this.handleTaskClick,
          onTaskDrag: this.handleTaskDrag
        });
        
        this.ganttChart.render(this.$refs.ganttContainer);
      }
    },
    handleTaskClick(task, event) {
      this.$emit('task-click', task, event);
    },
    handleTaskDrag(task, event) {
      this.$emit('task-drag', task, event);
    }
  },
  watch: {
    tasks: {
      handler(newTasks) {
        if (this.ganttChart) {
          this.ganttChart.updateTasks(newTasks);
        }
      },
      deep: true
    },
    startDate(val) {
      if (this.ganttChart) {
        this.ganttChart.updateOptions({ startDate: val });
      }
    },
    endDate(val) {
      if (this.ganttChart) {
        this.ganttChart.updateOptions({ endDate: val });
      }
    },
    viewMode(val) {
      if (this.ganttChart) {
        this.ganttChart.updateOptions({ viewMode: val });
      }
    },
    columnWidth(val) {
      if (this.ganttChart) {
        this.ganttChart.updateOptions({ columnWidth: val });
      }
    },
    rowHeight(val) {
      if (this.ganttChart) {
        this.ganttChart.updateOptions({ rowHeight: val });
      }
    },
    headerHeight(val) {
      if (this.ganttChart) {
        this.ganttChart.updateOptions({ headerHeight: val });
      }
    }
  },
  beforeDestroy() {
    // 清理资源
    this.ganttChart = null;
  }
};
</script>

<style scoped>
.gantt-chart-vue {
  position: relative;
}
</style> 