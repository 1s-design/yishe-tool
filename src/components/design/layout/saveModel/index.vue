<!--
 * @Author: chan-max jackieontheway666@gmail.com
 * @Date: 2023-12-16 12:40:25
 * @LastEditors: chan-max jackieontheway666@gmail.com
 * @LastEditTime: 2025-08-08 05:45:18
 * @FilePath: /1s/src/components/design/layout/saveModel/index.vue
 * @Description: 
 * 
 * Copyright (c) 2024 by 1s, All Rights Reserved. 
-->
<template>
  <div class="save-model-container">
    <!-- 左侧信息展示区域 -->
    <div class="left-section">
      <!-- 模型预览区域 -->
      <div class="preview-section">
        <div class="preview-header">
          <h3 class="text-base font-medium">模型预览</h3>
        </div>
        <div class="preview-content">
          <s1-image
            class="preview-image"
            :src="displayThumbnail"
          ></s1-image>
        </div>
      </div>

      <!-- 模型组成信息 -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="text-base font-medium">模型组成</h3>
        </div>
        
        <!-- 基本模型信息 -->
        <div class="model-info">
          <div class="info-label">
            <span class="dot blue"></span>
            <span>基本模型</span>
          </div>
          <div class="info-content">
            <div class="info-row">
              <span class="label">名称:</span>
              <span class="value">{{ currentOperatingBaseModelInfo?.name || '未设置' }}</span>
            </div>
            <div class="info-row">
              <span class="label">描述:</span>
              <span class="value">{{ currentOperatingBaseModelInfo?.description || '未设置' }}</span>
            </div>
            <div class="info-row">
              <span class="label">标签:</span>
              <div class="tags">
                <template v-if="currentOperatingBaseModelInfo?.keywords">
                  <Badge
                    v-for="(keyword, index) in currentOperatingBaseModelInfo.keywords.split(',')" 
                    :key="`base-${index}-${keyword.trim()}`"
                    variant="secondary"
                    class="tag-item"
                  >
                    {{ keyword.trim() }}
                  </Badge>
                </template>
                <span v-else class="no-data">未设置</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 贴纸信息 -->
        <div class="sticker-info">
          <div class="info-label">
            <span class="dot green"></span>
            <span>贴纸 ({{ currentModelController?.decalControllers?.length || 0 }}个)</span>
          </div>
          
          <template v-if="currentModelController?.decalControllers?.length">
            <div class="sticker-list">
              <div 
                v-for="(decal, index) in currentModelController.decalControllers" 
                :key="decal.id && decal.id.value ? decal.id.value : index"
                class="sticker-item"
              >
                <div class="sticker-preview">
                  <s1-image
                    :src="decal.state.src"
                    class="sticker-image"
                  ></s1-image>
                </div>
                <div class="sticker-details">
                  <div class="sticker-name">{{ decal.info?.name || '未设置' }}</div>
                  <div class="sticker-desc">{{ decal.info?.description || '未设置' }}</div>
                  <div class="sticker-tags">
                    <template v-if="decal.info?.keywords">
                      <Badge
                        v-for="(keyword, tagIndex) in decal.info.keywords.split(',')" 
                        :key="`decal-${decal.id && decal.id.value ? decal.id.value : index}-${keyword.trim()}`"
                        size="small"
                        class="tag-item"
                      >
                        {{ keyword.trim() }}
                      </Badge>
                    </template>
                    <span v-else class="no-data">未设置</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
          
          <template v-else>
            <div class="empty-stickers">
              <span>暂无贴纸</span>
            </div>
          </template>
        </div>
      </div>

      <!-- 材质信息展示卡片 -->
      <div class="material-card info-card">
        <div class="card-header">
          <h3 class="text-base font-medium">材质信息</h3>
        </div>
        <div class="material-info">
          <div v-if="currentModelController.state.material.textureInfo">
            <div class="material-thumb-wrap">
              <s1-img
                :src="currentModelController.state.material.textureInfo.url"
                class="material-thumb"
              ></s1-img>
            </div>
          </div>
          <div v-else class="no-material-thumb">无纹理</div>

                    <!-- 新增：材质名称 -->
                    <div class="material-row">
            <span class="label">名称:</span>
            <span class="value">{{ currentModelController.state.material.textureInfo?.name || '未设置' }}</span>
          </div>
          <!-- 新增：材质描述 -->
          <div class="material-row">
            <span class="label">描述:</span>
            <span class="value">{{ currentModelController.state.material.textureInfo?.description || '未设置' }}</span>
          </div>
          <!-- 新增：材质标签 -->
          <div class="material-row">
            <span class="label">标签:</span>
            <div class="tags">
              <template v-if="currentModelController.state.material.textureInfo?.keywords">
                <Badge
                  v-for="(keyword, index) in currentModelController.state.material.textureInfo.keywords.split(',')" 
                  :key="`material-${index}-${keyword.trim()}`"
                  variant="secondary"
                  class="tag-item"
                >
                  {{ keyword.trim() }}
                </Badge>
              </template>
              <span v-else class="no-data">未设置</span>
            </div>
          </div>

          <div class="material-row">
            <span class="label">密度:</span>
            <span class="value">{{ currentModelController.state.material.textureRepeat || 0 }}</span>
          </div>
          <div class="material-row">
            <span class="label">粗糙度:</span>
            <span class="value">{{ currentModelController.state.material.roughness || 0 }}</span>
          </div>
          <div class="material-row">
            <span class="label">金属感:</span>
            <span class="value">{{ currentModelController.state.material.metailness || 0 }}</span>
          </div>
          <div class="material-row">
            <span class="label">颜色:</span>
            <div class="color-display">
              <div 
                class="color-preview" 
                :style="{ background: currentModelController.state.material.color }"
              ></div>
              <span class="color-value">{{ currentModelController.state.material.color }}</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- 右侧表单区域 -->
    <div class="right-section">
      <!-- 模型信息表单 -->
      <div class="form-card">
        <div class="card-header">
          <h3 class="text-base font-medium">模型信息</h3>
        </div>
        
        <div class="compact-form flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <Label class="text-xs">模型名称</Label>
            <Input
              v-model="form.name"
              placeholder="请输入模型名称"
              class="h-6 text-[11px]"
            />
          </div>

          <div class="flex flex-col gap-1">
            <Label class="text-xs">模型描述</Label>
            <Textarea
              v-model="form.description"
              placeholder="请输入模型描述"
              :rows="3"
              class="text-[11px]"
            />
          </div>

          <div class="flex flex-col gap-1">
            <Label class="text-xs">模型标签</Label>
            <s1-tagsInput
              v-model="form.keywords"
              :string="true"
              :autocompleteTags="customModelAutoplacementTags"
              :autocompleteWidth="300"
            ></s1-tagsInput>
          </div>

          <div class="flex items-center gap-2">
            <Label class="text-xs">是否母版</Label>
            <Switch
              v-model:checked="form.isTemplate"
            />
          </div>

        </div>

        <!-- 保存按钮上方新增AI生成内容按钮 -->
        <!-- <div class="ai-gen-button-container" style="padding: 0 12px 8px 12px;">
          <Button 
            @click="aiGenerateContent" 
            variant="outline"
            class="ai-gen-button rounded-full" 
          >
            AI生成内容
          </Button>
        </div> -->
        <!-- 保存按钮 -->
        <div class="save-button-container">
          <Button 
            @click="save" 
            variant="default" 
            class="save-button rounded-full" 
            :disabled="loading"
          >
            {{ loadingMessage || "上传模型" }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onBeforeMount, computed, watch } from "vue";
