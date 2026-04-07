<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2023-12-16 12:40:26
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-06-05 23:28:34
 * @FilePath: /yishe/src/modules/main/App.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by 1s, All Rights Reserved. 
-->
<template>
  <a-config-provider :theme="antdTheme" :locale="antLocale">
    <el-config-provider :locale="elementLocale">
      <!-- <header-menu v-if="$route?.meta?.header"></header-menu> -->
      <div class="app-content" :class="appThemeClass">
        <router-view></router-view>
      </div>
    </el-config-provider>
  </a-config-provider>


  <!-- Removed Global Login Modal -->

  <!-- 自动化操作遮罩层 -->
  <AutomationOverlay />
</template>
<script setup>
import { computed, ref, onMounted, watchEffect } from "vue";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import en from "element-plus/dist/locale/en.mjs";
import headerMenu from "./view/base/header/index.vue";
// import footerMenu from "./view/base/footer/index.vue";
import { theme } from 'ant-design-vue'

import antEn from 'ant-design-vue/es/locale/en_US';
import antZh from 'ant-design-vue/es/locale/zh_CN';

import { Modal } from 'ant-design-vue'
import loginForm from '@/modules/main/view/user/login/index.vue'
import { openLoginDialog, showLoginFormModal } from '@/modules/main/view/user/login/index.tsx'
import { useEventBus } from '@vueuse/core';
import { isDarkMode } from '@/components/design/store'


const antLocale = computed(() => {
  if (locale.value == "en") {
    return antEn;
  } else {
    return antZh;
  }
});



const { defaultAlgorithm, darkAlgorithm } = theme


import { useI18n } from "vue-i18n";

const { t, locale, global } = useI18n();

const screenSize = ref(window.innerWidth)

const customToken = computed(() => {
  if (screenSize.value < 768) {
    return { fontSize: 10, controlHeight: 28 }
  } else if (screenSize.value < 1960) {
    return { fontSize: 10, controlHeight: 30 }
  } else {
    return { fontSize: 11, controlHeight: 32 }
  }
})

// 监听窗口大小变化
window.addEventListener('resize', () => {
  screenSize.value = window.innerWidth
})

const antdTheme = computed(() => ({
  algorithm: isDarkMode.value ? darkAlgorithm : defaultAlgorithm,
  token: {
    ...customToken.value,
    colorPrimary: "#2563eb",
    borderRadius: 8,
  },
}))

const appThemeClass = computed(() => (isDarkMode.value ? "tool-theme-dark" : "tool-theme-light"));


const elementLocale = computed(() => {
  if (locale.value == "en") {
    return en;
  } else {
    return zhCn;
  }
});

onMounted(() => {
  const bus = useEventBus('design-page-loaded');
  bus.on(() => {
    console.log('🎉 design-page-loaded 事件已收到，页面已挂载完成');
    // 这里可以做后续处理
  });
});

watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  document.documentElement.classList.toggle('light', !isDarkMode.value)
})




</script>
<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}


#app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* font-family: alimama; */
}

#app>* {
  flex-shrink: 0;
}

.app-content {
  width: 100%;
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: stretch;
  flex-direction: column;
  background: var(--1s-shell-background, #eef2f7);
  color: var(--1s-text-color, #18202c);

  &>* {
    flex-shrink: 0;
  }
}

.app-content.tool-theme-dark {
  color-scheme: dark;
}

.app-content.tool-theme-light {
  color-scheme: light;
}
</style>
