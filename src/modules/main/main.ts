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
import Utils from '@/common/utils'

// 引入注册组件
import 'virtual:svg-icons-register'
import AnimateOnScroll from 'primevue/animateonscroll';
import VueMagnifier from '@websitebeaver/vue-magnifier'
import '@websitebeaver/vue-magnifier/styles.css'

// 引入自动化遮罩层组件
import AutomationOverlay from '@/components/automationOverlay.vue'

import { useConfigStore, initConfigStoreBasicConfig } from '@/store/stores/config.ts';
import { useLoginStatusStore, initLoginStoreUserInfo } from '@/store/stores/login';
import to from 'await-to-js';
import { setupSingleTabManager } from '@/utils/singleTabManager'

// 检查并处理 URL 参数中的 token
async function handleUrlToken() {
  // 解析 URL 参数，支持 hash 路由
  let tokenFromUrl = null;

  // 方法1: 尝试从 search 参数获取
  const urlParams = new URLSearchParams(window.location.search);
  tokenFromUrl = urlParams.get('token');

  // 方法2: 如果 search 中没有，尝试从 hash 中获取
  if (!tokenFromUrl && window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    tokenFromUrl = hashParams.get('token');
  }

  // 方法3: 直接从完整 URL 中解析
  if (!tokenFromUrl) {
    const fullUrl = window.location.href;
    const tokenMatch = fullUrl.match(/[?&]token=([^&#]+)/);
    if (tokenMatch) {
      tokenFromUrl = decodeURIComponent(tokenMatch[1]);
    }
  }

  console.log('当前 URL:', window.location.href);
  console.log('search 参数:', window.location.search);
  console.log('hash 参数:', window.location.hash);
  console.log('解析到的 token:', tokenFromUrl);

  if (tokenFromUrl) {
    console.log('处理urltoken')

    const loginStore = useLoginStatusStore();

    // 使用虚拟登录方法设置 token 并获取用户信息
    const loginSuccess = await loginStore.virtualLogin(tokenFromUrl);

    if (loginSuccess) {
      console.log('从 URL 参数获取到 token 并完成虚拟登录');

      // 清除 URL 中的 token 参数（避免在地址栏显示）
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('token');

      // 如果 hash 中有 token，也要清除
      if (currentUrl.hash && currentUrl.hash.includes('token=')) {
        const hashUrl = new URL('http://dummy.com' + currentUrl.hash);
        hashUrl.searchParams.delete('token');
        currentUrl.hash = hashUrl.pathname + hashUrl.search;
      }

      window.history.replaceState({}, '', currentUrl.toString());
    } else {
      console.error('虚拟登录失败，token 可能无效');
    }
  } else {
    console.log('无token')
  }
}


async function setup() {

  // 启动单标签页管理器
  const canContinue = setupSingleTabManager();
  if (!canContinue) {
    return; // 如果检测到其他活跃标签页，直接返回
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

  app.use(router)

  app.use(ElementPlus)

  app.config.globalProperties.__DEV__ = import.meta.env.DEV

  await initLoginStoreUserInfo()

  await initConfigStoreBasicConfig()

  // 处理 URL 参数中的 token
  await handleUrlToken();
  app.mount('#app')




}

import { createMobileApp } from '@/modules/mobile/main'

if (Utils.isMobile) {
  createMobileApp()
} else {
  setup()
}





















