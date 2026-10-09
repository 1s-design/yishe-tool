<!--
 * @Author: chan-max 2651308363@qq.com
 * @Date: 2023-12-23 20:38:25
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2023-12-30 20:09:47
 * @FilePath: /1s/src/components/design/components/screenshot.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by 1s, All Rights Reserved. 
-->

<template>
  <audio ref="audio">
    <source src="/audio/screenshot.mp3" type="audio/mp3" />
  </audio>
  <Transition
    name="screenshot"
    @before-enter="transitioning = true"
    @after-enter="transitioning = false"
  >
    <div v-if="show" class="screenshot" @mouseenter="mouseenter" @mouseleave="mouseleave">
      <img :src="src" style="width: 100%; height: 100%; object-fit: contain" />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, defineExpose, nextTick } from "vue";
import { message } from '@/common/message';

// 组件一旦展示就会进入动画流程
const show = ref(false);

// 图片路径
const src = ref();

//截图音频
const audio = ref();

// 清除截图缩略图的定时器
var timer = null;

// 动画是否在运行中
const transitioning = ref(false);

function mouseenter() {
  if (transitioning.value) return;
  clearTimeout(timer);
}

function mouseleave() {
  clear();
}

function clear() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    show.value = false;
  }, 3000);
}

async function execScreenshot(base64) {
  // audio.value.play();
  src.value = base64;
  if (show.value) {
    show.value = false;
    await nextTick();
  }
  show.value = true;
  clear();
}

defineExpose({
  execScreenshot,
});
</script>
<style>
.screenshot {
  position: absolute;
  z-index: 9;
  z-index: 9;
  width: 16em;
  height: 16em;
  right: 3em;
  bottom: 3em;
  border: 5px solid #fff;
  box-: none;
  border-radius: 1em;
  background-color: #fff;
  z-index: 10;
}

.screenshot-enter-from {
  width: 100%;
  height: 100%;
  right: 0;
  bottom: 0;
}

.screenshot-enter-active {
  transition: all 0.2s ease-out;
}

.screenshot-enter-to {
  width: 200px;
  height: auto;
  right: 30px;
  bottom: 30px;
}

.screenshot-leave-to {
  right: -1000px;
  bottom: 30px;
}

.screenshot-leave-active {
  transition: all 1s;
}
</style>
