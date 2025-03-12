/**
 * 甘特图关键路径分析工具
 * 
 * 关键路径是项目中从开始到完成的最长路径，由一系列关键任务组成
 * 关键任务是指如果延迟将导致整个项目延期的任务
 * 
 * @module CriticalPathAnalyzer
 */

import { Task, Dependency, TaskId } from './types';
import utils, { daysBetween, addDays } from './utils';

// 从utils中提取DateUtils
const { DateUtils } = utils;

interface TaskNode {
  id: TaskId;
  name: string;
  start: Date;
  end: Date;
  duration: number;
  earlyStart: number; // 最早开始时间（以天为单位，从项目开始算起）
  earlyFinish: number; // 最早完成时间
  lateStart: number; // 最晚开始时间
  lateFinish: number; // 最晚完成时间
  float: number; // 浮动时间（可以延迟的天数而不影响项目进度）
  predecessors: TaskId[]; // 前置任务ID
  successors: TaskId[]; // 后置任务ID
  isCritical: boolean; // 是否在关键路径上
}

export interface CriticalPathResult {
  criticalTasks: TaskId[]; // 关键路径上的任务ID
  criticalPaths: TaskId[][]; // 可能存在多条关键路径
  taskNodes: Record<string, TaskNode>; // 所有任务节点的详细计算结果
  projectDuration: number; // 项目总持续时间（天）
}

/**
 * 关键路径分析器
 */
export class CriticalPathAnalyzer {
  private tasks: Task[] = [];
  private dependencies: Dependency[] = [];
  private nodes: Record<string, TaskNode> = {};
  private startDate: Date;
  
  /**
   * 创建关键路径分析器实例
   * @param tasks 任务列表
   * @param dependencies 依赖关系列表
   * @param startDate 项目开始日期（可选）
   */
  constructor(tasks: Task[], dependencies: Dependency[], startDate?: Date) {
    this.tasks = [...tasks];
    this.dependencies = [...dependencies];
    
    // 确定项目开始日期（所有任务中最早的开始日期）
    this.startDate = startDate || this.determineProjectStartDate();
  }
  
  /**
   * 计算关键路径
   * @returns 关键路径分析结果
   */
  public analyze(): CriticalPathResult {
    // 初始化任务节点
    this.initializeNodes();
    
    // 计算每个任务的前置和后置任务
    this.buildDependencyGraph();
    
    // 前向传递（计算最早开始和最早完成时间）
    this.forwardPass();
    
    // 后向传递（计算最晚开始和最晚完成时间）
    this.backwardPass();
    
    // 计算浮动时间并标记关键路径
    this.calculateFloatAndMarkCriticalPath();
    
    // 收集关键路径上的任务
    const criticalTasks = Object.values(this.nodes)
      .filter(node => node.isCritical)
      .map(node => node.id);
    
    // 识别可能存在的多条关键路径
    const criticalPaths = this.identifyCriticalPaths();
    
    // 确定项目持续时间
    const projectDuration = Object.values(this.nodes)
      .filter(node => node.successors.length === 0) // 找出所有终点任务
      .reduce((maxDuration, node) => Math.max(maxDuration, node.earlyFinish), 0);
    
    return {
      criticalTasks,
      criticalPaths,
      taskNodes: this.nodes,
      projectDuration
    };
  }
  
  /**
   * 确定项目开始日期
   * @private
   */
  private determineProjectStartDate(): Date {
    if (this.tasks.length === 0) {
      return new Date();
    }
    
    let earliestDate = new Date(this.tasks[0].start);
    
    for (const task of this.tasks) {
      const taskStartDate = new Date(task.start);
      if (taskStartDate < earliestDate) {
        earliestDate = taskStartDate;
      }
    }
    
    return earliestDate;
  }
  
  /**
   * 初始化所有任务节点
   * @private
   */
  private initializeNodes(): void {
    this.nodes = {};
    
    for (const task of this.tasks) {
      const startDate = new Date(task.start);
      const endDate = new Date(task.end);
      const duration = daysBetween(startDate, endDate);
      
      // 确保任务ID转换为字符串作为对象键
      const taskIdKey = String(task.id);
      
      this.nodes[taskIdKey] = {
        id: task.id,
        name: task.name,
        start: startDate,
        end: endDate,
        duration: duration,
        earlyStart: 0, // 初始化为0，将在前向传递中更新
        earlyFinish: 0,
        lateStart: 0,
        lateFinish: 0,
        float: 0,
        predecessors: [],
        successors: [],
        isCritical: false
      };
    }
  }
  
