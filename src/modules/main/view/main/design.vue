<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2025-05-20 06:50:38
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-06-02 21:22:58
 * @FilePath: /1s/src/modules/main/view/main/design.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="design-view-container">
    <div class="design-view">
    <designiy></designiy>
  </div>
  </div>
</template>
<script setup>
import designiy from "@/components/design/index.vue";

onMounted(() => {
  console.log('design page mounted')
})

</script>
<style lang="less">

.design-view-container{
  width: 100%;
  height: 100%;
  background: var(--1s-shell-background, #eef2f7);
}

.design-view {
  height: 100%;
  width: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}
</style>
