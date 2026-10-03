<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2023-12-14 19:04:03
 * @LastEditors: chan-max 2651308363@qq.com
 * @LastEditTime: 2024-02-18 09:13:42
 * @FilePath: /yishe/src/components/design/layout/subHeaderMenu/index.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by 1s, All Rights Reserved. 
-->
<template>
  <div class="designiy-sub-header">
    <div class="designiy-sub-header__mode">
      {{ isEdit ? "编辑" : "新建" }}
    </div>

    <div class="designiy-sub-header__group">
      <button class="designiy-sub-header__btn">
        <icon-prev class="designiy-sub-header__icon"></icon-prev>
      </button>
      <button class="designiy-sub-header__btn">
        <icon-prev
          style="transform: rotateY(180deg)"
          class="designiy-sub-header__icon"
        ></icon-prev>
      </button>
    </div>

    <div class="flex-1"></div>

    <Tooltip>
      <TooltipTrigger as-child>
        <button class="designiy-sub-header__btn" @click="$emit('takephoto')">
          <icon-camera class="designiy-sub-header__icon"></icon-camera>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">截屏</TooltipContent>
    </Tooltip>

    <div class="designiy-sub-header__divider" />

    <online-point :online="online"></online-point>
  </div>
</template>

<script setup>
import { ref } from "vue";
import headerMenuDropdown from "../headerMenuDropdown/index.vue";
import onlinePoint from "../../components/onlinePoint.vue";
import {
  isDarkMode,
  online,
  isEdit,
  currentEditingModelInfo,
  currentModelController,
} from "../../store";
import iconPrev from "@/icon/design/prev.svg?component";
import iconCamera from "@/icon/camera.svg?component";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
</script>

<style lang="less" scoped>
.designiy-sub-header {
  width: 100%;
  height: 100%;
  background: var(--1s-surface-background);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0 12px;
  column-gap: 4px;
  border-bottom: 1px solid var(--1s-divider-color);
}

.designiy-sub-header__mode {
  font-size: 11px;
  color: var(--1s-text-color-tertiary);
  user-select: none;
  margin-right: 8px;
  white-space: nowrap;
}

.designiy-sub-header__group {
  display: flex;
  align-items: center;
  gap: 1px;
}

.designiy-sub-header__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 5px;
  background: none;
  color: var(--1s-text-color-secondary);
  cursor: pointer;
  transition: background 0.08s, color 0.08s;

  &:hover {
    background: var(--1s-hover-overlay);
    color: var(--1s-text-color);
  }

  &:active {
    background: var(--1s-pressed-overlay);
  }
}

.designiy-sub-header__icon {
  width: 14px;
  height: 14px;
}

.designiy-sub-header__divider {
  width: 1px;
  height: 14px;
  background: var(--1s-divider-color);
  margin: 0 4px;
}
</style>
