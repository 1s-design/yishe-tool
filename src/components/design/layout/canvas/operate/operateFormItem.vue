<template>
  <div class="operate-form-item" :class="{ 'is-stacked': stacked }" :style="style">
    <div class="operate-form-item-label">
      <slot name="name">{{ label || name }}</slot>
    </div>
    <div class="operate-form-item-content">
      <slot name="content">
        <slot></slot>
      </slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: {
    default: "",
  },
  name: {
    default: "",
  },
  style: {},
  stacked: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less">
/* 属性行 — Figma 检查器风格：label | controls，无图标 */
.operate-form-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
  padding: 2px 0;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;

  &.is-stacked {
    align-items: flex-start;

    .operate-form-item-label {
      padding-top: 5px;
    }

    .operate-form-item-content {
      flex-wrap: wrap;
    }
  }
}

.operate-form-item-label {
  flex: 0 0 72px;
  min-width: 0;
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--1s-control-font);
  font-weight: 500;
  line-height: 1.2;
  color: var(--1s-text-color-secondary);
  user-select: none;
}

.operate-form-item-content {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: var(--1s-control-font);
  color: var(--1s-text-color);

  > * {
    min-width: 0;
    max-width: 100%;
  }

  /* ---- 内容区控件统一到 24px 行高 ---- */
  input,
  select,
  textarea {
    height: var(--1s-control-h-sm);
    min-height: var(--1s-control-h-sm);
    font-size: var(--1s-control-font-md);
    box-sizing: border-box;
  }

  input[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  button,
  .u-btn {
    height: var(--1s-control-h-sm);
    min-height: var(--1s-control-h-sm);
  }

  /* 颜色块保持 22px 视觉方块 */
  .color-picker {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }

  /* 内联数值输入默认紧凑宽 */
  input[type="number"] {
    width: 72px;
  }
}
</style>
