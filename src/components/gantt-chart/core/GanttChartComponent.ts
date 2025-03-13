class GanttChartElement extends HTMLElement {
  private wrapper: HTMLElement | null = null;
  private _data: any = {};
  private _options: any = {};

  static get observedAttributes() {
    return ['data', 'options'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      switch (name) {
        case 'data':
          this._data = JSON.parse(newValue);
          break;
        case 'options':
          this._options = JSON.parse(newValue);
          break;
      }
      this.render();
    }
  }

  private render() {
    if (!this.shadowRoot) return;

    // 注入样式
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .gantt-chart-container {
        width: 100%;
        height: 100%;
        overflow: auto;
      }
    `;
    
    // 创建容器
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'gantt-chart-container';
    
    // 清空 shadowRoot
    while (this.shadowRoot.firstChild) {
      this.shadowRoot.removeChild(this.shadowRoot.firstChild);
    }
    
    // 添加新的内容
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(this.wrapper);
    
    // 初始化甘特图
    this.initGanttChart();
  }

  private initGanttChart() {
    if (!this.wrapper) return;
    
    // 这里实现甘特图的核心渲染逻辑
    // 可以使用原生 JavaScript 或引入第三方库
  }

  // 公共 API
  public updateData(data: any) {
    this._data = data;
    this.render();
  }

  public updateOptions(options: any) {
    this._options = options;
    this.render();
  }

  // 导出功能
  public exportToPNG(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.wrapper) {
          reject(new Error('甘特图容器不存在'));
          return;
        }

        // 使用 html2canvas 库将甘特图转换为图像
        import('html2canvas').then((html2canvas) => {
          html2canvas.default(this.wrapper as HTMLElement, {
            allowTaint: true,
            useCORS: true,
            scale: 2, // 提高导出图像质量
            backgroundColor: null,
            logging: false
          }).then(canvas => {
            // 转换为 PNG 数据 URL
            const dataURL = canvas.toDataURL('image/png');
            
            // 触发下载
            this.downloadFile(dataURL, '甘特图.png');
            
            // 返回数据 URL
            resolve(dataURL);
          }).catch(error => {
            reject(error);
          });
        }).catch(error => {
          reject(new Error('加载导出库失败：' + error.message));
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public exportToPDF(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.wrapper) {
          reject(new Error('甘特图容器不存在'));
          return;
        }

        // 使用 html2canvas 和 jspdf 库
        Promise.all([
          import('html2canvas'),
          import('jspdf')
        ]).then(([html2canvas, jspdf]) => {
          html2canvas.default(this.wrapper as HTMLElement, {
            allowTaint: true,
            useCORS: true,
            scale: 2,
            backgroundColor: null,
            logging: false
          }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({
              orientation: 'landscape',
              unit: 'mm'
            });
            
            // 计算页面比例
            const imgWidth = 280; // A4 宽度 - 边距
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            
            // 保存 PDF
            const pdfOutput = pdf.output('datauristring');
            this.downloadFile(pdfOutput, '甘特图.pdf');
            
            resolve(pdfOutput);
          }).catch(error => {
            reject(error);
          });
        }).catch(error => {
          reject(new Error('加载导出库失败：' + error.message));
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public enterFullscreen(): void {
    if (!this.wrapper) return;
    
    try {
      if (this.wrapper.requestFullscreen) {
        this.wrapper.requestFullscreen();
      } else if ((this.wrapper as any).webkitRequestFullscreen) {
        (this.wrapper as any).webkitRequestFullscreen();
      } else if ((this.wrapper as any).msRequestFullscreen) {
        (this.wrapper as any).msRequestFullscreen();
      } else {
        console.warn('浏览器不支持全屏 API');
      }
    } catch (error) {
      console.error('进入全屏模式失败:', error);
    }
  }

  // 辅助方法：下载文件
  private downloadFile(dataURL: string, filename: string): void {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    }, 100);
  }
}

// 注册 Web Component
customElements.define('gantt-chart-component', GanttChartElement);

// 导出类型定义
export interface GanttChartOptions {
  viewMode?: 'day' | 'week' | 'month';
  allowTaskDrag?: boolean;
  allowTaskResize?: boolean;
  enableDependencies?: boolean;
  showProgress?: boolean;
  theme?: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    [key: string]: string;
  };
}

export interface GanttChartData {
  tasks: Task[];
  dependencies: Dependency[];
}

export interface Task {
  id: string | number;
  name: string;
  startDate: Date;
  endDate: Date;
  progress?: number;
  type?: 'task' | 'milestone' | 'project';
  [key: string]: any;
}

export interface Dependency {
  id: string | number;
  predecessorId: string | number;
  successorId: string | number;
  type?: 'FS' | 'FF' | 'SS' | 'SF';
} 