<template>
  <div class="flex h-full">
    <div
      style="width: 400px; height: 100%; padding: 1.5rem; row-gap: 1.5rem; overflow: auto; border-right: 1px solid var(--1s-border-color);"
      class="flex flex-col"
    >
      <div class="label">{{ activeFont.name || '未选择字体' }} 预览</div>
      <div class="preview-actions">
        <Button
          size="sm"
          :disabled="uploadingThumbnail || !activeFont.id"
          @click="uploadThumbnail"
        >
          更新缩略图
        </Button>
      </div>
      <div v-if="activeFont.id" class="font-family-info">
        <div class="font-family-label">FontFamily ID:</div>
        <div class="font-family-value-wrapper">
          <div class="font-family-value">{{ `font_${activeFont.id}` }}</div>
          <Button
            size="sm"
            variant="ghost"
            @click="copyFontFamily(activeFont.id)"
            class="font-family-copy-btn"
          >
            <Copy class="h-3.5 w-3.5 mr-1" />
            复制
          </Button>
        </div>
        <div class="font-actions">
          <Button
            v-if="!isFontLoaded(activeFont.id)"
            size="sm"
            variant="outline"
            @click="loadFontToCanvas(activeFont)"
            class="font-load-btn"
          >
            <Download class="h-3.5 w-3.5 mr-1" />
            加载到画布
          </Button>
          <Button
            v-else
            size="sm"
            variant="outline"
            disabled
            class="font-loaded-btn"
          >
            <Check class="h-3.5 w-3.5 mr-1" />
            已加载
          </Button>
        </div>
      </div>
      <div style="background: var(--1s-hover-background);">
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
      <Slider v-model="previewFontSizeModel" :max="100" :min="10" />
      <div class="label">描述</div>
      <div class="description-text">{{ activeFont.description }}</div>
      <div class="label">标签</div>
      <div class="flex flex-wrap" style="gap: 1rem 0.5rem">
        <template v-for="t in activeFont.keywords?.split(',')">
          <Badge variant="secondary" v-if="t">{{ t }}</Badge>
        </template>
      </div>
    </div>
    <div style="flex: 1; height: 100%; display: flex; flex-direction: column;">
      <div style="padding: 1.5rem; border-bottom: 1px solid var(--1s-border-color);" class="flex items-center justify-between">
        <div>共 {{ total }} 条</div>
        <div style="flex: 1"></div>
        <Button size="sm" variant="link" @click="goUpload">
          <ArrowUpRight class="h-3.5 w-3.5 mr-1" />
          去上传
        </Button>
        <Button size="sm" variant="link" @click="goMine">
          <ArrowUpRight class="h-3.5 w-3.5 mr-1" />
          查看我的上传
        </Button>
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
                    <Check class="h-3.5 w-3.5" />
                  </div>
                </div>
                <div class="font-item-info">
                  <div class="font-item-name">{{ item.name }}</div>
                  <div class="font-item-time">{{ item.createTime }}</div>
                </div>
                <div class="font-item-actions" @click.stop>
                  <Button
                    v-if="!isFontLoaded(item.id)"
                    size="icon-sm"
                    variant="outline"
                    @click="loadFontToCanvas(item)"
                    class="font-item-load-btn"
                  >
                    <Download class="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    v-else
                    size="icon-sm"
                    variant="outline"
                    disabled
                    class="font-item-loaded-btn"
                  >
                    <Check class="h-3.5 w-3.5" />
                  </Button>
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
import { ref, onBeforeMount, computed } from "vue";
import { getFontListApi } from "@/api";
import {
  showFontModal,
  showUpload,
  viewDisplayController,
} from "../../store";
import { usePaging } from "@/hooks/data/paging";
import Utils from "@/common/utils";
import { Copy, Download, Check, ArrowUpRight } from "lucide-vue-next";

import { fetchFontFaceWithMessage } from "@/components/design/layout/canvas/operate/fontFamily/index.ts";
import { getFontList, updateFontTemplate } from "@/api";
import { canvasStickerOptions, currentOperatingCanvasChildId,currentOperatingCanvasChild } from '@/components/design/layout/canvas/index.tsx'
import { htmlToPngFile } from "@/common/transform";
import { uploadToCOS } from "@/api/cos";
import { message } from '@/common/message';
import { cacheFontFamily } from "@/components/design/store";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


// 字体列表
const { list, getList, reset, loading, total } = usePaging((params) => {
  return getFontList({
    ...params,
    pageSize: 30,
  });
});

const activeFont = ref({} as any);

const previewFontSize = ref(36);

// Slider 组件使用数组 modelValue，这里做适配而不改变 previewFontSize 的数字语义
const previewFontSizeModel = computed({
  get: () => [previewFontSize.value],
  set: (v) => {
    previewFontSize.value = Array.isArray(v) ? v[0] : v;
  },
});

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
  border: 1px solid var(--1s-border-color);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: var(--1s-surface-background);
  aspect-ratio: 1 / 1.4;
  position: relative;

  &:hover {
    border-color: var(--1s-accent-color);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--1s-accent-color) 15%, transparent);
  }

  &.font-item-selected {
    border-color: var(--1s-accent-color);
    background: var(--1s-hover-background);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--1s-accent-color) 20%, transparent);
    
    .font-item-name {
      color: var(--1s-accent-color);
      font-weight: 600;
    }
    
    .font-item-image {
      background: var(--1s-accent-color-soft);
    }
  }

  &.font-item-loaded {
    border-left: 3px solid #67c23a;
  }
}

.font-item-image {
  width: 100%;
  height: 70%;
  background: var(--1s-control-surface-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--1s-border-color);
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
  color: var(--1s-text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.font-item-time {
  font-size: 0.8rem;
  color: var(--1s-text-color-tertiary);
  line-height: 1.2;
}

.label {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--1s-text-color);
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

.description-text {
  color: var(--1s-text-color-secondary);
  line-height: 1.5;
  background: var(--1s-control-surface-muted);
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid var(--1s-accent-color);
}

.font-family-info {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--1s-control-surface-muted);
  border-radius: 8px;
  border: 1px solid var(--1s-border-color);
}

.font-family-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--1s-text-color-secondary);
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
  color: var(--1s-accent-color);
  background: var(--1s-surface-background);
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--1s-border-color);
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
