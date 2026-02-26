<template>
  <div class="container flex flex-col items-center">
    <div
      ref="canvasContainerRef"
      v-if="!showMainCanvas"
      v-loading="renderingLoading"
      v-bind="loadingOptions"
      class="canvas-container"
    >
      <canvass></canvass>
      <div class="canvas-container-bottom-menu">
        <div style="flex: 1"></div>
        <el-tooltip
          :hide-after="0"
          content="小画布始终展示等比缩放的尺寸，大画布可以显示真实尺寸"
        >
          <el-button
            @click="showMainCanvas = true"
            :icon="FullScreen"
            type="info"
            text
            bg
            round
            size="small"
          >
            <span>大画布显示</span>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <div
      class="flex"
      style="width: 100%; padding: 10px; padding-top: 20px; column-gap: 10px"
    >
      <el-button 
        plain 
        link 
        @click="handleUploadClick"
        :disabled="shouldUpdateCanvasSticker && !isUpdatingSticker"
      >
        <CloudUploadOutlined style="font-size: 1.2em; margin-right: 4px" />
        上传
      </el-button>

      <a-dropdown arrow placement="bottom" :disabled="shouldUpdateCanvasSticker && !isUpdatingSticker">
        <div>
          <el-button link plain :disabled="shouldUpdateCanvasSticker && !isUpdatingSticker">
            <LinkOutlined style="font-size: 1.2em; margin-right: 4px" />
            导出
          </el-button>
        </div>
        <template #overlay>
          <a-menu>
            <a-menu-item @click="exportPng"> 导出原始图 </a-menu-item>
            <a-menu-item @click="exportTrimmedPng"> 自动去除空白边框 </a-menu-item>
            <!-- <a-menu-item @click="exportIco"> 导出ico </a-menu-item> -->
          </a-menu>
        </template>
      </a-dropdown>

      <a-dropdown arrow placement="bottom">
        <div>
          <el-button link plain> 更多 </el-button>
        </div>
        <template #overlay>
          <a-menu>
            <a-menu-item @click="removeAllChildren"> 移除所有子元素 </a-menu-item>
            <a-menu-item @click="consoleStikcerOptions">
              在控制台打印贴纸信息
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>

      <div style="flex: 1"></div>
      <div>
        <el-button link @click="showOfficialTemplate">
          <span>模版</span>
        </el-button>
        <addPopover>
          <el-button type="primary" link>
            <span>添加元素</span>
          </el-button>
        </addPopover>
      </div>
    </div>

    <div class="flex items-center" style="width: 100%; padding: 10px; column-gap: 10px">
      <div style="flex: 1"></div>
      <el-tooltip
        v-if="shouldUpdateCanvasSticker && !isUpdatingSticker"
        content="画布内容已更改，请先更新贴纸后再进行上传或导出操作"
        placement="top"
      >
        <span>
          <el-button 
            size="small" 
            @click="genSticker" 
            link
            :loading="isUpdatingSticker"
            :disabled="isUpdatingSticker"
            :class="{ 'update-required': shouldUpdateCanvasSticker }"
          >
            <template v-if="isUpdatingSticker">
              正在更新贴纸...
            </template>
            <template v-else>
              {{ shouldUpdateCanvasSticker ? "点击更新贴纸" : "贴纸已更新" }}
            </template>
          </el-button>
        </span>
      </el-tooltip>
      <el-button 
        v-else
        size="small" 
        @click="genSticker" 
        link
        :loading="isUpdatingSticker"
        :disabled="isUpdatingSticker"
        :class="{ 'update-required': shouldUpdateCanvasSticker }"
      >
        <template v-if="isUpdatingSticker">
          正在更新贴纸...
        </template>
        <template v-else>
          {{ shouldUpdateCanvasSticker ? "点击更新贴纸" : "贴纸已更新" }}
        </template>
      </el-button>
    </div>

    <div style="width: 100%; padding: 1rem">
      <el-select v-model="currentOperatingCanvasChildId">
        <template #label="{ label }">
          <div style="font-size: 1rem">
            {{ canvasChildLabelMap[currentOperatingCanvasChild.type] }}
          </div>
        </template>

        <template v-for="(item, index) in canvasStickerOptions.children">
          <el-option
            class="canvas-child-select-option"
            :value="item.id"
            :label="canvasChildLabelMap[item.type]"
          >
            <div
              style="display: flex; align-items: center; font-size: 1rem; height: 100%"
              @mouseenter="optionMouseenter(item)"
              @mouseleave="optionMouseleave(item)"
            >
              {{ canvasChildLabelMap[item.type] }}
              <div style="flex: 1"></div>
              <el-button
                v-if="!item.undeletable"
                link
                type="danger"
                @click="remove(item.id)"
              >
                <el-icon size="14">
                  <CircleCloseFilled></CircleCloseFilled>
                </el-icon>
              </el-button>
            </div>
          </el-option>
        </template>
      </el-select>
    </div>
    <div class="operate">
      <operateLayout></operateLayout>
    </div>
  </div>

  <a-modal
    v-model:open="showUploadModal"
    :centered="true"
    :destroyOnClose="true"
    width="540px"
    title="保存到图片素材库"
    okText="保存"
    cancelText="取消"
    @ok="doUpload"
    :confirmLoading="submitLoading"
  >
    <el-form
      style="padding: 12px"
      label-width="100px"
      :inline-message="false"
      :show-message="false"
      label-position="left"
    >
      <el-form-item label="贴纸名称：">
        <el-input v-model="editForm.name" placeholder="贴纸名称"></el-input>
      </el-form-item>
      <el-form-item label="贴纸描述:">
        <el-input
          type="textarea"
          v-model="editForm.description"
          placeholder="贴纸描述"
        ></el-input>
      </el-form-item>
      <el-form-item label="关键字:">
        <tagsInput
          v-model="editForm.keywords"
          :autocomplete-tags="stickerAutoplacementTags"
          :autocomplete-width="400"
          autocompletePlacement="bottom"
        ></tagsInput>
      </el-form-item>

      <el-form-item label="自动去除白色边框:">
        <a-switch
          v-model:checked="editForm.autoTrim"
          checked-children="是"
          un-checked-children="否"
        />
      </el-form-item>

      <!-- <el-form-item label="是否共享:">
        <a-switch
          v-model:checked="editForm.isPublic"
          checked-children="公开"
          un-checked-children="私密"
        />
      </el-form-item> -->
    </el-form>
  </a-modal>

  <officialTemplateModal></officialTemplateModal>
  <ChildViewHelperComponent></ChildViewHelperComponent>
