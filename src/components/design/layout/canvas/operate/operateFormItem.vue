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
    <div style="display: flex; column-gap: 2px; align-items: center; min-height: 24px">
      <div class="operate-form-item-icon">
        <slot name="icon"></slot>
      </div>
      <div class="operate-form-item-title">
        <slot name="name"></slot>
        <!-- <el-icon><Warning /></el-icon> -->
      </div>
    </div>
    <!-- <div style="flex: 1"></div> -->
    <div class="operate-form-item-content">
      <slot name="content"> </slot>
    </div>
  </div>
</template>
<script setup>
import { Warning } from "@element-plus/icons-vue";
const props = defineProps({
  name: {
    default: "",
  },
  style: {},
});
</script>
<style lang="less">
.operate-form-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  column-gap: 16px;
  min-height: 40px;
  padding: 1.2rem 0;
  .el-select__wrapper {
    min-height: 24px;
  }
  .el-input__wrapper {
    height: 24px !important;
  }

  .el-select--small .el-select__wrapper {
    font-size: 1rem;
  }
}

.operate-form-item-icon {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  margin: 0 4px;
  font-size: 12px;
  svg {
    width: 14px;
    height: 14px;
  }
}

.operate-form-item-title {
  font-size: 1rem;
  line-height: normal;
  text-wrap: nowrap;
  display: flex;
  align-items: center;
}

.operate-form-item-content {
  display: flex;
  align-items: center;
  justify-content: end;
  height: 100%;
  flex: 1;
  padding-right: 0.5rem;
  column-gap: 1rem;
  font-size: 1rem;
}
</style>
