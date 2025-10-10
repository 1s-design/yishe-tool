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
      <el-form label-position="left" label-width="78px" size="small" class="custom-form">
        <el-form-item label="旋转角度">
          <el-slider
            :min="0"
            :max="360"
            :step="1"
            v-model="currentOperatingDecalController.state.modelValueRotate"
            size="small"
          />
        </el-form-item>

        <el-form-item label="贴纸尺寸">
          <el-slider
            :min="0"
            :max="100"
            :step="1"
            v-model="currentOperatingDecalController.state.modelValueSize"
            size="small"
          />
        </el-form-item>

        <el-form-item label="贴纸粗糙度">
          <el-slider
            :min="0"
            :max="1"
            :step="0.01"
            v-model="currentOperatingDecalController.state.roughness"
            size="small"
          />
        </el-form-item>

        <el-form-item label="金属质感">
          <el-slider
            :min="0"
            :max="1"
            :step="0.01"
            v-model="currentOperatingDecalController.state.metalness"
            size="small"
          />
        </el-form-item>

        <el-form-item label="调整位置">
          <div class="position-control-container">
            <!-- 方向控制区域 -->
            <div class="direction-controls">
              <!-- 上方向 -->
              <div class="direction-row">
                <div class="direction-spacer"></div>
                <el-button
                  @click="moveTop"
                  :icon="Top"
                  class="direction-btn up-btn"
                  size="small"
                  circle
                ></el-button>
                <div class="direction-spacer"></div>
              </div>

              <!-- 左中右方向 -->
              <div class="direction-row">
                <el-button
                  @click="moveLeft"
                  :icon="Back"
                  class="direction-btn left-btn"
                  size="small"
                  circle
                ></el-button>
                <div class="center-spacer"></div>
                <el-button
                  @click="moveRight"
                  :icon="Right"
                  class="direction-btn right-btn"
                  size="small"
                  circle
                ></el-button>
              </div>

              <!-- 下方向 -->
              <div class="direction-row">
                <div class="direction-spacer"></div>
                <el-button
                  @click="moveDown"
                  :icon="Bottom"
                  class="direction-btn down-btn"
                  size="small"
                  circle
                ></el-button>
                <div class="direction-spacer"></div>
              </div>
            </div>

            <!-- 重置按钮 -->
            <div class="reset-section">
              <el-button
                @click="resetPosition"
                :icon="RefreshRight"
                class="reset-btn"
                size="small"
                type="warning"
              >
                恢复原始贴图位置
              </el-button>
            </div>
          </div>

          <a-alert
            message="适用于微调，如果出现贴纸部分丢失，建议重新拉取一个贴纸"
            banner
            closable
            style="margin-top: 8px"
          />
        </el-form-item>
        <el-form-item label="印花工艺">
          <el-select
            v-model="clothingPaintMethod"
            size="small"
            placeholder="选择印花工艺"
          >
            <template #label="{ label }">
              <div style="font-size: 0.875rem">{{ label }}</div>
            </template>
            <el-option
              v-for="item in clothingPaintMethods"
              :key="item.title"
              :label="item.title"
              :value="item.title"
            >
              <el-popover width="auto" :hide-after="0" placement="right">
                <template #reference>
                  <div class="flex">
                    {{ item.title }}
                  </div>
                </template>
                <s1-img
                  :src="item.thumbnail"
                  fit="cover"
                  style="width: 180px; height: 180px"
                ></s1-img>
                <div style="width: 180px; padding: 8px">
                  {{ item.description }}
                </div>
              </el-popover>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <div></div>

    <div style="flex: 1"></div>
    <div>
      <el-button @click="replace" type="warning" round class="bottom-btn"
        >替换该贴纸</el-button
      >
    </div>
    <div>
      <el-button @click="useCurrentSticker()" round plain class="bottom-btn"
        >在贴纸制作中使用该贴纸模版</el-button
      >
    </div>
    <div>
      <el-button @click="showDecalList = !showDecalList" round plain class="bottom-btn">
        贴纸列表
      </el-button>
    </div>
    <div>
      <el-button @click="showWorkspace = !showWorkspace" round plain class="bottom-btn">
        工作台
      </el-button>
    </div>
    <div>
      <el-button @click="remove" type="danger" round class="bottom-btn"
        >移除该贴纸</el-button
      >
    </div>
  </div>

  <s1-empty v-else>
    <template #description> 未选择贴纸 </template>
  </s1-empty>

  <!-- 替换贴纸弹窗 -->
  <el-dialog
    v-model="showReplaceDialog"
    title="替换贴纸"
    width="100%"
    :fullscreen="true"
    :before-close="handleCloseDialog"
  >
    <div class="replace-dialog-content">
      <div class="search-section">
        <el-input
          v-model="stickerSearchQueryParams.searchText"
          placeholder="搜索贴纸"
          clearable
        >
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
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
            <el-button @click="replaceSticker(item.id)" type="primary" size="small" round>
              替换
            </el-button>
          </div>
        </div>
      </div>

      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 36, 48]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </el-dialog>

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
import { Top, Bottom, Back, Right, RefreshRight, Search } from "@element-plus/icons-vue";
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
  :deep(.el-form-item__label) {
    font-size: 12px;
    color: #606266;
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
  background: #ffffff;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
  font-size: 14px;

  &:hover {
    background: linear-gradient(145deg, #f0f0f0, #e0e0e0);
    border-color: #c0c4cc;
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.95);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #409eff;
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
  color: #606266;
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