</template>

<script setup lang="tsx">
import {
  CanvasController,
  canvasStickerOptions,
  addCanvasChild,
  removeCavnasChild,
  CanvasChildType,
  currentOperatingCanvasChildId,
  currentOperatingCanvasChild,
  showMainCanvas,
  canvasChildLabelMap,
  renderingLoading,
} from "./index.tsx";

import operateLayout from "./operateLayout/index.vue";
import { onMounted, ref, computed, watch, reactive, watchEffect, nextTick } from "vue";

import {
  Delete,
  Plus,
  DeleteFilled,
  CircleCloseFilled,
  Link,
  CirclePlusFilled,
  FullScreen,
  WarningFilled,
} from "@element-plus/icons-vue";
import {
  StarOutlined,
  StarFilled,
  StarTwoTone,
  CloudUploadOutlined,
  LinkOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons-vue";
import { useLoadingOptions } from "@/components/loading/index.tsx";
import addPopover from "./addPopover.vue";
import Api from "@/api";
import { message } from "ant-design-vue";
import { useLoginStatusStore } from "@/store/stores/login";
import tagsInput from "@/components/design/components/tagsInput/tagsInput.vue";
import { stickerAutoplacementTags } from "@/components/design/components/tagsInput/index.ts";
import Utils from "@/common/utils";
import { imageDataToFile, canvasToFile } from '@/common/transform';
import officialTemplateModal from "./officialTemplateModal/index.vue";
import {
  currentFocusingStickerId,
  ChildViewHelperComponent,
} from "@/components/design/layout/canvas/components/childViewHelper/index";

const loginStore = useLoginStatusStore();

const canvasContainerRef = ref();

const loadingOptions = useLoadingOptions({});

let canvasController = new CanvasController({
  max: 320,
});

const shouldUpdateCanvasSticker = computed(() => {
  return canvasController.shouldUpdateCanvasSticker.value;
});

const isUpdatingSticker = computed(() => {
  return renderingLoading.value || canvasController.loading.value;
});

let canvass = canvasController.getRender();

function checkAndUpdate() {
  if (shouldUpdateCanvasSticker.value) {
    message.warning("请先点击'更新贴纸'按钮更新画布内容");
    return false;
  }
  return true;
}

function exportPng() {
  if (!checkAndUpdate()) return;
  canvasController.downloadPng();
}

/* 导出去除多余空白的图片 */
function exportTrimmedPng() {
  if (!checkAndUpdate()) return;
  canvasController.downloadTrimmedPng();
}


function remove(id) {
  removeCavnasChild(id);
}

function removeAllChildren() {
  // 除了画布，其他全移除
  canvasStickerOptions.value.children = [canvasStickerOptions.value.children[0]];
}

/**
 * @method 在控制台打印当前贴纸配置信息
 */
function consoleStikcerOptions() {
  console.log(JSON.parse(JSON.stringify(canvasStickerOptions.value)));
}

/**
 * @method 展示设计模板模版
 */

import { showOfficialTempalteModal } from "./officialTemplateModal";
function showOfficialTemplate() {
  showOfficialTempalteModal.value = true;
}

/**
 * @method 处理保存逻辑
 */

const showUploadModal = ref(false);
const submitLoading = ref(false);

const editForm = ref({
  name: "",
  description: "",
  keywords: [],
  autoTrim: true, // 默认开启自动去除白色边框
});

function handleUploadClick() {
  if (shouldUpdateCanvasSticker.value) {
    message.warning("请先点击'更新贴纸'按钮更新画布内容");
    return;
  }
  showUploadModal.value = true;
}

async function doUpload() {
  if (shouldUpdateCanvasSticker.value) {
    message.warning("请先点击'更新贴纸'按钮更新画布内容");
    return;
  }
  submitLoading.value = true;

  try {
    // 先更新画布确保内容是最新的
    await canvasController.activeUpdateRenderingCanvas();
    
    // 等待画布更新完成
    while (canvasController.loading.value || renderingLoading.value) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // 检查画布尺寸是否合法
    const canvasWidth = canvasController.canvasEl.width;
    const canvasHeight = canvasController.canvasEl.height;
    
    if (canvasWidth <= 0 || canvasHeight <= 0) {
      throw new Error("无效的画布尺寸");
    }

    // 针对超大尺寸进行安全提示 (例如超过 16384 像素)
    if (canvasWidth > 16384 || canvasHeight > 16384) {
      console.warn("当前画布尺寸极大，可能会导致处理时间过长或内存不足。");
    }

    // 根据是否去除白色边框来决定使用哪个方法获取文件
    let file;
    if (editForm.value.autoTrim) {
      // 使用更加内存友好的裁切方式，避免大量的 ImageData 内存申请和遍历
      const trimmedCanvas = Utils.trimCanvas(canvasController.canvasEl);
      file = await canvasToFile(trimmedCanvas);
    } else {
      // 直接将原始画布转为文件
      file = await canvasToFile(canvasController.canvasEl);
    }

    // 获取文件后缀
    const suffix = file.name.split('.').pop() || 'png';

    // 上传文件到COS，路径包含当前用户账号
    const cos = await Api.uploadToCOS({
      file: file,
      category: 'sticker',
      account: loginStore?.userInfo?.account || loginStore?.userInfo?.name || undefined,
    });

    // 直接保存到素材
    await Api.createSticker({
      url: cos.url,
      suffix: suffix,
      ...editForm.value,
      keywords: editForm.value.keywords.join(","),
      isCustom: true, // 标识为自定义贴纸
      meta: {
        data: canvasStickerOptions.value,
      },
      uploaderId: loginStore.isLogin ? loginStore.userInfo.id : null,
    });
    message.success("保存成功");

    submitLoading.value = false;
    showUploadModal.value = false;
  } catch (e) {
    console.error('保存失败:', e);
    submitLoading.value = false;
    message.error("保存失败: " + (e.message || e));
  }
}

/**
 * @method 子元素鼠标覆盖事件
 */

function optionMouseenter(item) {
  currentFocusingStickerId.value = item.id;
}

function optionMouseleave(item) {
  if (item.id == currentFocusingStickerId.value) {
    currentFocusingStickerId.value = null;
  }
}

/**
 * 获取贴纸的主题色
 */
async function getCanvasStickerColor() {
  let colors = await canvasController.getPalette();
}



/**
 * @methods 手动生成贴纸
 */
function genSticker() {
  canvasController.activeUpdateRenderingCanvas();
}
</script>

<style lang="less" scoped>
:deep(.el-form-item) {
  margin-bottom: 8px;
}

.container {
  width: 360px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.canvas-container {
  width: 320px;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px;
  position: relative;
  overflow: hidden;

  // &:hover {

  //     .canvas-container-bottom-menu {
  //         bottom: 0px;
  //     }
  // }
}

.canvas-container-bottom-menu {
  width: 100%;
  height: 48px;
  position: fixed;
  padding: 0 1rem;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
  position: absolute;
  // bottom: -48px;
  bottom: 0px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;
}

.operate {
  flex: 1;
  width: 100%;
  overflow: auto;
}

.title {
  font-size: 1rem;
  font-weight: bold;
}

.label {
  line-height: 22px;
}

// 需要更新贴纸时的样式
:deep(.update-required) {
  color: #f56c6c !important;
  font-weight: bold !important;
  
  &:hover {
    color: #f56c6c !important;
    opacity: 0.8;
  }
}
</style>
