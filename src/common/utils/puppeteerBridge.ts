/**
 * Puppeteer 通信桥接对象
 * 提供与 Puppeteer 自动化脚本的通信接口
 */

import { useRouter } from "vue-router";
import _router from "@/modules/main/router";
import { useEventBus } from '@vueuse/core';


interface NavigationOptions {
  timeout?: number;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
}

interface ClickOptions {
  selector: string;
  timeout?: number;
  waitForSelector?: boolean;
}

interface ApiCallOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

class PuppeteerBridge {
  private listeners: Map<string, (data: any) => void> = new Map();
  private consoleLogs: string[] = [];

  constructor() {
    // this.initConsoleCapture();
    this.exposeToWindow();
    
    // 验证挂载是否成功
    setTimeout(() => {
      if ((window as any).puppeteerBridge === this) {
        console.log('✅ PuppeteerBridge 成功挂载到 window.puppeteerBridge');
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(name => name !== 'constructor');
        console.log('可用方法:', methods.join(', '));
      } else {
        console.warn('⚠️ PuppeteerBridge 挂载可能有问题，尝试重新挂载');
        this.exposeToWindow();
        
        // 再次检查
        setTimeout(() => {
          if ((window as any).puppeteerBridge === this) {
            console.log('✅ 重新挂载成功');
          } else {
            console.error('❌ 重新挂载失败，请手动调用 window.mountPuppeteerBridge()');
          }
        }, 100);
      }
    }, 100);
  }

  /**
   * 初始化控制台日志捕获
   */
  private initConsoleCapture() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    console.log = (...args) => {
      this.consoleLogs.push(`[LOG] ${args.join(' ')}`);
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      this.consoleLogs.push(`[ERROR] ${args.join(' ')}`);
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      this.consoleLogs.push(`[WARN] ${args.join(' ')}`);
      originalWarn.apply(console, args);
    };

