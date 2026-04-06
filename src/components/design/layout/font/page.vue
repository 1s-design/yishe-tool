<template>
  <div class="flex h-full">
    <div
      style="width: 400px; height: 100%; padding: 1.5rem; row-gap: 1.5rem; overflow: auto; border-right: 1px solid #eee;"
      class="flex flex-col"
    >
      <div class="label">{{ activeFont.name || '未选择字体' }} 预览</div>
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
      <div v-if="activeFont.id" class="font-family-info">
        <div class="font-family-label">FontFamily ID:</div>
        <div class="font-family-value-wrapper">
          <div class="font-family-value">{{ `font_${activeFont.id}` }}</div>
          <el-button 
            size="small" 
            text 
            type="primary" 
            :icon="DocumentCopy"
            @click="copyFontFamily(activeFont.id)"
            class="font-family-copy-btn"
          >
            复制
          </el-button>
        </div>
        <div class="font-actions">
          <el-button
            v-if="!isFontLoaded(activeFont.id)"
            size="small"
            type="primary"
            plain
            :icon="Download"
            @click="loadFontToCanvas(activeFont)"
            class="font-load-btn"
          >
            加载到画布
          </el-button>
          <el-button
            v-else
            size="small"
            type="success"
            plain
            disabled
            :icon="Check"
            class="font-loaded-btn"
          >
            已加载
          </el-button>
        </div>
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
              <div 
                v-for="item in list" 
                class="font-item" 
                :class="{ 
                  'font-item-selected': activeFont.id === item.id,
                  'font-item-loaded': isFontLoaded(item.id)
                }" 
                @click="select(item)"
              >
                <div class="font-item-image">
                  <s1-image
                    :src="item.thumbnail"
                    fit="contain"
                    style="width: 100%; height: 100%;"
                  ></s1-image>
                  <div class="font-item-loaded-badge" v-if="isFontLoaded(item.id) && activeFont.id !== item.id">
                    <el-icon><Check /></el-icon>
                  </div>
                </div>
                <div class="font-item-info">
                  <div class="font-item-name">{{ item.name }}</div>
                  <div class="font-item-time">{{ item.createTime }}</div>
                </div>
                <div class="font-item-actions" @click.stop>
                  <el-button
                    v-if="!isFontLoaded(item.id)"
                    size="small"
                    type="primary"
                    plain
                    @click="loadFontToCanvas(item)"
                    class="font-item-load-btn"
                  >
                    <el-icon><Download /></el-icon>
                  </el-button>
                  <el-button
                    v-else
                    size="small"
                    type="success"
                    plain
                    disabled
                    class="font-item-loaded-btn"
                  >
                    <el-icon><Check /></el-icon>
                  </el-button>
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
import { cacheFontFamily } from "@/components/design/store";
import { DocumentCopy, Download, Check } from "@element-plus/icons-vue";


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

// 检查字体是否已加载（响应式）
function isFontLoaded(fontId: string): boolean {
  if (!fontId) return false;
  const cache = cacheFontFamily.value;
  return !!cache[fontId];
}

// 复制 FontFamily ID
async function copyFontFamily(fontId: string) {
  if (!fontId) {
    message.warning('请先选择一个字体');
    return;
  }
  const fontFamilyId = `font_${fontId}`;
  try {
    await navigator.clipboard.writeText(fontFamilyId);
    message.success('FontFamily ID 已复制到剪贴板');
  } catch (error) {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = fontFamilyId;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      message.success('FontFamily ID 已复制到剪贴板');
    } catch (e) {
      message.error('复制失败，请手动复制');
    }
    document.body.removeChild(textarea);
  }
}

// 加载字体到画布（不应用）
async function loadFontToCanvas(item: any) {
  if (!item || !item.id) {
    message.warning('请先选择一个字体');
    return;
  }
  
  if (isFontLoaded(item.id)) {
    message.info('字体已加载到画布');
    return;
  }
  
  try {
    await fetchFontFaceWithMessage({
      url: item.url || '',
      id: item.id,
      name: item.name
    });
    message.success(`字体 "${item.name}" 已加载到画布，可通过 FontFamily ID "${`font_${item.id}`}" 使用`);
  } catch (error) {
    message.error(`字体 "${item.name}" 加载失败`);
  }
}

async function select(item) {
  activeFont.value = item;
  await fetchFontFaceWithMessage(item);
  if (previewTextareaRef.value) {
    previewTextareaRef.value.innerHTML = item.name;
  }
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

    let userAccount = 'anonymous'
    let userId = undefined
    try {
      const { getLocalUserInfo } = await import('@/store/stores/loginAction')
      const userInfo = getLocalUserInfo()
      const currentUser = userInfo?.userInfo || userInfo || {}
      userAccount = currentUser?.account || currentUser?.name || 'anonymous'
      userId = currentUser?.id
    } catch (e) {
      console.warn('无法获取用户信息:', e)
    }

    // 上传到COS
    const thumbnailCos = await uploadToCOS({
      file: pngFile,
      category: 'font-template',
      account: userAccount,
      userId,
      entityId: activeFont.value.id,
      isThumbnail: true,
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
  position: relative;

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

  &.font-item-loaded {
    border-left: 3px solid #67c23a;
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
  position: relative;
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

.font-family-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #eee;
}

.font-family-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
}

.font-family-value-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.font-family-value {
  flex: 1;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  color: #007bff;
  background: #fff;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-family-copy-btn {
  flex-shrink: 0;
}

.font-actions {
  display: flex;
  gap: 0.5rem;
}

.font-load-btn,
.font-loaded-btn {
  width: 100%;
}


.font-item-loaded-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 20px;
  height: 20px;
  background: #67c23a;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.font-item-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  display: flex;
  gap: 4px;
}

.font-item-load-btn,
.font-item-loaded-btn {
  padding: 4px 8px;
  font-size: 12px;
}
</style>
