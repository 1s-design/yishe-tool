<template>
  <operate-form-item>
    <template #icon>
      <icon></icon>
    </template>
    <template #name> 个性字体 </template>
    <template #content>
      <el-select
        ref="selectRef"
        v-model="model"
        size="small"
        placeholder="请选择"
        filterable
        clearable
        remote
        :remote-method="remoteMethod"
        style="width: 120px"
        :loading="loading"
        @visible-change="handleVisibleChange"
      >
        <template #label="{ label }">
          {{ model?.name || '' }}
        </template>

        <template #empty>
          <s1-empty v-if="!loading">
            <template #description>
              <p>无相关字体，尝试使用关键字或相关描述查找</p>
            </template>
            <el-button type="primary" size="small" plain round @click="emitUpload">
              快速上传
            </el-button>
          </s1-empty>
        </template>
        
        <!-- 字体选项列表 -->
        <template v-for="item in displayList" :key="item.id">
          <el-option v-if="!item.hide" :label="item.name" :value="item">
            <div 
              class="font-option-text"
              @mouseenter="(event) => showThumbnail(item, event)"
              @mouseleave="hideThumbnail"
            >
              <span class="font-name-text">{{ item.name }}</span>
              <span class="font-desc-text" v-if="item.description">{{ item.description }}</span>
            </div>
          </el-option>
        </template>
        
        <!-- 加载更多按钮 -->
        <template v-if="hasMore && !loading">
          <el-option disabled>
            <div class="load-more" @click="loadMore">
              <el-button type="text" size="small">加载更多...</el-button>
            </div>
          </el-option>
        </template>
        
        <!-- 加载状态 -->
        <template v-if="loading">
          <el-option disabled>
            <div class="loading-state">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载中...</span>
            </div>
          </el-option>
        </template>
      </el-select>
      <el-button size="small" @click="showFontModal = true"> 字体库 </el-button>
      
      <!-- 缩略图Popover -->
      <el-popover
        v-model:visible="thumbnailVisible"
        :show-arrow="false"
        placement="top"
        :width="500"
        trigger="manual"
        popper-class="font-thumbnail-popover"
        :teleported="true"
        :transition="'el-fade-in-linear'"
      >
        <template #reference>
          <div 
            ref="popoverTrigger"
            class="popover-trigger"
            :style="{ 
              position: 'fixed', 
              left: popoverPosition.x + 'px', 
              top: popoverPosition.y + 'px',
              width: '1px',
              height: '1px',
              opacity: 0,
              pointerEvents: 'none'
            }"
          ></div>
        </template>
                 <div class="thumbnail-content" v-if="currentThumbnail">
           <desimage
             :src="currentThumbnail.thumbnail"
             class="font-thumbnail-preview"
           ></desimage>
         </div>
      </el-popover>
    </template>
  </operate-form-item>
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/font-family.svg?component";
import { ref, onBeforeMount, watch, computed, nextTick, onUnmounted } from "vue";
import { getFontListApi } from "@/api";
import desimage from "@/components/image.vue";
import Utils from "@/common/utils";
import { fetchFontFaceWithMessage } from "./index.ts";
import { showUpload } from "@/components/design/store";
import { GlobalConst } from "@/types/index.ts";
import { useDebounceFn, useThrottleFn } from "@vueuse/core";
import { TopRight, Loading } from "@element-plus/icons-vue";
import { showFontModal } from "@/components/design/store";
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
const selectRef = ref();
const list = ref<FontItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const searchKeyword = ref('');
const hasMore = ref(true);

// Popover相关状态
const thumbnailVisible = ref(false);
const currentThumbnail = ref<FontItem | null>(null);
const popoverTrigger = ref();
const popoverPosition = ref({ x: 0, y: 0 });
const showThumbnailTimer = ref<NodeJS.Timeout | null>(null);

// 计算显示的列表（当前页的数据）
const displayList = computed(() => {
  return list.value;
});

function emitUpload() {
  selectRef.value.toggleMenu(false);
  showUpload.value = true;
}