  /**
   * 构建依赖关系图
   * @private
   */
  private buildDependencyGraph(): void {
    // 根据依赖关系，为每个任务建立前置和后置任务列表
    for (const dep of this.dependencies) {
      const fromIdKey = String(dep.fromId);
      const toIdKey = String(dep.toId);
      
      if (this.nodes[fromIdKey] && this.nodes[toIdKey]) {
        // 添加后继任务
        if (!this.nodes[fromIdKey].successors.includes(dep.toId)) {
          this.nodes[fromIdKey].successors.push(dep.toId);
        }
        
        // 添加前驱任务
        if (!this.nodes[toIdKey].predecessors.includes(dep.fromId)) {
          this.nodes[toIdKey].predecessors.push(dep.fromId);
        }
      }
    }
  }
  
  /**
   * 前向传递 - 计算最早开始和最早完成时间
   * @private
   */
  private forwardPass(): void {
    // 找出所有没有前置任务的起始任务
    const startTasks = Object.values(this.nodes).filter(node => node.predecessors.length === 0);
    
    // 计算每个起始任务的earlyStart（相对于项目开始日期的天数）
    for (const node of startTasks) {
      node.earlyStart = daysBetween(this.startDate, node.start);
      node.earlyFinish = node.earlyStart + node.duration;
    }
    
    // 使用拓扑排序算法处理所有任务
    const visited = new Set<string>();
    const visiting = new Set<string>();
    
    const visit = (nodeId: string): void => {
      if (visited.has(nodeId)) return;
      if (visiting.has(nodeId)) {
        // 检测到循环依赖，需要处理
        console.warn(`检测到循环依赖，涉及任务: ${nodeId}`);
        return;
      }
      
      visiting.add(nodeId);
      
      const node = this.nodes[nodeId];
      
      // 如果所有前置任务都已访问，计算earlyStart和earlyFinish
      if (node.predecessors.length === 0 || 
          node.predecessors.every(predId => visited.has(String(predId)))) {
        
        if (node.predecessors.length > 0) {
          // 最早开始时间 = 所有前置任务的最早完成时间的最大值
          node.earlyStart = Math.max(...node.predecessors.map(
            predId => this.nodes[String(predId)].earlyFinish
          ));
        }
        
        node.earlyFinish = node.earlyStart + node.duration;
      }
      
      // 处理所有后继任务
      for (const succId of node.successors) {
        visit(String(succId));
      }
      
      visiting.delete(nodeId);
      visited.add(nodeId);
    };
    
    // 对所有任务执行拓扑排序
    for (const nodeId in this.nodes) {
      if (!visited.has(nodeId)) {
        visit(nodeId);
      }
    }
  }
  
  /**
   * 后向传递 - 计算最晚开始和最晚完成时间
   * @private
   */
  private backwardPass(): void {
    // 找出所有没有后继任务的结束任务
    const endTasks = Object.values(this.nodes).filter(node => node.successors.length === 0);
    
    // 找出项目的最晚完成时间（所有结束任务的最早完成时间的最大值）
    const projectEndTime = Math.max(...endTasks.map(node => node.earlyFinish));
    
    // 初始化所有结束任务的lateFinish和lateStart
    for (const node of endTasks) {
      node.lateFinish = projectEndTime;
      node.lateStart = node.lateFinish - node.duration;
    }
    
    // 从终点任务开始，反向计算所有任务的lateStart和lateFinish
    const visited = new Set<string>();
    
    const processedEndTasks = new Set<string>();
    for (const node of endTasks) {
      processedEndTasks.add(String(node.id));
    }
    
    let allTasksProcessed = false;
    
    while (!allTasksProcessed) {
      allTasksProcessed = true;
      
      for (const nodeId in this.nodes) {
        if (visited.has(nodeId) || processedEndTasks.has(nodeId)) {
          continue;
        }
        
        const node = this.nodes[nodeId];
        
        // 检查所有后继任务是否已处理
        const allSuccessorsProcessed = node.successors.every(
          succId => visited.has(String(succId)) || processedEndTasks.has(String(succId))
        );
        
        if (allSuccessorsProcessed) {
          // 最晚完成时间 = 所有后继任务的最晚开始时间的最小值
          node.lateFinish = Math.min(...node.successors.map(
            succId => this.nodes[String(succId)].lateStart
          ));
          
          node.lateStart = node.lateFinish - node.duration;
          
          visited.add(nodeId);
        } else {
          // 还有后继任务没处理
          allTasksProcessed = false;
        }
      }
    }
  }
  
  /**
   * 计算浮动时间并标记关键路径
   * @private
   */
  private calculateFloatAndMarkCriticalPath(): void {
    for (const nodeId in this.nodes) {
      const node = this.nodes[nodeId];
      
      // 浮动时间 = 最晚开始时间 - 最早开始时间
      node.float = node.lateStart - node.earlyStart;
      
      // 标记关键路径（浮动时间为0的任务）
      node.isCritical = node.float === 0;
    }
  }
  
