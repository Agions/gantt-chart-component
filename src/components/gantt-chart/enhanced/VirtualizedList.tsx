import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  className?: string;
  style?: React.CSSProperties;
  onVisibleItemsChange?: (startIndex: number, endIndex: number) => void;
}

export function VirtualizedList<T>({ 
  items, 
  renderItem, 
  itemHeight, 
  containerHeight, 
  overscan = 5,
  className = '',
  style = {},
  onVisibleItemsChange
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  
  // 使用useMemo缓存计算结果
  const {
    visibleItemCount,
    totalHeight,
    startIndex,
    endIndex,
    visibleItems
  } = useMemo(() => {
    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );
    const visibleItems = items.slice(startIndex, endIndex + 1);
    
    return {
      visibleItemCount,
      totalHeight,
      startIndex,
      endIndex,
      visibleItems
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);
  
  // 使用useCallback和防抖优化滚动处理
  const handleScroll = useCallback(
    debounce(() => {
      if (containerRef.current) {
        const newScrollTop = containerRef.current.scrollTop;
        setScrollTop(newScrollTop);
        setIsScrolling(false);
        
        // 通知可见项变化
        onVisibleItemsChange?.(startIndex, endIndex);
      }
    }, 16), // 约60fps
    [startIndex, endIndex, onVisibleItemsChange]
  );
  
  // 滚动开始处理
  const handleScrollStart = useCallback(() => {
    setIsScrolling(true);
  }, []);
  
  // 使用IntersectionObserver优化可见性检测
  useEffect(() => {
    const currentContainer = containerRef.current;
    if (currentContainer) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              handleScroll();
            }
          });
        },
        {
          root: currentContainer,
          threshold: 0.1
        }
      );
      
      // 观察容器内的所有项
      currentContainer.querySelectorAll('.virtualized-item').forEach((item) => {
        observer.observe(item);
      });
      
      return () => observer.disconnect();
    }
  }, [handleScroll]);
  
  // 添加滚动事件监听器
  useEffect(() => {
    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener('scroll', handleScrollStart);
      currentContainer.addEventListener('scroll', handleScroll);
      return () => {
        currentContainer.removeEventListener('scroll', handleScrollStart);
        currentContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll, handleScrollStart]);
  
  return (
    <div
      ref={containerRef}
      className={`virtualized-list ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        willChange: 'transform',
        ...style
      }}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative',
          willChange: 'transform'
        }}
      >
        {visibleItems.map((item, idx) => (
          <div
            key={`${startIndex + idx}`}
            className="virtualized-item"
            style={{
              position: 'absolute',
              top: (startIndex + idx) * itemHeight,
              width: '100%',
              height: itemHeight,
              transform: isScrolling ? 'translateZ(0)' : undefined,
              willChange: isScrolling ? 'transform' : undefined
            }}
          >
            {renderItem(item, startIndex + idx)}
          </div>
        ))}
      </div>
    </div>
  );
} 