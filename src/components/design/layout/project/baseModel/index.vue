<template>
  <div class="project-page flex flex-col min-h-screen">
    <div class="flex-1 relative">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full mx-auto p-4">
        <div
          v-for="item in list"
          class="flex flex-col items-center justify-start h-[240px]"
        >
          <s1-image
            padding="5%"
            :src="item.thumbnail"
            @click="itemClick(item)"
            class="project-thumb w-[240px] !h-[180px] rounded-lg flex-shrink-0"
          >
          </s1-image>
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
                  <MoreHorizontal class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @select="edit(item)"> 编辑 </DropdownMenuItem>
                <DropdownMenuItem @select="useItem(item)"> 在工作台使用该模型 </DropdownMenuItem>
                <DropdownMenuItem> 选择新的封面图 </DropdownMenuItem>
                <DropdownMenuItem> 设置预留点 </DropdownMenuItem>
                <DropdownMenuItem @select="deleteItem(item)">
                  <span class="text-destructive">删除</span>
                </DropdownMenuItem>
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

  <Dialog :modal="false" v-model:open="showPreviewModal">
    <DialogContent class="max-w-[980px] w-[980px]">
      <div class="flex">
        <s1-img
          :src="currentItem.thumbnail"
          style="width: 480px; height: 480px; flex-shrink: 0"
        >
        </s1-img>
        <div style="padding: 24px; row-gap: 12px" class="flex flex-col">
          <h1>{{ currentItem.name }}</h1>
          <h6>{{ currentItem.description }}</h6>
          <h6>{{ currentItem.keywords }}</h6>
          <h6>{{ currentItem.updateTime }}</h6>
        </div>
      </div>
    </DialogContent>
  </Dialog>

  <Dialog :modal="false" v-model:open="showFormModal">
    <DialogContent class="max-w-[540px] w-[540px]">
      <DialogHeader>
        <DialogTitle>更新信息</DialogTitle>
      </DialogHeader>
      <div style="padding: 24px 12px" class="flex flex-col gap-3">
        <div class="flex flex-col gap-1.5">
          <Label>名字</Label>
          <Input v-model="editForm.name" placeholder="名称"></Input>
        </div>
        <div class="flex flex-col gap-1.5">
          <Label>描述</Label>
          <Input v-model="editForm.description" placeholder="描述"></Input>
        </div>
        <div class="flex flex-col gap-1.5">
          <Label>标签</Label>
          <tagsInput v-model="editForm.keywords" :string="true"> </tagsInput>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" size="sm" @click="showFormModal = false">取消</Button>
        <Button size="sm" :disabled="submitLoading" @click="ok">修改</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="tsx">
import { ref, onBeforeMount } from "vue";
import { Loader2, MoreHorizontal } from "lucide-vue-next";
import desimage from "@/components/image.vue";
import { useLoadingOptions } from "@/components/loading/index.tsx";
import { currentOperatingCanvasChild } from "@/components/design/layout/canvas/index.tsx";
import Utils from "@/common/utils";
import { canvasStickerOptions } from "@/components/design/layout/canvas/index.tsx";
import { message, Modal } from '@/common/message';
import { s1Confirm } from "@/common/message";
import Api from "@/api";
import tagsInput from "@/components/design/components/tagsInput/tagsInput.vue";
import { showUpload, viewDisplayController,currentOperatingBaseModelInfo } from "@/components/design/store";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

function uplaodClick() {
  viewDisplayController.value.showProject = false;
  showUpload.value = true;
}

const loadingOptions = useLoadingOptions({});

// 分页相关
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const list = ref([]);
const loading = ref(false);
const isEmpty = ref(false);

// 获取列表数据
async function getList() {
  loading.value = true;
  try {
    const res = await Api.getProductModelList({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    });
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

function useSticker(item) {
  canvasStickerOptions.value = item.meta.data;
  message.success("引用成功");
}

function selectBaseModel(item){
  currentOperatingBaseModelInfo.value = item;
}

async function deleteItem(item) {
  await s1Confirm({
    content: "确认删除该模型吗？",
  });

  await Api.deleteProductModel({ id: item.id });
  reset();
  await getList();
  message.success("删除成功");
}

function download(item) {
  Api.downloadCOSFile(item.url);
}

const currentItem = ref({} as any);

const showPreviewModal = ref(false);

function itemClick(item) {
  currentItem.value = item;
  showPreviewModal.value = true;
}

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
  };
  currentItem.value = item;
  showFormModal.value = true;
}

function useItem(item){
  currentOperatingBaseModelInfo.value = item;
}

async function ok() {
  submitLoading.value = true;
  let res = await Api.updateProductModel(editForm.value);
  message.success("修改成功");
  submitLoading.value = false;
  let ind = list.value.indexOf(currentItem.value);
  list.value[ind] = res;
}
</script>

<style scoped lang="less">
.bar {
  height: 36px;
  column-gap: 1rem;
  min-height: 36px;
}

</style>
