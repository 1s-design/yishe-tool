<template>
  <div class="project-page flex flex-col min-h-full">
    <!-- 过滤区域 -->
    <div class="project-toolbar">
      <slot name="tabs"></slot>
      <div class="project-toolbar__controls">
        <div class="project-toolbar__group">
          <span class="project-toolbar__label">自定义贴纸</span>
          <el-select 
            v-model="queryParams.isCustom" 
            placeholder="请选择类型" 
            style="width: 92px" 
            clearable 
            @change="getList"
          >
            <el-option label="全部" :value="null" />
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </div>
        <el-button @click="reset">重置筛选</el-button>
      </div>
      <div class="project-toolbar__caption">{{ total }} 项</div>
    </div>
    
    <div class="flex-1 relative">
      <div
        class="grid grid-cols-1 gap-3 w-full p-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      >
        <div
          v-for="item in list"
          class="project-card project-gallery-card"
        >
          <s1-img
            padding="5%"
            :src="item.url"
            @click="itemClick(item)"
            class="project-thumb project-gallery-card__media"
          >
            <s1-icon
              v-if="item.uploader?.isAdmin"
              name="official-badge"
              class="absolute right-[5%] top-[5%] opacity-80"
              :size="18"
            ></s1-icon>
          </s1-img>
          <div class="project-gallery-card__body">
            <div class="project-gallery-card__content">
              <div class="project-gallery-card__title text-ellipsis">
                {{ item.name || "未命名" }}
              </div>
              <div class="project-gallery-card__meta">
                <div class="project-tag project-tag--accent" v-if="item.isPublic">已共享</div>
                <div
                  class="project-tag"
                  v-if="item?.uploader?.account == loginStore.userInfo?.account"
                >
                  我
                </div>
                <div 
                  class="project-tag"
                  :class="item.isCustom ? 'project-tag--success' : 'project-tag--danger'"
                  v-if="item.isCustom !== undefined"
                >
                  {{ item.isCustom ? '自定义' : '系统' }}
                </div>
                <div class="project-timeago">{{ Utils.time.timeago(item.updateTime) }}</div>
              </div>
            </div>
            <a-dropdown trigger="click" class="project-gallery-card__actions">
              <el-button link class="project-action-button">
                <el-icon>
                  <MoreFilled />
                </el-icon>
              </el-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="edit(item)"> 编辑 </a-menu-item>
                  <!-- 3D 工作台链路已停用，暂不提供直接使用贴纸入口。 -->
                  <!-- <a-menu-item @click="useSticker(item)"> 在工作台使用 </a-menu-item> -->
                  <!-- <a-menu-item @click="editStickerInWorkspace(item)">
                      在工作台中编辑
                  </a-menu-item> -->
                  <a-menu-item
                    @click="useInCanvasSticker(item)"
                  >
                    在贴纸制作中使用
                  </a-menu-item>

                  <a-menu-item @click="showRepeatEffect(item)"> 查看重复效果 </a-menu-item>

                  <a-menu-item @click="deleteItem(item)">
                    <span style="color: var(--el-color-danger)">删除</span>
                  </a-menu-item>
                  <!-- <a-menu-item> 分享给好友 </a-menu-item>
                  <a-menu-item> 发布 </a-menu-item> -->
                  <a-menu-item v-if="item.type == 'image'" @click="download(item)">
                    下载源文件
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
        <div class="project-loading-overlay__spinner">
          <el-icon class="animate-spin text-lg"><Loading /></el-icon>
        </div>
      </div>
      <s1-empty v-if="isEmpty">
        <template #description> 暂无贴纸 </template>
      </s1-empty>
    </div>

    <div class="project-footer">
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
    <el-form
      label-width="72px"
      :inline-message="false"
      :show-message="false"
      label-position="left"
    >
      <el-form-item label="贴纸名称：">
        <el-input v-model="editForm.name" placeholder="名称"></el-input>
      </el-form-item>
      <el-form-item label="贴纸描述:">
        <el-input
          type="textarea"
          v-model="editForm.description"
          placeholder="描述"
        ></el-input>
      </el-form-item>
      <el-form-item label="关键字:">
        <tagsInput
          v-model="editForm.keywords"
          :string="true"
          :autocomplete-tags="stickerAutoplacementTags"
          :autocomplete-width="400"
          autocompletePlacement="right"
        ></tagsInput>
      </el-form-item>
      <!-- <el-form-item label="是否共享:">
        <a-switch
          v-model:checked="editForm.isPublic"
          checked-children="公开"
          un-checked-children="私密"
        />
      </el-form-item> -->
      <el-form-item label="是否为材质:">
        <el-switch
          v-model="editForm.isTexture"
        ></el-switch>
      </el-form-item>
    </el-form>
  </a-modal>

  <!-- 重复效果预览 Modal -->
  <a-modal
    v-model:open="showRepeatModal"
    :centered="true"
    :destroyOnClose="true"
    width="600px"
    title="重复效果预览"
    :footer="null"
  >
    <div class="repeat-preview-container">
      <div class="repeat-preview-grid">
        <div v-for="i in 9" :key="i" class="repeat-preview-item-wrapper">
          <img 
            :src="currentPreviewItem?.url" 
            class="repeat-preview-item"
            @load="onImageLoad"
            ref="previewImages"
          />
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="tsx">
import { ref, onBeforeMount } from "vue";
import {
  Search,
  ArrowRightBold,
  Operation,
  ArrowRight,
  MoreFilled,
  Loading,
} from "@element-plus/icons-vue";
import { getStickerList } from "@/api";
import { usePaging } from "@/hooks/data/paging.ts";
import desimage from "@/components/image.vue";
import { MoreOutlined } from "@ant-design/icons-vue";
import { menuItems, menuState, setActiveMenu } from "@/components/design/store";
import { initDraggableElement } from "@/components/design/utils/draggable";
import { imgToFile, createImgObjectURL, imgToBase64 } from "@/common/transform/index";
import { stickerAutoplacementTags } from "@/components/design/components/tagsInput/index.ts";
import { useLoadingOptions } from "@/components/loading/index.tsx";

