<template>
  <div class="project-page flex flex-col min-h-screen">
    <div class="flex-1 relative">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full mx-auto p-4"
      >
        <div
          v-for="item in list"
          class="flex flex-col items-center justify-start h-[240px]"
        >
          <!-- 视频文件 -->
          <div v-if="isVideo(item.url)" class="project-thumb w-full !h-[180px] rounded-lg relative group">
            <video 
              class="w-full h-full object-contain"
              :src="item.url"
              controls
              controlsList="nodownload nofullscreen novolume"
            ></video>
            <div class="project-tag project-tag--danger absolute top-2 right-2">
              视频
            </div>
            <!-- 自定义模型标识 -->
            <div v-if="item.customModelId" class="absolute top-2 left-2">
              <div class="relation-badge relative">
                模型关联
                <!-- 悬停提示 -->
                <div class="absolute top-full left-0 mt-2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:opacity-100">
                  <div class="project-tooltip-panel px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                    <div class="font-medium mb-1">关联模型：</div>
                    <div v-if="item.customModelInfo" class="relation-model-name">{{ item.customModelInfo.name }}</div>
                    <div class="project-placeholder-text text-xs mt-1">ID: {{ item.customModelId }}</div>
                    <div v-if="item.customModelInfo?.description" class="project-muted-text text-xs mt-1 max-w-48 break-words">
                      {{ item.customModelInfo.description }}
                    </div>
                    <div class="project-tooltip-arrow"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 图片文件 -->
          <s1-img
            v-else
            padding="5%"
            :src="item.url"
            class="project-thumb w-[240px] !h-[180px] rounded-lg flex-shrink-0 relative group"
          >
            <!-- 自定义模型标识 -->
            <div v-if="item.customModelId" class="absolute top-2 left-2 z-10">
              <div class="relation-badge relative">
                模型关联
                <!-- 悬停提示 -->
                <div class="absolute top-full left-0 mt-2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:opacity-100">
                  <div class="project-tooltip-panel px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                    <div class="font-medium mb-1">关联模型：</div>
                    <div v-if="item.customModelInfo" class="relation-model-name">{{ item.customModelInfo.name }}</div>
                    <div class="project-placeholder-text text-xs mt-1">ID: {{ item.customModelId }}</div>
                    <div v-if="item.customModelInfo?.description" class="project-muted-text text-xs mt-1 max-w-48 break-words">
                      {{ item.customModelInfo.description }}
                    </div>
                    <div class="project-tooltip-arrow"></div>
                  </div>
                </div>
              </div>
            </div>
          </s1-img>
          <div class="bar flex items-center justify-between w-full mt-2 px-2">
            <div class="text-ellipsis max-w-[160px]">
              {{ item.name || "未命名" }} {{ item.customModelId }}
            </div>
            <div class="flex-1"></div>
            <div class="project-timeago">{{ Utils.time.timeago(item.updateTime) }}</div>

            <a-dropdown trigger="click">
              <el-button link>
                <el-icon>
                  <MoreFilled />
                </el-icon>
              </el-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item v-if="item.customModelId" @click="openRelatedModel(item)">
                    <span style="color: var(--el-color-primary)">打开关联模型</span>
                  </a-menu-item>
                  <a-menu-item @click="deleteItem(item)">
                    <span style="color: var(--el-color-danger)">删除</span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </div>
      <div
        v-if="loading"
        class="project-loading-overlay absolute inset-0 flex items-center justify-center"
      >
        <el-icon class="animate-spin text-2xl"><Loading /></el-icon>
      </div>
      <s1-empty v-if="isEmpty">
        <template #description> 暂无草稿 </template>
      </s1-empty>
    </div>

    <div class="project-footer sticky bottom-0 left-0 right-0 py-4">
      <div class="mx-auto flex justify-end">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 40, 60, 80]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { ref, onBeforeMount } from "vue";
import { MoreFilled, Loading } from "@element-plus/icons-vue";
import { getDraftList, deleteDraft, getCustomModelById } from "@/api";
import Utils from "@/common/utils";
import { message } from "ant-design-vue";
import { s1Confirm } from "@/common/message";
import { currentModelController } from "@/components/design/store";

// 分页相关
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const list = ref([]);
const loading = ref(false);
const isEmpty = ref(false);

// 判断是否为视频文件
function isVideo(url: string) {
  return url.toLowerCase().endsWith('.webm') || url.toLowerCase().endsWith('.mp4');
}

// 获取自定义模型信息
async function getCustomModelInfo(customModelId: string) {
  if (!customModelId) return null;
  try {
    console.log('正在获取模型信息，ID:', customModelId);
    const modelInfo = await getCustomModelById(customModelId);
    console.log('获取到的模型信息:', modelInfo);
    return modelInfo;
  } catch (error) {
    console.error('获取自定义模型信息失败:', error);
    return null;
  }
}

// 获取列表数据
async function getList() {
  loading.value = true;
  try {
    const res = await getDraftList({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    });
    
    // 直接赋值，不再处理 customModelInfo
    list.value = res.list;
    total.value = res.total;
    isEmpty.value = list.value.length === 0;
  } catch (error) {
    console.error(error);
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

// 重置
function reset() {
  currentPage.value = 1;
  getList();
}

onBeforeMount(() => {
  getList();
});

async function deleteItem(item) {
  await s1Confirm({
    content: "确认删除该草稿吗？",
  });

  await deleteDraft({ids:[item.id]});
  reset();
  message.success("删除成功");
}

// 打开关联模型
async function openRelatedModel(item) {
  if (!item.customModelId) {
    message.error("该草稿没有关联的模型");
    return;
  }

  try {
    // 使用controller中封装的openModelById方法
    const success = await currentModelController.value.openModelById(item.customModelId, {
      showSuccessMessage: true,
      showErrorMessage: true,
      autoEnterEditMode: true
    });
    
    if (success) {
      console.log('关联模型打开成功');
    } else {
      console.error('关联模型打开失败');
    }
  } catch (error) {
    console.error('打开关联模型失败:', error);
    message.error("打开关联模型失败");
  }
}
</script>

<style scoped lang="less">
.bar {
  height: 36px;
  column-gap: 1rem;
  min-height: 36px;
}

.relation-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.16);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.28);
  font-size: 10px;
  font-weight: 600;
  box-shadow: var(--1s-shadow-sm);
  cursor: help;
}

.relation-model-name {
  color: #93c5fd;
}

.project-tooltip-arrow {
  position: absolute;
  bottom: 100%;
  left: 16px;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid var(--1s-border-color);
}
</style>