    console.info = (...args) => {
      this.consoleLogs.push(`[INFO] ${args.join(' ')}`);
      originalInfo.apply(console, args);
    };
  }

  /**
   * 导航到指定页面
   */
  async navigateTo(path: string, options: NavigationOptions = {}): Promise<void> {
    const { timeout = 30000, waitUntil = 'networkidle2' } = options;
    try {

      // 使用 Vue Router 进行导航
      const router = _router

      if (router) {
        await router.push(path);
        console.log(`导航到页面: ${path}`);
      } else {
        // 如果没有 router，使用 window.location
        window.location.href = path;
      }
    } catch (error) {
      console.error('导航失败:', error);
      throw error;
    }
  }


  async gotoDesignPage(){
     if (window.location.pathname === '/design') {
       // 已在design页面，直接等待事件
       return new Promise((resolve) => {
         const bus = useEventBus('design-page-loaded');
         const stop = bus.on(() => {
           stop();
           resolve(true);
         });
       });
     } else {
       await this.navigateTo('/design');
       // 监听页面加载完成事件
       return new Promise((resolve) => {
         const bus = useEventBus('design-page-loaded');
         const stop = bus.on(() => {
           stop(); // 只监听一次
           resolve(true);
         });
       });
     }
  }

  /**
   * 点击元素
   */
  async clickElement(options: ClickOptions): Promise<void> {
    const { selector, timeout = 5000, waitForSelector = true } = options;
    
    try {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`元素未找到: ${selector}`);
      }
      
      (element as HTMLElement).click();
      console.log(`点击元素: ${selector}`);
    } catch (error) {
      console.error('点击元素失败:', error);
      throw error;
    }
  }

  /**
   * 输入文本
   */
  async typeText(selector: string, text: string, options: { timeout?: number; clear?: boolean } = {}): Promise<void> {
    const { timeout = 5000, clear = true } = options;
    
    try {
      const element = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
      if (!element) {
        throw new Error(`输入元素未找到: ${selector}`);
      }
      
      if (clear) {
        element.value = '';
      }
      
      element.value += text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      
      console.log(`在 ${selector} 中输入文本: ${text}`);
    } catch (error) {
      console.error('输入文本失败:', error);
      throw error;
    }
  }

  /**
   * 调用 API
   */
  async callApi(options: ApiCallOptions): Promise<any> {
    const { url, method = 'GET', data, headers = {}, timeout = 10000 } = options;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: data ? JSON.stringify(data) : undefined
      });
      
      const result = await response.json();
      console.log(`API调用成功: ${method} ${url}`, result);
      return result;
    } catch (error) {
      console.error('API调用失败:', error);
      throw error;
    }
  }

  /**
   * 等待元素出现
   */
  async waitForElement(selector: string, timeout: number = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkElement = () => {
        const element = document.querySelector(selector);
        if (element) {
          console.log(`元素已出现: ${selector}`);
          resolve();
          return;
        }
        
        if (Date.now() - startTime > timeout) {
          reject(new Error(`等待元素超时: ${selector}`));
          return;
        }
        
        setTimeout(checkElement, 100);
      };
      
      checkElement();
    });
  }

  /**
   * 获取页面截图
   */
  async takeScreenshot(options: { path?: string; fullPage?: boolean; quality?: number } = {}): Promise<string> {
    const { fullPage = false, quality = 80 } = options;
    
    try {
      // 使用 html2canvas 进行截图
      const html2canvas = (window as any).html2canvas;
      if (!html2canvas) {
        throw new Error('html2canvas 未加载');
      }
      
      const canvas = await html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        scale: 1,
        scrollX: 0,
        scrollY: 0,
        width: fullPage ? document.documentElement.scrollWidth : window.innerWidth,
        height: fullPage ? document.documentElement.scrollHeight : window.innerHeight
      });
      
      const dataUrl = canvas.toDataURL('image/png', quality / 100);
      console.log('截图完成');
      return dataUrl;
    } catch (error) {
      console.error('截图失败:', error);
      throw error;
    }
  }

  /**
   * 执行 JavaScript 代码
   */
  async evaluateScript(script: string): Promise<any> {
    try {
      const result = eval(script);
      console.log(`执行脚本: ${script}`, result);
      return result;
    } catch (error) {
      console.error('执行脚本失败:', error);
      throw error;
    }
  }

  /**
   * 监听事件
   */
  on(eventType: string, callback: (data: any) => void): void {
    this.listeners.set(eventType, callback);
    console.log(`注册事件监听: ${eventType}`);
  }

  /**
   * 移除事件监听
   */
  off(eventType: string): void {
    this.listeners.delete(eventType);
    console.log(`移除事件监听: ${eventType}`);
  }

  /**
   * 触发自定义事件
   */
  async triggerEvent(eventType: string, data: any = {}): Promise<void> {
    try {
      const listener = this.listeners.get(eventType);
      if (listener) {
        listener(data);
      }
      
      // 同时触发 DOM 事件
      const event = new CustomEvent(eventType, { detail: data });
      document.dispatchEvent(event);
      
      console.log(`触发事件: ${eventType}`, data);
    } catch (error) {
      console.error('触发事件失败:', error);
      throw error;
    }
  }

  /**
   * 获取页面信息
   */
  async getPageInfo(): Promise<{
    url: string;
    title: string;
    viewport: { width: number; height: number };
  }> {
    return {
      url: window.location.href,
      title: document.title,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }

  /**
   * 滚动页面
   */
  async scrollTo(options: { x?: number; y?: number; selector?: string; behavior?: 'auto' | 'smooth' } = {}): Promise<void> {
    const { x, y, selector, behavior = 'smooth' } = options;
    
    try {
      if (selector) {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({ behavior });
        }
      } else {
        window.scrollTo({ left: x || 0, top: y || 0, behavior });
      }
      
      console.log(`滚动页面:`, { x, y, selector, behavior });
    } catch (error) {
      console.error('滚动失败:', error);
      throw error;
    }
  }

  /**
   * 等待网络请求完成
   */
  async waitForNetworkIdle(timeout: number = 30000): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('网络空闲等待完成');
        resolve();
      }, timeout);
    });
  }

  /**
   * 获取元素信息
   */
  async getElementInfo(selector: string): Promise<{
    text: string;
    value: string;
    attributes: Record<string, string>;
    boundingBox: { x: number; y: number; width: number; height: number };
  }> {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`元素未找到: ${selector}`);
    }
    
    const rect = element.getBoundingClientRect();
    const attributes: Record<string, string> = {};
    
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }
    
    return {
      text: element.textContent || '',
      value: (element as HTMLInputElement).value || '',
      attributes,
      boundingBox: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      }
    };
  }

  /**
   * 检查元素是否存在
   */
  async elementExists(selector: string): Promise<boolean> {
    const element = document.querySelector(selector);
    return !!element;
  }

  /**
   * 获取所有匹配的元素
   */
  async getElements(selector: string): Promise<string[]> {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map(el => el.outerHTML);
  }

  /**
   * 设置视口大小
   */
  async setViewport(width: number, height: number): Promise<void> {
    // 在浏览器环境中，这通常由 Puppeteer 处理
    console.log(`设置视口大小: ${width}x${height}`);
  }

  /**
   * 模拟键盘按键
   */
  async pressKey(key: string): Promise<void> {
    const event = new KeyboardEvent('keydown', { key, bubbles: true });
    document.dispatchEvent(event);
    console.log(`按键: ${key}`);
  }

  /**
   * 模拟鼠标移动
   */
  async moveMouse(x: number, y: number): Promise<void> {
    const event = new MouseEvent('mousemove', { 
      clientX: x, 
      clientY: y, 
      bubbles: true 
    });
    document.dispatchEvent(event);
    console.log(`鼠标移动到: ${x}, ${y}`);
  }

  /**
   * 获取控制台日志
   */
  async getConsoleLogs(): Promise<string[]> {
    return [...this.consoleLogs];
  }

  /**
   * 清除控制台日志
   */
  async clearConsoleLogs(): Promise<void> {
    this.consoleLogs = [];
    console.log('控制台日志已清除');
  }

  /**
   * 获取 Vue 应用实例
   */
  getVueApp(): any {
    return (window as any).__VUE_APP__ || (window as any).$app;
  }

  /**
   * 获取 Vue Router 实例
   */
  getRouter(): any {
    return (window as any).$router || (window as any).__VUE_ROUTER__;
  }

  /**
   * 获取 Pinia Store
   */
  getStore(storeName: string): any {
    const pinia = (window as any).__PINIA__;
    if (pinia && pinia._s) {
      return pinia._s.get(storeName);
    }
    return null;
  }

  /**
   * 等待 Vue 组件加载完成
   */
  async waitForVueReady(): Promise<void> {
    return new Promise((resolve) => {
      const checkVue = () => {
        if (document.querySelector('#app') && (window as any).__VUE_APP__) {
          resolve();
        } else {
          setTimeout(checkVue, 100);
        }
      };
      checkVue();
    });
  }

  /**
   * 暴露到全局 window 对象
   */
  private exposeToWindow() {
    // 直接挂载到 window
    (window as any).puppeteerBridge = this;
    
    // 同时挂载到全局对象（兼容不同环境）
    if (typeof global !== 'undefined') {
      (global as any).puppeteerBridge = this;
    }
    
    // 确保在 DOM 加载完成后也能访问
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        (window as any).puppeteerBridge = this;
        console.log('PuppeteerBridge 在 DOMContentLoaded 后重新挂载');
      });
    }
    
    // 在 window load 后再次确保挂载
    window.addEventListener('load', () => {
      (window as any).puppeteerBridge = this;
      console.log('PuppeteerBridge 在 window load 后重新挂载');
    });
    
    console.log('PuppeteerBridge 已挂载到 window.puppeteerBridge');
    
    // 添加一个全局检查函数
    (window as any).checkPuppeteerBridge = () => {
      return !!(window as any).puppeteerBridge;
    };
  }

  /**
   * 获取桥接状态
   */
  getStatus(): { connected: boolean; listeners: number; consoleLogs: number } {
    return {
      connected: true,
      listeners: this.listeners.size,
      consoleLogs: this.consoleLogs.length
    };
  }
}

