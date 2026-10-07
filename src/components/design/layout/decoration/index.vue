<template>
  <section class="designiy-decoration u-panel">
    <header class="u-panel__header">
      <div class="decoration-heading">
        <strong>装饰</strong>
        <span>即将开放</span>
      </div>
    </header>
    <div class="u-panel__empty decoration-empty">
      <Sparkles class="decoration-empty__icon" />
      <strong>暂无可用装饰工具</strong>
      <small>装饰模块会在后续版本加入，当前请从左侧选择贴纸或画布。</small>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Sparkles } from "lucide-vue-next";
</script>

<style scoped lang="less">
.designiy-decoration {
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--1s-panel-background);
}

.decoration-heading {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;

  strong {
    color: var(--1s-text-color);
    font-size: var(--1s-control-font-md);
    font-weight: 600;
  }

  span {
    color: var(--1s-text-color-tertiary);
    font-size: var(--1s-control-font);
  }
}

.decoration-empty {
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-height: 180px;

  strong {
    color: var(--1s-text-color-secondary);
    font-size: var(--1s-control-font-md);
    font-weight: 600;
  }

  small {
    max-width: 170px;
    color: var(--1s-text-color-tertiary);
    font-size: var(--1s-control-font);
    line-height: 1.55;
  }
}

.decoration-empty__icon {
  width: 22px;
  height: 22px;
  margin-bottom: 2px;
  color: var(--1s-text-color-tertiary);
}
</style>
