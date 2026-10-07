<template>
  <KeepAlive>
    <transition v-bind="animation">
      <Draggable v-if="show" ref="dialogRef" class="designiy-dialog" v-slot="{ x, y }" :initial-value="{ x, y }"
        :prevent-default="true" :handle="handle" :style="{ zIndex: 1000,}" @vue:mounted="mounted">
        <Teleport to="body">
          <div v-if="show && mask" class="dialog-mask" @click="$emit('close')" :style="{ zIndex: 999 }"></div>
        </Teleport>
        <div ref="handle" v-show="header" class="designiy-dialog-header">
          <div class="designiy-dialog-header-title">
            <slot name="title" v-if="$slots.title"></slot>
            <span v-else> {{ title }} </span>
          </div>
          <div @click="close" class="designiy-dialog-header-close">
            <X class="w-4 h-4" />
          </div>
        </div>
        <div class="designiy-dialog-content">
          <slot></slot>
        </div>
      </Draggable>
    </transition>
  </KeepAlive>
</template>
<script setup>
import { defineProps, ref, onMounted, onBeforeMount, computed, watch } from "vue";
import { useDraggable } from "@vueuse/core";
import { UseDraggable as Draggable } from "@vueuse/components";
import { X } from "lucide-vue-next";
import { onActivated } from "vue";

const handle = ref();
const { x, y, style } = useDraggable(handle, {
  initialValue: {},
});

const dialogRef = ref();

function mounted() {
  if (!dialogRef.value) {
    return;
  }

  if(props.center){
    return
  }
  // 在中间
  let el = dialogRef.value.$el;
  el.style.top =  props.top ||  `calc(50% - ${el.clientHeight / 2}px)`;
}

const props = defineProps({
  title: "", // 顶部标题
  show: {
    default: true,
  }, // 是否展示
  header: {
    default: true,
  },
  // 存在遮罩层时
  mask: {
    default: true,
  },
  animation: {},
  top: {
    default: null
  },
  center:{
    default:true
  }
});

const emits = defineEmits(["close"]);

function close() {
  emits("close");
}
</script>
<style lang="less">
.designiy-dialog {
  background: var(--1s-container-background);
  position: fixed;
  border-radius: var(--1s-control-radius);

  * {
    pointer-events: auto !important;
  }
}

.designiy-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  cursor: move;
  position: relative;
}

.designiy-dialog-header-close {
  color: var(--1s-container-header-text-color);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--1s-state-hover);

  &:hover {
    background-color: var(--1s-state-active);
  }
}

.designiy-dialog-header-title {
  color: var(--1s-text-color);
  font-size: 1.2rem;
}

.designiy-dialog-content {
  width: 100%;
  height: 100%;
  text-align: left;
}

.dialog-mask {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: #000;
  opacity: 0.2;
}
</style>
