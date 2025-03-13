import { Task, Dependency } from '../types';

interface CacheConfig {
  maxSize?: number;
  ttl?: number; // 缓存生存时间（毫秒）
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class CacheManager {
  private taskCache: Map<string, CacheEntry<Task>> = new Map();
  private dependencyCache: Map<string, CacheEntry<Dependency>> = new Map();
  private calculationCache: Map<string, CacheEntry<any>> = new Map();
  private readonly config: Required<CacheConfig>;
  
  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize || 1000,
      ttl: config.ttl || 5 * 60 * 1000 // 默认5分钟
    };
  }
  
  // 缓存任务数据
  setTask(task: Task): void {
    this.taskCache.set(task.id, {
      data: task,
      timestamp: Date.now()
    });
    this.enforceMaxSize(this.taskCache);
  }
  
  // 获取任务数据
  getTask(taskId: string): Task | null {
    const entry = this.taskCache.get(taskId);
    if (!entry) return null;
    
    if (this.isExpired(entry)) {
      this.taskCache.delete(taskId);
      return null;
    }
    
    return entry.data;
  }
  
  // 缓存依赖关系数据
  setDependency(dependency: Dependency): void {
    const key = `${dependency.fromId}-${dependency.toId}`;
    this.dependencyCache.set(key, {
      data: dependency,
      timestamp: Date.now()
    });
    this.enforceMaxSize(this.dependencyCache);
  }
  
  // 获取依赖关系数据
  getDependency(fromId: string, toId: string): Dependency | null {
    const key = `${fromId}-${toId}`;
    const entry = this.dependencyCache.get(key);
    if (!entry) return null;
    
    if (this.isExpired(entry)) {
      this.dependencyCache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  // 缓存计算结果
  setCalculation<T>(key: string, data: T): void {
    this.calculationCache.set(key, {
      data,
      timestamp: Date.now()
    });
    this.enforceMaxSize(this.calculationCache);
  }
  
  // 获取计算结果
  getCalculation<T>(key: string): T | null {
    const entry = this.calculationCache.get(key);
    if (!entry) return null;
    
    if (this.isExpired(entry)) {
      this.calculationCache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  // 清除过期缓存
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.taskCache.entries()) {
      if (this.isExpired(entry)) {
        this.taskCache.delete(key);
      }
    }
    
    for (const [key, entry] of this.dependencyCache.entries()) {
      if (this.isExpired(entry)) {
        this.dependencyCache.delete(key);
      }
    }
    
    for (const [key, entry] of this.calculationCache.entries()) {
      if (this.isExpired(entry)) {
        this.calculationCache.delete(key);
      }
    }
  }
  
  // 清除所有缓存
  clearAll(): void {
    this.taskCache.clear();
    this.dependencyCache.clear();
    this.calculationCache.clear();
  }
  
  // 检查缓存项是否过期
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > this.config.ttl;
  }
  
  // 强制执行最大缓存大小限制
  private enforceMaxSize(cache: Map<string, CacheEntry<any>>): void {
    if (cache.size > this.config.maxSize) {
      const entriesToDelete = Array.from(cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, cache.size - this.config.maxSize);
      
      entriesToDelete.forEach(([key]) => cache.delete(key));
    }
  }
  
  // 获取缓存统计信息
  getStats(): { tasks: number; dependencies: number; calculations: number } {
    return {
      tasks: this.taskCache.size,
      dependencies: this.dependencyCache.size,
      calculations: this.calculationCache.size
    };
  }
} 