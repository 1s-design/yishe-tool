<template>
  <operate-form-item>
    <template #icon>
      <icon></icon>
    </template>
    <template #name> 个性字体 </template>
    <template #content>
      <div class="font-selector-wrapper">
        <el-button 
          size="small" 
          @click="openFontDialog"
          class="font-select-button"
        >
          {{ model?.name || '请选择' }}
        </el-button>
        <!-- <el-button size="small" @click="openFontModal"> 字体库 </el-button> -->
        <el-button 
          v-if="model" 
          size="small" 
          link 
          type="danger"
          @click="clearFont"
        >
          清除
        </el-button>
      </div>
      
      <!-- 字体选择抽屉 -->
      <el-drawer
        v-model="dialogVisible"
        title="选择字体"
        :size="1200"
        :modal="true"
        :with-header="true"
        :append-to-body="true"
        :wrapper-closable="true"
        direction="rtl"
        @open="handleDialogOpened"
        @close="handleDialogClosed"
      >
        <div class="font-drawer-content">
          <!-- 搜索框 -->
          <div class="font-search-wrapper">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索字体名称或描述"
              clearable
              @input="handleSearchInput"
              @clear="handleSearchClear"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button 
              type="primary" 
              size="small" 
              plain 
              round 
              @click="emitUpload"
              style="margin-left: 10px;"
            >
              快速上传
            </el-button>
          </div>

          <!-- 字体列表 -->
          <div class="font-list-wrapper" v-loading="loading">
            <div v-if="!loading && displayList.length === 0" class="font-empty">
              <s1-empty>
                <template #description>
                  <p>无相关字体，尝试使用关键字或相关描述查找</p>
                </template>
              </s1-empty>
            </div>
            
            <div v-else class="font-list-grid">
              <div
                v-for="item in displayList"
                :key="item.id"
                class="font-item"
                :class="{ 'font-item-selected': model?.id === item.id }"
                @click="selectFont(item)"
              >
                <div class="font-item-thumbnail" v-if="item.thumbnail">
                  <desimage :src="item.thumbnail" class="font-thumbnail-img"></desimage>
                </div>
                <div class="font-item-info">
                  <div class="font-item-name">{{ item.name }}</div>
                  <div class="font-item-desc" v-if="item.description">{{ item.description }}</div>
                </div>
                <div class="font-item-check" v-if="model?.id === item.id">
                  <el-icon><Check /></el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="font-pagination-wrapper">
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
import icon from "@/components/design/assets/icon/font-family.svg?component";
import { ref, watch, computed } from "vue";
import desimage from "@/components/image.vue";
import { fetchFontFaceWithMessage } from "./index.ts";
import { showUpload, showFontModal } from "@/components/design/store";
import { useDebounceFn } from "@vueuse/core";
import { Loading, Search, Check } from "@element-plus/icons-vue";
import { getFontList } from "@/api";

interface FontItem {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  url?: string;
  hide?: boolean;
}

const model = defineModel<FontItem | null>({ default: null });
const dialogVisible = ref(false);
const list = ref<FontItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);
const searchKeyword = ref('');

// 计算显示的列表（当前页的数据）
const displayList = computed(() => {
  return list.value.filter(item => !item.hide);
});

function emitUpload() {
  dialogVisible.value = false;
  showUpload.value = true;
}

function openFontModal() {
  try {
    console.log('Opening font modal...');
    showFontModal.value = true;
    console.log('showFontModal value:', showFontModal.value);
  } catch (error) {
    console.error('Error opening font modal:', error);
  }
}

function openFontDialog() {
  dialogVisible.value = true;
}

function clearFont() {
  model.value = null;
}

function selectFont(item: FontItem) {
  model.value = item;
  dialogVisible.value = false;
}

function handleDialogOpened() {
  if (list.value.length === 0) {
    fetchFontList();
  }
}

function handleDialogClosed() {
  // 弹窗关闭时的清理工作（如果需要）
}

async function fetchFontList(params = {}) {
  loading.value = true;
  
  try {
    const res = await getFontList({
      ...params,
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    });
    
    list.value = res.list || [];
    total.value = res.total || 0;
    
  } catch (error) {
    console.error('获取字体列表失败:', error);
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
  fetchFontList({
    match: searchKeyword.value,
  });
}

// 页码变化
function handleCurrentChange(page: number) {
  currentPage.value = page;
  fetchFontList({
    match: searchKeyword.value,
  });
}

// 搜索输入
const handleSearchInput = useDebounceFn(function (val: string) {
  searchKeyword.value = val;
  currentPage.value = 1;
  fetchFontList({
    match: val,
  });
}, 333);

// 清除搜索
function handleSearchClear() {
  searchKeyword.value = '';
  currentPage.value = 1;
  fetchFontList();
}

// 初始化时不加载，等弹窗打开时再加载
// onBeforeMount(() => {
//   fetchFontList();
// });

/**
 * */
const emits = defineEmits(["font-load"]);

watch(
  model,
  async () => {
    const info = model.value;
    if (!info || !info.url) {
      return;
    }
    const { url, id, name } = info;

    await fetchFontFaceWithMessage({
      url,
      id,
      name
    });

    emits("font-load");
  },
  {
    immediate: true,
  }
);
</script>

<style scoped>
.font-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.font-select-button {
  max-width: 200px;
}

.font-display-name {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
}

.font-select-icon {
  flex-shrink: 0;
}

.font-drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
}

.font-search-wrapper {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 0;
  flex-shrink: 0;
}

.font-search-wrapper .el-input {
  flex: 1;
}

.font-list-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
  min-height: 0;
}

.font-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.font-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  padding: 4px;
}

.font-item {
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

.font-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
}

.font-item-selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.font-item-thumbnail {
  width: 100%;
  height: 120px;
  margin-bottom: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
}

.font-thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.font-item-info {
  flex: 1;
  min-height: 40px;
}

.font-item-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.font-item-desc {
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.font-item-check {
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

.font-pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 12px;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0;
  width: 100%;
  background: #fff;
}
</style>