// 创建并导出实例
export const puppeteerBridge = new PuppeteerBridge();

// 立即挂载到 window（额外保障）
if (typeof window !== 'undefined') {
  (window as any).puppeteerBridge = puppeteerBridge;
  console.log('PuppeteerBridge 立即挂载完成');
  
  // 确保在 Vue 应用挂载后也能访问
  const originalMount = window.addEventListener;
  window.addEventListener('load', () => {
    (window as any).puppeteerBridge = puppeteerBridge;
    console.log('PuppeteerBridge 在 window load 后重新挂载');
  });
  
  // 监听 DOM 变化，确保在 Vue 应用挂载后也能访问
  const observer = new MutationObserver(() => {
    if (document.querySelector('#app') && !(window as any).puppeteerBridge) {
      (window as any).puppeteerBridge = puppeteerBridge;
      console.log('PuppeteerBridge 在 DOM 变化后重新挂载');
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 添加全局函数来手动挂载（以防万一）
if (typeof window !== 'undefined') {
  (window as any).mountPuppeteerBridge = () => {
    (window as any).puppeteerBridge = puppeteerBridge;
    console.log('手动挂载 PuppeteerBridge 完成');
    return true;
  };
}

// 类型声明
declare global {
  interface Window {
    puppeteerBridge: PuppeteerBridge;
    checkPuppeteerBridge: () => boolean;
    mountPuppeteerBridge: () => boolean;
  }
} 