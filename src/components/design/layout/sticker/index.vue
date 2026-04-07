<template>
  <div class="container">
    <div class="menu">
      <div class="flex justify-between w-full">
        <div style="flex: 1"></div>
        <el-button @click="refresh" link type="primary">刷新</el-button>
      </div>
      <div class="search">
        <el-input v-model="stickerSearchQueryParams.searchText" placeholder="寻找贴纸">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
          <template #suffix>
            <el-icon>
              <Operation />
            </el-icon>
          </template>
        </el-input>
      </div>
    </div>
    <div class="scroll-list" :class="{ 'loading-wave': loading }">
      <div v-if="!loading && list.length === 0" class="empty">
        暂无数据
      </div>
      <div v-else class="list-grid">
        <div v-for="item in list" :key="item.id" class="item">
          <div class="image-wrapper">
            <s1-image
              :src="item.url"
              class="image"
              :meta="item"
              :showSize="true"
              @load="imgLoad"
            >
            </s1-image>
          </div>
          <sticker-popover :stickerInfo="item">
            <div class="bar">
              <div class="title text-ellipsis">{{ item.name || "......" }}</div>
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
          </sticker-popover>
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
<script setup lang="tsx">
import { ref, watch } from "vue";
import { Search, Operation, ArrowRight } from "@element-plus/icons-vue";
import { getStickerList } from "@/api";
import stickerPopover from "./stickerPopover.vue";
import { currentModelController } from "@/components/design/store";
import { initDraggableElement } from "@/components/design/utils/draggable";

const stickerSearchQueryParams = ref({
  searchText: "",
});

const list = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

function refresh() {
  currentPage.value = 1;
  getList();
}

function handleSizeChange(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  getList();
}

function handleCurrentChange(page: number) {
  currentPage.value = page;
  getList();
}

function imgLoad(el, meta) {
  // 如果 el 是 s1-image 组件，需要找到内部的 img 元素
  const img = el.tagName === 'IMG' ? el : el.querySelector('img') || el;
  if (!img) return;
  
  initDraggableElement(img, async () => {
    let info = img.meta || meta;
    currentModelController.value.stickToMousePosition({
      img: img,
      type: "image",
      local: false,
      src: img.src,
      id: info.id,
      ...info,
    });
  });
}

async function getList() {
  loading.value = true;
  try {
    const res = await getStickerList({
      match: [stickerSearchQueryParams.value.searchText].filter(Boolean),
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    });
    list.value = res.list || [];
    total.value = res.total || 0;
  } catch (error) {
    console.error("获取贴纸列表失败:", error);
    list.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

watch([() => stickerSearchQueryParams.value.searchText], () => {
  currentPage.value = 1;
  getList();
});

// 初始化加载
getList();
</script>
<style lang="less" scoped>
.container {
  width: 100%;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.menu {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  row-gap: 10px;
}

.search {
  width: 100%;
}

.scroll-list {
  flex: 1;
  width: 100%;
  padding: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  box-sizing: border-box;
  position: relative;
  background: var(--1s-surface-background);
  transition: background 0.3s;
}

.scroll-list.loading-wave {
  background: linear-gradient(
    90deg,
    var(--1s-surface-background) 0%,
    var(--1s-control-surface-muted) 25%,
    var(--1s-surface-background) 50%,
    var(--1s-control-surface-muted) 75%,
    var(--1s-surface-background) 100%
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
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  row-gap: 6px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.image-wrapper {
  width: 100%;
  max-width: 100%;
  height: 120px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--1s-control-surface-muted);
  border-radius: 4px;
  box-sizing: border-box;
  border: 1px solid var(--1s-control-border-color);
}

.image-wrapper :deep(.s1-image) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-wrapper :deep(img) {
  max-width: 100% !important;
  max-height: 100% !important;
  width: auto !important;
  height: auto !important;
  object-fit: contain !important;
  border-radius: 4px;
  display: block;
}

.image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}


.bar {
  width: 100%;
  font-size: 10px;
  color: var(--1s-control-text-muted);
  display: flex;
  padding: 0 7px;
  justify-content: space-between;
  align-items: center;
  column-gap: 1em;
  box-sizing: border-box;
  flex-shrink: 0;

  &:hover {
    color: var(--1s-text-color);
    cursor: pointer;
  }

  .el-icon {
    height: 1em;
    line-height: 1em;
    flex-shrink: 0;
  }
  
  .title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.empty {
  text-align: center;
  color: var(--1s-text-color-tertiary);
  padding: 40px 0;
}

.pagination-wrapper {
  padding: 8px 10px;
  width: 100%;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--1s-border-color);
  background: var(--1s-panel-background);
  
  :deep(.el-pagination) {
    justify-content: center;
    
    .el-pagination__sizes,
    .el-pagination__total {
      display: none;
    }
    
    .btn-prev,
    .btn-next {
      margin: 0 4px;
    }
    
    .el-pager {
      li {
        min-width: 28px;
        height: 28px;
        line-height: 28px;
        font-size: 12px;
      }
    }
  }
}

</style>
