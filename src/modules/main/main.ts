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
import '@/style/controls.less'

import App from './App.vue'
import { apiInstance } from "@/api/apiInstance";

import { s1Plugin } from '@/components/export.ts'
import { lightDirectivesPlugin } from '@/plugins/lightDirectives'

// 引入注册组件
import 'virtual:svg-icons-register'

// 引入自动化遮罩层组件
import AutomationOverlay from '@/components/automationOverlay.vue'

import { normalizeTokenValue, useLoginStatusStore, initLoginStoreUserInfo } from '@/store/stores/login';
import { initConfigStoreBasicConfig } from '@/store/stores/config.ts';
import { startDesignToolWebSocket } from '@/services/connectionStatus';
import { setupSingleTabManager } from '@/utils/singleTabManager'
import { getDesignRuntimeSnapshot } from '@/services/designRuntime'

const EMBED_RUNTIME_KEY = 'yishe_tool_embed_runtime'
const LAUNCH_RUNTIME_KEY = 'yishe_tool_launch_runtime'
const LAUNCH_PROMPT_RUNTIME_KEY = 'yishe_tool_launch_prompt_runtime'

function getRuntimeParam(searchParams: URLSearchParams, hashParams: URLSearchParams, key: string) {
  return (searchParams.get(key) || hashParams.get(key) || '').trim()
}

function isEmbeddedRuntime() {
  return window.self !== window.top
}

function parseUrlRuntimeParams() {
  const searchParams = new URLSearchParams(window.location.search)
  const hashQuery = window.location.hash.split('?')[1] || ''
  const hashParams = new URLSearchParams(hashQuery)

  const embedSource = getRuntimeParam(searchParams, hashParams, 'embed')
  const tenantId = getRuntimeParam(searchParams, hashParams, 'tenantId')
  const tokenFromUrl = normalizeTokenValue(getRuntimeParam(searchParams, hashParams, 'token'))
  const launchSource = getRuntimeParam(searchParams, hashParams, 'launchSource')
  const launchClientId = getRuntimeParam(searchParams, hashParams, 'launchClientId')
  const launchProfileId = getRuntimeParam(searchParams, hashParams, 'launchProfileId')
  const launchProfileName = getRuntimeParam(searchParams, hashParams, 'launchProfileName')
  const launchMachineCode = getRuntimeParam(searchParams, hashParams, 'launchMachineCode')
  const prompt = getRuntimeParam(searchParams, hashParams, 'prompt')

  return {
    embedSource,
    tenantId,
    tokenFromUrl,
    launchSource,
    launchClientId,
    launchProfileId,
    launchProfileName,
    launchMachineCode,
    prompt,
  }
}

function syncEmbedRuntimeState(embedSource: string) {
  if (embedSource) {
    sessionStorage.setItem(EMBED_RUNTIME_KEY, embedSource)
    return
  }

  sessionStorage.removeItem(EMBED_RUNTIME_KEY)
}

function syncLaunchPromptState(prompt: string) {
  if (prompt) {
    sessionStorage.setItem(
      LAUNCH_PROMPT_RUNTIME_KEY,
      JSON.stringify({
        prompt,
        createdAt: new Date().toISOString(),
        consumed: false,
      }),
    )
  }
}

function syncLaunchRuntimeState(params: ReturnType<typeof parseUrlRuntimeParams>) {
  if (
    params.launchSource === 'admin-design-tool' &&
    params.launchClientId &&
    params.launchProfileId
  ) {
    sessionStorage.setItem(
      LAUNCH_RUNTIME_KEY,
      JSON.stringify({
        source: params.launchSource,
        clientId: params.launchClientId,
        profileId: params.launchProfileId,
        profileName: params.launchProfileName || undefined,
        machineCode: params.launchMachineCode || undefined,
        workspaceId: getDesignRuntimeSnapshot().workspaceId,
        launchedAt: new Date().toISOString(),
      }),
    )
    return
  }

  if (params.launchSource) {
    sessionStorage.removeItem(LAUNCH_RUNTIME_KEY)
  }
}

function cleanupAuthParamsFromUrl() {
  const runtimeParamKeys = [
    'token',
    'tenantId',
    'launchSource',
    'launchClientId',
    'launchProfileId',
    'launchProfileName',
    'launchMachineCode',
    'prompt',
  ]
  const currentUrl = new URL(window.location.href)
  runtimeParamKeys.forEach((key) => currentUrl.searchParams.delete(key))

  if (currentUrl.hash.includes('?')) {
    const [hashPath, hashQuery] = currentUrl.hash.slice(1).split('?')
    const nextHashParams = new URLSearchParams(hashQuery || '')
    runtimeParamKeys.forEach((key) => nextHashParams.delete(key))
    const nextHashQuery = nextHashParams.toString()
    currentUrl.hash = nextHashQuery ? `${hashPath}?${nextHashQuery}` : hashPath
  }

  window.history.replaceState({}, '', currentUrl.toString())
}

// 检查并处理 URL 参数中的 token
async function handleUrlToken() {
  const runtimeParams = parseUrlRuntimeParams()
  const { tokenFromUrl, prompt } = runtimeParams

  if (!tokenFromUrl) {
    return false
  }

  // 安全加固：读取 token 后立即从 URL 中移除，缩短暴露窗口
  cleanupAuthParamsFromUrl()

  const loginStore = useLoginStatusStore();
  const loginSuccess = await loginStore.virtualLogin(tokenFromUrl, {
    silent: isEmbeddedRuntime(),
  });

  return loginSuccess
}

async function setup() {
  const designRuntime = getDesignRuntimeSnapshot()

  // 启动单标签页管理器
  if (!isEmbeddedRuntime()) {
    const canContinue = setupSingleTabManager({
      scopeId: designRuntime.workspaceId,
    });
    if (!canContinue) {
      return; // 如果检测到其他活跃标签页，直接返回
    }
  }

  const app = createApp(App)

  const pinia = createPinia()

  app.use(s1Plugin)

  // 注册自动化遮罩层组件
  app.component('AutomationOverlay', AutomationOverlay)

  app.use(pinia)

  app.use(i18n)

  app.use(lightDirectivesPlugin)

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

  startDesignToolWebSocket();

  app.use(router)
  await router.isReady()

  app.mount('#app')
}
setup()















