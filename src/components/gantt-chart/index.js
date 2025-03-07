/**
 * 甘特图组件库主入口
 */
import GanttChartReact from './react/GanttChartReact';
import GanttChartCore from './core/GanttChartCore';

// Vue组件需要在Vue项目中引入
// Vue不能直接导出，因为Vue组件需要在Vue环境中使用
// import GanttChartVue from './vue/GanttChartVue.vue';

export {
  GanttChartReact,
  GanttChartCore,
  // GanttChartVue
};

// 默认导出React版本
export default GanttChartReact; 