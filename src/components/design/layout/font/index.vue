<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2025-05-20 06:50:38
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-08-15 05:12:19
 * @FilePath: /1s/src/components/design/layout/font/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <Dialog :modal="false" v-model:open="showFontModal">
    <DialogContent class="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 rounded-none gap-0 overflow-hidden flex flex-col">
      <DialogHeader class="px-5 py-3 border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
        <DialogTitle class="text-sm font-semibold">字体库</DialogTitle>
      </DialogHeader>
      <div class="flex-1 overflow-auto min-h-0">
        <page></page>
      </div>
    </DialogContent>
  </Dialog>
</template>
<script setup>
import { ref, onBeforeMount } from "vue";
import { Modal } from '@/common/message';
import { getFontListApi } from "@/api";
import { showFontModal } from "../../store.ts";
import { usePaging } from "@/hooks/data/paging.ts";
import Utils from '@/common/utils'
import page from './page.vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
 
function handleOk(){
  
}

function onAfterOpen() {
  console.log('Font modal opened successfully');
}

function onAfterClose() {
  console.log('Font modal closed');
}

</script>
<style lang="less">
.font-a-modal {
  overflow:hidden;
  z-index: 10000 !important;
}
</style>
