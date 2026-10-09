<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2023-11-29 21:41:57
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2023-12-25 23:09:19
 * @FilePath: /1s/src/components/design/layout/textSticker/index.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by 1s, All Rights Reserved. 
-->
<template>
  <div class="designiy-text-sticker">
    <div class="designiy-text-sticker-header">
      <div class="relative w-full">
        <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input v-model="input" placeholder="" class="pl-8 pr-8 bg-[#f9f9f9] -none" />
        <SlidersHorizontal class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
      </div>
    </div>
    <div class="designiy-text-sticker-body">
      <resource></resource>
    </div>
  </div>
</template>

<script setup lang="ts">
import resource from "./resource.vue";
import { ref } from "vue";
import { Search, SlidersHorizontal } from "lucide-vue-next";
import { Input } from "@/components/ui/input";
const input = ref("");
const value = ref();
const options = ref([]);
</script>
<style lang="less" scoped>
.designiy-text-sticker {
  display: flex;
  flex-direction: column;
  width: auto;
  width: 300px;
  height: 100%;
  justify-content: space-between;
}

.designiy-text-sticker-header {
  padding: 10px;
  row-gap: 10px;
  display: flex;
  flex-direction: column;
}

.designiy-text-sticker-body {
  flex: 1;
  overflow: auto;
}
</style>
