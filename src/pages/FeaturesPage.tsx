import React from 'react';

const FeaturesPage: React.FC = () => {
  return (
    <div className="features-page">
      <header className="features-header">
        <h1>甘特图专业版功能</h1>
        <p>探索我们甘特图组件的全部强大功能和使用场景</p>
      </header>

      <section className="features-showcase">
        <div className="feature-card">
          <div className="feature-icon">📅</div>
          <h3>多视图模式</h3>
          <p>支持日、周、月多种视图模式，轻松切换不同时间尺度，满足不同粒度的项目规划需求。</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔄</div>
          <h3>交互式任务管理</h3>
          <p>通过直观的拖拽界面调整任务日期、持续时间，实时反馈变更影响，无需手动输入日期。</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔗</div>
          <h3>任务依赖关系</h3>
          <p>可视化表示并管理任务间的依赖关系，自动处理前置任务变更对后续任务的影响。</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>关键路径分析</h3>
          <p>自动计算并突出显示项目关键路径，一目了然地识别影响项目完成时间的关键任务。</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>进度跟踪</h3>
          <p>直观展示任务完成百分比，支持不同颜色标识任务状态，轻松掌握项目整体进度。</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📱</div>
          <h3>响应式设计</h3>
          <p>完美适配桌面和移动设备，无论在哪里都能获得最佳使用体验。</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>高性能渲染</h3>
          <p>采用虚拟列表和组件优化技术，即使处理大量任务也能保持流畅的性能表现。</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🎨</div>
          <h3>主题定制</h3>
          <p>灵活的主题配置系统，让您的甘特图完美融入企业品牌风格。</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">💾</div>
          <h3>数据导出</h3>
          <p>支持导出为图片、PDF或原始数据，方便分享和汇报项目计划。</p>
        </div>
      </section>

      <section className="use-cases">
        {/* <h2>应用场景</h2> */}
        
        {/* <div className="use-case">
          <div className="use-case-content">
            <h3>软件开发项目</h3>
            <p>对软件开发流程中的设计、编码、测试等阶段进行规划和跟踪，清晰展示开发里程碑和发布计划。</p>
            <ul>
              <li>跟踪敏捷开发周期</li>
              <li>管理版本发布时间线</li>
              <li>协调开发与测试资源</li>
            </ul>
          </div>
          <div className="use-case-image placeholder">
            {/* <span>软件开发示例图</span> 
          </div> 
        </div>*/}

        {/* <div className="use-case reverse">
          <div className="use-case-content">
            <h3>建筑与工程项目</h3>
            <p>管理复杂建筑工程的各个阶段，处理不同施工队伍之间的工作依赖关系，确保项目按时完成。</p>
            <ul>
              <li>排序相互依赖的施工任务</li>
              <li>跟踪施工进度与延误</li>
              <li>管理多团队协作</li>
            </ul>
          </div>
          <div className="use-case-image placeholder">
            {/* <span>建筑工程示例图</span> 
          </div>
        </div> */}

        {/* <div className="use-case">
          <div className="use-case-content">
            <h3>活动与会议策划</h3>
            <p>规划会议或活动的准备工作，从场地租赁、宣传到执行的各个环节，确保所有准备工作按时完成。</p>
            <ul>
              <li>创建活动准备时间表</li>
              <li>安排资源与人员</li>
              <li>监控关键截止日期</li>
            </ul>
          </div>
          <div className="use-case-image placeholder">
          </div>
        </div> */}
      </section>

      <section className="cta-section">
        <h2>准备好提升您的项目管理了吗？</h2>
        <p>立即尝试甘特图专业版，体验高效项目规划与管理的全新方式。</p>
        <div className="cta-buttons">
          <a href="/demo" className="cta-button primary">查看演示</a>
          <a href="https://github.com/Agions/gantt-chart-component" className="cta-button secondary" target="_blank" rel="noopener noreferrer">获取源码</a>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage; 