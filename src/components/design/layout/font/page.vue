<template>
  <div class="flex h-full">
    <div
      style="width: 400px; height: 100%; padding: 1.5rem; row-gap: 1.5rem; overflow: auto; border-right: 1px solid #eee;"
      class="flex flex-col"
    >
      <div class="label">{{ activeFont.name }} 预览</div>
      <div class="preview-actions">
        <el-button 
          size="small" 
          type="primary" 
          :loading="uploadingThumbnail"
          :disabled="!activeFont.id"
          @click="uploadThumbnail"
        >
          更新缩略图
        </el-button>
      </div>
      <div style="background: rgba(115, 0, 255, 0.05);">
      <div
        ref="previewContainerRef"
        :style="{ fontSize: previewFontSize + 'px', fontFamily: `font_${activeFont.id}` }"
        class="flex items-center justify-center"
        style="
          width: 100%;
          height: 300px;
    
          overflow: hidden;
          border-radius: 8px;
        "
      >
        <div ref="previewTextareaRef" contenteditable style="max-width: 350px;text-align: center;">
          未选择字体
        </div>
      </div>
    </div>
      <div class="label">文字预览大小</div>
      <a-slider id="test" v-model:value="previewFontSize" :max="100" :min="10" />
      <div class="label">描述</div>
      <div class="description-text">{{ activeFont.description }}</div>
      <div class="label">标签</div>
      <div class="flex flex-wrap" style="gap: 1rem 0.5rem">
        <template v-for="t in activeFont.keywords?.split(',')">
          <a-tag color="default" v-if="t">{{ t }}</a-tag>
        </template>
      </div>
    </div>
    <div style="flex: 1; height: 100%; display: flex; flex-direction: column;">
      <div style="padding: 1.5rem; border-bottom: 1px solid #eee;" class="flex items-center justify-between">
        <div>共 {{ total }} 条</div>
        <div style="flex: 1"></div>
        <el-button size="small" link :icon="TopRight" @click="goUpload">
          去上传
        </el-button>
        <el-button size="small" link :icon="TopRight" @click="goMine">
          查看我的上传
        </el-button>
      </div>
      <div style="flex: 1; overflow: hidden;">
        <s1-scrollbar height="100%">
          <div
            v-infinite-scroll="getList"
            :infinite-scroll-distance="150"
            style="padding: 1.5rem"
          >
            <div class="font-grid">
              <div v-for="item in list" class="font-item" :class="{ 'font-item-selected': activeFont.id === item.id }" @click="select(item)">
                <div class="font-item-image">
                  <s1-image
                    :src="item.thumbnail"
                    fit="contain"
                    style="width: 100%; height: 100%;"
                  ></s1-image>
                </div>
                <div class="font-item-info">
                  <div class="font-item-name">{{ item.name }}</div>
                  <div class="font-item-time">{{ item.createTime }}</div>
                </div>
              </div>
            </div>

            <s1-loadingBottom v-if="loading"></s1-loadingBottom>
          </div>
        </s1-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from "vue";
import { getFontListApi } from "@/api";
import {
  showFontModal,
  showUpload,
  viewDisplayController,
} from "../../store";
import { usePaging } from "@/hooks/data/paging";
import Utils from "@/common/utils";
import { Paperclip, TopRight } from "@element-plus/icons-vue";

import { fetchFontFaceWithMessage } from "@/components/design/layout/canvas/operate/fontFamily/index.ts";
import { getFontList, updateFontTemplate } from "@/api";
import { canvasStickerOptions, currentOperatingCanvasChildId,currentOperatingCanvasChild } from '@/components/design/layout/canvas/index.tsx'
import { htmlToPngFile } from "@/common/transform";
import { uploadToCOS } from "@/api/cos";
import { message } from "ant-design-vue";


// 字体列表
const { list, getList, reset, loading, total } = usePaging((params) => {
  return getFontList({
    ...params,
    pageSize: 30,
  });
});

const activeFont = ref({} as any);

const previewFontSize = ref(36);

const previewTextareaRef = ref();
const previewContainerRef = ref();
const uploadingThumbnail = ref(false);

async function select(item) {
  activeFont.value = item;
  await fetchFontFaceWithMessage(item);
  previewTextareaRef.value.innerHTML = item.name;
}

function goUpload() {
  showFontModal.value = false;
  showUpload.value = true;
}

function goMine() {
  showFontModal.value = false;
  viewDisplayController.value.showProject = true;
}

async function uploadThumbnail() {
  if (!activeFont.value.id) {
    message.warning("请先选择一个字体");
    return;
  }

  if (!previewContainerRef.value) {
    message.error("预览容器未找到");
    return;
  }

  try {
    uploadingThumbnail.value = true;

    // 将预览区域导出为图片
    const pngFile = await htmlToPngFile(previewContainerRef.value, `${activeFont.value.name}_thumbnail`);

    // 上传到COS
    const thumbnailCos = await uploadToCOS({
      file: pngFile,
    });

    // 更新字体记录
    await updateFontTemplate({
      id: activeFont.value.id,
      thumbnail: thumbnailCos.url,
    });

    // 更新本地数据
    activeFont.value.thumbnail = thumbnailCos.url;
    
    // 更新列表中的对应项
    const listItem = list.value.find(item => item.id === activeFont.value.id);
    if (listItem) {
      listItem.thumbnail = thumbnailCos.url;
    }

    message.success("缩略图更新成功！");
  } catch (error) {
    console.error("上传缩略图失败:", error);
    message.error("上传缩略图失败，请重试");
  } finally {
    uploadingThumbnail.value = false;
  }
}
</script>

<style lang="less" scoped>
.font-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.font-item {
  cursor: pointer;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: #fff;
  aspect-ratio: 1 / 1.4;

  &:hover {
    border-color: #007bff;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
    transform: translateY(-2px);
  }

  &.font-item-selected {
    border-color: #007bff;
    background: #f0f8ff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
    
    .font-item-name {
      color: #007bff;
      font-weight: 600;
    }
    
    .font-item-image {
      background: #e6f3ff;
    }
  }
}

.font-item-image {
  width: 100%;
  height: 70%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #eee;
}

.font-item-info {
  padding: 0.75rem;
  height: 30%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.font-item-name {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.font-item-time {
  font-size: 0.8rem;
  color: #999;
  line-height: 1.2;
}

.label {
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

.description-text {
  color: #666;
  line-height: 1.5;
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #007bff;
}
</style>
