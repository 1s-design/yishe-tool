<template>
  <main v-click="click" class="png-background">
    <div id="canvas-container" ref="canvasBackgroundEl">
      <div
        id="canvas-text"
        ref="canvasTextEl"
        :contenteditable="editable"
        @input="input"
        @blur="blur"
        @paste="paste"
      ></div>
    </div>
  </main>
</template>
<script setup>
import { onMounted, ref, nextTick } from "vue";
import { operatingTextStickerOptions } from "../../store";
import { useDebounceFn } from "@vueuse/core";

import { vClick } from "../../composition/vClick";
import {
  canvasTextEl,
  canvasBackgroundEl,
  base64,
  forceUpdateTextSticker,
} from "./watch";

// 输入文字内容
const input = useDebounceFn(function input(e) {
  // 阻止tab切换焦点
  if (e.keyCode === 9) {
    e.preventDefault();
  }
  operatingTextStickerOptions.content = canvasTextEl.value.innerText;
}, 500);

const editable = ref(false);

const justBlured = ref(false);

function blur() {
  justBlured.value = true;
  editable.value = false;
  setTimeout(() => {
    justBlured.value = false;
  }, 100);
}

async function click() {
  if (justBlured.value) {
    // 此情况为点击了画布但是非输入框的位置，此情况应该让失焦,并为不可编辑
    editable.value = false;
    justBlured.value = false;
    return;
  }

  // 可编辑状态
  if (editable.value) {
    justBlured.value = false;
    return;
  }

  editable.value = true;
  justBlured.value = false;
  await nextTick();
  canvasTextEl.value.focus();
  //设置光标到最后
  var range = window.getSelection();
  range.selectAllChildren(canvasTextEl.value);
  range.collapseToEnd();
}

onMounted(async () => {
  canvasTextEl.value.innerText = operatingTextStickerOptions.content;
  forceUpdateTextSticker();
});

// 处理粘贴时富文本影响
function paste(e) {
  let paste = (event.clipboardData || window.clipboardData).getData("text");
  paste = paste.toUpperCase();
  const selection = window.getSelection();
  if (!selection.rangeCount) return false;
  selection.deleteFromDocument();
  selection.getRangeAt(0).insertNode(document.createTextNode(paste));
  event.preventDefault();
}
</script>
<style lang="less" scoped>
main {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: auto;
  border-radius: 4px;
  cursor: pointer;
  box-sizing: border-box;
  position: relative;
  border: 1px solid transparent;
  box-sizing: border-box;
  border: 2px solid #eee;
  &:focus-within {
    border: 2px solid var(--1s-accent-color);
  }
}

#canvas-container {
  position: relative;
  font-family: Microsoft Yahei;
}

#canvas-text {
  white-space: pre;
  outline: none;
  min-width: 1px; // 保证在没有内容时也能显示光标
  caret-color: var(--1s-accent-color);
  font-family: Microsoft Yahei;
}
</style>
