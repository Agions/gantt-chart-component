import React, { useState, useEffect, useRef } from 'react';
import { Task, Dependency } from './components/gantt-chart/core/types';
import { createCriticalPathAnalyzer } from './components/gantt-chart/core/CriticalPathAnalyzer';
import { TaskFilter } from './components/gantt-chart/enhanced/TaskFilter';
import './components/gantt-chart/styles/TaskFilter.css';
import { EnhancedGanttChart } from './components/gantt-chart/enhanced/EnhancedGanttChart';
import './components/gantt-chart/styles/EnhancedGanttChart.css';

// 导入其他必要的组件和样式

function App() {
  const ganttRef = useRef<any>(null);
  
  // 示例任务数据
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      name: '需求分析',
      start: '2023-06-01',
      end: '2023-06-10',
      progress: 100,
      type: 'task'
    },
    {
      id: '2',
      name: '设计阶段',
      start: '2023-06-11',
      end: '2023-06-25',
      progress: 80,
      type: 'task'
    },
    {
      id: '3',
      name: '开发阶段',
      start: '2023-06-26',
      end: '2023-07-15',
      progress: 60,
      type: 'task'
    },
    {
      id: '4',
      name: '测试阶段',
      start: '2023-07-16',
      end: '2023-07-25',
      progress: 30,
      type: 'task'
    },
    {
      id: '5',
      name: '项目发布',
      start: '2023-07-26',
      end: '2023-07-26',
      progress: 0,
      type: 'milestone'
    }
  ]);

  // 示例依赖关系
  const [dependencies, setDependencies] = useState<Dependency[]>([
    { fromId: '1', toId: '2', type: 'finish_to_start' },
    { fromId: '2', toId: '3', type: 'finish_to_start' },
    { fromId: '3', toId: '4', type: 'finish_to_start' },
    { fromId: '4', toId: '5', type: 'finish_to_start' }
  ]);

  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [criticalTasks, setCriticalTasks] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  // 当任务列表变化时分析关键路径
  useEffect(() => {
    const analyzer = createCriticalPathAnalyzer(tasks, dependencies);
    const result = analyzer.analyze();
    
    // 获取关键路径上的任务ID列表
    const criticalTasksSet = new Set(result.criticalTasks.map(String));
    setCriticalTasks(criticalTasksSet);
    
    // 更新filtered任务
    setFilteredTasks(tasks);
  }, [tasks, dependencies]);

  // 处理任务过滤
  const handleFilterChange = (filtered: Task[]) => {
    setFilteredTasks(filtered);
  };

  // 处理任务选择
  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    if (ganttRef.current) {
      ganttRef.current.scrollToTask(task.id);
    }
  };
  
  // 处理任务变更
  const handleTasksChange = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
  };
  
  // 处理依赖关系变更
  const handleDependenciesChange = (updatedDeps: Dependency[]) => {
    setDependencies(updatedDeps);
  };
  
  // 处理视图模式变更
  const handleViewModeChange = (mode: 'day' | 'week' | 'month') => {
    setViewMode(mode);
    if (ganttRef.current) {
      ganttRef.current.setViewMode(mode);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>甘特图组件示例</h1>
        <p>这是一个展示甘特图功能的React应用，部署在GitHub Pages上</p>
        <a 
          className="github-link" 
          href="https://github.com/Agions/gantt-chart-demo" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          在GitHub上查看源码
        </a>
      </header>

      <div className="card">
        <h2>视图控制</h2>
        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={() => handleViewModeChange('day')} 
            style={{ 
              padding: '8px 16px', 
              marginRight: '10px', 
              backgroundColor: viewMode === 'day' ? '#1890ff' : '#f0f0f0',
              color: viewMode === 'day' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            日视图
          </button>
          <button 
            onClick={() => handleViewModeChange('week')} 
            style={{ 
              padding: '8px 16px', 
              marginRight: '10px', 
              backgroundColor: viewMode === 'week' ? '#1890ff' : '#f0f0f0',
              color: viewMode === 'week' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            周视图
          </button>
          <button 
            onClick={() => handleViewModeChange('month')} 
            style={{ 
              padding: '8px 16px', 
              backgroundColor: viewMode === 'month' ? '#1890ff' : '#f0f0f0',
              color: viewMode === 'month' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            月视图
          </button>
        </div>
      </div>

      <div className="card">
        <h2>交互式甘特图（支持拖拽和依赖线）</h2>
        <div style={{ height: '400px', marginBottom: '20px' }}>
          <EnhancedGanttChart
            tasks={tasks}
            dependencies={dependencies}
            viewMode={viewMode}
            onTasksChange={handleTasksChange}
            onDependenciesChange={handleDependenciesChange}
            onTaskClick={(task) => setSelectedTask(task)}
            options={{
              allowTaskDrag: true,
              allowTaskResize: true,
              enableDependencies: true,
              showProgress: true,
              theme: {
                primary: '#1890ff',
                taskBorder: '#91d5ff',
                taskBackground: '#e6f7ff',
                milestoneColor: '#722ed1',
                criticalTaskBackground: '#fff2f0',
                criticalTaskBorder: '#ff4d4f'
              }
            }}
            ref={ganttRef}
          />
        </div>
        
        {selectedTask && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f9f9f9', 
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <h3>选中的任务</h3>
            <p><strong>名称:</strong> {selectedTask.name}</p>
            <p><strong>时间段:</strong> {typeof selectedTask.start === 'string' ? selectedTask.start : selectedTask.start.toLocaleDateString()} 至 {typeof selectedTask.end === 'string' ? selectedTask.end : selectedTask.end.toLocaleDateString()}</p>
            <p><strong>进度:</strong> {selectedTask.progress}%</p>
            <p><strong>类型:</strong> {selectedTask.type === 'task' ? '任务' : selectedTask.type === 'milestone' ? '里程碑' : '项目'}</p>
            <p><strong>是否为关键任务:</strong> {criticalTasks.has(String(selectedTask.id)) ? '是' : '否'}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2>任务过滤与搜索</h2>
        <TaskFilter 
          tasks={tasks} 
          onFilterChange={handleFilterChange} 
          onTaskSelect={handleTaskSelect}
        />
      </div>

      <div className="card">
        <h2>关键路径分析</h2>
        <div>
          <h3>项目任务列表</h3>
          <ul>
            {filteredTasks.map(task => (
              <li key={task.id} style={{ 
                padding: '10px', 
                marginBottom: '5px', 
                backgroundColor: criticalTasks.has(String(task.id)) ? '#ffecec' : '#f9f9f9',
                border: criticalTasks.has(String(task.id)) ? '1px solid #ff4d4f' : '1px solid #d9d9d9',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => handleTaskSelect(task)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong>{task.name}</strong> {criticalTasks.has(String(task.id)) && <span style={{ color: 'red' }}>(关键任务)</span>}</span>
                  <span>{task.progress}%</span>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {typeof task.start === 'string' ? task.start : task.start.toLocaleDateString()} 至 {typeof task.end === 'string' ? task.end : task.end.toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="footer">
        <p>甘特图组件演示 © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App; 