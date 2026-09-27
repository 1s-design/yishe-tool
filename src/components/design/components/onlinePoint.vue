<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2023-12-16 11:19:12
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2023-12-30 15:36:42
 * @FilePath: /1s/src/components/design/components/onlinePoint.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by 1s, All Rights Reserved. 
-->

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <div
        class="online-point"
        :class="online ? 'online-point-online' : 'online-point-offonline'"
      >
        <div @animationend="animationend" :class="{ 'online-point-effect': effect }"></div>
      </div>
    </TooltipTrigger>
    <TooltipContent>{{ online ? '网络连接正常' : '已断线' }}</TooltipContent>
  </Tooltip>
</template>

<script setup>
import { ref, defineProps } from "vue";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const props = defineProps(["online"]);

const effect = ref(true);

function animationend() {
  effect.value = false;
}

function ping() {
  effect.value = true;
}

window.ping = ping;
</script>

<style lang="less">
.online-point {
  position: relative;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.online-point-online {
  background-color: rgba(0, 255, 0, 0.9);
  .online-point-effect {
    box-shadow: 0px 0px 2px 2px rgba(0, 255, 0, 0.3) inset;
  }
}

.online-point-offonline {
  background-color: red;
  .online-point-effect {
    box-shadow: 0px 0px 2px 2px red inset;
  }
}

.online-point-effect {
  position: absolute;
  border-radius: 50%;
  height: 100%;
  width: 100%;
  animation: pulsate 2s ease-out;
  animation-iteration-count: 1;
  opacity: 1;
}

@keyframes pulsate {
  0% {
    transform: scale(0.5, 0.5);
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  50% {
    transform: scale(2, 2);
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}
</style>
