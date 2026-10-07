<template>
  <div class="container decal-property-panel u-panel" v-if="currentOperatingDecalController">
    <header class="u-panel__header decal-property-header">
      <div class="decal-property-heading">
        <strong>贴纸属性</strong>
        <span>调整位置与材质</span>
      </div>
      <button
        type="button"
        class="u-icon-btn u-icon-btn--xs"
        aria-label="关闭属性面板"
        title="关闭属性面板"
        @click="showDecalControl = false"
      >
        <X class="w-3 h-3" />
      </button>
    </header>

    <section class="decal-preview-wrap u-panel__section">
      <div class="u-panel__section-title">
        <span>贴纸</span>
        <button
          type="button"
          class="u-icon-btn u-icon-btn--xs"
          aria-label="查看贴纸详情"
          title="查看贴纸详情"
          @click="handleStickerImgClick"
        >
          <Info class="w-3 h-3" />
        </button>
      </div>
      <s1-img
        :src="currentOperatingDecalController.state.src"
        class="png-background u-media-preview"
        @click="handleStickerImgClick"
      ></s1-img>
    </section>

    <section class="decal-property-form u-panel__section">
      <div class="u-panel__section-title">
        <span>变换与外观</span>
      </div>
      <div class="custom-form">
        <div class="u-prop-row">
          <Label class="u-prop-row__label">旋转角度</Label>
          <div class="u-prop-row__value u-slider-wrap">
            <Slider
              class="u-slider"
              aria-label="旋转角度"
              :min="0"
              :max="360"
              :step="1"
              :model-value="[currentOperatingDecalController.state.modelValueRotate]"
              @update:model-value="v => (currentOperatingDecalController.state.modelValueRotate = v[0])"
            />
            <span class="u-slider-value">{{ currentOperatingDecalController.state.modelValueRotate }}°</span>
          </div>
        </div>

        <div class="u-prop-row">
          <Label class="u-prop-row__label">贴纸尺寸</Label>
          <div class="u-prop-row__value u-slider-wrap">
            <Slider
              class="u-slider"
              aria-label="贴纸尺寸"
              :min="0"
              :max="100"
              :step="1"
              :model-value="[currentOperatingDecalController.state.modelValueSize]"
              @update:model-value="v => (currentOperatingDecalController.state.modelValueSize = v[0])"
            />
            <span class="u-slider-value">{{ currentOperatingDecalController.state.modelValueSize }}%</span>
          </div>
        </div>

        <div class="u-prop-row">
          <Label class="u-prop-row__label">贴纸粗糙度</Label>
          <div class="u-prop-row__value u-slider-wrap">
            <Slider
              class="u-slider"
              aria-label="贴纸粗糙度"
              :min="0"
              :max="1"
              :step="0.01"
              :model-value="[currentOperatingDecalController.state.roughness]"
              @update:model-value="v => (currentOperatingDecalController.state.roughness = v[0])"
            />
            <span class="u-slider-value">{{ Number(currentOperatingDecalController.state.roughness).toFixed(2) }}</span>
          </div>
        </div>

        <div class="u-prop-row">
          <Label class="u-prop-row__label">金属质感</Label>
          <div class="u-prop-row__value u-slider-wrap">
            <Slider
              class="u-slider"
              aria-label="金属质感"
              :min="0"
              :max="1"
              :step="0.01"
              :model-value="[currentOperatingDecalController.state.metalness]"
              @update:model-value="v => (currentOperatingDecalController.state.metalness = v[0])"
            />
            <span class="u-slider-value">{{ Number(currentOperatingDecalController.state.metalness).toFixed(2) }}</span>
          </div>
        </div>

        <div class="u-prop-row u-prop-row--stacked">
          <Label class="u-prop-row__label">调整位置</Label>
          <div class="u-prop-row__value">
            <div class="position-control-container">
              <div class="direction-pad" aria-label="贴纸位置微调">
                <span class="direction-spacer"></span>
                <Button
                  @click="moveTop"
                  variant="outline"
                  class="direction-btn direction-btn--up"
                  size="icon-sm"
                  title="向上移动"
                >
                  <ArrowUp class="w-3.5 h-3.5" />
                </Button>
                <span class="direction-spacer"></span>
                <Button
                  @click="moveLeft"
                  variant="outline"
                  class="direction-btn direction-btn--left"
                  size="icon-sm"
                  title="向左移动"
                >
                  <ArrowLeft class="w-3.5 h-3.5" />
                </Button>
                <span class="direction-center" aria-hidden="true"></span>
                <Button
                  @click="moveRight"
                  variant="outline"
                  class="direction-btn direction-btn--right"
                  size="icon-sm"
                  title="向右移动"
                >
                  <ArrowRight class="w-3.5 h-3.5" />
                </Button>
                <span class="direction-spacer"></span>
                <Button
                  @click="moveDown"
                  variant="outline"
                  class="direction-btn direction-btn--down"
                  size="icon-sm"
                  title="向下移动"
                >
                  <ArrowDown class="w-3.5 h-3.5" />
                </Button>
                <span class="direction-spacer"></span>
              </div>
              <Button
                @click="resetPosition"
                variant="outline"
                class="reset-btn"
                size="sm"
              >
                <RotateCw class="w-3.5 h-3.5" />
                恢复原始贴图位置
              </Button>
            </div>
            <div class="u-panel__hint">
              适用于微调；如果贴纸缺失，建议重新拉取贴纸。
            </div>
          </div>
        </div>
        <div class="u-prop-row">
          <Label class="u-prop-row__label">印花工艺</Label>
          <Select
            v-model="clothingPaintMethod"
            class="u-prop-row__value"
          >
            <SelectTrigger class="h-6 text-[11px]">
              <SelectValue placeholder="选择印花工艺" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="item in clothingPaintMethods"
                :key="item.title"
                :value="item.title"
              >
                <Tooltip>
                  <TooltipTrigger as-child>
                    <div class="flex">
                      {{ item.title }}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <s1-img
                      :src="item.thumbnail"
                      fit="cover"
                      style="width: 180px; height: 180px"
                    ></s1-img>
                    <div style="width: 180px; padding: 8px">
                      {{ item.description }}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>

    <div class="decal-property-spacer"></div>

    <footer class="decal-property-footer">
      <Button @click="replace" variant="default" class="decal-footer-btn decal-footer-btn--primary"
        >替换贴纸</Button
      >
      <Button @click="useCurrentSticker()" variant="outline" class="decal-footer-btn"
        >作为模板</Button
      >
      <Button @click="showDecalList = !showDecalList" variant="outline" class="decal-footer-btn">
        贴纸列表
      </Button>
      <Button @click="showWorkspace = !showWorkspace" variant="outline" class="decal-footer-btn">
        工作台
      </Button>
      <Button @click="remove" variant="destructive" class="decal-footer-btn decal-footer-btn--danger"
        >移除贴纸</Button
      >
    </footer>
  </div>

  <s1-empty v-else>
    <template #description> 未选择贴纸 </template>
  </s1-empty>

  <!-- 替换贴纸弹窗 -->
  <Dialog :open="showReplaceDialog" @update:open="v => !v && handleCloseDialog()">
    <DialogContent class="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 rounded-none gap-0 overflow-hidden flex flex-col">
      <DialogHeader class="px-5 py-3 border-b border-border flex flex-row items-center justify-between space-y-0 shrink-0">
        <DialogTitle class="text-sm font-semibold">替换贴纸</DialogTitle>
      </DialogHeader>
      <div class="replace-dialog-content flex-1 overflow-auto min-h-0">
      <div class="search-section">
        <div class="relative w-full">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            v-model="stickerSearchQueryParams.searchText"
            placeholder="搜索贴纸"
            class="pl-8"
          />
        </div>
      </div>

      <div class="sticker-grid">
        <div v-for="item in stickerList" :key="item.id" class="sticker-item">
          <s1-image
            padding="10%"
            :src="item.url"
            class="sticker-image"
            :meta="item"
            :showSize="true"
          >
          </s1-image>
          <div class="sticker-info">
            <div class="sticker-title text-ellipsis">{{ item.name || "......" }}</div>
            <Button @click="replaceSticker(item.id)" variant="default" size="sm" class="sticker-replace-btn">
              替换
            </Button>
          </div>
        </div>
      </div>

      <div class="pagination-section">
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground">共 {{ total }} 条</span>
          <Select
            :model-value="String(pageSize)"
            @update:model-value="v => handleSizeChange(Number(v))"
          >
            <SelectTrigger class="h-6 text-[11px] w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="s in [12, 24, 36, 48]"
                :key="s"
                :value="String(s)"
              >
                {{ s }} 条/页
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage <= 1"
            @click="handleCurrentChange(currentPage - 1)"
          >
            上一页
          </Button>
          <span class="text-xs">{{ currentPage }}</span>
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage * pageSize >= total"
            @click="handleCurrentChange(currentPage + 1)"
          >
            下一页
          </Button>
        </div>
      </div>
      </div>
    </DialogContent>
  </Dialog>

  <!-- 贴纸详情弹窗 -->
  <sticker-detail-modal v-if="showStickerDetailModal" />
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import {
  currentOperatingDecalController,
  showWorkspace,
  showDecalControl,
  showDecalList,
  showCanvasLayout,
  setActiveMenu,
  menuItems,
} from "../../store";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Info, RotateCw, Search, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { canvasStickerOptions } from "../canvas";
import { clothingPaintMethods } from ".";
import { getStickerList } from "@/api";
import { useStickerDetailModal } from "../project/sticker/stickerModal.ts";
import stickerDetailModal from "../project/sticker/stickerDetailModal.vue";

