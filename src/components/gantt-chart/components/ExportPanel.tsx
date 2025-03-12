/**
 * 甘特图导出面板组件
 * 整合了图片导出、数据导出和打印功能的界面
 */

import React, { useState, useCallback } from 'react';
import { Task, Dependency, Resource } from '../core/types';
import { ImageExporter, ExportOptions as ImageExportOptions } from '../core/ImageExporter';
import { DataExporter, ExportFormat, ExportOptions as DataExportOptions } from '../core/DataExporter';
import { PrintManager, PrintOptions } from '../core/PrintManager';

// 导出面板属性
interface ExportPanelProps {
  /** 目标容器（甘特图容器元素） */
  container: HTMLElement;
  /** 任务数据 */
  tasks: Task[];
  /** 依赖关系数据 */
  dependencies: Dependency[];
  /** 资源数据 */
  resources: Resource[];
  /** 项目信息 */
  projectInfo?: Record<string, string>;
  /** 关闭面板回调 */
  onClose: () => void;
}

// 导出类型
enum ExportType {
  PNG = 'png',
  JPEG = 'jpeg',
  PDF = 'pdf',
  Excel = 'excel',
  CSV = 'csv',
  JSON = 'json',
  Print = 'print'
}

/**
 * 导出面板组件
 */
