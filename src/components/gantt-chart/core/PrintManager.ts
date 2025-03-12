/**
 * 甘特图打印管理工具
 * 提供将甘特图直接打印或保存为PDF的功能
 */

import { Task, Dependency, Resource } from './types';

export interface PrintOptions {
  /** 打印标题 */
  title?: string;
  /** 是否包含页眉 */
  includeHeader?: boolean;
  /** 页眉内容 */
  headerText?: string;
  /** 是否包含页脚 */
  includeFooter?: boolean;
  /** 页脚内容 */
  footerText?: string;
  /** 是否添加日期信息 */
  includeDate?: boolean;
  /** 是否包含项目信息 */
  includeProjectInfo?: boolean;
  /** 是否包含资源列表 */
  includeResources?: boolean;
  /** 页面方向：portrait或landscape */
  orientation?: 'portrait' | 'landscape';
  /** 纸张尺寸 */
  paperSize?: 'A4' | 'A3' | 'letter' | 'legal';
  /** 缩放比例 */
  scale?: number;
  /** 是否自动适应页面 */
  fitToPage?: boolean;
  /** 页边距（mm） */
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  /** 是否在每页显示表头 */
  repeatTableHeader?: boolean;
  /** 是否打印背景色和图像 */
  printBackground?: boolean;
}

/**
 * 甘特图打印管理器
 */
export class PrintManager {
  /** 甘特图容器元素 */
  private container: HTMLElement;
  /** 默认打印选项 */
  private defaultOptions: PrintOptions = {
    title: '甘特图',
    includeHeader: true,
    headerText: '项目甘特图',
    includeFooter: true,
    footerText: '©2023 甘特图组件',
    includeDate: true,
    includeProjectInfo: true,
    includeResources: true,
    orientation: 'landscape',
    paperSize: 'A4',
    scale: 1,
    fitToPage: true,
    margins: {
      top: 15,
      right: 10,
      bottom: 15,
      left: 10
    },
    repeatTableHeader: true,
    printBackground: true
  };

  /** 任务数据 */
  private tasks: Task[] = [];
  /** 依赖关系数据 */
  private dependencies: Dependency[] = [];
  /** 资源数据 */
  private resources: Resource[] = [];
  /** 项目信息 */
  private projectInfo: Record<string, string> = {};

  /**
   * 创建打印管理器
   * @param container 甘特图容器元素
   */
  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * 设置任务数据
   * @param tasks 任务数据
   */
  public setTasks(tasks: Task[]): void {
    this.tasks = tasks;
  }

  /**
   * 设置依赖关系数据
   * @param dependencies 依赖关系数据
   */
  public setDependencies(dependencies: Dependency[]): void {
    this.dependencies = dependencies;
  }

  /**
   * 设置资源数据
   * @param resources 资源数据
   */
  public setResources(resources: Resource[]): void {
    this.resources = resources;
  }

  /**
   * 设置项目信息
   * @param info 项目信息
   */
  public setProjectInfo(info: Record<string, string>): void {
    this.projectInfo = info;
  }

