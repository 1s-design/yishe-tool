<template>
  <div class="frame-maker">
    <div class="frame-maker-layout">
      <!-- 制作区域 -->
      <div class="maker-main">
        <div v-if="!selectedImage" class="maker-placeholder">
          <div class="placeholder-content">
            <el-icon :size="64" color="#ccc">
              <Picture></Picture>
            </el-icon>
            <p>请选择一张图片开始制作画框</p>
            <el-button type="primary" @click="showSelectModal = true" style="margin-top: 16px">
              选择图片
            </el-button>
          </div>
        </div>

        <div v-else class="maker-workspace">
          <!-- 左侧工具栏 -->
          <div class="maker-sidebar">
            <div class="sidebar-divider"></div>

            <div class="sidebar-section">
              <div class="tool-item" @click="handleUndo" :class="{ disabled: !canUndo }">
                <div class="tool-icon">↶</div>
                <span class="tool-label">撤销</span>
              </div>
              <div class="tool-item" @click="handleRedo" :class="{ disabled: !canRedo }">
                <div class="tool-icon">↷</div>
                <span class="tool-label">重做</span>
              </div>
              <div class="tool-item" @click="handleReset" :class="{ disabled: !selectedImage }">
                <div class="tool-icon">↺</div>
                <span class="tool-label">重置</span>
              </div>
            </div>

            <div class="sidebar-divider"></div>

            <div class="sidebar-section">
              <div class="tool-item" @click="handleChangeImage">
                <div class="tool-icon">🖼️</div>
                <span class="tool-label">更换图片</span>
              </div>
              <div class="tool-item" @click="handleExport">
                <div class="tool-icon">💾</div>
                <span class="tool-label">导出图片</span>
              </div>
              <div class="tool-item primary" @click.stop="handleUpload" :class="{ loading: uploading }">
                <div class="tool-icon">☁️</div>
                <span class="tool-label">上传到图片库</span>
              </div>
            </div>
          </div>

          <!-- 右侧操作区域 -->
          <div class="maker-canvas-area">
            <div class="canvas-wrapper">
              <div class="preview-container">
                <img 
                  v-if="selectedImage" 
                  :src="selectedImage.url" 
                  :alt="selectedImage.name"
                  class="preview-image"
                />
                <!-- Loading 遮罩 -->
                <div v-if="imageLoading" class="image-loading-overlay">
                  <div class="loading-content">
                    <el-icon class="is-loading" :size="32">
                      <Loading />
                    </el-icon>
                    <p>正在加载图片...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 选择图片弹窗 -->
    <a-modal
      v-model:open="showSelectModal"
      title="选择图片"
      width="1200px"
      :footer="null"
      :z-index="10001"
      :centered="true"
      :body-style="{ padding: '16px', height: '600px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }"
      @cancel="showSelectModal = false"
      class="select-image-modal"
    >
      <div class="select-modal-content">
        <div class="sticker-list-container">
          <stickerSelector @select="handleImageSelectFromModal" />
        </div>
      </div>
    </a-modal>

    <!-- 上传弹窗 -->
    <a-modal
      v-model:open="showUploadModal"
      title="保存到图片素材库"
      :confirmLoading="submitLoading"
      :z-index="10002"
      :centered="true"
      @ok="doUpload"
      @cancel="showUploadModal = false"
    >
      <el-form label-width="100px">
        <el-form-item label="图片名称：">
          <el-input v-model="uploadForm.name" placeholder="图片名称"></el-input>
        </el-form-item>
        <el-form-item label="图片描述:">
          <el-input
            type="textarea"
            v-model="uploadForm.description"
            placeholder="图片描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="关键字:">
          <tagsInput
            v-model="uploadForm.keywords"
            :autocomplete-tags="stickerAutoplacementTags"
            :autocomplete-width="400"
            autocompletePlacement="bottom"
          ></tagsInput>
        </el-form-item>
      </el-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Picture, Loading } from '@element-plus/icons-vue'
import { message } from 'ant-design-vue'

