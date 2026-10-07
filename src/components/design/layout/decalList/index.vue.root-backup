<template>
  <div class="fixed" style="height: calc(100vh - 160px); bottom: 24px; right: 12px">
    <div v-if="!decals.length" style="text-align: center">无贴纸</div>

    <div style="position: relative; height: calc(100% - 64px)">
      <div class="to-top btn" v-show="!arrivedState.top" @click="goTop">
        <ArrowUp class="w-3.5 h-3.5" />
      </div>
      <div class="to-bottom btn" v-show="!arrivedState.bottom" @click="goBottom">
        <ArrowDown class="w-3.5 h-3.5" />
      </div>
      <div
        class="scroller flex flex-col hide-scrollbar items-center"
        ref="scrollRef"
        :class="{
          'gradient-top': !arrivedState.top && arrivedState.bottom,
          'gradient-bottom': !arrivedState.bottom && arrivedState.top,
          'gradient-both': !arrivedState.bottom && !arrivedState.top,
        }"
        style="height: 100%; overflow: auto"
      >
        <template v-for="item in decals">
          <div class="item" @click="decalClick(item)">
            <s1-image :src="item.state.url"></s1-image>
          </div>
        </template>
      </div>
    </div>

    <div style="height: 64px" class="flex items-center justify-center">
      <Button variant="outline" size="icon-sm" class="rounded-full" @click="showDecalList = false">
        <X class="w-3.5 h-3.5" />
      </Button>
    </div>
  </div>
</template>
<script setup>
import {
  currentOperatingBaseModelInfo,
  currentModelController,
  showDecalList,
  currentOperatingDecalController,
  showDecalControl,
} from "../../store";
import { computed, reactive } from "vue";
import { useScroll } from "@vueuse/core";
import { Plus, X, ArrowUp, ArrowDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button';
import unUploadIcon from "@/icon/un-upload.svg?component";

const scrollRef = ref();

const { x, y, isScrolling, arrivedState, directions } = useScroll(scrollRef, {
  behavior: "smooth",
});

function goTop() {
  y.value = 0;
}

function goBottom() {
  y.value = 999999;
}

function decalClick(item) {
  currentOperatingDecalController.value = item;
  showDecalControl.value = true;
}

function unUpload() {}

const decals = computed(() => {
  return currentModelController.value.decalControllers;
});
</script>
<style lang="less" scoped>
.scroller {
  row-gap: 12px;
  min-width: 120px;
  padding: 1rem;
}

.btn {
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  color: var(--1s-text-color-secondary);
  border: none;
  height: 24px;
  width: 64px;
  border-radius: 5px;
  z-index: 10;
  cursor: pointer;
  left: calc(50% - 32px);
  transition: background 0.1s, color 0.1s;

  &:hover {
    background-color: var(--1s-hover-overlay);
    color: var(--1s-text-color);
  }
}

.to-top {
  top: 0;
}

.to-bottom {
  bottom: 0;
}

.item {
  height: 108px;
  width: 108px;
  flex-shrink: 0;
  
  background-color: var(--1s-control-surface-background);
  border-radius: 8px;
  border: 2px solid var(--1s-control-border-color);
  transition: all 0.3s;
  position: relative;

  &:hover {
    border-color: var(--1s-accent-color);
  }
}

// 竖向两端 渐变
.gradient-both {
  mask-image: linear-gradient(
    0deg,
    transparent 0%,
    transparent 28px,
    rgba(0, 0, 0) 70px,
    rgba(0, 0, 0) calc(100% - 70px),
    transparent calc(100% - 28px)
  );
}

.gradient-top {
  mask-image: linear-gradient(
    0deg,
    rgba(0, 0, 0) 70px,
    rgba(0, 0, 0) calc(100% - 70px),
    transparent calc(100% - 28px)
  );
}

.gradient-bottom {
  mask-image: linear-gradient(0deg, transparent 0%, transparent 28px, rgba(0, 0, 0) 70px);
}

.gradient-top {
}
</style>
