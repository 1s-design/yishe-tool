<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2023-12-16 12:40:25
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-11-11 06:59:14
 * @FilePath: /1s/src/components/design/layout/customTextSticker/operateFormItem.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by 1s, All Rights Reserved. 
-->
<template>
  <div class="operate-form-item" :style="style">
    <div class="operate-form-item-left">
      <div v-if="$slots.icon" class="operate-form-item-icon">
        <slot name="icon"></slot>
      </div>
      <div class="operate-form-item-title">
        <slot name="name">{{ label || name }}</slot>
      </div>
    </div>
    <div class="operate-form-item-content">
      <slot name="content">
        <slot></slot>
      </slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: {
    default: "",
  },
  name: {
    default: "",
  },
  style: {},
});
</script>

<style lang="less">
.operate-form-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 8px;
  min-height: 28px;
  padding: 4px 0;
  box-sizing: border-box;

  .el-select__wrapper {
    min-height: 24px !important;
    height: 24px !important;
    padding: 0 6px !important;
    font-size: 11px !important;
    border-radius: 4px !important;
  }

  .el-input__wrapper {
    height: 24px !important;
    min-height: 24px !important;
    padding: 0 6px !important;
    font-size: 11px !important;
    border-radius: 4px !important;
  }

  .el-input-number {
    width: auto !important;
    .el-input__wrapper {
      padding: 0 4px !important;
    }
  }

  .el-button--small {
    height: 24px !important;
    padding: 0 8px !important;
    font-size: 11px !important;
    border-radius: 4px !important;
  }

  .el-color-picker--small {
    height: 24px !important;
    .el-color-picker__trigger {
      width: 24px !important;
      height: 24px !important;
      padding: 2px !important;
      border-radius: 4px !important;
    }
  }

  .el-slider--small {
    height: 24px !important;
  }
}

.operate-form-item-left {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  min-width: 0;
}

.operate-form-item-icon {
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--1s-text-color-secondary, #71717a);
  flex-shrink: 0;

  svg {
    width: 12px;
    height: 12px;
  }
}

.operate-form-item-title {
  font-size: 11px;
  font-weight: 500;
  color: var(--1s-text-color-secondary, #71717a);
  line-height: 1.2;
  white-space: nowrap;
  user-select: none;
}

.operate-form-item-content {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  min-width: 0;
  gap: 6px;
  font-size: 11px;
}
</style>
