<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2025-05-20 06:50:38
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-08-13 07:28:26
 * @FilePath: /1s/src/components/design/layout/material/drawer.vue
 * @Description: 材质选择drawer组件
-->
<template>
  <Dialog :open="viewDisplayController.showMaterialModal" @update:open="(val) => handleClose()">
    <DialogContent
      class="fixed left-0 top-0 right-auto translate-x-0 translate-y-0 h-[100vh] max-h-[100vh] w-[420px] max-w-[90vw] rounded-none gap-0 p-0 overflow-hidden flex flex-col"
    >
      <DialogHeader class="px-5 py-3 border-b border-border">
        <DialogTitle>材质选择</DialogTitle>
      </DialogHeader>
      <div class="material-drawer-content">
      <!-- 搜索栏 -->
      <div class="search-section">
        <Input placeholder="搜索材质" v-model="search"></Input>
      </div>
      
      <!-- 当前使用材质 -->
      <div
        v-if="currentModelController.state.material.textureInfo"
        class="current-material-section"
      >
        <span class="current-material-label">正在使用:</span>
        <s1-img
          :src="currentModelController.state?.material.textureInfo?.url"
          class="current-material-image"
          fit="cover"
        ></s1-img>
        <Button @click="removeMaterial" size="sm" variant="outline" class="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"> 移除 </Button>
      </div>
      
      <!-- 材质列表区域 -->
      <div class="material-list-container">
        <div class="material-list">
          <template v-for="(item, index) in list" :key="index">
            <div class="material-item-row">
              <!-- 左侧图片 -->
              <div class="material-image">
                <s1-img
                  :src="item.url"
                  class="material-thumbnail"
                  fit="cover"
                ></s1-img>
              </div>
              
              <!-- 右侧信息和操作 -->
              <div class="material-info-section">
                <div class="material-info">
                  <h4 class="material-name">{{ item.name || '未命名材质' }}</h4>
                  <p class="material-description">{{ item.description || '暂无描述' }}</p>
                </div>
                <div class="material-actions">
                  <Button @click="useMaterial(item)" size="sm" class="rounded-full">
                    使用该材质
                  </Button>
                </div>
              </div>
            </div>
          </template>
        </div>
        
        <div v-if="loading" class="loading-state">
          加载中...
        </div>
        
        <div v-if="isEmpty" class="empty-state">
          暂无材质
        </div>
      </div>
      
      <!-- 分页组件 -->
      <div class="pagination-section">
        <div class="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage <= 1"
            @click="handleCurrentChange(currentPage - 1)"
          >
            上一页
          </Button>
          <div class="text-xs text-muted-foreground">
            {{ currentPage }} / {{ Math.max(1, Math.ceil(total / pageSize)) }}
          </div>
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage >= Math.max(1, Math.ceil(total / pageSize))"
            @click="handleCurrentChange(currentPage + 1)"
          >
            下一页
          </Button>
        </div>
      </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { viewDisplayController, currentModelController } from "@/components/design/store";
import Api from "@/api";
import Utils from "@/common/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

let search = ref("");

// 分页相关状态
const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);
const list = ref([]);
const loading = ref(false);
const isEmpty = ref(false);

// 获取列表数据
async function getList() {
  loading.value = true;
  try {
    const res = await Api.getStickerList({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      isTexture: true,
    });
    list.value = res.list || [];
    total.value = res.total || 0;
    isEmpty.value = list.value.length === 0;
  } catch (error) {
    console.error('获取材质列表失败:', error);
    list.value = [];
    total.value = 0;
    isEmpty.value = true;
  } finally {
    loading.value = false;
  }
}

// 处理页码改变
function handleCurrentChange(val: number) {
  currentPage.value = val;
  getList();
}

// 处理每页条数改变
function handleSizeChange(val: number) {
  pageSize.value = val;
  currentPage.value = 1;
  getList();
}

// 使用该材质
function useMaterial(item) {
  currentModelController.value.state.material.textureInfo = item;
  // 关闭材质选择drawer
  viewDisplayController.value.showMaterialModal = false;
}

function removeMaterial() {
  // 移除当前材质
  currentModelController.value.state.material.textureInfo = null;
}

function handleClose() {
  // 关闭drawer
  viewDisplayController.value.showMaterialModal = false;
}

// 监听搜索变化
watch(search, () => {
  currentPage.value = 1;
  getList();
});

// 组件挂载时获取数据
onMounted(() => {
  getList();
});
</script>

<style scoped lang="less">
.material-drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.search-section {
  padding: 12px;
  height: 64px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.current-material-section {
  padding: 0 12px 12px 12px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  
  .current-material-label {
    margin-right: 8px;
    font-size: 14px;
    color: var(--1s-control-text-muted);
  }
  
  .current-material-image {
    width: 32px;
    height: 32px;
    margin-right: 8px;
  }
}

.material-list-container {
  flex: 1;
  overflow: auto;
  padding: 0 12px;
  min-height: 0; /* 确保flex子元素可以正确收缩 */
}

.material-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.material-item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--1s-control-surface-background);
  border: 1px solid var(--1s-dialog-border);
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  
  &:hover {
    background: var(--1s-control-hover-background);
    
    box-: none;
  }
}

.material-image {
  flex-shrink: 0;
}

.material-thumbnail {
  background: var(--1s-control-surface-muted);
  height: 80px;
  width: 80px;
  border-radius: 8px;
  border: 1px solid var(--1s-dialog-border);
}

.material-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 80px;
  min-width: 0; /* 防止flex子元素溢出 */
}

.material-info {
  flex: 1;
  min-width: 0; /* 防止flex子元素溢出 */
  
  .material-name {
    margin: 0 0 4px 0;
    color: var(--1s-text-color);
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .material-description {
    margin: 0;
    color: var(--1s-control-text-muted);
    font-size: 12px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }
}

.material-actions {
  margin-top: 8px;
  flex-shrink: 0;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 20px;
  color: var(--1s-text-color-tertiary);
}

.pagination-section {
  padding: 12px 12px 4px 12px;
  border-top: 1px solid var(--1s-border-color);
  flex-shrink: 0;
  background: var(--1s-surface-background);
}
</style>
