/**
 * Puppeteer 通信桥接对象 (已禁用)
 * 为修复构建错误，已按要求删除 puppeteer 相关的代码
 */

export const puppeteerBridge = {};

if (typeof window !== 'undefined') {
  (window as any).puppeteerBridge = puppeteerBridge;
}