<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2025-05-20 06:50:38
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-08-15 05:12:19
 * @FilePath: /1s/src/components/design/layout/font/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <a-modal v-model:open="showFontModal" title="字体库" width="100%" class="font-a-modal" @ok="handleOk" :footer="null" :centered="true" wrap-class-name="full-modal">
    <page></page>
  </a-modal>
</template>
<script setup>
import { ref, onBeforeMount } from "vue";
import { getFontListApi } from "@/api";
import { showFontModal } from "../../store.ts";
import { usePaging } from "@/hooks/data/paging.ts";
import Utils from '@/common/utils'
import page from './page.vue'
 
function handleOk(){
  
}

</script>
<style lang="less">
.font-a-modal {
  overflow:hidden;
}

.full-modal {
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }
  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }
  .ant-modal-body {
    flex: 1;
    max-height: calc(100vh - 80px);
  }
}
</style>
