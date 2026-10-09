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
import { ref, onMounted, onBeforeUnmount, provide } from "vue";
import iconMenu from "@/icon/menu.svg?component";
import menuMain from "./main.vue";

const showHeaderMenuDropdown = ref(false);

function toggle() {
  showHeaderMenuDropdown.value = !showHeaderMenuDropdown.value;
}

const clicker = ref(false);

provide("clicker", clicker);

function closeDropdown() {
  showHeaderMenuDropdown.value = false;
}

onMounted(() => document.body.addEventListener("click", closeDropdown));
onBeforeUnmount(() => document.body.removeEventListener("click", closeDropdown));
</script>

<style lang="less">
.designiy-header-menu-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--1s-control-h-md);
  height: var(--1s-control-h-md);
  border-radius: 0;
  color: var(--1s-text-color-secondary);

  &:hover {
    background: var(--1s-state-hover);
    color: var(--1s-text-color);
  }
}

.designiy-header-menu-dropdown-content {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: var(--1s-z-dropdown);
}
</style>
