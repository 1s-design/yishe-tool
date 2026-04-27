<template>
  <div class="sticker-selector">
    <div class="search-wrapper">
      <div class="search-input-row">
        <el-input
          v-model="searchText"
          placeholder="搜索贴纸名称或编码"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button
          @click="handleSearch"
          type="primary"
          :loading="loading"
          class="search-btn"
        >
          搜索
        </el-button>
      </div>
    </div>

    <div class="sticker-list" v-loading="loading" element-loading-text="加载中...">
      <div v-if="!loading && list.length === 0" class="empty">
        <el-icon :size="48" class="empty-icon"><Picture /></el-icon>
        <div class="empty-text">暂无贴纸</div>
      </div>
      <div v-else class="list-grid">
        <div
          v-for="item in list"
          :key="item.id"
          class="sticker-item"
          @click="handleSelect(item)"
        >
          <div class="image-wrapper">
            <img :src="item.url" :alt="item.name" />
            <div v-if="item.code" class="code-badge">
              {{ item.code }}
            </div>
          </div>
          <div class="sticker-info">
            <div class="sticker-name">{{ item.name || "未命名" }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-wrapper" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :total="total"
        layout="prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        small
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search, Picture } from '@element-plus/icons-vue'
import { getStickerList } from '@/api'

const emit = defineEmits(['select'])

const searchText = ref('')
const list = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

function handleSelect(item) {
  emit('select', item)
}

function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  getList()
}

function handleCurrentChange(page) {
  currentPage.value = page
  getList()
}

function handleSearch() {
  currentPage.value = 1
  getList()
}

async function getList() {
  loading.value = true
  try {
    const res = await getStickerList({
      match: [searchText.value].filter(Boolean),
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    })
    list.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error("获取贴纸列表失败:", error)
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 初始化加载
getList()
</script>

<style lang="less" scoped>
.sticker-selector {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.search-wrapper {
  padding: 10px;
  border-bottom: 1px solid var(--1s-border-color, #f0f0f0);
}

.search-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-btn {
  flex-shrink: 0;
  width: 72px;
}

.sticker-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  min-height: 0;
  background: var(--1s-surface-background, #fff);
  position: relative;
}

.list-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.sticker-item {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  background: var(--1s-surface-background, #fff);
  border: 1px solid var(--1s-control-border-color, transparent);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--el-color-primary);
  }
}

.image-wrapper {
  width: 100%;
  height: 100px;
  background: var(--1s-control-surface-muted, #efefef);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}

.code-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  pointer-events: none;
  user-select: none;
}

.sticker-info {
  padding: 6px 8px;
}

.sticker-name {
  font-size: 11px;
  color: var(--1s-text-color, #666);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 12px;

  .empty-icon {
    color: var(--1s-text-color-tertiary, #999);
    opacity: 0.5;
  }

  .empty-text {
    color: var(--1s-text-color-secondary, #999);
    font-size: 14px;
  }
}

.pagination-wrapper {
  padding: 12px 10px;
  border-top: 1px solid var(--1s-border-color, #eee);
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  background: var(--1s-panel-background, #fff);
  margin-top: auto;
}
</style>

