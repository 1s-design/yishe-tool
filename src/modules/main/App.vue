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
  <TooltipProvider :delay-duration="150">
    <div class="app-content" :class="appThemeClass">
      <router-view></router-view>
    </div>
    <!-- shadcn Dialog-based login modal -->
    <login-form />
  </TooltipProvider>

  <!-- shadcn Toast host -->
  <ToastHost />

  <AutomationOverlay />
</template>
<script setup>
import { computed, ref, watchEffect } from "vue";

import loginForm from '@/modules/main/view/user/login/index.vue'
import { isDarkMode } from '@/components/design/store'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ToastHost } from '@/components/ui/toast'

import { useI18n } from "vue-i18n";

const { t, locale, global } = useI18n();

const screenSize = ref(window.innerWidth)

// 监听窗口大小变化
window.addEventListener('resize', () => {
  screenSize.value = window.innerWidth
})

const appThemeClass = computed(() => (isDarkMode.value ? "tool-theme-dark" : "tool-theme-light"));

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
