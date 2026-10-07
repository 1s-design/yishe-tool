<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2023-11-29 21:41:57
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2023-12-16 23:56:11
 * @FilePath: /1s/src/components/design/layout/headerMenuDropdown/index.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by 1s, All Rights Reserved. 
-->
<template>
  <div class="designiy-header-menu-dropdown">
    <icon-menu
      style="width: 16px; height: 16px; color: var(--1s-text-color-secondary); cursor: pointer"
      @click.stop="toggle"
    ></icon-menu>
    <div v-if="showHeaderMenuDropdown" class="designiy-header-menu-dropdown-content">
      <menu-main></menu-main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from "vue";
import iconMenu from "@/icon/menu.svg?component";
import menuMain from "./main.vue";

const showHeaderMenuDropdown = ref(false);

function toggle() {
  showHeaderMenuDropdown.value = !showHeaderMenuDropdown.value;
}

const clicker = ref(false);

provide("clicker", clicker);

onMounted(() => {
  document.body.addEventListener("click", (e) => {
    showHeaderMenuDropdown.value = false;
  });
});
</script>

<style lang="less">
.designiy-header-menu-dropdown {
  width: 30px;
  height: 30px;
  background: var(--1s-control-surface-muted);
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--1s-text-color);
  border-radius: 5px;
  font-size: 16px;
  position: relative;
}

.designiy-header-menu-dropdown-content {
  position: absolute;
  top: 30px;
  left: 0;
  z-index: 9;
}
</style>
