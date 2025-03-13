import React, { useState, useRef, useEffect } from 'react';
import { Task, Dependency, DependencyType } from '../components/gantt-chart/core/types';
import { EnhancedGanttChart } from '../components/gantt-chart/enhanced/EnhancedGanttChart';
import '../components/gantt-chart/styles/EnhancedGanttChart.css';

// 示例任务数据
const sampleTasks: Task[] = [
  {
    id: 1,
    name: '项目启动',
    start: new Date(2023, 0, 1),
    end: new Date(2023, 0, 5),
    progress: 100,
    type: 'milestone',
    dependencies: []
  },
  {
    id: 2,
    name: '需求分析',
    start: new Date(2023, 0, 6),
    end: new Date(2023, 0, 15),
    progress: 100,
    dependencies: [1]
  },
  {
    id: 3,
    name: '系统设计',
    start: new Date(2023, 0, 16),
    end: new Date(2023, 0, 31),
    progress: 80,
    dependencies: [2]
  },
  {
    id: 4,
    name: '前端开发',
    start: new Date(2023, 1, 1),
    end: new Date(2023, 1, 28),
    progress: 60,
    dependencies: [3]
  },
  {
    id: 5,
    name: '后端开发',
    start: new Date(2023, 1, 1),
    end: new Date(2023, 2, 15),
    progress: 50,
    dependencies: [3]
  },
  {
    id: 6,
    name: '测试',
    start: new Date(2023, 2, 16),
    end: new Date(2023, 3, 15),
    progress: 30,
    dependencies: [4, 5]
  },
  {
    id: 7,
    name: '部署上线',
    start: new Date(2023, 3, 16),
    end: new Date(2023, 3, 20),
    progress: 0,
    type: 'milestone',
    dependencies: [6]
  }
];

// 示例依赖数据
const sampleDependencies: Dependency[] = [
  { fromId: 1, toId: 2, type: 'finish-to-start' as unknown as DependencyType },
  { fromId: 2, toId: 3, type: 'finish-to-start' as unknown as DependencyType },
  { fromId: 3, toId: 4, type: 'finish-to-start' as unknown as DependencyType },
  { fromId: 3, toId: 5, type: 'finish-to-start' as unknown as DependencyType },
  { fromId: 4, toId: 6, type: 'finish-to-start' as unknown as DependencyType },
  { fromId: 5, toId: 6, type: 'finish-to-start' as unknown as DependencyType },
  { fromId: 6, toId: 7, type: 'finish-to-start' as unknown as DependencyType }
];

// 甘特图配置
const ganttOptions = {
  allowTaskDrag: true,
  allowTaskResize: true,
  enableDependencies: true,
  showProgress: true,
  theme: {
    primary: '#4F46E5',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    taskBorder: '#818CF8',
    taskBackground: '#EEF2FF',
    milestoneColor: '#8B5CF6',
    criticalTaskBackground: '#FEF2F2',
    criticalTaskBorder: '#EF4444',
    dependencyLineColor: '#8B5CF6'
  }
};

const DemoPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [dependencies, setDependencies] = useState(sampleDependencies);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const ganttRef = useRef<any>(null);

  const handleTasksChange = (updatedTasks: Task[]) => {
    console.log('Tasks updated:', updatedTasks);
    setTasks(updatedTasks);
  };

  const handleDependenciesChange = (updatedDependencies: Dependency[]) => {
    console.log('Dependencies updated:', updatedDependencies);
    setDependencies(updatedDependencies);
  };

  // 演示一些动态效果
  useEffect(() => {
    // 定时更新任务进度（模拟实时更新）
    const intervalId = setInterval(() => {
      setTasks(prevTasks => 
        prevTasks.map(task => {
          // 随机更新一些任务的进度
          if (Math.random() > 0.8 && (task.progress ?? 0) < 100) {
            return {
              ...task,
              progress: Math.min(100, (task.progress ?? 0) + Math.floor(Math.random() * 5))
            };
          }
          return task;
        })
      );
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="demo-page">
      <header className="demo-header">
        <h1>甘特图高级演示</h1>
        <p>探索甘特图组件的强大功能，包括任务拖拽、依赖关系、关键路径等</p>
        
        <div className="view-mode-controls">
          <button 
            className={viewMode === 'day' ? 'active' : ''} 
            onClick={() => setViewMode('day')}
          >
            日视图
          </button>
          <button 
            className={viewMode === 'week' ? 'active' : ''} 
            onClick={() => setViewMode('week')}
          >
            周视图
          </button>
          <button 
            className={viewMode === 'month' ? 'active' : ''} 
            onClick={() => setViewMode('month')}
          >
            月视图
          </button>
        </div>
      </header>

      <div className="demo-chart">
        <EnhancedGanttChart
          tasks={tasks}
          dependencies={dependencies}
          viewMode={viewMode}
          onTasksChange={handleTasksChange}
          onDependenciesChange={handleDependenciesChange}
          options={ganttOptions}
          ref={ganttRef}
        />
      </div>

      <div className="demo-instructions">
        <h2>操作指南</h2>
        <ul>
          <li><strong>拖拽任务</strong>：点击并拖动任务条来调整任务的开始日期</li>
          <li><strong>调整任务长度</strong>：拖动任务条两端的手柄来调整任务持续时间</li>
          <li><strong>查看任务详情</strong>：点击任务条显示详细信息</li>
          <li><strong>添加依赖关系</strong>：点击任务条的连接点并拖动到另一个任务</li>
          <li><strong>缩放时间轴</strong>：使用顶部的视图模式按钮切换时间尺度</li>
        </ul>
      </div>

      <footer className="demo-footer">
        <p>尝试在甘特图上操作以体验完整功能，或查看 <a href="#features">功能列表</a> 了解更多</p>
      </footer>
    </div>
  );
};

export default DemoPage; 