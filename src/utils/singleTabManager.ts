/*
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2025-07-10 08:17:03
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-07-10 08:27:56
 * @FilePath: /design-server/Users/jackie/workspace/1s/src/utils/singleTabManager.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * @Description: 单标签页管理器 - 确保同时只有一个浏览器标签页打开系统
 */

interface SingleTabManagerOptions {
  disabled?: boolean
  reason?: string
  scopeId?: string
}

// 单标签页管理功能
export function setupSingleTabManager(options: SingleTabManagerOptions = {}) {
  if (options.disabled) {
    console.log(`单标签页管理器已跳过${options.reason ? `：${options.reason}` : ''}`);
    return true;
  }

  const scopeId = String(options.scopeId || 'default').replace(/[^a-zA-Z0-9:_-]/g, '')
  const TAB_KEY = `design_system_active_tab:${scopeId}`;
  const currentTabId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // 本地存储可能已满（QuotaExceededError）或被禁用：单标签页限制属于增强能力，
  // 任何存储异常都不能阻断应用启动，否则页面会一直 loading。
  const safeGet = (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('[singleTabManager] 读取本地存储失败，已忽略:', error);
      return null;
    }
  };
  const safeSet = (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('[singleTabManager] 写入本地存储失败（可能已超出配额），已跳过多标签页检查:', error);
      return false;
    }
  };
  const safeRemove = (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('[singleTabManager] 清理本地存储失败:', error);
    }
  };
  
  // 检查是否已有其他标签页打开
  const existingTabId = safeGet(TAB_KEY);
  const currentTime = Date.now();
  
  if (existingTabId && existingTabId !== currentTabId) {
    // 检查现有标签页是否还在活跃（5秒内更新过）
    const lastUpdateTime = safeGet(`${TAB_KEY}_time`);
    if (lastUpdateTime && (currentTime - parseInt(lastUpdateTime)) < 5000) {
      // 有其他活跃标签页，关闭当前页面
      console.log('检测到其他活跃标签页，关闭当前页面');
      
      // 延迟1秒后尝试关闭窗口
      setTimeout(() => {
        window.close();
      }, 1000);
      return false;
    }
  }
  
  // 设置当前标签页为活跃标签页
  if (!safeSet(TAB_KEY, currentTabId) || !safeSet(`${TAB_KEY}_time`, currentTime.toString())) {
    // 存储不可用则直接放弃多标签页限制，保证应用可用
    return true;
  }
  
  // 定期更新活跃状态（每2秒）
  let updateInterval = setInterval(() => {
    safeSet(`${TAB_KEY}_time`, Date.now().toString());
  }, 2000);
  
  // 监听storage事件，检测其他标签页的更新
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === `${TAB_KEY}_time` && e.newValue) {
      const newTime = parseInt(e.newValue);
      const currentTime = Date.now();
      
      // 如果其他标签页更新了时间戳，且比当前标签页更新，则关闭当前页面
      if (newTime > currentTime - 3000) { // 3秒内的更新认为是活跃的
        console.log('检测到其他标签页更新，关闭当前页面');
        clearInterval(updateInterval);
        window.removeEventListener('storage', handleStorageChange);
        window.close();
      }
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  // 页面卸载时清理
  window.addEventListener('beforeunload', () => {
    clearInterval(updateInterval);
    window.removeEventListener('storage', handleStorageChange);
    // 如果当前标签页是活跃标签页，清除标记
    if (safeGet(TAB_KEY) === currentTabId) {
      safeRemove(TAB_KEY);
      safeRemove(`${TAB_KEY}_time`);
    }
  });
  
  // 页面隐藏时暂停更新，显示时恢复更新
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // 页面隐藏，暂停更新
      clearInterval(updateInterval);
    } else {
      // 页面显示，恢复更新
      updateInterval = setInterval(() => {
        safeSet(`${TAB_KEY}_time`, Date.now().toString());
      }, 2000);
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  console.log('单标签页管理器已启动');
  return true;
} 
