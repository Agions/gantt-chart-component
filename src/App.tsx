import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Task } from './components/gantt-chart/core/types';
import { TaskFilter } from './components/gantt-chart/enhanced/TaskFilter';
import { EnhancedGanttChart } from './components/gantt-chart/enhanced/EnhancedGanttChart';
import { ViewModeSelector } from './components/gantt-chart/enhanced/ViewModeSelector';
import { TaskDetails } from './components/gantt-chart/enhanced/TaskDetails';
import { TaskList } from './components/gantt-chart/enhanced/TaskList';
import { TaskToolbar } from './components/gantt-chart/enhanced/TaskToolbar';
import { useGanttData } from './hooks/useGanttData';
import { useCriticalPath } from './hooks/useCriticalPath';
import './components/gantt-chart/styles/TaskFilter.css';
import './components/gantt-chart/styles/EnhancedGanttChart.css';
import './App.css';

function App() {
  const ganttRef = useRef<any>(null);
  const {
    tasks,
    dependencies,
    handleTasksChange,
    handleDependenciesChange,
    addTask,
    deleteTask,
    updateTask,
    undo,
    redo,
    resetData,
    canUndo,
    canRedo
  } = useGanttData();

  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  
  const { criticalTasks } = useCriticalPath(tasks, dependencies);

  // 当任务变化时，更新过滤后的任务列表
  useEffect(() => {
    setFilteredTasks(tasks);
  }, [tasks]);

  // 处理任务过滤 - 使用useCallback记忆化
  const handleFilterChange = useCallback((filtered: Task[]) => {
    setFilteredTasks(filtered);
  }, []);

  // 处理任务选择 - 使用useCallback记忆化
  const handleTaskSelect = useCallback((task: Task) => {
    setSelectedTask(task);
    if (ganttRef.current) {
      ganttRef.current.scrollToTask(task.id);
    }
  }, []);
  
  // 处理视图模式变更 - 使用useCallback记忆化
  const handleViewModeChange = useCallback((mode: 'day' | 'week' | 'month') => {
    setViewMode(mode);
    if (ganttRef.current) {
      ganttRef.current.setViewMode(mode);
    }
  }, []);

  // 处理添加任务 - 使用useCallback记忆化
  const handleAddTask = useCallback((taskName: string) => {
    const newTask = addTask({ name: taskName });
    // 选择新创建的任务
    setSelectedTask(newTask);
  }, [addTask]);
  
  // 处理重置数据 - 使用useCallback记忆化
  const handleReset = useCallback(() => {
    if (window.confirm('确定要重置所有数据吗？这将删除所有您的更改。')) {
      resetData();
      setSelectedTask(null);
    }
  }, [resetData]);

  // 使用useMemo缓存甘特图配置
  const ganttOptions = useMemo(() => ({
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
  }), []);

  return (
    <div className="container">
      <header className="header">
        <h1>甘特图组件示例</h1>
        <p>这是一个展示甘特图功能的React应用，部署在GitHub Pages上</p>
        <a 
          className="github-link" 
          href="https://github.com/Agions/gantt-chart-component" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          在GitHub上查看源码
        </a>
      </header>

      <div className="card">
        <h2>任务管理</h2>
        <TaskToolbar 
          onAddTask={handleAddTask}
          onUndo={undo}
          onRedo={redo}
          onReset={handleReset}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        <h3>视图控制</h3>
        <ViewModeSelector 
          currentMode={viewMode} 
          onModeChange={handleViewModeChange} 
        />
      </div>

      <div className="card">
        <h2>交互式甘特图（支持拖拽和依赖线）</h2>
        <div style={{ height: '400px', marginBottom: '20px', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
          <EnhancedGanttChart
            tasks={tasks}
            dependencies={dependencies}
            viewMode={viewMode}
            onTasksChange={handleTasksChange}
            onDependenciesChange={handleDependenciesChange}
            onTaskClick={handleTaskSelect}
            options={ganttOptions}
            ref={ganttRef}
          />
        </div>
        
        {selectedTask && (
          <TaskDetails 
            task={selectedTask} 
            isCritical={criticalTasks.has(String(selectedTask.id))} 
          />
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
        <h2>关键路径分析与任务管理</h2>
        <TaskList 
          tasks={filteredTasks}
          criticalTasks={criticalTasks}
          onTaskSelect={handleTaskSelect}
          onTaskDelete={deleteTask}
          onTaskUpdate={updateTask}
        />
      </div>

      <footer className="footer">
        <p>甘特图组件演示 © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App; 