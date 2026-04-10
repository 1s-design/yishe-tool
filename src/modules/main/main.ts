/*
 * @Author: chan-max 2651308363@qq.com
 * @Date: 2024-02-20 08:07:02
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-07-12 07:27:30
 * @FilePath: /yishe/src/modules/main/main.ts
 * @Description: 
 * 
 * Copyright (c) 2024 by 1s, All Rights Reserved. 
 */

import { createApp } from 'vue'
import 'animate.css';
import '@/index.css'
import { createPinia } from 'pinia'

import router from '../main/router'
import i18n from '@/i18n/index.ts'
import '@/style/base.less'
import '@/style/vars.less'

import Antd from 'ant-design-vue'
import ElementPlus from 'element-plus'

import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import App from './App.vue'
import '@/style/cover-elementplus.scss'
import { apiInstance } from "@/api/apiInstance";
import { defaultResponseInterceptors } from '@/api/apiInterception'

import '@/style/cover-antdesign.less'
import { s1Plugin } from '@/components/export.ts'

// 引入注册组件
import 'virtual:svg-icons-register'

// 引入自动化遮罩层组件
import AutomationOverlay from '@/components/automationOverlay.vue'

import { normalizeTokenValue, useLoginStatusStore, initLoginStoreUserInfo } from '@/store/stores/login';
import { initConfigStoreBasicConfig } from '@/store/stores/config.ts';
import { setupSingleTabManager } from '@/utils/singleTabManager'

const EMBED_RUNTIME_KEY = 'yishe_tool_embed_runtime'

function isEmbeddedRuntime() {
  return window.self !== window.top
}

function parseUrlRuntimeParams() {
  const searchParams = new URLSearchParams(window.location.search)
  const hashQuery = window.location.hash.split('?')[1] || ''
  const hashParams = new URLSearchParams(hashQuery)

  const embedSource = searchParams.get('embed') || hashParams.get('embed') || ''
  const tenantId = searchParams.get('tenantId') || hashParams.get('tenantId') || ''
  const tokenFromUrl = normalizeTokenValue(searchParams.get('token') || hashParams.get('token') || '')

  return {
    embedSource,
    tenantId,
    tokenFromUrl,
  }
}

function syncEmbedRuntimeState(embedSource: string) {
  if (embedSource) {
    sessionStorage.setItem(EMBED_RUNTIME_KEY, embedSource)
    return
  }

  sessionStorage.removeItem(EMBED_RUNTIME_KEY)
}

function cleanupAuthParamsFromUrl() {
  const currentUrl = new URL(window.location.href)
  currentUrl.searchParams.delete('token')
  currentUrl.searchParams.delete('tenantId')

  if (currentUrl.hash.includes('?')) {
    const [hashPath, hashQuery] = currentUrl.hash.slice(1).split('?')
    const nextHashParams = new URLSearchParams(hashQuery || '')
    nextHashParams.delete('token')
    nextHashParams.delete('tenantId')
    const nextHashQuery = nextHashParams.toString()
    currentUrl.hash = nextHashQuery ? `${hashPath}?${nextHashQuery}` : hashPath
  }

  window.history.replaceState({}, '', currentUrl.toString())
}

// 检查并处理 URL 参数中的 token
async function handleUrlToken() {
  const { embedSource, tokenFromUrl } = parseUrlRuntimeParams()
  syncEmbedRuntimeState(embedSource)

  if (!tokenFromUrl) {
    return false
  }

  const loginStore = useLoginStatusStore();
  const loginSuccess = await loginStore.virtualLogin(tokenFromUrl, {
    silent: isEmbeddedRuntime(),
  });

  if (loginSuccess) {
    cleanupAuthParamsFromUrl()
    return true
  }

  return false
}

async function setup() {
  // 启动单标签页管理器
  if (!isEmbeddedRuntime()) {
    const canContinue = setupSingleTabManager();
    if (!canContinue) {
      return; // 如果检测到其他活跃标签页，直接返回
    }
  }

  // pc 端专有的拦截器
  apiInstance.interceptors.response.use(defaultResponseInterceptors);

  const app = createApp(App)

  const pinia = createPinia()

  app.use(s1Plugin)

  // 注册自动化遮罩层组件
  app.component('AutomationOverlay', AutomationOverlay)

  app.use(pinia)

  app.use(Antd)

  app.use(i18n)

  app.use(ElementPlus)

  app.config.globalProperties.__DEV__ = import.meta.env.DEV

  try {
    // 优先处理 URL token，避免旧 token 抢先污染当前会话。
    await handleUrlToken();
  } catch (error) {
    console.error('处理 URL 登录参数失败:', error);
  }

  try {
    await initLoginStoreUserInfo()
  } catch (error) {
    console.error('初始化登录信息失败:', error);
    useLoginStatusStore().logout();
  }

  try {
    await initConfigStoreBasicConfig()
  } catch (error) {
    console.error('初始化基础配置失败:', error);
  }

  app.use(router)
  await router.isReady()

  app.mount('#app')
}
setup()


















