<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2025-05-20 06:50:38
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-08-13 07:28:26
 * @FilePath: /1s/src/components/design/layout/material/drawer.vue
 * @Description: 材质选择drawer组件
-->
<template>
  <el-drawer 
    v-model="viewDisplayController.showMaterialModal" 
    :modal="true" 
    :size="420" 
    :with-header="true" 
    :append-to-body="true"
    :wrapper-closable="true"
    modal-class="bg-transparent"
    title="材质选择"
    direction="ltr"
    :before-close="handleClose"
  >
    <div class="material-drawer-content">
      <!-- 搜索栏 -->
      <div class="search-section">
        <el-input placeholder="搜索材质" v-model="search"></el-input>
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
        <el-button @click="removeMaterial" size="small" type="danger" plain> 移除 </el-button>
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
                  <el-button @click="useMaterial(item)" type="primary" size="small" round>
                    使用该材质
                  </el-button>
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
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 36, 48]"
          :total="total"
          layout="prev, pager, next, sizes"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          small
        />
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { viewDisplayController, currentModelController } from "@/components/design/store";
import Api from "@/api";
import Utils from "@/common/utils";

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
    color: #666;
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
  background: #fafafa;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  
  &:hover {
    background: #f0f0f0;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.material-image {
  flex-shrink: 0;
}

.material-thumbnail {
  background: #f7f7f7;
  height: 80px;
  width: 80px;
  border-radius: 8px;
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
    color: #333;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .material-description {
    margin: 0;
    color: #666;
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
  color: #999;
}

.pagination-section {
  padding: 12px 12px 4px 12px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
  background: #fff;
}
</style> 