  /**
   * 识别可能存在的多条关键路径
   * @private
   */
  private identifyCriticalPaths(): TaskId[][] {
    // 找出关键路径上的所有任务
    const criticalTaskIds = Object.values(this.nodes)
      .filter(node => node.isCritical)
      .map(node => node.id);
    
    if (criticalTaskIds.length === 0) {
      return [];
    }
    
    // 构建仅包含关键任务的子图
    const criticalGraph: Record<string, TaskId[]> = {};
    
    for (const taskId of criticalTaskIds) {
      const taskIdKey = String(taskId);
      criticalGraph[taskIdKey] = this.nodes[taskIdKey].successors.filter(
        succId => criticalTaskIds.includes(succId)
      );
    }
    
    // 找出所有开始任务（无前置关键任务）
    const startTasks = criticalTaskIds.filter(taskId => 
      !criticalTaskIds.some(otherId => 
        this.nodes[String(otherId)].successors.includes(taskId)
      )
    );
    
    // 找出所有结束任务（无后继关键任务）
    const endTasks = criticalTaskIds.filter(taskId => 
      this.nodes[String(taskId)].successors.filter(
        succId => criticalTaskIds.includes(succId)
      ).length === 0
    );
    
    // 使用DFS找出所有从起始到结束的路径
    const paths: TaskId[][] = [];
    
    for (const startTask of startTasks) {
      for (const endTask of endTasks) {
        const findPaths = (currentId: TaskId, currentPath: TaskId[]): void => {
          const newPath = [...currentPath, currentId];
          
          if (currentId === endTask) {
            paths.push(newPath);
            return;
          }
          
          for (const nextId of criticalGraph[String(currentId)] || []) {
            if (!currentPath.includes(nextId)) { // 避免循环
              findPaths(nextId, newPath);
            }
          }
        };
        
        findPaths(startTask, []);
      }
    }
    
    return paths;
  }
  
  /**
   * 获取任务的最早开始日期（日历日期）
   * @param taskId 任务ID
   */
  public getTaskEarlyStartDate(taskId: TaskId): Date | null {
    const node = this.nodes[String(taskId)];
    if (!node) return null;
    
    const earlyStartDays = node.earlyStart;
    return addDays(this.startDate, earlyStartDays);
  }
  
  /**
   * 获取任务的最早完成日期（日历日期）
   * @param taskId 任务ID
   */
  public getTaskEarlyFinishDate(taskId: TaskId): Date | null {
    const node = this.nodes[String(taskId)];
    if (!node) return null;
    
    const earlyFinishDays = node.earlyFinish;
    return addDays(this.startDate, earlyFinishDays);
  }
  
  /**
   * 获取任务的最晚开始日期（日历日期）
   * @param taskId 任务ID
   */
  public getTaskLateStartDate(taskId: TaskId): Date | null {
    const node = this.nodes[String(taskId)];
    if (!node) return null;
    
    const lateStartDays = node.lateStart;
    return addDays(this.startDate, lateStartDays);
  }
  
  /**
   * 获取任务的最晚完成日期（日历日期）
   * @param taskId 任务ID
   */
  public getTaskLateFinishDate(taskId: TaskId): Date | null {
    const node = this.nodes[String(taskId)];
    if (!node) return null;
    
    const lateFinishDays = node.lateFinish;
    return addDays(this.startDate, lateFinishDays);
  }
  
  /**
   * 获取项目预计完成日期
   */
  public getProjectEndDate(): Date {
    // 项目结束日期 = 项目开始日期 + 项目持续时间
    const projectDuration = Object.values(this.nodes)
      .filter(node => node.successors.length === 0) // 找出所有终点任务
      .reduce((maxDuration, node) => Math.max(maxDuration, node.earlyFinish), 0);
    
    return addDays(this.startDate, projectDuration);
  }
  
  /**
   * 检查任务是否在关键路径上
   * @param taskId 任务ID
   */
  public isTaskCritical(taskId: TaskId): boolean {
    const node = this.nodes[String(taskId)];
    return node ? node.isCritical : false;
  }
  
  /**
   * 获取任务的浮动时间（天数）
   * @param taskId 任务ID
   */
  public getTaskFloat(taskId: TaskId): number | null {
    const node = this.nodes[String(taskId)];
    return node ? node.float : null;
  }
}

/**
 * 创建关键路径分析器的工厂函数
 * @param tasks 任务列表
 * @param dependencies 依赖关系列表
 * @param startDate 项目开始日期（可选）
 * @returns CriticalPathAnalyzer 实例
 */
export function createCriticalPathAnalyzer(
  tasks: Task[],
  dependencies: Dependency[],
  startDate?: Date
): CriticalPathAnalyzer {
  return new CriticalPathAnalyzer(tasks, dependencies, startDate);
}

// 导出默认的工厂函数
export default createCriticalPathAnalyzer; 