export const ExportPanel: React.FC<ExportPanelProps> = ({
  container,
  tasks,
  dependencies,
  resources,
  projectInfo = {},
  onClose
}) => {
  // 选中的导出类型
  const [exportType, setExportType] = useState<ExportType>(ExportType.PNG);
  // 导出选项
  const [fileName, setFileName] = useState<string>('gantt-chart');
  const [includeLegend, setIncludeLegend] = useState<boolean>(true);
  const [includeHeader, setIncludeHeader] = useState<boolean>(true);
  const [includeFooter, setIncludeFooter] = useState<boolean>(true);
  const [includeProjectInfo, setIncludeProjectInfo] = useState<boolean>(true);
  const [includeResources, setIncludeResources] = useState<boolean>(true);
  const [watermarkText, setWatermarkText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>('');

  /**
   * 处理导出按钮点击
   */
  const handleExport = useCallback(async () => {
    try {
      setLoading(true);
      setExportMessage('');
      
      switch (exportType) {
        case ExportType.PNG:
          await exportAsPNG();
          break;
        case ExportType.JPEG:
          await exportAsJPEG();
          break;
        case ExportType.PDF:
          await exportAsPDF();
          break;
        case ExportType.Excel:
          exportAsExcel();
          break;
        case ExportType.CSV:
          exportAsCSV();
          break;
        case ExportType.JSON:
          exportAsJSON();
          break;
        case ExportType.Print:
          printGantt();
          break;
      }
      
      setExportMessage('导出成功！');
    } catch (error) {
      console.error('导出失败', error);
      setExportMessage(`导出失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  }, [exportType, fileName, includeLegend, includeHeader, includeFooter, includeProjectInfo, includeResources, watermarkText]);

  /**
   * 导出为PNG
   */
  const exportAsPNG = async () => {
    const imageExporter = new ImageExporter(container);
    const options: ImageExportOptions = {
      fileName,
      includeLegend,
      includeHeader,
      watermarkText: watermarkText || undefined
    };
    await imageExporter.exportAsPNG(options);
  };

  /**
   * 导出为JPEG
   */
  const exportAsJPEG = async () => {
    const imageExporter = new ImageExporter(container);
    const options: ImageExportOptions = {
      fileName,
      includeLegend,
      includeHeader,
      watermarkText: watermarkText || undefined
    };
    await imageExporter.exportAsJPEG(options);
  };

  /**
   * 导出为PDF
   */
  const exportAsPDF = async () => {
    const imageExporter = new ImageExporter(container);
    const options: ImageExportOptions = {
      fileName,
      includeLegend,
      includeHeader,
      watermarkText: watermarkText || undefined
    };
    await imageExporter.exportAsPDF(options);
  };

  /**
   * 导出为Excel
   */
  const exportAsExcel = () => {
    const dataExporter = new DataExporter(tasks, dependencies, resources);
    const options: DataExportOptions = {
      fileName,
      includeHeader,
      exportTasks: true,
      exportDependencies: true,
      exportResources: includeResources
    };
    dataExporter.export(ExportFormat.EXCEL, options);
  };

  /**
   * 导出为CSV
   */
  const exportAsCSV = () => {
    const dataExporter = new DataExporter(tasks, dependencies, resources);
    const options: DataExportOptions = {
      fileName,
      includeHeader,
      exportTasks: true,
      exportDependencies: true,
      exportResources: includeResources
    };
    dataExporter.export(ExportFormat.CSV, options);
  };

  /**
   * 导出为JSON
   */
  const exportAsJSON = () => {
    const dataExporter = new DataExporter(tasks, dependencies, resources);
    const options: DataExportOptions = {
      fileName,
      prettyJSON: true,
      exportTasks: true,
      exportDependencies: true,
      exportResources: includeResources
    };
    dataExporter.export(ExportFormat.JSON, options);
  };

  /**
   * 打印甘特图
   */
  const printGantt = () => {
    const printManager = new PrintManager(container);
    printManager.setTasks(tasks);
    printManager.setDependencies(dependencies);
    printManager.setResources(resources);
    printManager.setProjectInfo(projectInfo);
    
    const options: PrintOptions = {
      title: fileName,
      includeHeader,
      includeFooter,
      includeProjectInfo,
      includeResources,
      headerText: fileName
    };
    
    printManager.print(options);
  };

  return (
    <div className="export-panel">
      <div className="export-panel-header">
        <h3 className="export-panel-title">导出甘特图</h3>
        <button className="export-panel-close" onClick={onClose}>×</button>
      </div>
      
      <div className="export-panel-body">
        <div className="export-panel-section">
          <label className="export-panel-label">导出格式</label>
          <div className="export-panel-options">
            <label className="export-panel-option">
              <input
                type="radio"
                name="exportType"
                value={ExportType.PNG}
                checked={exportType === ExportType.PNG}
                onChange={() => setExportType(ExportType.PNG)}
              />
              <span>PNG图片</span>
            </label>
            
            <label className="export-panel-option">
              <input
                type="radio"
                name="exportType"
                value={ExportType.JPEG}
                checked={exportType === ExportType.JPEG}
                onChange={() => setExportType(ExportType.JPEG)}
              />
              <span>JPEG图片</span>
            </label>
            
            <label className="export-panel-option">
              <input
                type="radio"
                name="exportType"
                value={ExportType.PDF}
                checked={exportType === ExportType.PDF}
                onChange={() => setExportType(ExportType.PDF)}
              />
              <span>PDF文档</span>
            </label>
            
            <label className="export-panel-option">
              <input
                type="radio"
                name="exportType"
                value={ExportType.Excel}
                checked={exportType === ExportType.Excel}
                onChange={() => setExportType(ExportType.Excel)}
              />
              <span>Excel表格</span>
            </label>
            
            <label className="export-panel-option">
              <input
                type="radio"
                name="exportType"
                value={ExportType.CSV}
                checked={exportType === ExportType.CSV}
                onChange={() => setExportType(ExportType.CSV)}
              />
              <span>CSV文件</span>
            </label>
            
            <label className="export-panel-option">
              <input
                type="radio"
                name="exportType"
                value={ExportType.JSON}
                checked={exportType === ExportType.JSON}
                onChange={() => setExportType(ExportType.JSON)}
              />
              <span>JSON数据</span>
            </label>
            
            <label className="export-panel-option">
              <input
                type="radio"
                name="exportType"
                value={ExportType.Print}
                checked={exportType === ExportType.Print}
                onChange={() => setExportType(ExportType.Print)}
              />
              <span>打印</span>
            </label>
          </div>
        </div>
        
        <div className="export-panel-section">
          <label className="export-panel-label">文件名</label>
          <input
            type="text"
            className="export-panel-input"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="甘特图"
          />
        </div>
        
        {(exportType === ExportType.PNG || exportType === ExportType.JPEG || exportType === ExportType.PDF) && (
          <>
            <div className="export-panel-section">
              <label className="export-panel-checkbox">
                <input
                  type="checkbox"
                  checked={includeLegend}
                  onChange={(e) => setIncludeLegend(e.target.checked)}
                />
                <span>包含图例</span>
              </label>
            </div>
            
            <div className="export-panel-section">
              <label className="export-panel-checkbox">
                <input
                  type="checkbox"
                  checked={includeHeader}
                  onChange={(e) => setIncludeHeader(e.target.checked)}
                />
                <span>包含标题</span>
              </label>
            </div>
            
            <div className="export-panel-section">
              <label className="export-panel-label">水印文字</label>
              <input
                type="text"
                className="export-panel-input"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="可选水印文字"
              />
            </div>
          </>
        )}
        
        {(exportType === ExportType.Excel || exportType === ExportType.CSV || exportType === ExportType.JSON) && (
          <>
            <div className="export-panel-section">
              <label className="export-panel-checkbox">
                <input
                  type="checkbox"
                  checked={includeHeader}
                  onChange={(e) => setIncludeHeader(e.target.checked)}
                />
                <span>包含表头</span>
              </label>
            </div>
            
            <div className="export-panel-section">
              <label className="export-panel-checkbox">
                <input
                  type="checkbox"
                  checked={includeResources}
                  onChange={(e) => setIncludeResources(e.target.checked)}
                />
                <span>包含资源数据</span>
              </label>
            </div>
          </>
        )}
        
        {exportType === ExportType.Print && (
          <>
            <div className="export-panel-section">
              <label className="export-panel-checkbox">
                <input
                  type="checkbox"
                  checked={includeHeader}
                  onChange={(e) => setIncludeHeader(e.target.checked)}
                />
                <span>包含页眉</span>
              </label>
            </div>
            
            <div className="export-panel-section">
              <label className="export-panel-checkbox">
                <input
                  type="checkbox"
                  checked={includeFooter}
                  onChange={(e) => setIncludeFooter(e.target.checked)}
                />
                <span>包含页脚</span>
              </label>
            </div>
            
            <div className="export-panel-section">
              <label className="export-panel-checkbox">
                <input
                  type="checkbox"
                  checked={includeProjectInfo}
                  onChange={(e) => setIncludeProjectInfo(e.target.checked)}
                />
                <span>包含项目信息</span>
              </label>
            </div>
            
            <div className="export-panel-section">
              <label className="export-panel-checkbox">
                <input
                  type="checkbox"
                  checked={includeResources}
                  onChange={(e) => setIncludeResources(e.target.checked)}
                />
                <span>包含资源列表</span>
              </label>
            </div>
          </>
        )}
      </div>
      
      <div className="export-panel-footer">
        {exportMessage && (
          <div className={`export-panel-message ${exportMessage.includes('失败') ? 'error' : 'success'}`}>
            {exportMessage}
          </div>
        )}
        
        <div className="export-panel-actions">
          <button className="export-panel-button cancel-button" onClick={onClose} disabled={loading}>
            取消
          </button>
          
          <button
            className="export-panel-button export-button"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? '处理中...' : `导出为${exportType.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel; 