// MobileOptimizer.ts
interface MobileConfig {
  enableLowPowerMode?: boolean;
  maxVisibleTasks?: number;
  throttleInterval?: number;
  enableGestures?: boolean;
}

interface BatteryManager {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

interface NavigatorWithBattery extends Navigator {
  getBattery(): Promise<BatteryManager>;
}

export class MobileOptimizer {
  private readonly config: Required<MobileConfig>;
  private isLowPowerMode: boolean = false;
  private lastRenderTime: number = 0;
  private renderQueue: (() => void)[] = [];
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private isScrolling: boolean = false;
  
  constructor(config: MobileConfig = {}) {
    this.config = {
      enableLowPowerMode: config.enableLowPowerMode ?? true,
      maxVisibleTasks: config.maxVisibleTasks ?? 30,
      throttleInterval: config.throttleInterval ?? 100,
      enableGestures: config.enableGestures ?? true
    };
    
    // 监听电池状态
    if ('getBattery' in navigator) {
      (navigator as NavigatorWithBattery).getBattery().then((battery: BatteryManager) => {
        this.handleBatteryChange(battery);
        battery.addEventListener('levelchange', () => this.handleBatteryChange(battery));
        battery.addEventListener('chargingchange', () => this.handleBatteryChange(battery));
      });
    }
  }
  
  // 处理电池状态变化
  private handleBatteryChange(battery: BatteryManager): void {
    if (this.config.enableLowPowerMode) {
      this.isLowPowerMode = battery.level <= 0.2 && !battery.charging;
    }
  }
  
  // 优化渲染性能
  optimizeRendering(renderFn: () => void): void {
    if (this.isLowPowerMode) {
      // 在低电量模式下，限制渲染频率
      const now = Date.now();
      if (now - this.lastRenderTime < this.config.throttleInterval) {
        this.renderQueue.push(renderFn);
        return;
      }
      this.lastRenderTime = now;
    }
    
    requestAnimationFrame(() => {
      renderFn();
      // 处理渲染队列
      if (this.renderQueue.length > 0) {
        const nextRender = this.renderQueue.shift();
        if (nextRender) {
          this.optimizeRendering(nextRender);
        }
      }
    });
  }
  
  // 优化滚动性能
  setupScrollOptimization(element: HTMLElement): void {
    if (!element) return;
    
    // 使用Passive事件监听器提高滚动性能
    element.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    
    if (this.config.enableGestures) {
      this.setupTouchHandlers(element);
    }
  }
  
  // 处理滚动事件
  private handleScroll(event: Event): void {
    if (this.isLowPowerMode) {
      // 在低电量模式下减少滚动事件的处理频率
      if (this.isScrolling) return;
      this.isScrolling = true;
      setTimeout(() => {
        this.isScrolling = false;
      }, this.config.throttleInterval);
    }
  }
  
  // 设置触摸事件处理
  private setupTouchHandlers(element: HTMLElement): void {
    element.addEventListener('touchstart', (e: TouchEvent) => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    element.addEventListener('touchmove', (e: TouchEvent) => {
      if (!this.touchStartX || !this.touchStartY) return;
      
      const deltaX = e.touches[0].clientX - this.touchStartX;
      const deltaY = e.touches[0].clientY - this.touchStartY;
      
      // 判断滑动方向，优化滚动体验
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // 垂直滚动
        e.preventDefault();
        element.scrollTop += deltaY;
      }
    }, { passive: false });
    
    element.addEventListener('touchend', () => {
      this.touchStartX = 0;
      this.touchStartY = 0;
    }, { passive: true });
  }
  
  // 获取当前设备的最佳任务显示数量
  getOptimalTaskCount(): number {
    if (this.isLowPowerMode) {
      return Math.min(this.config.maxVisibleTasks, 20);
    }
    return this.config.maxVisibleTasks;
  }
  
  // 优化图像渲染
  optimizeImages(element: HTMLElement): void {
    const images = element.getElementsByTagName('img');
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (this.isLowPowerMode) {
        // 在低电量模式下降低图片质量
        img.style.imageRendering = 'optimizeSpeed';
      } else {
        img.style.imageRendering = 'auto';
      }
    }
  }
  
  // 优化动画效果
  optimizeAnimations(element: HTMLElement): void {
    if (this.isLowPowerMode) {
      element.style.setProperty('--animation-duration', '0.3s');
      element.style.setProperty('--transition-duration', '0.3s');
    } else {
      element.style.setProperty('--animation-duration', '0.2s');
      element.style.setProperty('--transition-duration', '0.2s');
    }
  }
  
  // 检查是否为移动设备
  isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  // 获取当前优化状态
  getOptimizationStatus(): {
    isLowPowerMode: boolean;
    isMobile: boolean;
    maxVisibleTasks: number;
  } {
    return {
      isLowPowerMode: this.isLowPowerMode,
      isMobile: this.isMobileDevice(),
      maxVisibleTasks: this.getOptimalTaskCount()
    };
  }
} 