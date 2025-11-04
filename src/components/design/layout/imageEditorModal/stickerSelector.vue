<template>
  <div class="sticker-selector">
    <div class="search-wrapper">
      <el-input 
        v-model="searchText" 
        placeholder="搜索贴纸"
        size="small"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    
    <div class="sticker-list" :class="{ 'loading-wave': loading }">
      <div v-if="!loading && list.length === 0" class="empty">
        暂无数据
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
          </div>
          <div class="sticker-name">{{ item.name || "..." }}</div>
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
import { Search } from '@element-plus/icons-vue'
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

watch(() => searchText.value, () => {
  currentPage.value = 1
  getList()
})

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
  border-bottom: 1px solid #f0f0f0;
}

.sticker-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  min-height: 0;
  background: #fff;
  transition: background 0.3s;
}

.sticker-list.loading-wave {
  background: linear-gradient(
    90deg,
    #ffffff 0%,
    #f5f5f5 25%,
    #ffffff 50%,
    #f5f5f5 75%,
    #ffffff 100%
  );
  background-size: 200% 100%;
  animation: wave-bg 2s ease-in-out infinite;
}

@keyframes wave-bg {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
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
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.image-wrapper {
  width: 100%;
  height: 120px;
  background: #efefef;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}

.sticker-name {
  padding: 8px;
  font-size: 12px;
  color: #666;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: #fff;
}

.empty {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.pagination-wrapper {
  padding: 16px 10px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  background: #fff;
  margin-top: auto;
}
</style>