// 配置 message 的 z-index，确保显示在弹窗之上
message.config({
  top: '100px',
  duration: 3,
  maxCount: 3,
})
import Api from '@/api'
import { useLoginStatusStore } from '@/store/stores/login'
import { downloadByFile } from '@/common/transform'
import tagsInput from '@/components/design/components/tagsInput/tagsInput.vue'
import { stickerAutoplacementTags } from '@/components/design/components/tagsInput/index.ts'
import stickerSelector from '../imageEditorModal/stickerSelector.vue'

const loginStore = useLoginStatusStore()

const selectedImage = ref(null)
const uploading = ref(false)
const showUploadModal = ref(false)
const showSelectModal = ref(false)
const submitLoading = ref(false)
const imageLoading = ref(false)
const canUndo = ref(false)
const canRedo = ref(false)

// 历史记录
const history = ref([])
const historyIndex = ref(-1)

const uploadForm = ref({
  name: '',
  description: '',
  keywords: []
})

// 保存原始图片尺寸（用于导出时保持高分辨率）
const originalImageSize = ref({ width: 0, height: 0 })

// 从弹窗选择图片
async function handleImageSelectFromModal(sticker) {
  showSelectModal.value = false
  await handleImageSelect(sticker)
}

// 选择图片
async function handleImageSelect(sticker) {
  if (!sticker || !sticker.url) {
    message.error('图片信息无效')
    return
  }

  // 显示 loading
  imageLoading.value = true
  selectedImage.value = sticker
  await nextTick()

  try {
    // 获取图片尺寸
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('图片加载超时'))
      }, 30000)
      
      img.onload = () => {
        clearTimeout(timeout)
        originalImageSize.value = {
          width: img.width,
          height: img.height
        }
        resolve()
      }
      
      img.onerror = (error) => {
        clearTimeout(timeout)
        reject(error)
      }
      
      img.src = sticker.url
    })

    imageLoading.value = false
    message.success('图片加载成功')
    
    // 保存历史记录
    saveHistory()
  } catch (error) {
    imageLoading.value = false
    console.error('图片加载异常:', error)
    message.error('图片加载异常: ' + error.message)
  }
}

// 保存历史记录
function saveHistory() {
  const state = {
    selectedImage: selectedImage.value,
    originalImageSize: originalImageSize.value
  }
  const json = JSON.stringify(state)
  // 移除当前索引之后的历史记录
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(json)
  historyIndex.value = history.value.length - 1
  
  updateUndoRedoState()
}

// 更新撤销/重做状态
function updateUndoRedoState() {
  canUndo.value = historyIndex.value > 0
  canRedo.value = historyIndex.value < history.value.length - 1
}

// 撤销
function handleUndo() {
  if (!canUndo.value) return
  
  historyIndex.value--
  const json = history.value[historyIndex.value]
  const state = JSON.parse(json)
  selectedImage.value = state.selectedImage
  originalImageSize.value = state.originalImageSize
  updateUndoRedoState()
}

// 重做
function handleRedo() {
  if (!canRedo.value) return
  
  historyIndex.value++
  const json = history.value[historyIndex.value]
  const state = JSON.parse(json)
  selectedImage.value = state.selectedImage
  originalImageSize.value = state.originalImageSize
  updateUndoRedoState()
}

// 重置
function handleReset() {
  if (!selectedImage.value) return
  handleImageSelect(selectedImage.value)
}

// 更换图片
function handleChangeImage() {
  selectedImage.value = null
  history.value = []
  historyIndex.value = -1
  updateUndoRedoState()
  showSelectModal.value = true
}

// 导出图片
async function handleExport() {
  if (!selectedImage.value) {
    message.warning('请先选择图片')
    return
  }

  try {
    // 获取图片
    const response = await fetch(selectedImage.value.url)
    const blob = await response.blob()
    const file = new File([blob], selectedImage.value.name || 'frame-image.png', { type: blob.type })
    
    downloadByFile(file)
    message.success('图片导出成功')
  } catch (e) {
    console.error('导出失败:', e)
    message.error('导出失败: ' + (e.message || e))
  }
}

