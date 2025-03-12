/**
 * 浏览器兼容性检测工具
 * 用于检测当前浏览器环境是否支持甘特图组件的关键特性
 */

/**
 * 检测浏览器是否支持所有必需的特性
 * @returns {boolean} 如果浏览器兼容所有必需的特性，则返回true
 */
export function isCompatible(): boolean {
  const checks = [
    checkES6Support(),
    checkDOMFeatures(),
    checkEventFeatures(),
    checkCSSFeatures()
  ];
  
  return checks.every(check => check === true);
}

/**
 * 检测浏览器是否支持ES6特性
 */
function checkES6Support(): boolean {
  try {
    // 检测箭头函数 - 使用Function构造函数代替eval
    new Function('return () => {}')();
    
    // 检测Promise
    if (typeof Promise === 'undefined') return false;
    
    // 检测Map和Set
    if (typeof Map === 'undefined' || typeof Set === 'undefined') return false;
    
    // 检测解构赋值
    new Function('const { a } = { a: 1 }; return a === 1;')();
    
    // 检测模板字符串
    new Function('return `test` === "test";')();
    
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 检测DOM特性支持
 */
function checkDOMFeatures(): boolean {
  // 检测querySelector和querySelectorAll
  if (!document.querySelector || !document.querySelectorAll) return false;
  
  // 检测classList
  if (!('classList' in document.documentElement)) return false;
  
  // 检测addEventListener
  if (!window.addEventListener) return false;
  
  // 检测ResizeObserver
  if (typeof ResizeObserver === 'undefined') {
    console.warn('ResizeObserver不受支持，某些功能可能受限');
    // ResizeObserver不是必须的，所以不返回false
  }
  
  return true;
}

/**
 * 检测事件特性支持
 */
function checkEventFeatures(): boolean {
  // 检测MouseEvent和TouchEvent
  if (typeof MouseEvent === 'undefined') {
    return false;
  }
  
  // 检测passive事件支持
  let passiveSupported = false;
  try {
    const options = Object.defineProperty({}, 'passive', {
      get: function() {
        passiveSupported = true;
        return true;
      }
    });
    window.addEventListener('test', null as any, options);
    window.removeEventListener('test', null as any, options);
  } catch (err) {
    passiveSupported = false;
  }
  
  if (!passiveSupported) {
    console.warn('被动事件侦听器不受支持，触摸性能可能受影响');
    // passive不是必须的，所以不返回false
  }
  
  return true;
}

/**
 * 检测CSS特性支持
 */
function checkCSSFeatures(): boolean {
  const el = document.createElement('div');
  
  // 检测flex布局
  if (!(('flexBasis' in el.style) || ('webkitFlexBasis' in el.style))) {
    return false;
  }
  
  // 检测transform
  if (!(('transform' in el.style) || ('webkitTransform' in el.style))) {
    return false;
  }
  
  // 检测transition
  if (!(('transition' in el.style) || ('webkitTransition' in el.style))) {
    return false;
  }
  
  return true;
}

/**
 * 获取详细的兼容性信息
 * @returns {Object} 包含各项特性兼容性信息的对象
 */
export function getCompatibilityDetails(): { [key: string]: boolean } {
  return {
    es6Support: checkES6Support(),
    domFeatures: checkDOMFeatures(),
    eventFeatures: checkEventFeatures(),
    cssFeatures: checkCSSFeatures()
  };
}

/**
 * 检测当前浏览器兼容性并输出警告（如果需要）
 */
export function checkBrowserCompatibility(): void {
  if (!isCompatible()) {
    console.warn(
      '您的浏览器可能不完全支持甘特图组件的所有功能。' +
      '建议使用最新版本的Chrome、Firefox、Safari或Edge浏览器。'
    );
    
    const details = getCompatibilityDetails();
    console.debug('兼容性详情:', details);
  }
}

/**
 * 推荐的浏览器版本
 */
export const RECOMMENDED_BROWSERS = [
  { name: 'Chrome', version: '>=90' },
  { name: 'Firefox', version: '>=88' },
  { name: 'Safari', version: '>=14' },
  { name: 'Edge', version: '>=90' }
];

// 自动运行兼容性检查
if (typeof window !== 'undefined') {
  // 确保在浏览器环境中运行
  checkBrowserCompatibility();
} 