import { createCustomModelApi, uploadToCOS, getCustomModelById } from "@/api";
import { confirm as uiConfirm } from '@/components/ui/confirm';
import {
  currentModelController,
  currentOperatingBaseModelInfo,
  lastestScreenshot,
  screenshots,
  showSaveModel,
  isEdit,
  currentEditingModelId,
  exitEditMode,
  selectedAngles,
} from "../../store";
import { base64ToFile, base64ToPngFile } from "@/common/transform/base64ToFile";
import { useLoginStatusStore } from "@/store/stores/login";
import { message } from '@/common/message';
import desimage from "@/components/image.vue";
import { XCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import Utils from "@/common/utils";
import { saveCustomModel } from "./index.ts";
import { customModelAutoplacementTags } from "../../components/tagsInput";
import { updateCustomModelWithUpload } from "./index.ts";

const loginStore = useLoginStatusStore();

const displayThumbnail = ref();

const form = ref({
  name: null,
  description: null,
  keywords: null,
  isTemplate: false,
});

// 获取模型缩略图
function updateThumbnail() {
  displayThumbnail.value = currentModelController.value.getScreenshotBase64();
}

// 填充表单数据（编辑模式）
async function fillFormWithExistingData() {
  if (isEdit.value && currentEditingModelId.value) {
    try {
      const modelInfo = await getCustomModelById(currentEditingModelId.value);
      if (modelInfo) {
        form.value = {
          name: modelInfo.name || '',
          description: modelInfo.description || '',
          keywords: modelInfo.keywords || '',
          isTemplate: modelInfo.isTemplate || false,
        };
      }
    } catch (error) {
      console.error('获取模型信息失败:', error);
    }
  }
}

// 监听弹窗显示状态，每次显示时重新生成截图
watch(showSaveModel, (newVal) => {
  if (newVal) {
    // 弹窗显示时重新生成截图
    updateThumbnail();
    
    // 如果是编辑模式，填充原有数据到表单
    if (isEdit.value) {
      fillFormWithExistingData();
    }
  }
});

// 监听编辑状态变化，确保编辑模式下填充数据
watch(isEdit, (newVal) => {
  if (newVal && showSaveModel.value) {
    fillFormWithExistingData();
  } else if (!newVal) {
    // 退出编辑模式时清空表单
    form.value = {
      name: '',
      description: '',
      keywords: '',
      isTemplate: false,
    };
  }
});

// 初始化时获取截图
onBeforeMount(() => {
  updateThumbnail();
  
  // 如果是编辑模式，填充原有数据到表单
  if (isEdit.value) {
    fillFormWithExistingData();
  }
});

const loading = ref(false);
const loadingMessage = ref("");

async function save() {
  try {
    loading.value = true;
    if (isEdit.value) {
      // 编辑模式，弹窗提示
      const okContinue = await uiConfirm({
        title: "提示",
        description: "当前为修改模式，将会影响到原模型，是否继续？",
        okText: "确定",
        cancelText: "取消",
      });
      if (!okContinue) return;
      await updateCustomModelWithUpload({
        ...form.value,
        id: currentEditingModelId.value,
        selectedAngles: selectedAngles.value,
      });
      message.success("模型修改成功");
      showSaveModel.value = false; // 关闭弹窗
      // exitEditMode();
    } else {
      await saveCustomModel({
        ...form.value,
        selectedAngles: selectedAngles.value,
      });
      message.success("上传成功");
      showSaveModel.value = false; // 关闭弹窗
    }
  } catch (e) {
    // 如果用户取消操作，不显示错误信息
    if (e && e.toString().includes('cancel')) {
      return;
    }
    console.error('保存失败:', e);
  } finally {
    loading.value = false;
  }
}

function removeScreenshot(item) {
  let ind = screenshots.value.indexOf(item);
  screenshots.value.splice(ind, 1);
}

/**
 * @method AI生成内容，打印模型、贴纸、材质信息
 */
function aiGenerateContent() {
  // 模型信息
  const modelInfo = form.value;
  // 贴纸信息
  const decals = currentModelController.value?.decalControllers || [];
  // 材质信息
  const material = currentModelController.value?.state?.material || null;
  console.log('AI生成内容：');
  console.log('模型信息:', modelInfo);
  if (decals.length > 0) {
    console.log('贴纸信息:', decals.map(d => d.info));
  } else {
    console.log('贴纸信息: 无');
  }
  if (material) {
    console.log('材质信息:', material);
  } else {
    console.log('材质信息: 无');
  }
}
</script>
<style lang="less" scoped>
/* 主容器布局 */
.save-model-container {
  display: flex;
  height: 100vh;
  max-height: 90vh;
  overflow: auto;
  gap: 12px;
  padding: 12px;
  box-sizing: border-box;
}

/* 左侧信息展示区域 */
.left-section {
  flex: 0 0 40%; /* 左侧更宽 */
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  min-height: 0;
}

/* 右侧表单区域 */
.right-section {
  flex: 1; /* 右侧自适应 */
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  min-height: 0;
}

/* 左侧预览区域 */
.preview-section {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  background: var(--1s-control-surface-muted);
  border-radius: 8px;
  overflow: hidden;
  min-height: 0;
  height: 170px;
  max-height: 180px;
}

.preview-header {
  padding: 6px 10px 4px;
  border-bottom: 1px solid var(--1s-border-color);
  background: var(--1s-surface-background);
  flex-shrink: 0;
}

.preview-content {
  flex: 1;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  background: var(--1s-control-surface-muted);
  border-radius: 6px;
  object-fit: contain;
  max-height: 120px;
}

/* 卡片通用样式 */
.info-card {
  background: var(--1s-surface-background);
  border-radius: 8px;
  border: 1px solid var(--1s-border-color);
  overflow: hidden;
  flex-shrink: 0;
}

.form-card {
  background: var(--1s-surface-background);
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.card-header {
  padding: 8px 12px 6px;
  border-bottom: 1px solid var(--1s-border-color);
  background: var(--1s-control-surface-muted);
  flex-shrink: 0;
}

.card-header h3 {
  font-size: 13px;
  margin: 0;
}

/* 模型信息样式 */
.model-info,
.sticker-info {
  padding: 8px 12px;
}

.model-info {
  border-bottom: 1px solid var(--1s-border-color);
}

.info-label {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--1s-text-color-secondary);
  font-size: 12px;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  margin-right: 5px;
  flex-shrink: 0;
}

.dot.blue {
  background: var(--1s-accent-color);
}

.dot.green {
  background: #28a745;
}

.info-content {
  margin-left: 10px;
}

.info-row {
  display: flex;
  margin-bottom: 4px;
  align-items: flex-start;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  flex: 0 0 45px;
  font-size: 11px;
  color: var(--1s-text-color-tertiary);
  margin-right: 4px;
}

.value {
  flex: 1;
  font-size: 11px;
  color: var(--1s-text-color);
  word-break: break-word;
  line-height: 1.3;
}

.tags {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.tag-item {
  margin: 0;
  font-size: 10px;
}

.no-data {
  color: var(--1s-text-color-tertiary);
  font-style: italic;
  font-size: 11px;
}

/* 贴纸列表样式 */
.sticker-list {
  margin-left: 10px;
  overflow-y: visible;
}

.sticker-item {
  display: flex;
  gap: 6px;
  padding: 6px;
  border: 1px solid var(--1s-border-color);
  border-radius: 4px;
  margin-bottom: 4px;
  background: var(--1s-control-surface-muted);
}

.sticker-item:last-child {
  margin-bottom: 0;
}

.sticker-preview {
  flex-shrink: 0;
}

.sticker-image {
  width: 24px;
  height: 24px;
  border-radius: 3px;
  object-fit: cover;
  border: 1px solid var(--1s-border-color);
}

.sticker-details {
  flex: 1;
  min-width: 0;
}

.sticker-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--1s-text-color);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sticker-desc {
  font-size: 10px;
  color: var(--1s-text-color-tertiary);
  margin-bottom: 3px;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sticker-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
}

.empty-stickers {
  margin-left: 10px;
  padding: 12px;
  text-align: center;
  color: var(--1s-text-color-tertiary);
  font-size: 11px;
}

/* 表单样式 */
.compact-form {
  padding: 8px 12px;
}

.compact-form label {
  font-size: 11px;
  font-weight: 500;
  color: var(--1s-text-color-secondary);
}

/* 保存按钮 */
.save-button-container {
  padding: 8px 12px;
  border-top: 1px solid var(--1s-border-color);
  background: var(--1s-control-surface-muted);
  flex-shrink: 0;
}

.save-button {
  width: 100%;
}

/* 材质信息样式 */
.material-card {
  margin-top: 2px;
}
.material-info {
  padding: 8px 12px;
}
.material-thumb-wrap {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 8px;
}
.material-thumb {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid var(--1s-border-color);
  background: var(--1s-control-surface-muted);
}
.no-material-thumb {
  color: var(--1s-text-color-tertiary);
  font-size: 11px;
  margin-bottom: 8px;
}
.material-row {
  display: flex;
  align-items: center;
  font-size: 11px;
  margin-bottom: 4px;
}
.material-row .label {
  color: var(--1s-text-color-tertiary);
  margin-right: 6px;
  min-width: 36px;
}
.material-row .value {
  color: var(--1s-text-color);
}

/* 颜色显示样式 */
.color-display {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.color-preview {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid var(--1s-border-color);
  flex-shrink: 0;
}

.color-value {
  font-size: 11px;
  color: var(--1s-text-color);
}

/* 滚动条样式 */
.info-section::-webkit-scrollbar,
.sticker-list::-webkit-scrollbar {
  width: 3px;
}

.info-section::-webkit-scrollbar-track,
.sticker-list::-webkit-scrollbar-track {
  background: var(--1s-control-surface-muted);
  border-radius: 2px;
}

.info-section::-webkit-scrollbar-thumb,
.sticker-list::-webkit-scrollbar-thumb {
  background: var(--1s-control-surface-muted);
  border-radius: 2px;
}

.info-section::-webkit-scrollbar-thumb:hover,
.sticker-list::-webkit-scrollbar-thumb:hover {
  background: var(--1s-border-color);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .save-model-container {
    gap: 8px;
    padding: 8px;
  }
  
  .left-section {
    flex: 0 0 35%;
  }
  
  .preview-section {
    height: 150px;
  }
  
  .preview-image {
    max-height: 100px;
  }
}

@media (max-width: 900px) {
  .save-model-container {
    gap: 6px;
    padding: 6px;
  }
  
  .left-section {
    flex: 0 0 38%;
  }
  
  .preview-section {
    height: 140px;
  }
  
  .preview-image {
    max-height: 90px;
  }
  
  .card-header {
    padding: 6px 8px 4px;
  }
  
  .card-header h3 {
    font-size: 12px;
  }
  
  .info-card {
    border-radius: 6px;
  }
  
  .form-card {
    border-radius: 6px;
  }
}

@media (max-width: 768px) {
  .save-model-container {
    gap: 4px;
    padding: 4px;
  }
  
  .left-section {
    flex: 0 0 42%;
  }
  
  .preview-section {
    height: 120px;
  }
  
  .preview-image {
    max-height: 80px;
  }
  
  .card-header {
    padding: 4px 6px 3px;
  }
  
  .card-header h3 {
    font-size: 11px;
  }
  
  .info-label {
    font-size: 11px;
  }
  
  .label {
    font-size: 10px;
    min-width: 32px;
  }
  
  .value {
    font-size: 10px;
  }
  
  .sticker-name {
    font-size: 10px;
  }
  
  .sticker-desc {
    font-size: 9px;
  }
  
  .compact-form {
    padding: 6px 8px;
  }
  
  .compact-form label {
    font-size: 10px;
  }
  
  .save-button-container {
    padding: 6px 8px;
  }
}

@media (max-width: 600px) {
  .save-model-container {
    gap: 3px;
    padding: 3px;
  }
  
  .left-section {
    flex: 0 0 45%;
  }
  
  .preview-section {
    height: 100px;
  }
  
  .preview-image {
    max-height: 70px;
  }
  
  .card-header {
    padding: 3px 4px 2px;
  }
  
  .card-header h3 {
    font-size: 10px;
  }
  
  .info-label {
    font-size: 10px;
  }
  
  .label {
    font-size: 9px;
    min-width: 28px;
  }
  
  .value {
    font-size: 9px;
  }
  
  .sticker-name {
    font-size: 9px;
  }
  
  .sticker-desc {
    font-size: 8px;
  }
  
  .compact-form {
    padding: 4px 6px;
  }
  
  .compact-form label {
    font-size: 9px;
  }
  
  .save-button-container {
    padding: 4px 6px;
  }
  
  .material-thumb {
    width: 36px;
    height: 36px;
  }
  
  .sticker-image {
    width: 20px;
    height: 20px;
  }
}
</style>