  /**
   * 打印甘特图
   * @param options 打印选项
   */
  public print(options: PrintOptions = {}): void {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const printWindow = this.createPrintWindow(mergedOptions);
    
    // 添加打印样式和内容
    this.addPrintContent(printWindow, mergedOptions);
    
    // 等待图片加载完成后打印
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      
      // 打印完成后关闭窗口
      setTimeout(() => {
        printWindow.close();
      }, 500);
    }, 500);
  }

  /**
   * 创建打印窗口
   * @param options 打印选项
   * @returns 打印窗口对象
   */
  private createPrintWindow(options: PrintOptions): Window {
    const printWindow = window.open('', '_blank', 'width=800,height=600')!;
    
    // 创建基础HTML结构
    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${options.title}</title>
        <style>
          @media print {
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            @page {
              size: ${options.paperSize} ${options.orientation};
              margin: ${options.margins?.top}mm ${options.margins?.right}mm ${options.margins?.bottom}mm ${options.margins?.left}mm;
            }
            
            .no-print {
              display: none !important;
            }
            
            .page-break {
              page-break-after: always;
            }
            
            .header {
              position: running(header);
              height: 20mm;
            }
            
            .footer {
              position: running(footer);
              height: 15mm;
            }
            
            @page {
              @top-center {
                content: element(header);
              }
              
              @bottom-center {
                content: element(footer);
              }
            }
            
            .repeat-header {
              display: table-header-group;
            }
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.5;
            color: #333;
          }
          
          .print-container {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
          }
          
          .print-header {
            text-align: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
            margin-bottom: 20px;
          }
          
          .print-title {
            font-size: 20px;
            font-weight: bold;
            margin: 0;
          }
          
          .print-date {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
          }
          
          .print-footer {
            text-align: center;
            padding: 10px 0;
            border-top: 1px solid #eee;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
          
          .print-page-number:after {
            content: "第 " counter(page) " 页 / 共 " counter(pages) " 页";
          }
          
          .project-info {
            margin-bottom: 20px;
            border: 1px solid #eee;
            border-radius: 4px;
            padding: 15px;
            background-color: #f9f9f9;
          }
          
          .project-info-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          
          .project-info-item {
            display: flex;
            margin-bottom: 5px;
          }
          
          .project-info-label {
            font-weight: 500;
            width: 120px;
          }
          
          .resources-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          .resources-table th,
          .resources-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          
          .resources-table th {
            background-color: #f5f5f5;
            font-weight: 500;
          }
          
          .gantt-print-container {
            width: 100%;
            overflow: hidden;
            border: 1px solid #eee;
            border-radius: 4px;
          }
          
          .print-buttons {
            margin-bottom: 20px;
            text-align: right;
          }
          
          .print-button {
            padding: 8px 16px;
            background-color: #1890ff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-left: 10px;
          }
          
          .print-button:hover {
            background-color: #40a9ff;
          }
          
          .print-close-button {
            background-color: #f5f5f5;
            color: #333;
          }
          
          .print-close-button:hover {
            background-color: #e8e8e8;
          }
        </style>
      </head>
      <body>
        <div class="print-buttons no-print">
          <button class="print-button print-action-button" onclick="window.print()">打印</button>
          <button class="print-button print-close-button" onclick="window.close()">关闭</button>
        </div>
        <div class="print-container">
          <!-- 打印内容将在这里动态生成 -->
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    
    return printWindow;
  }

  /**
   * 添加打印内容
   * @param printWindow 打印窗口
   * @param options 打印选项
   */
  private addPrintContent(printWindow: Window, options: PrintOptions): void {
    const container = printWindow.document.querySelector('.print-container')!;
    
    // 添加页眉
    if (options.includeHeader) {
      const header = printWindow.document.createElement('div');
      header.className = 'print-header';
      
      const title = printWindow.document.createElement('h1');
      title.className = 'print-title';
      title.textContent = options.headerText || options.title || '甘特图';
      header.appendChild(title);
      
      // 添加日期
      if (options.includeDate) {
        const dateElement = printWindow.document.createElement('div');
        dateElement.className = 'print-date';
        dateElement.textContent = new Date().toLocaleString();
        header.appendChild(dateElement);
      }
      
      container.appendChild(header);
    }
    
    // 添加项目信息
    if (options.includeProjectInfo && Object.keys(this.projectInfo).length > 0) {
      const projectInfoElement = printWindow.document.createElement('div');
      projectInfoElement.className = 'project-info';
      
      const projectInfoTitle = printWindow.document.createElement('div');
      projectInfoTitle.className = 'project-info-title';
      projectInfoTitle.textContent = '项目信息';
      projectInfoElement.appendChild(projectInfoTitle);
      
      Object.entries(this.projectInfo).forEach(([key, value]) => {
        const item = printWindow.document.createElement('div');
        item.className = 'project-info-item';
        
        const label = printWindow.document.createElement('div');
        label.className = 'project-info-label';
        label.textContent = key;
        item.appendChild(label);
        
        const valueElement = printWindow.document.createElement('div');
        valueElement.className = 'project-info-value';
        valueElement.textContent = value;
        item.appendChild(valueElement);
        
        projectInfoElement.appendChild(item);
      });
      
      container.appendChild(projectInfoElement);
    }
    
    // 添加资源列表
    if (options.includeResources && this.resources.length > 0) {
      const resourcesElement = printWindow.document.createElement('div');
      resourcesElement.className = 'resources-container';
      
      const resourcesTitle = printWindow.document.createElement('div');
      resourcesTitle.className = 'project-info-title';
      resourcesTitle.textContent = '资源列表';
      resourcesElement.appendChild(resourcesTitle);
      
      const table = printWindow.document.createElement('table');
      table.className = 'resources-table';
      
      // 表头
      const thead = printWindow.document.createElement('thead');
      const headerRow = printWindow.document.createElement('tr');
      
      ['ID', '资源名称', '角色', '成本', '可用性'].forEach(headerText => {
        const th = printWindow.document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // 表体
      const tbody = printWindow.document.createElement('tbody');
      
      this.resources.forEach(resource => {
        const row = printWindow.document.createElement('tr');
        
        const idCell = printWindow.document.createElement('td');
        idCell.textContent = String(resource.id);
        row.appendChild(idCell);
        
        const nameCell = printWindow.document.createElement('td');
        nameCell.textContent = resource.name || '';
        row.appendChild(nameCell);
        
        const roleCell = printWindow.document.createElement('td');
        roleCell.textContent = resource.role || '';
        row.appendChild(roleCell);
        
        const costCell = printWindow.document.createElement('td');
        costCell.textContent = resource.cost ? `${resource.cost}` : '';
        row.appendChild(costCell);
        
        const availabilityCell = printWindow.document.createElement('td');
        availabilityCell.textContent = resource.availability ? `${resource.availability}%` : '100%';
        row.appendChild(availabilityCell);
        
        tbody.appendChild(row);
      });
      
      table.appendChild(tbody);
      resourcesElement.appendChild(table);
      container.appendChild(resourcesElement);
    }
    
    // 添加甘特图内容
    const ganttContainer = printWindow.document.createElement('div');
    ganttContainer.className = 'gantt-print-container';
    
    // 克隆原始甘特图
    const originalGantt = this.container.cloneNode(true) as HTMLElement;
    
    // 应用打印样式调整
    this.applyPrintStyles(originalGantt, options);
    
    // 添加到打印容器
    ganttContainer.innerHTML = originalGantt.outerHTML;
    container.appendChild(ganttContainer);
    
    // 添加页脚
    if (options.includeFooter) {
      const footer = printWindow.document.createElement('div');
      footer.className = 'print-footer';
      
      const footerText = printWindow.document.createElement('div');
      footerText.textContent = options.footerText || '';
      footer.appendChild(footerText);
      
      const pageNumber = printWindow.document.createElement('div');
      pageNumber.className = 'print-page-number';
      footer.appendChild(pageNumber);
      
      container.appendChild(footer);
    }
  }

  /**
   * 应用打印样式调整
   * @param element 元素
   * @param options 打印选项
   */
  private applyPrintStyles(element: HTMLElement, options: PrintOptions): void {
    // 设置宽度以适应打印
    if (options.fitToPage) {
      element.style.width = '100%';
      element.style.height = 'auto';
      element.style.overflow = 'visible';
    }
    
    // 设置比例
    if (options.scale && options.scale !== 1) {
      element.style.transform = `scale(${options.scale})`;
      element.style.transformOrigin = 'top left';
    }
    
    // 确保背景色打印
    if (options.printBackground) {
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `;
      element.appendChild(styleElement);
    }
    
    // 移除不需要打印的元素
    const noPrintElements = element.querySelectorAll('.no-print');
    noPrintElements.forEach(el => el.parentNode?.removeChild(el));
    
    // 调整表格表头以在每页重复
    if (options.repeatTableHeader) {
      const headers = element.querySelectorAll('.gantt-chart-header, .gantt-chart-timeline');
      headers.forEach(el => {
        (el as HTMLElement).classList.add('repeat-header');
      });
    }
  }
}

// 导出默认的实例创建函数
export default function createPrintManager(container: HTMLElement): PrintManager {
  return new PrintManager(container);
} 