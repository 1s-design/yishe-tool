<template>
  <div class="size-widget">
    <div class="size-widget__title">
      <icon class="size-widget__icon"></icon>
      <span>{{ label }}</span>
      <Tooltip>
        <TooltipTrigger as-child>
          <button
            type="button"
            class="size-widget__lock"
            :class="{ 'is-active': locked }"
            :aria-pressed="locked"
            @click="toggleLock"
          >
            <Lock v-if="locked" class="w-3 h-3" />
            <Unlock v-else class="w-3 h-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{{ locked ? '解锁比例' : '锁定比例' }}</TooltipContent>
      </Tooltip>
    </div>

    <div class="size-widget__row">
      <label class="size-widget__field">
        <span class="size-widget__field-label">宽</span>
        <Input class="size-widget__input" v-model.number="width.value" step="10" placeholder="宽" type="number" @input="onWidthChange" />
        <span class="size-widget__unit">{{ canvasStickerOptions.unit }}</span>
      </label>

      <Tooltip>
        <TooltipTrigger as-child>
          <button type="button" class="size-widget__swap" @click="flipSize">
            <ArrowUpDown class="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">翻转宽高</TooltipContent>
      </Tooltip>

      <label class="size-widget__field">
        <span class="size-widget__field-label">高</span>
        <Input class="size-widget__input" v-model.number="height.value" step="10" placeholder="高" type="number" @input="onHeightChange" />
        <span class="size-widget__unit">{{ canvasStickerOptions.unit }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/size.svg?component";
import { canvasStickerOptions } from '@/components/design/layout/canvas/index.tsx'
import { Lock, Unlock, ArrowUpDown } from "lucide-vue-next";
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { ref } from 'vue'

defineProps({
    label: {
        default: "尺寸",
    }
});

const width = defineModel<any>("width", { default: { value: 0 } });
const height = defineModel<any>("height", { default: { value: 0 } });

const locked = ref(false)
let lockedRatio = 1
let updating = false

function toggleLock() {
    if (!locked.value) {
        const w = Number(width.value?.value) || 0
        const h = Number(height.value?.value) || 0
        lockedRatio = h === 0 ? 1 : w / h
    }
    locked.value = !locked.value
}

function onWidthChange() {
    if (!locked.value || updating) return
    const w = Number(width.value?.value) || 0
    if (w <= 0) return
    updating = true
    const newH = Math.round(w / lockedRatio)
    height.value = { ...height.value, value: newH || 1 }
    updating = false
}

function onHeightChange() {
    if (!locked.value || updating) return
    const h = Number(height.value?.value) || 0
    if (h <= 0) return
    updating = true
    const newW = Math.round(h * lockedRatio)
    width.value = { ...width.value, value: newW || 1 }
    updating = false
}

function flipSize() {
    const w = Number(width.value?.value) || 0
    const h = Number(height.value?.value) || 0
    width.value = { ...width.value, value: h }
    height.value = { ...height.value, value: w }
    // 如果锁定了比例，更新锁定比例
    if (locked.value) {
        lockedRatio = h === 0 ? 1 : w / h
    }
}
</script>

<style scoped lang="less">
.size-widget {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  min-width: 0;
  padding: 4px 8px 6px;
  box-sizing: border-box;
}

.size-widget__title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--1s-control-font);
  font-weight: 550;
  color: var(--1s-text-color-secondary);
  user-select: none;

  > span {
    flex: 1;
    min-width: 0;
  }
}

.size-widget__icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  color: var(--1s-text-color-tertiary);
}

.size-widget__lock {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--1s-text-color-tertiary);
  cursor: pointer;
  transition: background var(--1s-transition-fast), color var(--1s-transition-fast);

  &:hover {
    background: var(--1s-state-hover);
    color: var(--1s-text-color);
  }

  &.is-active {
    color: var(--1s-accent-color);
    background: var(--1s-accent-color-soft);
  }
}

.size-widget__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 24px minmax(0, 1fr);
  align-items: end;
  gap: 4px;
}

.size-widget__field {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;

  .size-widget__field-label {
    flex-shrink: 0;
    font-size: 10px;
    color: var(--1s-text-color-tertiary);
    user-select: none;
  }
}

.size-widget__input {
  min-width: 0;
  width: 100%;
  height: var(--1s-control-h-sm);
  font-size: var(--1s-control-font-md);
}

.size-widget__unit {
  flex-shrink: 0;
  font-size: 9px;
  color: var(--1s-text-color-tertiary);
  user-select: none;
}

.size-widget__swap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: var(--1s-control-h-sm);
  padding: 0;
  border: none;
  border-radius: 0;
  background: var(--1s-surface-background);
  color: var(--1s-text-color-secondary);
  cursor: pointer;
  transition: background var(--1s-transition-fast), color var(--1s-transition-fast);

  &:hover {
    background: var(--1s-state-hover);
    color: var(--1s-text-color);
  }
}
</style>