// 替换贴纸弹窗相关
const showReplaceDialog = ref(false);
const stickerList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(12);
const stickerSearchQueryParams = ref({
  searchText: "",
});

function remove() {
  currentOperatingDecalController.value.remove();
  setActiveMenu(menuItems.canvas);
}

function replace() {
  showReplaceDialog.value = true;
  getStickerListData();
}

function handleCloseDialog() {
  showReplaceDialog.value = false;
  stickerSearchQueryParams.value.searchText = "";
  currentPage.value = 1;
}

function replaceSticker(stickerId: string) {
  currentOperatingDecalController.value.replaceSticker(stickerId);
  showReplaceDialog.value = false;
}

async function getStickerListData() {
  try {
    const params = {
      match: [stickerSearchQueryParams.value.searchText].filter(Boolean),
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    };
    
    const response = await getStickerList(params);
    stickerList.value = response.list || [];
    total.value = response.total || 0;
  } catch (error) {
    console.error("获取贴纸列表失败:", error);
  }
}

function handleSizeChange(newSize: number) {
  pageSize.value = newSize;
  currentPage.value = 1;
  getStickerListData();
}

function handleCurrentChange(newPage: number) {
  currentPage.value = newPage;
  getStickerListData();
}

// 监听搜索文本变化
watch(
  () => stickerSearchQueryParams.value.searchText,
  () => {
    currentPage.value = 1;
    getStickerListData();
  }
);


