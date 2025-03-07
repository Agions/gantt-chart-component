import React, { useState } from 'react';
import GanttChartReact from '../react/GanttChartReact';

const ReactExample = () => {
  // 示例数据
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: '需求分析',
      start: '2023-10-01',
      end: '2023-10-10',
      color: '#4e85c5'
    },
    {
      id: 2,
      name: '设计阶段',
      start: '2023-10-11',
      end: '2023-10-25',
      color: '#de5454'
    },
    {
      id: 3,
      name: '开发阶段',
      start: '2023-10-15',
      end: '2023-11-15',
      color: '#f2bd53'
    },
    {
      id: 4,
      name: '测试阶段',
      start: '2023-11-10',
      end: '2023-11-30',
      color: '#57c997'
    },
    {
      id: 5,
      name: '部署上线',
      start: '2023-12-01',
      end: '2023-12-05',
      color: '#9d5ff5'
    }
  ]);

  const [viewMode, setViewMode] = useState('day');

  // 任务点击处理函数
  const handleTaskClick = (task, event) => {
    console.log('点击了任务:', task);
    alert(`点击了任务: ${task.name}`);
  };

  // 切换视图模式
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // 添加任务
  const addTask = () => {
    const newTask = {
      id: tasks.length + 1,
      name: `新任务 ${tasks.length + 1}`,
      start: '2023-11-20',
      end: '2023-12-10',
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    };
    setTasks([...tasks, newTask]);
  };

  return (
    <div className="gantt-example">
      <h2>React 甘特图示例</h2>
      
      <div className="controls">
        <div className="view-modes">
          <button 
            onClick={() => handleViewModeChange('day')} 
            className={viewMode === 'day' ? 'active' : ''}
          >
            日视图
          </button>
          <button 
            onClick={() => handleViewModeChange('week')} 
            className={viewMode === 'week' ? 'active' : ''}
          >
            周视图
          </button>
          <button 
            onClick={() => handleViewModeChange('month')} 
            className={viewMode === 'month' ? 'active' : ''}
          >
            月视图
          </button>
        </div>
        
        <button onClick={addTask} className="add-task-btn">
          添加任务
        </button>
      </div>
      
      <div style={{ height: '400px', width: '100%', border: '1px solid #e0e0e0' }}>
        <GanttChartReact
          tasks={tasks}
          startDate={new Date('2023-10-01')}
          endDate={new Date('2023-12-31')}
          viewMode={viewMode}
          onTaskClick={handleTaskClick}
        />
      </div>
      
      <style jsx>{`
        .gantt-example {
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .controls {
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
        }
        
        .view-modes button {
          margin-right: 10px;
          padding: 8px 12px;
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .view-modes button.active {
          background: #4e85c5;
          color: white;
          border-color: #3a6ea5;
        }
        
        .add-task-btn {
          padding: 8px 16px;
          background: #57c997;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .add-task-btn:hover {
          background: #45b784;
        }
      `}</style>
    </div>
  );
};

export default ReactExample; 