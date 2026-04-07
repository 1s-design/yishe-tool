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
// import 'default-passive-events'
import "tailwindcss/tailwind.css"
import { createPinia } from 'pinia'

import router from '../main/router'
import i18n from '@/i18n/index.ts'
import '@/style/base.less'
import '@/style/vars.less'

// 引入 Puppeteer 桥接对象


import Antd from 'ant-design-vue'
//  import "ant-design-vue/dist/antd.css";


import ElementPlus from 'element-plus'

import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/dist/index.css'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import App from './App.vue'
import 'element-plus/dist/index.css'
import '@/style/cover-elementplus.scss'
import { apiInstance } from "@/api/apiInstance";
import { defaultResponseInterceptors } from '@/api/apiInterception'
import { RecycleScroller } from 'vue-virtual-scroller'
import InfiniteLoading from "v3-infinite-loading";
import "v3-infinite-loading/lib/style.css"; //required if you're not going to override default slots
import Api from '@/api'

import '@/style/cover-antdesign.less'
import { s1Plugin } from '@/components/export.ts'

import VxeUI from 'vxe-pc-ui'
import 'vxe-pc-ui/lib/style.css'

import VxeUITable from 'vxe-table'
import 'vxe-table/lib/style.css'

// 引入注册组件
import 'virtual:svg-icons-register'
import AnimateOnScroll from 'primevue/animateonscroll';
import VueMagnifier from '@websitebeaver/vue-magnifier'
import '@websitebeaver/vue-magnifier/styles.css'

// 引入自动化遮罩层组件
import AutomationOverlay from '@/components/automationOverlay.vue'

import { useConfigStore, initConfigStoreBasicConfig } from '@/store/stores/config.ts';
import { normalizeTokenValue, useLoginStatusStore, initLoginStoreUserInfo } from '@/store/stores/login';
import to from 'await-to-js';
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

  console.log('当前 URL:', window.location.href);
  console.log('search 参数:', window.location.search);
  console.log('hash 参数:', window.location.hash);
  console.log('解析到的 token:', tokenFromUrl);

  if (!tokenFromUrl) {
    console.log('无token')
    return false
  }

  console.log('处理urltoken')

  const loginStore = useLoginStatusStore();
  const loginSuccess = await loginStore.virtualLogin(tokenFromUrl, {
    silent: isEmbeddedRuntime(),
  });

  if (loginSuccess) {
    console.log('从 URL 参数获取到 token 并完成虚拟登录');
    cleanupAuthParamsFromUrl()
    return true
  }

  console.error('虚拟登录失败，token 可能无效');
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

  app.use(VxeUI).use(VxeUITable)

  app.component("InfiniteLoading", InfiniteLoading);

  app.component('s1Mangnifier', VueMagnifier)

  // 注册自动化遮罩层组件
  app.component('AutomationOverlay', AutomationOverlay)

  app.directive('animateonscroll', AnimateOnScroll);

  app.use(pinia)

  app.use(VueVirtualScroller)

  app.use(Antd)

  app.use(i18n)

  app.use(ElementPlus)

  app.config.globalProperties.__DEV__ = import.meta.env.DEV

  try {
    // 优先处理 URL token，避免旧 token 抢先污染当前会话。
    await handleUrlToken();
  } catch (error) {
    console.error('处理 URL token 失败:', error);
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

  const loginStore = useLoginStatusStore();
  const currentRouteName = router.currentRoute.value.name;

  if (!loginStore.isLogin && currentRouteName !== 'Login' && currentRouteName !== 'Signup') {
    await router.replace({ name: 'Login' });
  }

  if (loginStore.isLogin && currentRouteName === 'Login') {
    await router.replace({ name: 'Home' });
  }

  app.mount('#app')




}
setup()



















