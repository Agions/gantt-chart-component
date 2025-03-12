/**
 * 甘特图任务过滤和搜索组件
 * 用于快速查找和筛选甘特图中的任务
 * 
 * @module TaskFilter
 */
import React, { useState, useCallback, useMemo } from 'react';
import { Task } from '../core/types';
import utils from '../core/utils';

// 从utils中提取DateUtils
const { DateUtils } = utils;

interface TaskFilterProps {
  /** 任务列表 */
  tasks: Task[];
  /** 筛选后的回调函数 */
  onFilterChange: (filteredTasks: Task[]) => void;
  /** 当任务被选中时的回调 */
  onTaskSelect?: (task: Task) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 任务过滤和搜索组件
 */
export const TaskFilter: React.FC<TaskFilterProps> = ({
  tasks,
  onFilterChange,
  onTaskSelect,
  className,
  style
}) => {
  // 搜索关键词
  const [searchText, setSearchText] = useState('');
  
  // 筛选条件
  const [filters, setFilters] = useState({
    status: 'all', // all, in-progress, completed, not-started
    type: 'all',   // all, task, milestone, project
    startDateFrom: '',
    startDateTo: '',
    endDateFrom: '',
    endDateTo: '',
  });
  
  // 提取所有任务类型
  const taskTypes = useMemo(() => {
    const types = new Set<string>();
    tasks.forEach(task => {
      if (task.type) types.add(task.type);
    });
    return Array.from(types);
  }, [tasks]);
  
  // 处理搜索框变更
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
  }, []);
  
  // 处理筛选条件变更
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
  // 重置所有筛选条件
  const handleReset = useCallback(() => {
    setSearchText('');
    setFilters({
      status: 'all',
      type: 'all',
      startDateFrom: '',
      startDateTo: '',
      endDateFrom: '',
      endDateTo: '',
    });
  }, []);
  
  // 根据条件筛选任务
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // 搜索文本筛选
      if (searchText && !task.name.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
      
      // 状态筛选
      if (filters.status !== 'all') {
        const progress = task.progress || 0;
        if (filters.status === 'completed' && progress < 100) return false;
        if (filters.status === 'not-started' && progress > 0) return false;
        if (filters.status === 'in-progress' && (progress === 0 || progress === 100)) return false;
      }
      
      // 类型筛选
      if (filters.type !== 'all' && task.type !== filters.type) {
        return false;
      }
      
      // 开始日期筛选
      if (filters.startDateFrom && new Date(task.start) < new Date(filters.startDateFrom)) {
        return false;
      }
      if (filters.startDateTo && new Date(task.start) > new Date(filters.startDateTo)) {
        return false;
      }
      
      // 结束日期筛选
      if (filters.endDateFrom && new Date(task.end) < new Date(filters.endDateFrom)) {
        return false;
      }
      if (filters.endDateTo && new Date(task.end) > new Date(filters.endDateTo)) {
        return false;
      }
      
      return true;
    });
  }, [tasks, searchText, filters]);
  
  // 当筛选结果变化时，调用回调
  React.useEffect(() => {
    onFilterChange(filteredTasks);
  }, [filteredTasks, onFilterChange]);
  
  return (
    <div className={`gantt-task-filter ${className || ''}`} style={style}>
      <div className="filter-search">
        <input
          type="text"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="搜索任务..."
          className="search-input"
        />
      </div>
      
      <div className="filter-options">
        <div className="filter-group">
          <label>状态</label>
          <select 
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">全部状态</option>
            <option value="not-started">未开始 (0%)</option>
            <option value="in-progress">进行中 (1-99%)</option>
            <option value="completed">已完成 (100%)</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>类型</label>
          <select 
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="all">全部类型</option>
            {taskTypes.map(type => (
              <option key={type} value={type}>
                {type === 'task' ? '任务' : type === 'milestone' ? '里程碑' : type === 'project' ? '项目' : type}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>开始日期</label>
          <div className="date-range">
            <input 
              type="date" 
              value={filters.startDateFrom}
              onChange={(e) => handleFilterChange('startDateFrom', e.target.value)}
              placeholder="起始"
            />
            <span>至</span>
            <input 
              type="date" 
              value={filters.startDateTo}
              onChange={(e) => handleFilterChange('startDateTo', e.target.value)}
              placeholder="结束"
            />
          </div>
        </div>
        
        <div className="filter-group">
          <label>结束日期</label>
          <div className="date-range">
            <input 
              type="date" 
              value={filters.endDateFrom}
              onChange={(e) => handleFilterChange('endDateFrom', e.target.value)}
              placeholder="起始"
            />
            <span>至</span>
            <input 
              type="date" 
              value={filters.endDateTo}
              onChange={(e) => handleFilterChange('endDateTo', e.target.value)}
              placeholder="结束"
            />
          </div>
        </div>
        
        <button className="reset-button" onClick={handleReset}>
          重置筛选
        </button>
      </div>
      
      <div className="filter-results">
        <h4>筛选结果 ({filteredTasks.length})</h4>
        {filteredTasks.length > 0 ? (
          <ul className="task-list">
            {filteredTasks.map(task => (
              <li 
                key={task.id} 
                className="task-item"
                onClick={() => onTaskSelect && onTaskSelect(task)}
              >
                <div className="task-progress" style={{ width: `${task.progress || 0}%` }} />
                <div className="task-info">
                  <span className="task-name">{task.name}</span>
                  <span className="task-dates">
                    {task.start && typeof task.start === 'string' ? task.start : ''} - {task.end && typeof task.end === 'string' ? task.end : ''}
                  </span>
                </div>
                <div className="task-type">
                  {task.type === 'milestone' && <span className="milestone-badge">里程碑</span>}
                  {task.type === 'project' && <span className="project-badge">项目</span>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-results">没有找到匹配的任务</div>
        )}
      </div>
    </div>
  );
};

export default TaskFilter;