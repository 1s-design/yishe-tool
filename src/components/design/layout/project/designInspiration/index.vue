<template>
  <div class="design-inspiration-tab">
    <div class="inspiration-header">
      <h3 class="inspiration-title">设计灵感</h3>
      <p class="inspiration-desc">收集和管理设计灵感，为创作提供参考</p>
    </div>
    
    <div class="inspiration-search">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索灵感..."
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    
    <div class="inspiration-grid" v-loading="loading">
      <div
        v-for="item in inspirationList"
        :key="item.id"
        class="inspiration-card"
        @click="handleSelect(item)"
      >
        <div class="inspiration-image">
          <img :src="item.url" :alt="item.name" />
        </div>
        <div class="inspiration-info">
          <div class="inspiration-name">{{ item.name }}</div>
          <div class="inspiration-tags">
            <el-tag v-for="tag in item.tags?.slice(0, 3)" :key="tag" size="small">
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
      
      <div v-if="!loading && inspirationList.length === 0" class="inspiration-empty">
        暂无设计灵感
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const loading = ref(false)
const inspirationList = ref<any[]>([])

const handleSearch = () => {
  // TODO: 实现搜索功能
  loadInspirations()
}

const loadInspirations = async () => {
  loading.value = true
  try {
    // TODO: 从 API 加载设计灵感
    inspirationList.value = []
  } finally {
    loading.value = false
  }
}

const handleSelect = (item: any) => {
  // TODO: 处理选择灵感
  console.log('Selected inspiration:', item)
}

onMounted(() => {
  loadInspirations()
})
</script>

<style scoped>
.design-inspiration-tab {
  padding: 16px;
}

.inspiration-header {
  margin-bottom: 16px;
}

.inspiration-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px;
}

.inspiration-desc {
  font-size: 12px;
  color: var(--1s-text-color-secondary);
  margin: 0;
}

.inspiration-search {
  margin-bottom: 16px;
}

.inspiration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  min-height: 200px;
}

.inspiration-card {
  border: 1px solid var(--1s-border-color);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.inspiration-card:hover {
  border-color: var(--1s-accent-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.inspiration-image {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.inspiration-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.inspiration-info {
  padding: 8px;
}

.inspiration-name {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inspiration-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.inspiration-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: var(--1s-text-color-secondary);
}
</style>
