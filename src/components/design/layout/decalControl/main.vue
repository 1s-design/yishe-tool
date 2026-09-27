<template>
  <div class="container" v-if="currentOperatingDecalController">
    <div style="padding: 0.75rem">
      <s1-img
        :src="currentOperatingDecalController.state.src"
        class="png-background"
        @click="handleStickerImgClick"
        style="cursor: pointer; width: 100%"
      ></s1-img>
    </div>

    <div style="padding: 0.75rem">
      <div class="custom-form flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <Label class="w-[78px] shrink-0 text-xs">旋转角度</Label>
          <Slider
            class="flex-1"
            :min="0"
            :max="360"
            :step="1"
            :model-value="[currentOperatingDecalController.state.modelValueRotate]"
            @update:model-value="v => (currentOperatingDecalController.state.modelValueRotate = v[0])"
          />
        </div>

        <div class="flex items-center gap-2">
          <Label class="w-[78px] shrink-0 text-xs">贴纸尺寸</Label>
          <Slider
            class="flex-1"
            :min="0"
            :max="100"
            :step="1"
            :model-value="[currentOperatingDecalController.state.modelValueSize]"
            @update:model-value="v => (currentOperatingDecalController.state.modelValueSize = v[0])"
          />
        </div>

        <div class="flex items-center gap-2">
          <Label class="w-[78px] shrink-0 text-xs">贴纸粗糙度</Label>
          <Slider
            class="flex-1"
            :min="0"
            :max="1"
            :step="0.01"
            :model-value="[currentOperatingDecalController.state.roughness]"
            @update:model-value="v => (currentOperatingDecalController.state.roughness = v[0])"
          />
        </div>

        <div class="flex items-center gap-2">
          <Label class="w-[78px] shrink-0 text-xs">金属质感</Label>
          <Slider
            class="flex-1"
            :min="0"
            :max="1"
            :step="0.01"
            :model-value="[currentOperatingDecalController.state.metalness]"
            @update:model-value="v => (currentOperatingDecalController.state.metalness = v[0])"
          />
        </div>

        <div class="flex items-start gap-2">
          <Label class="w-[78px] shrink-0 text-xs">调整位置</Label>
          <div class="flex-1">
          <div class="position-control-container">
            <!-- 方向控制区域 -->
            <div class="direction-controls">
              <!-- 上方向 -->
              <div class="direction-row">
                <div class="direction-spacer"></div>
                <Button
                  @click="moveTop"
                  variant="outline"
                  class="direction-btn up-btn rounded-full"
                  size="icon-sm"
                >
                  <ArrowUp class="w-3.5 h-3.5" />
                </Button>
                <div class="direction-spacer"></div>
              </div>

              <!-- 左中右方向 -->
              <div class="direction-row">
                <Button
                  @click="moveLeft"
                  variant="outline"
                  class="direction-btn left-btn rounded-full"
                  size="icon-sm"
                >
                  <ArrowLeft class="w-3.5 h-3.5" />
                </Button>
                <div class="center-spacer"></div>
                <Button
                  @click="moveRight"
                  variant="outline"
                  class="direction-btn right-btn rounded-full"
                  size="icon-sm"
                >
                  <ChevronRight class="w-3.5 h-3.5" />
                </Button>
              </div>

              <!-- 下方向 -->
              <div class="direction-row">
                <div class="direction-spacer"></div>
                <Button
                  @click="moveDown"
                  variant="outline"
                  class="direction-btn down-btn rounded-full"
                  size="icon-sm"
                >
                  <ArrowDown class="w-3.5 h-3.5" />
                </Button>
                <div class="direction-spacer"></div>
              </div>
            </div>

            <!-- 重置按钮 -->
            <div class="reset-section">
              <Button
                @click="resetPosition"
                variant="outline"
                class="reset-btn"
                size="sm"
              >
                <RotateCw class="w-3.5 h-3.5 mr-1" />
                恢复原始贴图位置
              </Button>
            </div>
          </div>

          <div
            class="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground"
            style="margin-top: 8px"
          >
            适用于微调，如果出现贴纸部分丢失，建议重新拉取一个贴纸
          </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Label class="w-[78px] shrink-0 text-xs">印花工艺</Label>
          <Select
            v-model="clothingPaintMethod"
            class="flex-1"
          >
            <SelectTrigger class="h-6 text-[11px] w-full">
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
    </div>

    <div></div>

    <div style="flex: 1"></div>
    <div>
      <Button @click="replace" variant="default" class="bottom-btn rounded-full"
        >替换该贴纸</Button
      >
    </div>
    <div>
      <Button @click="useCurrentSticker()" variant="outline" class="bottom-btn rounded-full"
        >在贴纸制作中使用该贴纸模版</Button
      >
    </div>
    <div>
      <Button @click="showDecalList = !showDecalList" variant="outline" class="bottom-btn rounded-full">
        贴纸列表
      </Button>
    </div>
    <div>
      <Button @click="showWorkspace = !showWorkspace" variant="outline" class="bottom-btn rounded-full">
        工作台
      </Button>
    </div>
    <div>
      <Button @click="remove" variant="destructive" class="bottom-btn rounded-full"
        >移除该贴纸</Button
      >
    </div>
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
            <Button @click="replaceSticker(item.id)" variant="default" size="sm" class="rounded-full">
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
import { ArrowDown, ArrowLeft, ArrowUp, ChevronRight, RotateCw, Search } from 'lucide-vue-next'
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
  width: 360px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  row-gap: 0.75rem;
  overflow: auto;
}

.custom-form {
  :deep(label) {
    font-size: 12px;
    color: var(--1s-text-color-secondary);
  }
}

.bottom-btn {
  width: 100% !important;
}

.container > div {
  width: 100%;
}

.position-control-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
}

.direction-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--1s-surface-background);
  border-radius: 12px;
  padding: 12px;
  position: relative;
}

.direction-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.direction-spacer {
  width: 20px;
  height: 20px;
}

.center-spacer {
  width: 20px;
  height: 20px;
}

.reset-section {
  margin-top: 12px;
  width: 100%;
}

.reset-btn {
  width: 100%;
}

.direction-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: var(--1s-shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--1s-text-color-secondary);
  font-size: 14px;

  &:hover {
    background: var(--1s-hover-background);
    border-color: var(--1s-border-color-strong);
    transform: scale(1.05);
    box-shadow: var(--1s-shadow-md);
  }

  &:active {
    transform: scale(0.95);
    box-shadow: var(--1s-shadow-xs);
  }
}

.up-btn {
  margin-bottom: 6px;
}

.down-btn {
  margin-top: 6px;
}

.left-btn {
  margin-right: 6px;
}

.right-btn {
  margin-left: 6px;
}

// 替换贴纸弹窗样式
.replace-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-section {
  width: 100%;
}

.sticker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  flex: 1;
  overflow-y: auto;
}

.sticker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid var(--1s-border-color);
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--1s-accent-color);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  }
}

.sticker-image {
  width: 120px !important;
  height: 100px !important;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.sticker-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.sticker-title {
  font-size: 12px;
  color: var(--1s-text-color-secondary);
  text-align: center;
  max-width: 100%;
}

.pagination-section {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
