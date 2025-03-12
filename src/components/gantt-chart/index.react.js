/**
 * 甘特图React组件库入口
 */
import GanttChartCore from './core/GanttChartCore';

// React组件
import GanttChartReact from './react/GanttChartReact';

// 类型定义
import * as Types from './core/types';

// 工具函数
import * as Utils from './core/utils';

// 兼容性检测
import { 
  isCompatible, 
  getCompatibilityDetails, 
  checkBrowserCompatibility,
  RECOMMENDED_BROWSERS
} from './utils/browserCompat';

// 导出组件和类型
export {
  GanttChartCore,
  GanttChartReact,
  Types,
  Utils,
  // 兼容性工具
  isCompatible,
  getCompatibilityDetails,
  checkBrowserCompatibility,
  RECOMMENDED_BROWSERS
};

// 默认导出
export default {
  GanttChartCore,
  GanttChartReact
}; 