// 显示缩略图
function showThumbnail(item: FontItem, event: MouseEvent) {
  if (!item.thumbnail) return;
  
  // 清除之前的定时器
  if (showThumbnailTimer.value) {
    clearTimeout(showThumbnailTimer.value);
  }
  
  // 延迟显示，避免快速移动时频繁显示/隐藏
  showThumbnailTimer.value = setTimeout(() => {
    currentThumbnail.value = item;
    
    // 获取下拉框的位置信息
    const selectDropdown = document.querySelector('.el-select-dropdown');
    const dropdownRect = selectDropdown?.getBoundingClientRect();
    
    // 固定在下拉框上方
    const popoverWidth = 500;
    const popoverHeight = 220;
    const margin = 20;
    
    let x, y;
    
    if (dropdownRect) {
      // 水平居中对齐下拉框
      x = dropdownRect.left + (dropdownRect.width / 2) - (popoverWidth / 2);
      // 显示在下拉框上方
      y = dropdownRect.top - popoverHeight - margin;
      
      // 如果上方空间不够，显示在下拉框下方
      if (y < margin) {
        y = dropdownRect.bottom + margin;
      }
      
      // 确保不超出左右边界
      if (x < margin) {
        x = margin;
      } else if (x + popoverWidth > window.innerWidth - margin) {
        x = window.innerWidth - popoverWidth - margin;
      }
    } else {
      // 如果没有找到下拉框，使用鼠标位置
      x = event.clientX - popoverWidth / 2;
      y = event.clientY - popoverHeight - margin;
      
      // 检查左边界
      if (x < margin) {
        x = margin;
      }
      
      // 检查右边界
      if (x + popoverWidth > window.innerWidth - margin) {
        x = window.innerWidth - popoverWidth - margin;
      }
      
      // 检查上边界
      if (y < margin) {
        y = event.clientY + margin;
      }
    }
    
    // 确保不超出边界
    x = Math.max(margin, x);
    y = Math.max(margin, y);
    
    popoverPosition.value = { x, y };
    
    nextTick(() => {
      thumbnailVisible.value = true;
    });
  }, 200); // 200ms延迟
}

// 隐藏缩略图
const hideThumbnail = useThrottleFn(() => {
  // 清除定时器
  if (showThumbnailTimer.value) {
    clearTimeout(showThumbnailTimer.value);
    showThumbnailTimer.value = null;
  }
  
  thumbnailVisible.value = false;
  currentThumbnail.value = null;
}, 100);

async function fetchFontList(params = {}, isLoadMore = false) {
  if (isLoadMore) {
    loading.value = true;
  } else {
    loading.value = true;
    currentPage.value = 1;
    list.value = [];
  }
  
  try {
    const res = await getFontList({
      ...params,
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    });
    
    if (isLoadMore) {
      // 加载更多时追加数据
      list.value = [...list.value, ...(res.list || [])];
    } else {
      // 搜索或首次加载时替换数据
      list.value = res.list || [];
    }
    
    total.value = res.total || 0;
    hasMore.value = (list.value.length < total.value);
    
  } catch (error) {
    console.error('获取字体列表失败:', error);
    if (!isLoadMore) {
      list.value = [];
    }
  } finally {
    loading.value = false;
  }
}

// 加载更多
async function loadMore() {
  if (loading.value || !hasMore.value) return;
  
  currentPage.value++;
  await fetchFontList({
    match: searchKeyword.value,
  }, true);
}

// 处理下拉框显示/隐藏
function handleVisibleChange(visible: boolean) {
  if (visible && list.value.length === 0) {
    // 当下拉框打开且没有数据时，重新加载
    fetchFontList();
  }
  
  // 关闭下拉框时隐藏缩略图
  if (!visible) {
    hideThumbnail();
  }
}

const remoteMethod = useDebounceFn(function (val) {
  searchKeyword.value = val;
  fetchFontList({
    match: val,
  });
}, 333);

// 初始化加载
onBeforeMount(() => {
  fetchFontList();
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (showThumbnailTimer.value) {
    clearTimeout(showThumbnailTimer.value);
  }
});

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
.font-option-text {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.font-option-text:hover {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 8px 4px;
  margin: 0 -4px;
}

.font-name-text {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-desc-text {
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.load-more {
  text-align: center;
  padding: 8px 0;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  color: #909399;
  font-size: 14px;
}

.loading-state .el-icon {
  margin-right: 8px;
}

.popover-trigger {
  position: absolute;
  z-index: -1;
}

.thumbnail-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.font-thumbnail-preview {
  width: 480px !important;
  height: 200px !important;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}



/* 调整下拉框宽度 */
:deep(.el-select-dropdown) {
  min-width: 200px !important;
}

:deep(.el-select-dropdown__item) {
  padding: 0 12px;
}

/* Popover样式 */
:deep(.font-thumbnail-popover) {
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid #e4e7ed;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.95);
  z-index: 9999 !important;
  pointer-events: none;
}

:deep(.font-thumbnail-popover .el-popover__body) {
  pointer-events: none;
}

:deep(.font-thumbnail-popover .el-popover__title) {
  display: none;
}

:deep(.font-thumbnail-popover .el-popover__arrow) {
  display: none;
}
</style>
