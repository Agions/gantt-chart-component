import { ThemeConfig } from '../themes';

interface DensityConfig {
  minRowHeight: number;
  maxRowHeight: number;
  minTaskPadding: number;
  maxTaskPadding: number;
  breakpoints: {
    compact: number;
    normal: number;
    comfortable: number;
  };
}

export class DensityManager {
  private readonly config: DensityConfig;
  private readonly theme: ThemeConfig;
  
  constructor(theme: ThemeConfig) {
    this.theme = theme;
    this.config = {
      minRowHeight: 24,
      maxRowHeight: 64,
      minTaskPadding: 4,
      maxTaskPadding: 24,
      breakpoints: {
        compact: 50,     // 任务数量大于50时使用紧凑布局
        normal: 20,      // 任务数量大于20时使用普通布局
        comfortable: 0   // 任务数量小于20时使用舒适布局
      }
    };
  }
  
  // 根据任务数量计算最佳密度
  calculateOptimalDensity(taskCount: number): {
    rowHeight: number;
    taskPadding: number;
    fontSize: string;
  } {
    let density: 'compact' | 'normal' | 'comfortable';
    
    if (taskCount >= this.config.breakpoints.compact) {
      density = 'compact';
    } else if (taskCount >= this.config.breakpoints.normal) {
      density = 'normal';
    } else {
      density = 'comfortable';
    }
    
    return this.getDensitySettings(density);
  }
  
  // 获取不同密度的设置
  private getDensitySettings(density: 'compact' | 'normal' | 'comfortable') {
    switch (density) {
      case 'compact':
        return {
          rowHeight: this.config.minRowHeight,
          taskPadding: this.config.minTaskPadding,
          fontSize: this.theme.typography.fontSize.small
        };
        
      case 'normal':
        return {
          rowHeight: this.theme.spacing.rowHeight,
          taskPadding: this.theme.spacing.taskPadding,
          fontSize: this.theme.typography.fontSize.medium
        };
        
      case 'comfortable':
        return {
          rowHeight: this.config.maxRowHeight,
          taskPadding: this.config.maxTaskPadding,
          fontSize: this.theme.typography.fontSize.large
        };
    }
  }
  
  // 计算容器高度
  calculateContainerHeight(taskCount: number, containerWidth: number): number {
    const { rowHeight } = this.calculateOptimalDensity(taskCount);
    return taskCount * rowHeight;
  }
  
  // 计算最佳列宽
  calculateOptimalColumnWidth(containerWidth: number, dateRange: number): number {
    const minColumnWidth = 20;
    const maxColumnWidth = 100;
    const optimalWidth = Math.floor(containerWidth / dateRange);
    
    return Math.min(Math.max(optimalWidth, minColumnWidth), maxColumnWidth);
  }
  
  // 获取当前视图的布局配置
  getLayoutConfig(taskCount: number, containerWidth: number, dateRange: number) {
    const density = this.calculateOptimalDensity(taskCount);
    const columnWidth = this.calculateOptimalColumnWidth(containerWidth, dateRange);
    const containerHeight = this.calculateContainerHeight(taskCount, containerWidth);
    
    return {
      ...density,
      columnWidth,
      containerHeight,
      headerHeight: this.theme.spacing.headerHeight
    };
  }
  
  // 更新主题配置
  updateTheme(newTheme: ThemeConfig) {
    Object.assign(this.theme, newTheme);
  }
} 