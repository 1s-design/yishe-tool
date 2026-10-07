<template>
  <div class="operate-form-item u-prop-row" :style="style">
    <div class="operate-form-item-left u-prop-row__label">
      <div v-if="$slots.icon" class="operate-form-item-icon">
        <slot name="icon"></slot>
      </div>
      <div class="operate-form-item-title">
        <slot name="name">{{ label || name }}</slot>
      </div>
    </div>
    <div class="operate-form-item-content u-prop-row__value">
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
});
</script>

<style lang="less">
.operate-form-item {
  min-height: 28px;
  padding: 2px 4px;
  gap: 6px;

  .operate-form-item-content > * {
    min-width: 0;
    max-width: 100%;
  }
}

.operate-form-item-left {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 4px;
  flex: 0 0 76px;
  min-width: 0;
  max-width: 76px;
}

.operate-form-item-icon {
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--1s-text-color-secondary);
  flex-shrink: 0;

  svg {
    width: 12px;
    height: 12px;
  }
}

.operate-form-item-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: var(--1s-control-font);
  font-weight: 500;
  color: var(--1s-text-color-secondary);
  line-height: 1.2;
  white-space: nowrap;
  user-select: none;
  flex: 1;
}

.operate-form-item-content {
  gap: 5px;
  min-width: 0;
  overflow: hidden;
  font-size: var(--1s-control-font);
}
</style>