import { loadingBottom } from "@/components/loading/index.tsx";
import {
  addCanvasChild,
  canvasStickerOptions,
} from "@/components/design/layout/canvas/index.tsx";
import { createDefaultCanvasChildcanvasStickerOptions } from "@/components/design/layout/canvas/children/canvas.tsx";
import Utils from "@/common/utils";
import { message, Modal } from "ant-design-vue";
import { s1Confirm } from "@/common/message";
import Api from "@/api";
import tagsInput from "@/components/design/components/tagsInput/tagsInput.vue";
import { useStickerDetailModal } from "./stickerModal.ts";
import { useLoginStatusStore } from "@/store/stores/login";

const loginStore = useLoginStatusStore();

const loadingOptions = useLoadingOptions({});

// 分页相关
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const list = ref([]);
const loading = ref(false);
const isEmpty = ref(false);

// 查询参数
const queryParams = ref({
  isCustom: true, // 默认仅显示自定义贴纸
});

// 获取列表数据
async function getList() {
  loading.value = true;
  try {
    const res = await getStickerList({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      ...queryParams.value,
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
  queryParams.value.isCustom = true;
  getList();
}

onBeforeMount(() => {
  getList();
});

// function useSticker(item) {
//   canvasStickerOptions.value = item.meta.data;
//   message.success("引用成功");
// }

function useInCanvasSticker(item) {
  if (item.meta?.data) {
    canvasStickerOptions.value = item.meta.data;
  } else {
    canvasStickerOptions.value = {
      unit: "px",
      showCanvasRealSize: false,
      supportBackgroundColor: {
        type: "pure",
        color: "rgba(0,0,0,0)",
      },
      svgFilter: {
        children: [],
      },
      children: [createDefaultCanvasChildcanvasStickerOptions()],
    };
    addCanvasChild({
      type: "image",
      imageInfo: item,
    });
  }
  menuState.value.showProject = false;
  setActiveMenu(menuItems.canvas);
  message.success("已加载到贴纸制作");
}

async function deleteItem(item) {
  await s1Confirm({
    content: "确认删除该贴纸吗？",
  });

  await Api.deleteSticker({ids:[item.id]});
  reset();
  message.success("删除成功");
}

function download(item) {
  Api.downloadCOSFile(item.url);
}

const currentItem = ref({});

const showFormModal = ref(false);

const submitLoading = ref(false);
const editForm = ref({} as any);
// 编辑
function edit(item) {
  editForm.value = {
    ...item
  };
  showFormModal.value = true;
  currentItem.value = item;
}

async function ok() {
  submitLoading.value = true;
  let res = await Api.updateSticker(editForm.value);
  message.success("修改成功");
  submitLoading.value = false;
  let ind = list.value.indexOf(currentItem.value);

  // 这里可以保存关联的信息
  list.value[ind] = {
    ...currentItem.value,
    ...res,
  };
}

const { open } = useStickerDetailModal();

function itemClick(item) {
  currentItem.value = item;
  open(item);
}

/**
 * @method 在工作台中编辑
 */
function editStickerInWorkspace(item) {}

const showRepeatModal = ref(false);
const currentPreviewItem = ref(null);
const previewImages = ref([]);

function showRepeatEffect(item) {
  currentPreviewItem.value = item;
  showRepeatModal.value = true;
}

function onImageLoad(event) {
  const img = event.target;
  const wrapper = img.parentElement;
  
  // 获取图片原始宽高比
  const aspectRatio = img.naturalWidth / img.naturalHeight;
  
  // 设置最大尺寸
  const maxWidth = 150;
  const maxHeight = 150;
  
  // 根据宽高比计算实际尺寸
  let width, height;
  if (aspectRatio > 1) {
    // 宽图
    width = Math.min(maxWidth, img.naturalWidth);
    height = width / aspectRatio;
  } else {
    // 高图
    height = Math.min(maxHeight, img.naturalHeight);
    width = height * aspectRatio;
  }
  
  // 设置容器尺寸
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
}
</script>

<style scoped lang="less">
.repeat-preview-container {
  width: 100%;
  overflow: hidden;
  background: var(--1s-control-surface-muted);
  padding: 10px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.repeat-preview-grid {
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 0;
  width: fit-content;
}

.repeat-preview-item-wrapper {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.repeat-preview-item {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.5);
    z-index: 1;
  }
}
</style>
