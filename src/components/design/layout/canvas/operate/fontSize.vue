<template>
  <operate-form-item>
    <template #name> {{ label }} </template>
    <template #content>
      <div class="unit-input">
        <input
          class="unit-input__field"
          type="number"
          v-model.number="model.value"
          min="0"
          step="10"
        />
        <button
          type="button"
          class="unit-input__unit"
          :title="`当前单位 ${model.unit}，点击切换`"
          @click="cycleUnit"
        >
          {{ model.unit }}
        </button>
      </div>
    </template>
  </operate-form-item>
</template>

<script setup lang="tsx">
import { computed } from "vue";
import { canvasStickerOptionsOnlyChild} from "@/components/design/layout/canvas/index.tsx";

const props = defineProps({
  label: {
    default: "文字大小",
  },
  tooltip: {
    default: "",
  },
});

const model = defineModel<any>({ default: () => ({ value: 0, unit: 'px' }) });

const unitOptions = computed(() => {
  return [
    {
      label: `使用当前画布单位(${canvasStickerOptionsOnlyChild.value.width.unit})`,
      value: canvasStickerOptionsOnlyChild.value.width.unit,
    },
    {
      label: "画布宽度百分比",
      value: "vw",
    },
    {
      label: "画布高度度百分比",
      value: "vh",
    },
  ];
});

function cycleUnit() {
  const opts = unitOptions.value;
  const idx = opts.findIndex((o) => o.value === model.value?.unit);
  const next = opts[(idx + 1) % opts.length];
  model.value = { ...model.value, unit: next.value };
}
</script>

<style scoped lang="less">
.unit-input {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
  min-width: 0;
  height: var(--1s-control-h-sm);
  border: 1px solid transparent;
  border-radius: 5px;
  background: var(--1s-control-surface-muted);
  padding: 0 2px 0 8px;
  box-sizing: border-box;
  transition: border-color 80ms, background-color 80ms;

  &:hover {
    border-color: var(--1s-border-color);
    background: var(--1s-surface-background);
  }

  &:focus-within {
    border-color: var(--1s-accent-color);
    background: var(--1s-surface-background);
    box-shadow: 0 0 0 2px var(--1s-focus-ring-color);
  }
}

.unit-input__field {
  flex: 1;
  min-width: 0;
  width: 100%;
  height: 100%;
  border: 0;
  background: transparent;
  color: var(--1s-text-color);
  font-size: var(--1s-control-font-md);
  outline: none;
  padding: 0;
  -moz-appearance: textfield;
  appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

.unit-input__unit {
  flex-shrink: 0;
  height: 18px;
  min-width: 22px;
  padding: 0 5px;
  border: 0;
  border-radius: 3px;
  background: var(--1s-state-hover);
  color: var(--1s-text-color-tertiary);
  font-size: 10px;
  line-height: 1;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: var(--1s-state-active);
    color: var(--1s-text-color-secondary);
  }
}
</style>
