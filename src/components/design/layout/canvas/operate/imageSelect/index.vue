<template>
  <operate-form-item>
    <template #icon>
      <icon></icon>
    </template>
    <template #name> {{ label }} </template>
    <template #content>
      <div class="image-selector-wrapper">
        <el-button 
          size="small" 
          @click="openImageDialog"
          class="image-select-button"
        >
          {{ model?.name || '请选择' }}
        </el-button>
        <el-button 
          v-if="model" 
          size="small" 
          link 
          type="danger"
          @click="remove"
        >
          清除
        </el-button>
      </div>
      
      <!-- 图片选择抽屉 -->
      <el-drawer
        v-model="dialogVisible"
        title="选择图片"
        :size="1200"
        :modal="true"
        :with-header="true"
        :append-to-body="true"
        :wrapper-closable="true"
        direction="rtl"
        @open="handleDialogOpened"
        @close="handleDialogClosed"
      >
        <div class="image-drawer-content">
          <!-- 搜索框 -->
          <div class="image-search-wrapper">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索图片名称"
              clearable
              @input="handleSearchInput"
              @clear="handleSearchClear"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <!-- 图片列表 -->
          <div class="image-list-wrapper" v-loading="loading">
            <div v-if="!loading && displayList.length === 0" class="image-empty">
              <s1-empty>
                <template #description>
                  <p>无相关图片，尝试使用关键字搜索</p>
                </template>
              </s1-empty>
            </div>
            
            <div v-else class="image-list-grid">
              <div
                v-for="item in displayList"
                :key="item.id"
                class="image-item"
                :class="{ 'image-item-selected': model?.id === item.id }"
                @click="selectImage(item)"
              >
                <div class="image-item-thumbnail">
                  <s1-image
                    :src="item.url"
                    class="image-thumbnail-img"
                  ></s1-image>
                </div>
                <div class="image-item-info">
                  <div class="image-item-name">{{ item.name || "未命名" }}</div>
                </div>
                <div class="image-item-check" v-if="model?.id === item.id">
                  <el-icon><Check /></el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="image-pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[12, 24, 48, 96]"
              :total="total"
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </el-drawer>
    </template>
  </operate-form-item>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import icon from "@/components/design/assets/icon/background-image.svg?component";
import { Search, Check } from "@element-plus/icons-vue";
import { useDebounceFn } from "@vueuse/core";
import { getStickerList } from "@/api";

interface ImageItem {
  id: string;
  name?: string;
  url: string;
  type?: string;
}

const model = defineModel<ImageItem | null>({ default: null });

const props = defineProps({
  label: {
    default: "选择图片",
  },
});

const dialogVisible = ref(false);
const list = ref<ImageItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);
const searchKeyword = ref('');

// 计算显示的列表（当前页的数据）
const displayList = computed(() => {
  return list.value;
});

function openImageDialog() {
  dialogVisible.value = true;
}

function remove() {
  model.value = null;
}

function selectImage(item: ImageItem) {  
  model.value = item;
  dialogVisible.value = false;
}

function handleDialogOpened() {
  if (list.value.length === 0) {
    fetchImageList();
  }
}

function handleDialogClosed() {
  // 弹窗关闭时的清理工作（如果需要）
}

async function fetchImageList(params = {}) {
  loading.value = true;
  
  try {
    const res = await getStickerList({
      ...params,
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      type: "image,texture",
    });
    
    list.value = res.list || [];
    total.value = res.total || 0;
    
  } catch (error) {
    console.error('获取图片列表失败:', error);
    list.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

// 分页大小变化
function handleSizeChange(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  fetchImageList({
    match: searchKeyword.value,
  });
}

// 页码变化
function handleCurrentChange(page: number) {
  currentPage.value = page;
  fetchImageList({
    match: searchKeyword.value,
  });
}

// 搜索输入
const handleSearchInput = useDebounceFn(function (val: string) {
  searchKeyword.value = val;
  currentPage.value = 1;
  fetchImageList({
    match: val,
  });
}, 333);

// 清除搜索
function handleSearchClear() {
  searchKeyword.value = '';
  currentPage.value = 1;
  fetchImageList();
}
</script>

<style scoped>
.image-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.image-select-button {
  max-width: 200px;
}

.image-drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
}

.image-search-wrapper {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 0;
  flex-shrink: 0;
}

.image-search-wrapper .el-input {
  flex: 1;
}

.image-list-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
  min-height: 0;
}

.image-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.image-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  padding: 4px;
}

.image-item {
  position: relative;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.image-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
}

.image-item-selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.image-item-thumbnail {
  width: 100%;
  height: 120px;
  margin-bottom: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-item-info {
  flex: 1;
  min-height: 30px;
}

.image-item-name {
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  text-align: center;
}

.image-item-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: #409eff;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.image-pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 12px;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0;
  width: 100%;
  background: #fff;
}
</style>
