<template>
  <div class="sticker-panel u-panel">
    <div class="u-panel__header">
      <div class="sticker-panel__title">
        <strong>贴纸素材</strong>
        <span>{{ total }} 项</span>
      </div>
      <Button variant="ghost" size="icon-xs" title="刷新" @click="refresh">
        <RefreshCw class="h-3 w-3" />
      </Button>
    </div>

    <div class="search">
      <div class="search__field">
        <Search class="search__icon" />
        <Input
          v-model="stickerSearchQueryParams.searchText"
          placeholder="搜索贴纸名称或编码"
          class="search__input"
          @keyup.enter="handleSearch"
        />
      </div>
      <Button variant="outline" size="sm" :disabled="loading" @click="handleSearch">搜索</Button>
    </div>

    <div class="scroll-list u-panel__body" :class="{ 'is-loading': loading }">
      <div v-if="loading" class="skeleton-grid" aria-label="正在加载贴纸">
        <div v-for="index in 8" :key="index" class="skeleton-item">
          <div class="skeleton-image"></div>
          <div class="skeleton-title"></div>
        </div>
      </div>

      <div v-else-if="list.length === 0" class="empty u-panel__empty">
        <ImageIcon :size="32" class="empty-icon" />
        <div class="empty-text">暂无贴纸</div>
        <div class="empty-hint">试试其他搜索关键词</div>
      </div>

      <div v-else class="list-grid">
        <div v-for="item in list" :key="item.id" class="item">
          <div class="image-wrapper">
            <s1-image
              :src="item.url"
              class="image"
              :meta="item"
              :showSize="true"
              @load="imgLoad"
            ></s1-image>
            <div v-if="item.code" class="code-badge">{{ item.code }}</div>
          </div>
          <sticker-popover :stickerInfo="item">
            <div class="bar">
              <div class="title text-ellipsis">{{ item.name || "未命名" }}</div>
              <ArrowRight class="h-3 w-3" />
            </div>
          </sticker-popover>
        </div>
      </div>
    </div>

    <div class="pagination-wrapper" v-if="total > 0">
      <Button variant="ghost" size="icon-xs" :disabled="currentPage <= 1" @click="handleCurrentChange(currentPage - 1)">‹</Button>
      <span>{{ currentPage }} / {{ Math.max(1, Math.ceil(total / pageSize)) }}</span>
      <Button variant="ghost" size="icon-xs" :disabled="currentPage >= Math.ceil(total / pageSize)" @click="handleCurrentChange(currentPage + 1)">›</Button>
    </div>
  </div>
</template>
<script setup lang="tsx">
import { ref, watch } from "vue";
import { Search, ArrowRight, RefreshCw, Image as ImageIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStickerList } from "@/api";
import stickerPopover from "./stickerPopover.vue";
import { currentModelController } from "@/components/design/store";
import { initDraggableElement } from "@/components/design/utils/draggable";

const stickerSearchQueryParams = ref({
  searchText: "",
});

const list = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

function refresh() {
  currentPage.value = 1;
  getList();
}

function handleSearch() {
  currentPage.value = 1;
  getList();
}

function handleSizeChange(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  getList();
}

function handleCurrentChange(page: number) {
  currentPage.value = page;
  getList();
}

function imgLoad(el, meta) {
  // 如果 el 是 s1-image 组件，需要找到内部的 img 元素
  const img = el.tagName === 'IMG' ? el : el.querySelector('img') || el;
  if (!img) return;
  
  initDraggableElement(img, async () => {
    let info = img.meta || meta;
    currentModelController.value.stickToMousePosition({
      img: img,
      type: "image",
      local: false,
      src: img.src,
      id: info.id,
      ...info,
    });
  });
}