function moveTop() {
  currentOperatingDecalController.value.moveTop();
}

function moveDown() {
  currentOperatingDecalController.value.moveDown();
}

function moveLeft() {
  currentOperatingDecalController.value.moveLeft();
}

function moveRight() {
  currentOperatingDecalController.value.moveRight();
}

function resetPosition() {
  currentOperatingDecalController.value.resetPosition();
}

function useCurrentSticker() {
  let currentOperatingDecalControllerState = currentOperatingDecalController.value.state;

  canvasStickerOptions.value =
    currentOperatingDecalControllerState.info.data ||
    currentOperatingDecalControllerState.info.meta.data;
  setActiveMenu(menuItems.canvas);
}

const clothingPaintMethod = ref();

// 新增：贴纸详情弹窗逻辑
const { show: showStickerDetailModal, open: openStickerDetailModal } = useStickerDetailModal();

function handleStickerImgClick() {
  // 取state和info合并，优先info
  const state = currentOperatingDecalController.value?.state || {};
  const info = currentOperatingDecalController.value?.info || {};
  // 兼容stickerDetailModal.vue所需字段
  openStickerDetailModal({
    ...info,
    url: state.url || state.src,
    name: info.name || '',
    description: info.description || '',
    keywords: info.keywords || '',
    updateTime: info.updateTime || '',
    id: state.id || info.id || '',
  });
}
</script>

<style scoped lang="less">
.container {
  width: 100%;
  height: 100%;
  min-width: 0;
  overflow: hidden;
}

.decal-preview-wrap,
.decal-property-form {
  padding-bottom: 4px;
}

.png-background {
  width: calc(100% - 16px);
  height: 96px;
  min-height: 96px;
  margin: 0 8px 6px;
  cursor: pointer;
}

