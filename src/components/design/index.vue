<!--
 * @Author: chan-max 2651308363@qq.com
 * @Date: 2024-02-11 09:10:15
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-06-04 20:51:49
 * @FilePath: /yishe/src/components/design/index.vue
 * @Description: 
 * 
 * Copyright (c) 2024 by 1s, All Rights Reserved. 
-->
<template>
  <div class="designiy" :class="isDarkMode ? 'dark' : 'light'">
    <main-view></main-view>
  </div>
</template>
<script setup>
import mainView from "./layout/main.vue";
import { isDarkMode, isEdit, currentEditingModelInfo } from "./store";
import { usePreventScreenResize } from "./composition/preventScreenResize";
import { onBeforeRouteLeave, useRoute } from "vue-router";
import { onBeforeMount, onMounted, onBeforeUnmount, ref, watchEffect } from "vue";
import { getModelById } from "@/api";
import { useStats } from "@/common/use/stats";
import { message, Modal } from "ant-design-vue";
import { s1Confirm } from "@/common/message";
// useStats()

// 阻止缩放屏幕影响使用体验
usePreventScreenResize();

// onBeforeMount(async () => {
//   window.addEventListener("beforeunload", onbeforeunload);
// });

// onBeforeUnmount(() => {
//   window.removeEventListener("beforeunload", onbeforeunload);
// });

function onbeforeunload(e) {
  e = e || window.event;
  if (e) {
    e.returnValue = "关闭提示";
  }

  return '关闭提示';
}

watchEffect(() => {
  if (typeof document === "undefined") {
    return;
  }
  document.body.classList.toggle("designiy-dark", isDarkMode.value);
  document.body.classList.toggle("designiy-light", !isDarkMode.value);
});

onBeforeUnmount(() => {
  if (typeof document === "undefined") {
    return;
  }
  document.body.classList.remove("designiy-dark", "designiy-light");
});

onBeforeRouteLeave(async (to, from, next) => {
  await s1Confirm({
    content: "确认要离开当前页面吗",
  });
  next();
});
</script>
<style lang="less">
@import url(./theme.less);
@import url(./style.less);

.designiy {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: stretch;
  align-items: stretch;
  background: var(--1s-shell-background);
  color: var(--1s-text-color);

  * {
    -webkit-user-drag: none;
  }
}
</style>

<style scoped></style>
