<template>
  <section class="decal-list-panel u-panel">
    <header class="u-panel__header">
      <div class="decal-list-heading">
        <strong>贴纸图层</strong>
        <span>{{ decals.length }}</span>
      </div>
      <div class="u-panel__actions">
        <Button variant="ghost" size="icon-xs" title="滚动到顶部" aria-label="滚动到顶部" @click="goTop">
          <ArrowUp class="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="icon-xs" title="滚动到底部" aria-label="滚动到底部" @click="goBottom">
          <ArrowDown class="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="icon-xs" title="关闭" aria-label="关闭贴纸列表" @click="showDecalList = false">
          <X class="w-3 h-3" />
        </Button>
      </div>
    </header>

    <div class="decal-list-content">
      <div v-if="!decals.length" class="u-panel__empty">无贴纸</div>

      <template v-else>
        <div class="scroller hide-scrollbar" ref="scrollRef">
          <button
            v-for="(item, index) in decals"
            :key="itemId(item) || index"
            type="button"
            class="u-list-row decal-list-row"
            :class="{ 'is-selected': isCurrent(item) }"
            :aria-label="`选择贴纸 ${index + 1}`"
            :aria-current="isCurrent(item) ? 'true' : undefined"
            @click="decalClick(item)"
          >
            <s1-image :src="item.state.url" class="decal-list-thumb"></s1-image>
            <span class="u-list-row__label">{{ decalName(item, index) }}</span>
            <span class="u-list-row__meta">#{{ String(index + 1).padStart(2, '0') }}</span>
          </button>
        </div>
      </template>
    </div>
  </section>
</template>
<script setup>
import {
  currentModelController,
  showDecalList,
  currentOperatingDecalController,
  showDecalControl,
} from "../../store";
import { computed, ref } from "vue";
import { useScroll } from "@vueuse/core";
import { X, ArrowUp, ArrowDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button';

const scrollRef = ref();

const { y } = useScroll(scrollRef, {
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

function isCurrent(item) {
  return Boolean(
    currentOperatingDecalController.value &&
      itemId(item) === itemId(currentOperatingDecalController.value),
  );
}

function itemId(item) {
  return item?.id?.value ?? item?.id;
}

function decalName(item, index) {
  return item?.info?.name || item?.state?.name || `贴纸 ${index + 1}`;
}

const decals = computed(() => currentModelController.value?.decalControllers ?? []);
</script>
<style lang="less" scoped>
.decal-list-panel {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.decal-list-heading {
  display: flex;
  align-items: baseline;
  gap: 5px;
  min-width: 0;

  strong {
    color: var(--1s-text-color);
    font-size: var(--1s-control-font-md);
    font-weight: 600;
  }

  span {
    color: var(--1s-text-color-tertiary);
    font-size: var(--1s-control-font);
    font-variant-numeric: tabular-nums;
  }
}

.decal-list-content {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 6px 8px 8px;
}

.scroller {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
  height: 100%;
  min-height: 0;
  overflow: auto;
  padding: 1px 0;
  box-sizing: border-box;
}

.decal-list-row {
  width: 100%;
  min-height: 32px;
  height: 32px;
  padding: 3px 6px;
  border: 0;
  background: transparent;
  color: inherit;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.decal-list-thumb {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid var(--1s-border-color);
  border-radius: 0;
  background: var(--1s-control-surface-muted);

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}


</style>