async function getList() {
  loading.value = true;
  try {
    const res = await getStickerList({
      match: [stickerSearchQueryParams.value.searchText].filter(Boolean),
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    });
    list.value = res.list || [];
    total.value = res.total || 0;
  } catch (error) {
    console.error("获取贴纸列表失败:", error);
    list.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

// 初始化加载
getList();
</script>
<style lang="less" scoped>
.sticker-panel {
  width: 100%;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  background: var(--1s-panel-background);
}

.sticker-panel__title {
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
    font-variant-numeric: tabular-nums;
  }
}

.search {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 6px 6px;
  border-bottom: 1px solid var(--1s-divider-color);
}

.search__field {
  position: relative;
  flex: 1;
  min-width: 0;
}

.search__icon {
  position: absolute;
  top: 50%;
  left: 7px;
  width: 13px;
  height: 13px;
  color: var(--1s-text-color-tertiary);
  pointer-events: none;
  transform: translateY(-50%);
}

.search__input {
  height: var(--1s-control-h-md);
  padding-left: 25px;
  font-size: var(--1s-control-font-md);
}

.scroll-list {
  padding: 6px;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--1s-panel-background);
  transition: opacity var(--1s-transition-fast);
}

.scroll-list.is-loading {
  opacity: 0.72;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px;
  width: 100%;
}

.skeleton-item {
  overflow: hidden;
  border: 1px solid var(--1s-control-border-color);
  border-radius: var(--1s-control-radius);
  background: var(--1s-control-surface-background);
}

.skeleton-image,
.skeleton-title {
  position: relative;
  overflow: hidden;
  background: var(--1s-control-surface-muted);

  &::after {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      100deg,
      transparent 20%,
      rgba(255, 255, 255, 0.08) 45%,
      transparent 70%
    );
    content: '';
    transform: translateX(-100%);
    animation: u-skeleton-shimmer 1.15s ease-in-out infinite;
  }
}

.skeleton-image {
  height: 88px;
  border-bottom: 1px solid var(--1s-divider-color);
}

.skeleton-title {
  width: 68%;
  height: 8px;
  margin: 8px 6px;
  border-radius: 999px;
}

@keyframes u-skeleton-shimmer {
  to {
    transform: translateX(100%);
  }
}

.list-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px;
  width: 100%;
  box-sizing: border-box;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--1s-control-border-color);
  border-radius: var(--1s-control-radius);
  background: var(--1s-control-surface-background);
  transition: var(--1s-control-transition);

  &:hover {
    border-color: var(--1s-border-color-strong);
    background: var(--1s-elevated-background);
  }
}

.image-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 88px;
  overflow: hidden;
  padding: 5px;
  box-sizing: border-box;
  background-color: var(--1s-control-surface-muted);
  border-bottom: 1px solid var(--1s-divider-color);
}

.image-wrapper :deep(.s1-image) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.image-wrapper :deep(img) {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: var(--1s-control-radius-sm);
}

.code-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 2px 5px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--1s-control-radius-sm);
  background: rgba(0, 0, 0, 0.68);
  color: #fff;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.2;
  pointer-events: none;
  user-select: none;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  width: 100%;
  height: 25px;
  padding: 0 6px;
  box-sizing: border-box;
  color: var(--1s-text-color-secondary);
  font-size: var(--1s-control-font);
  user-select: none;

  &:hover {
    color: var(--1s-text-color);
    cursor: pointer;
    background: var(--1s-state-hover);
  }

  .title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.empty {
  min-height: 132px;
  padding: 20px 12px;
  flex-direction: column;
  gap: 5px;

  .empty-icon {
    color: var(--1s-text-color-tertiary);
  }

  .empty-text {
    color: var(--1s-text-color-secondary);
    font-size: var(--1s-control-font-md);
    font-weight: 500;
  }

  .empty-hint {
    color: var(--1s-text-color-tertiary);
    font-size: var(--1s-control-font);
  }
}

.pagination-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 28px;
  padding: 2px 8px;
  border-top: 1px solid var(--1s-divider-color);
  background: var(--1s-panel-background);
  color: var(--1s-text-color-secondary);
  font-size: var(--1s-control-font);
  font-variant-numeric: tabular-nums;
}
</style>
