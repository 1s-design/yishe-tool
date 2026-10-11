<template>
  <div class="ratio-widget">
    <div class="ratio-widget__title">
      <icon class="ratio-widget__icon"></icon>
      <span>常用比例</span>
    </div>
    <div class="ratio-widget__grid">
      <button
        v-for="item in aspectRatioOptions"
        :key="item.label"
        type="button"
        class="ratio-chip"
        :class="{ 'is-active': activeValue === item.value }"
        :title="item.title || item.label"
        @click="apply(item)"
      >
        {{ item.label }}
      </button>
    </div>
    <div class="ratio-widget__custom">
      <input
        v-model="customRatio"
        class="ratio-input"
        placeholder="如 5:3 或 1.5"
        @keyup.enter="applyCustomRatio"
      />
      <button class="ratio-apply-btn" @click="applyCustomRatio()">应用</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/aspect-ratio.svg?component";
import { computed, ref } from 'vue'

const emit = defineEmits<{
  (e: 'change', ratio: number): void
}>()

const model = defineModel<number | string>({ default: '' })

const aspectRatioOptions = [
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
  { label: '3:2', value: 3 / 2 },
  { label: '2:3', value: 2 / 3 },
  { label: '黄金比', value: 1.618, title: '黄金比 1.618 : 1' },
  { label: '银比例', value: 1 / Math.sqrt(2), title: '银比例 1 : √2' },
]

const customRatio = ref('')

const activeValue = computed(() => {
  const v = Number(model.value)
  if (!v) return null
  return aspectRatioOptions.find((o) => Math.abs(o.value - v) < 0.001)?.value ?? null
})

function applyCustomRatio() {
  const input = customRatio.value.trim();
  if (!input) return;
  
  let ratio = 0;
  
  // 支持多种格式：
  // 1. 比例格式: "5:3", "16:9", "5：3"
  // 2. 小数格式: "1.5", "0.75"
  // 3. 百分比格式: "150%" (宽是高的150%)
  
  const ratioMatch = input.match(/^(\d+(?:\.\d+)?)\s*[:：]\s*(\d+(?:\.\d+)?)$/);
  const decimalMatch = input.match(/^(\d+(?:\.\d+)?)$/);
  const percentMatch = input.match(/^(\d+(?:\.\d+)?)\s*%$/);
  
  if (ratioMatch) {
    // 格式: 5:3
    const w = parseFloat(ratioMatch[1]);
    const h = parseFloat(ratioMatch[2]);
    if (w <= 0 || h <= 0) return;
    ratio = w / h;
  } else if (percentMatch) {
    // 格式: 150% (宽是高的150%)
    const percent = parseFloat(percentMatch[1]);
    if (percent <= 0) return;
    ratio = percent / 100;
  } else if (decimalMatch) {
    // 格式: 1.5 (宽是高的1.5倍)
    const val = parseFloat(decimalMatch[1]);
    if (val <= 0) return;
    ratio = val;
  } else {
    console.error('[AspectRatio] Invalid input format:', input);
    return;
  }
  
  model.value = ratio;
  emit('change', ratio);
}

function apply(item: { label: string; value: number }) {
  model.value = item.value
  emit('change', item.value)
}
</script>

<style scoped lang="less">
.ratio-widget {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  min-width: 0;
  padding: 4px 0 6px;
  box-sizing: border-box;
}

.ratio-widget__title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--1s-control-font);
  font-weight: 550;
  color: var(--1s-text-color-secondary);
  user-select: none;
}

.ratio-widget__icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  color: var(--1s-text-color-tertiary);
}

.ratio-widget__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
}

.ratio-widget__custom {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.ratio-input {
  flex: 1;
  height: 26px;
  padding: 0 8px;
  border: 1px solid var(--1s-border-color);
  border-radius: 4px;
  background: var(--1s-surface-background);
  color: var(--1s-text-color);
  font-size: 11px;
  outline: none;
  
  &:focus {
    border-color: var(--1s-accent-color);
  }
  
  &::placeholder {
    color: var(--1s-text-color-tertiary);
  }
}

.ratio-apply-btn {
  height: 26px;
  padding: 0 10px;
  border: none;
  border-radius: 4px;
  background: var(--1s-accent-color);
  color: white;
  font-size: 11px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
}

.ratio-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 26px;
  min-width: 0;
  padding: 0 6px;
  border: none;
  border-radius: 0;
  background: var(--1s-surface-background);
  color: var(--1s-text-color);
  font-size: var(--1s-control-font-md);
  font-weight: 450;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  transition: background var(--1s-transition-fast), border-color var(--1s-transition-fast);

  &:hover {
    background: var(--1s-state-hover);
    border-color: var(--1s-border-color-strong);
  }

  &.is-active {
    background: var(--1s-state-selected);
    border-color: var(--1s-border-color-strong);
    color: var(--1s-text-color);
    font-weight: 550;
  }
}
</style>