// 上传
function handleUpload() {
  if (!selectedImage.value) {
    message.warning('请先选择图片')
    return
  }
  
  // 初始化表单
  uploadForm.value.name = selectedImage.value?.name || '画框图片'
  uploadForm.value.description = selectedImage.value?.description || ''
  if (selectedImage.value?.keywords) {
    const keywordsStr = typeof selectedImage.value.keywords === 'string' 
      ? selectedImage.value.keywords 
      : String(selectedImage.value.keywords || '')
    uploadForm.value.keywords = keywordsStr.split(',').filter(k => k.trim())
  } else {
    uploadForm.value.keywords = []
  }
  
  showUploadModal.value = true
}

// 执行上传（使用与导出相同的逻辑）
async function doUpload() {
  if (!selectedImage.value) {
    message.error('没有选择图片，无法上传')
    return
  }
  
  submitLoading.value = true

  try {
    // 获取图片
    const response = await fetch(selectedImage.value.url)
    const blob = await response.blob()
    const file = new File([blob], selectedImage.value.name || 'frame-image.png', { type: blob.type })

    // 获取文件后缀
    const suffix = file.name.split('.').pop() || 'png'

    // 上传文件到COS
    let cos
    try {
      cos = await Api.uploadToCOS({
        file: file,
      })
    } catch (err) {
      throw new Error('上传到COS失败: ' + (err.message || err))
    }

    // 保存到素材库
    try {
      await Api.createSticker({
        url: cos.url,
        suffix: suffix,
        name: uploadForm.value.name,
        description: uploadForm.value.description,
        keywords: Array.isArray(uploadForm.value.keywords) 
          ? uploadForm.value.keywords.map(k => String(k || '')).filter(k => k).join(",")
          : String(uploadForm.value.keywords || ''),
        isCustom: true,
        uploaderId: loginStore.isLogin ? loginStore.userInfo.id : null,
      })
    } catch (err) {
      throw new Error('保存到素材库失败: ' + (err.message || err))
    }
    
    message.success("上传成功")
    submitLoading.value = false
    showUploadModal.value = false
  } catch (e) {
    console.error('上传失败:', e)
    submitLoading.value = false
    const errorMessage = e?.message || e?.response?.data?.message || e?.toString() || '未知错误'
    message.error("上传失败: " + errorMessage)
  }
}

onMounted(() => {
  // 初始化逻辑
})
</script>

<style lang="less" scoped>
.frame-maker {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.frame-maker-layout {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.maker-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.maker-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.placeholder-content {
  text-align: center;
  color: #999;
  
  p {
    margin-top: 16px;
    color: #999;
    font-size: 14px;
  }
}

.maker-workspace {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

.maker-sidebar {
  width: 300px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e5e5;
  background: #fafafa;
  padding: 8px 6px;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.section-title {
  font-size: 11px;
  color: #999;
  padding: 8px 10px 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.sidebar-divider {
  height: 1px;
  background: #e5e5e5;
  margin: 6px 0;
  flex-shrink: 0;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.1s ease;
  user-select: none;
  min-height: 32px;
  
  &:hover:not(.disabled) {
    background: #f0f0f0;
  }
  
  &:active:not(.disabled) {
    background: #e8e8e8;
  }
  
  &.disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  
  &.primary {
    background: #6900ff;
    color: #fff;
    margin-top: 2px;
    
    &:hover:not(.disabled) {
      background: #5a00e6;
    }
    
    &:active:not(.disabled) {
      background: #4d00cc;
    }
    
    .tool-label {
      color: #fff;
      font-weight: 500;
    }
  }
  
  &.loading {
    opacity: 0.7;
    cursor: wait;
  }
}

.tool-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
  line-height: 1;
}

.tool-label {
  font-size: 12px;
  color: #333;
  font-weight: 400;
  line-height: 1.4;
}

.maker-canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  width: 100%;
  height: 100%;
}

.canvas-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
  overflow: auto;
  min-height: 0;
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-container {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #fff;
}

.image-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(2px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  
  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

:deep(.select-image-modal) {
  .ant-modal {
    top: 50%;
    transform: translateY(-50%);
    margin: 0 auto;
    padding-bottom: 0;
  }
}

.select-modal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.sticker-list-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* 确保 Ant Design Vue message 显示在弹窗之上 */
:deep(.ant-message) {
  z-index: 10003 !important;
}

:deep(.ant-message-notice) {
  z-index: 10003 !important;
}

:deep(.ant-message-notice-content) {
  z-index: 10003 !important;
}
</style>