.custom-form {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0 0 4px;
}

.u-prop-row--stacked {
  align-items: flex-start;
  padding-top: 3px;

  > .u-prop-row__label {
    padding-top: 5px;
  }

  > .u-prop-row__value {
    display: flex;
    flex-direction: column;
    gap: 0;
    overflow: visible;
    white-space: normal;
  }
}

.u-slider-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.u-slider {
  flex: 1;
  min-width: 0;
}

.u-slider-value {
  flex: 0 0 34px;
  color: var(--1s-text-color-secondary);
  font-size: var(--1s-control-font);
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}

.decal-property-spacer {
  flex: 1 1 auto;
  min-height: 8px;
}

.decal-property-footer {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
  padding: 6px 8px;
  border-top: 1px solid var(--1s-divider-color);
  background: var(--1s-panel-background);
}

.decal-footer-btn {
  width: 100%;
  min-width: 0;
  height: var(--1s-control-h-sm);
  padding: 0 5px;
  border-radius: var(--1s-control-radius-sm);
  font-size: var(--1s-control-font);
  white-space: nowrap;
}

.decal-footer-btn--primary {
  grid-column: 1 / -1;
}

.decal-footer-btn--danger {
  grid-column: 1 / -1;
}

.decal-property-header {
  height: 32px;
}

.decal-property-heading {
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
    overflow: hidden;
    color: var(--1s-text-color-tertiary);
    font-size: var(--1s-control-font);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.sticker-replace-btn {
  height: var(--1s-control-h-sm) !important;
  padding: 0 8px !important;
  border-radius: var(--1s-control-radius-sm) !important;
  font-size: var(--1s-control-font) !important;
}

.position-control-container {
  width: 100%;
  margin: 2px 0 2px;
  padding: 7px;
  border: 1px solid var(--1s-border-color);
  border-radius: var(--1s-control-radius);
  background: var(--1s-control-surface-muted);
}

.direction-pad {
  display: grid;
  grid-template-columns: repeat(3, var(--1s-control-h-sm));
  grid-template-rows: repeat(3, var(--1s-control-h-sm));
  justify-content: center;
  gap: 3px;
}

.direction-spacer,
.direction-center {
  width: var(--1s-control-h-sm);
  height: var(--1s-control-h-sm);
}

.direction-center {
  display: block;
  border: 1px solid var(--1s-border-color);
  border-radius: var(--1s-control-radius-sm);
  background: var(--1s-surface-background);
}

.reset-section {
  width: 100%;
  margin-top: 7px;
}

.decal-property-form .u-panel__hint {
  margin: 0;
  padding: 4px 0 2px;
}

.reset-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  height: var(--1s-control-h-sm);
  margin-top: 7px;
  font-size: var(--1s-control-font);
  border-radius: var(--1s-control-radius-sm);
}

.direction-btn {
  width: var(--1s-control-h-sm);
  height: var(--1s-control-h-sm);
  min-width: var(--1s-control-h-sm);
  padding: 0;
  border-radius: var(--1s-control-radius-sm);
  transition: var(--1s-control-transition);

  &:hover {
    background: var(--1s-state-hover);
    border-color: var(--1s-border-color-strong);
    box-shadow: none;
  }

  &:active {
    transform: none;
    background: var(--1s-state-active);
  }
}

.replace-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-section {
  width: 100%;
}

.sticker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 8px;
  flex: 1;
  overflow-y: auto;
}

.sticker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border: 1px solid var(--1s-border-color);
  border-radius: var(--1s-control-radius);
  transition: var(--1s-control-transition);

  &:hover {
    border-color: var(--1s-accent-color);
    box-shadow: none;
    background: var(--1s-state-hover);
  }
}

.sticker-image {
  width: 100% !important;
  height: 92px !important;
  background: var(--1s-checkerboard-base);
  border-radius: var(--1s-control-radius-sm);
}

.sticker-info {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.sticker-title {
  min-width: 0;
  flex: 1;
  font-size: var(--1s-control-font-md);
  color: var(--1s-text-color-secondary);
}

.pagination-section {
  position: sticky;
  right: auto;
  bottom: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-top: 1px solid var(--1s-divider-color);
  background: var(--1s-surface-background);
}
</style>
