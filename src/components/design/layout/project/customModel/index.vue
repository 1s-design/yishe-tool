<template>
  <div class="project-page flex flex-col min-h-screen">
    <!-- 过滤器区域 -->
    <div class="project-toolbar px-4 py-3">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="project-muted-text text-sm">只看母版</span>
          <el-switch 
            v-model="showTemplateOnly" 
            @change="handleFilterChange"
            size="small"
          />
        </div>
      </div>
    </div>

    <div class="flex-1 relative">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full mx-auto p-4">
        <div
          v-for="item in list"
          class="flex flex-col items-center justify-start h-[240px] relative"
        >
          <div class="relative">
            <s1-image
              @click="openDetail(item)"
              padding="5%"
              :src="item.thumbnail"
              class="project-thumb w-[240px] !h-[180px] rounded-lg flex-shrink-0"
            >
            </s1-image>
            <div class="template-corner-tag" v-if="item.isTemplate">母版</div>
          </div>
          <div class="bar flex items-center justify-between w-full mt-2 px-2">
            <div class="text-ellipsis max-w-[80px]">
              {{ item.name || "未命名" }}
            </div>
            <div class="flex items-center gap-2">
              <div class="project-tag project-tag--accent" v-if="item.isPublic">已共享</div>
            </div>
            <div class="project-timeago">{{ Utils.time.timeago(item.updateTime) }}</div>
            <div class="flex-1"></div>
            <a-dropdown trigger="click">
              <el-button link>
                <el-icon size="12">
                  <MoreFilled />
                </el-icon>
              </el-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="viewRelatedDrafts(item)"> 查看相关截图 </a-menu-item>
                  <a-menu-item @click="copyToWorkspace(item)"> 复制模型信息到工作台 </a-menu-item>
                  <a-menu-item @click="edit(item)"> 编辑 </a-menu-item>
                  <a-menu-item @click="deleteItem(item)">
                    <span style="color: var(--el-color-danger)">删除</span>
                  </a-menu-item>
                  <a-menu-item @click="downloadThumbnail(item)"> 下载缩略图 </a-menu-item>
                  <a-menu-item @click="openShareCardModal(item)">
                    生成分享卡片
                  </a-menu-item>
                  <a-menu-item @click="editInWorkspace(item)">在工作台中编辑</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </div>
      <div v-if="loading" class="project-loading-overlay absolute inset-0 flex items-center justify-center">
        <el-icon class="animate-spin text-2xl"><Loading /></el-icon>
      </div>
      <s1-empty v-if="isEmpty">
        <template #description> 暂无模型 </template>
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

  <a-modal
    v-model:open="showFormModal"
    :centered="true"
    :destroyOnClose="true"
    width="540px"
    title="更新信息"
    okText="修改"
    cancelText="取消"
    @ok="ok"
    :confirmLoading="submitLoading"
  >
    <el-form style="padding: 24px 12px">
      <el-form-item label="名称">
        <el-input v-model="editForm.name" placeholder="名字"></el-input
      ></el-form-item>
      <el-form-item label="描述">
        <el-input v-model="editForm.description" placeholder="描述"></el-input
      ></el-form-item>
      <el-form-item label="标签">
        <tagsInput v-model="editForm.keywords" :string="true"> </tagsInput>
      </el-form-item>
      <el-form-item label="是否母版">
        <el-switch 
          v-model="editForm.isTemplate" 
        />
      </el-form-item>
    </el-form>
  </a-modal>

  <!-- 关联草稿弹窗 -->
  <a-modal
    v-model:open="draftModalVisible"
    :centered="true"
    :destroyOnClose="true"
    width="80%"
    title="关联草稿"
    :footer="null"
  >
    <div class="draft-modal-content">
      <div class="model-info mb-4">
        <h3 class="project-section-title text-lg font-medium mb-2">
          模型：{{ currentModel?.name || currentModel?.id }}
        </h3>
        <p v-if="currentModel?.description" class="project-muted-text">
          {{ currentModel.description }}
        </p>
      </div>
      
      <div v-if="relatedDrafts.length === 0" class="empty-state text-center py-8">
        <a-empty description="暂无关联草稿" />
      </div>
      
      <div v-else class="draft-grid">
        <div 
          v-for="draft in relatedDrafts" 
          :key="draft.id" 
          class="draft-item"
        >
          <div class="draft-preview">
            <!-- 图片类型 -->
            <el-image 
              v-if="draft.type !== 'video'"
              :src="draft.url" 
              fit="contain" 
              class="project-preview-surface w-full rounded-t-lg cursor-pointer"
              style="aspect-ratio: 4/3;"
              :preview-src-list="[draft.url]"
              :preview-teleported="true"
              :z-index="9999"
            />
            <!-- 视频类型 -->
            <div 
              v-else
              class="project-preview-surface video-preview w-full rounded-t-lg cursor-pointer"
              style="aspect-ratio: 4/3;"
            >
              <video 
                :src="draft.url" 
                class="w-full h-full object-contain rounded-t-lg"
                controls
                preload="metadata"
                @click.stop
              >
                您的浏览器不支持视频播放
              </video>
              <div class="video-overlay">
                <div class="video-icon">
                  <el-icon size="24">
                    <VideoPlay />
                  </el-icon>
                </div>
              </div>
            </div>
          </div>
          <div class="draft-info p-4">
            <div class="draft-name text-base font-semibold truncate mb-2">
              {{ draft.name || '未命名' }}
            </div>
            <div v-if="draft.description" class="draft-desc text-sm text-color-regular mb-3 line-clamp-2">
              {{ draft.description }}
            </div>
            <div class="draft-meta text-xs text-color-placeholder flex items-center gap-2">
              <span>{{ Utils.time.timeago(draft.createTime) }}</span>
              <span v-if="draft.type" class="type-tag">
                {{ draft.type === 'video' ? '视频' : '图片' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="tsx">
import { ref, onBeforeMount } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { Search, ArrowRightBold, Operation, ArrowRight, MoreFilled, Loading, VideoPlay } from "@element-plus/icons-vue";
import { getStickerList } from "@/api";
import desimage from "@/components/image.vue";
import { currentModelController, viewDisplayController, enterEditMode, selectedAngles } from "@/components/design/store";
import { initDraggableElement } from "@/components/design/utils/draggable";
import { imgToFile, createImgObjectURL, imgToBase64 } from "@/common/transform/index";
import { useLoadingOptions } from "@/components/loading/index.tsx";
import { currentOperatingCanvasChild } from "@/components/design/layout/canvas/index.tsx";
import Utils from "@/common/utils";
import Api from "@/api";
import { s1Confirm } from "@/common/message";
import { message } from "ant-design-vue";
import { useCustomModelDetailModal } from "@/components/design/layout/project/customModel/customModelModal";
import { openShareCardModal } from "@/components/design/layout/shareCard/index.ts";
import { saveAs } from "file-saver";
import { openCustomModel } from '@/components/design/utils/openCustomModel';

const { open } = useCustomModelDetailModal();

function openDetail(modelInfo) {
  open(modelInfo);
}

const loadingOptions = useLoadingOptions({});

// 分页相关
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const list = ref([]);
const loading = ref(false);
const isEmpty = ref(false);

// 过滤器相关
const showTemplateOnly = useLocalStorage('_1s_custom_model_show_template_only', false);

// 获取列表数据
async function getList() {
  loading.value = true;
  try {
    const params = {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    };
    
    // 当开启只看母版时，添加 isTemplate 参数
    if (showTemplateOnly.value) {
      params.isTemplate = true;
    }
    
    const res = await Api.getCustomModelList(params);
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

// 处理过滤器改变
function handleFilterChange() {
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

const showDetailModal = ref();

async function deleteItem(item) {
  await s1Confirm({
    okType: "danger",
    content: "确认删除该模型？",
  });

  await Api.deleteCustomModel([item.id]);
  reset();
  await getList();
  message.success("删除成功");
}

const currentItem = ref({});

const showFormModal = ref(false);

const submitLoading = ref(false);
const editForm = ref({} as any);
const draftModalVisible = ref(false);
const currentModel = ref(null);
const relatedDrafts = ref([]);
// 编辑
function edit(item) {
  editForm.value = {
    id: item.id,
    description: item.description,
    name: item.name,
    keywords: item.keywords,
    isTemplate: item.isTemplate,
  };
  currentItem.value = item;
  showFormModal.value = true;
}

async function ok() {
  submitLoading.value = true;
  let res = await Api.updateCustomModel(editForm.value);
  submitLoading.value = false;

  let ind = list.value.indexOf(currentItem.value);
  list.value[ind] = res;
  message.success("修改成功");
}

/**
 * 工作台编辑
 */
function copyToWorkspace(item) {
  openCustomModel(item);
}

function downloadThumbnail(item) {
  saveAs(item.thumbnail);
}

function editInWorkspace(item) {
  openCustomModel(item, { editMode: true });
}

// 查看关联草稿
async function viewRelatedDrafts(model) {
  currentModel.value = model;
  draftModalVisible.value = true;
  
  try {
    const res = await Api.getDraftList({
      customModelId: model.id,
      currentPage: 1,
      pageSize: 100 // 获取较多数据
    });
    relatedDrafts.value = res.list || [];
  } catch (error) {
    console.error('获取关联草稿失败:', error);
    message.error('获取关联草稿失败');
    relatedDrafts.value = [];
  }
}
</script>

<style scoped lang="less">
.bar {
  height: 36px;
  column-gap: 1rem;
  min-height: 36px;
}

.template-corner-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(245, 158, 11, 0.18);
  color: #f59e0b;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.85rem;
  font-weight: bold;
  white-space: nowrap;
  z-index: 10;
  border: 1px solid rgba(245, 158, 11, 0.28);
  box-shadow: var(--1s-shadow-sm);
}

.draft-modal-content {
  .draft-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    max-height: 70vh;
    overflow-y: auto;
    padding: 8px;
  }
  
  .draft-item {
    border: 1px solid var(--el-border-color);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    background: var(--el-bg-color);
    box-shadow: var(--1s-shadow-sm);
    display: flex;
    flex-direction: column;
    height: fit-content;
    
    &:hover {
      box-shadow: var(--1s-shadow-md);
      transform: translateY(-4px);
      border-color: var(--el-color-primary-light-7);
    }
  }
  
  .draft-preview {
    position: relative;
    background: var(--el-fill-color-lighter);
    
    .el-image {
      transition: transform 0.3s ease;
      background: var(--el-fill-color-lighter);
      
      &:hover {
        transform: scale(1.02);
      }
    }
  }
  
  .draft-info {
    background: var(--el-bg-color);
    border-top: 1px solid var(--el-border-color-lighter);
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .draft-name {
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1.4;
  }
  
  .draft-desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
    color: var(--el-text-color-regular);
  }
  
  .draft-meta {
    color: var(--el-text-color-placeholder);
    font-size: 12px;
    line-height: 1.4;
  }
  
  .video-preview {
    position: relative;
    overflow: hidden;
    
    &:hover .video-overlay {
      opacity: 1;
    }
  }
  
  .video-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.38);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  
  .video-icon {
    color: #fff;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .type-tag {
    background: var(--el-color-primary);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
  }
}

.empty-state {
  color: var(--el-text-color-placeholder);
}

.custom-model-modal .ant-modal {
  top: 32px !important;
  margin: 0 auto;
  padding-bottom: 0;
}
.custom-model-modal .ant-modal-content {
  max-height: 80vh;
  overflow-y: auto;
}

.model-3d-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  max-height: 70vh;
  background: var(--1s-control-surface-muted);
  border: 1px solid var(--1s-control-border-color);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

@media (max-width: 600px) {
  .custom-model-modal .ant-modal {
    width: 98vw !important;
    min-width: unset !important;
  }
}
</style>
