<template>
  <div class="project-page flex flex-col min-h-screen">
    <!-- 过滤器区域 -->
    <div class="project-toolbar px-4 py-3">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="project-muted-text text-sm">只看母版</span>
          <Switch
            :model-value="showTemplateOnly"
            @update:model-value="(v) => { showTemplateOnly = v; handleFilterChange(); }"
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
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="link" size="icon-sm">
                  <MoreHorizontal class="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @select="copyToWorkspace(item)"> 复制模型信息到工作台 </DropdownMenuItem>
                <DropdownMenuItem @select="edit(item)"> 编辑 </DropdownMenuItem>
                <DropdownMenuItem @select="deleteItem(item)">
                  <span class="text-destructive">删除</span>
                </DropdownMenuItem>
                <DropdownMenuItem @select="downloadThumbnail(item)"> 下载缩略图 </DropdownMenuItem>
                <DropdownMenuItem @select="openShareCardModal(item)">
                  生成分享卡片
                </DropdownMenuItem>
                <DropdownMenuItem @select="editInWorkspace(item)">在工作台中编辑</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div v-if="loading" class="project-loading-overlay absolute inset-0 flex items-center justify-center">
        <Loader2 class="animate-spin h-6 w-6" />
      </div>
      <s1-empty v-if="isEmpty">
        <template #description> 暂无模型 </template>
      </s1-empty>
    </div>
    
    <div class="project-footer sticky bottom-0 left-0 right-0 py-4">
      <div class="mx-auto flex items-center gap-2">
        <span class="text-xs text-muted-foreground">共 {{ total }} 条</span>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage <= 1"
          @click="handleCurrentChange(currentPage - 1)"
        >
          上一页
        </Button>
        <span class="text-xs">{{ currentPage }}</span>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage * pageSize >= total"
          @click="handleCurrentChange(currentPage + 1)"
        >
          下一页
        </Button>
      </div>
    </div>
  </div>

  <Dialog :modal="false" v-model:open="showFormModal">
    <DialogContent class="max-w-[540px] w-[540px]">
      <DialogHeader>
        <DialogTitle>更新信息</DialogTitle>
      </DialogHeader>
      <div style="padding: 24px 12px" class="flex flex-col gap-3">
        <div class="flex flex-col gap-1.5">
          <Label>名称</Label>
          <Input v-model="editForm.name" placeholder="名字"></Input>
        </div>
        <div class="flex flex-col gap-1.5">
          <Label>描述</Label>
          <Input v-model="editForm.description" placeholder="描述"></Input>
        </div>
        <div class="flex flex-col gap-1.5">
          <Label>标签</Label>
          <tagsInput v-model="editForm.keywords" :string="true"> </tagsInput>
        </div>
        <div class="flex items-center gap-2">
          <Label>是否母版</Label>
          <Switch v-model:checked="editForm.isTemplate" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" size="sm" @click="showFormModal = false">取消</Button>
        <Button size="sm" :disabled="submitLoading" @click="ok">修改</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- 关联草稿弹窗 -->
</template>

<script setup lang="tsx">
import { ref, onBeforeMount } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { Loader2, MoreHorizontal } from "lucide-vue-next";
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
import { message } from '@/common/message';
import { useCustomModelDetailModal } from "@/components/design/layout/project/customModel/customModelModal";
import { openShareCardModal } from "@/components/design/layout/shareCard/index.ts";
import { saveAs } from "file-saver";
import { openCustomModel } from '@/components/design/utils/openCustomModel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

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
    const params: Record<string, any> = {
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
    border: 1px solid var(--1s-border-color);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    background: var(--1s-surface-background);
    
    display: flex;
    flex-direction: column;
    height: fit-content;
    
    &:hover {
      box-shadow: var(--1s-shadow-md);
      transform: translateY(-4px);
      border-color: var(--primary);
    }
  }
  
  .draft-preview {
    position: relative;
    background: var(--1s-control-surface-muted);
    
    img {
      transition: transform 0.3s ease;
      background: var(--1s-control-surface-muted);
      
      &:hover {
        
      }
    }
  }
  
  .draft-info {
    background: var(--1s-surface-background);
    border-top: 1px solid var(--1s-border-color);
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .draft-name {
    font-weight: 600;
    color: var(--1s-text-color);
    line-height: 1.4;
  }
  
  .draft-desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
    color: var(--1s-text-color-secondary);
  }
  
  .draft-meta {
    color: var(--1s-text-color-tertiary);
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
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .video-icon {
    color: #fff;
    background: rgba(0, 0, 0, 0.55);
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .type-tag {
    background: var(--primary);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
  }
}

.empty-state {
  color: var(--1s-text-color-tertiary);
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

@media (max-width: 600px) {}
</style>
