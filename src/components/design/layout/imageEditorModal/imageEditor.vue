<template>
  <div class="image-editor">
    <div class="image-editor-layout">
      <!-- 左侧：贴纸选择面板 -->
      <div class="editor-sidebar" v-if="!selectedImage">
        <div class="sidebar-header">
          <h3>选择图片</h3>
          <p class="sidebar-tip">从贴纸资源中选择一张图片进行编辑</p>
        </div>
        <div class="sticker-list-container">
          <stickerSelector @select="handleImageSelect" />
        </div>
      </div>

      <!-- 右侧：编辑区域 -->
      <div class="editor-main">
        <div v-if="!selectedImage" class="editor-placeholder">
          <div class="placeholder-content">
            <el-icon :size="64" color="#ccc">
              <Picture></Picture>
            </el-icon>
            <p>请从左侧选择一张图片开始编辑</p>
          </div>
        </div>

        <div v-else class="editor-workspace">
          <!-- Fabric.js 画布容器 -->
          <div class="fabric-canvas-wrapper">
            <canvas ref="fabricCanvasRef" class="fabric-canvas"></canvas>
          </div>

          <!-- 工具栏 -->
          <div class="editor-toolbar">
            <div class="toolbar-section">
              <el-button-group>
                <el-button @click="handleCrop" :disabled="!fabricCanvas">裁剪</el-button>
                <el-button @click="handleRotate" :disabled="!fabricCanvas">旋转</el-button>
                <el-button @click="handleFlipH" :disabled="!fabricCanvas">水平翻转</el-button>
                <el-button @click="handleFlipV" :disabled="!fabricCanvas">垂直翻转</el-button>
              </el-button-group>
            </div>

            <div class="toolbar-section">
              <el-button-group>
                <el-button @click="handleUndo" :disabled="!canUndo">撤销</el-button>
                <el-button @click="handleRedo" :disabled="!canRedo">重做</el-button>
                <el-button @click="handleReset" :disabled="!fabricCanvas">重置</el-button>
              </el-button-group>
            </div>

            <div class="toolbar-section">
              <el-button @click="handleChangeImage">更换图片</el-button>
            </div>

            <div class="toolbar-spacer"></div>

            <div class="toolbar-section">
              <el-button @click="handleExport">导出图片</el-button>
              <el-button type="primary" @click="handleUpload" :loading="uploading">上传到图片库</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传弹窗 -->
    <a-modal
      v-model:open="showUploadModal"
      title="保存到图片素材库"
      :confirmLoading="submitLoading"
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
        <el-form-item label="自动去除白色边框:">
          <a-switch
            v-model:checked="uploadForm.autoTrim"
            checked-children="是"
            un-checked-children="否"
          />
        </el-form-item>
      </el-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Picture } from '@element-plus/icons-vue'
import { message } from 'ant-design-vue'
import Api from '@/api'
import { useLoginStatusStore } from '@/store/stores/login'
import { downloadByFile } from '@/common/transform'
import Utils from '@/common/utils'
import { imageDataToFile } from '@/common/transform'
import tagsInput from '@/components/design/components/tagsInput/tagsInput.vue'
import { stickerAutoplacementTags } from '@/components/design/components/tagsInput/index.ts'
import stickerSelector from './stickerSelector.vue'

// 动态导入 fabric.js
let fabric = null;
async function loadFabric() {
  if (fabric) return fabric;
  
  try {
    const fabricModule = await import('fabric');
    fabric = fabricModule.fabric || fabricModule.default;
    if (!fabric) {
      throw new Error('Fabric.js 加载失败');
    }
    return fabric;
  } catch (e) {
    console.error('Fabric.js 未安装，请运行: npm install fabric', e);
    message.error('Fabric.js 未安装，请先安装依赖: npm install fabric');
    return null;
  }
}

const loginStore = useLoginStatusStore()

const fabricCanvasRef = ref(null)
const fabricCanvas = ref(null)
const selectedImage = ref(null)
const canUndo = ref(false)
const canRedo = ref(false)
const uploading = ref(false)
const showUploadModal = ref(false)
const submitLoading = ref(false)

// 历史记录
const history = ref([])
const historyIndex = ref(-1)

const uploadForm = ref({
  name: '',
  description: '',
  keywords: [],
  autoTrim: true
})

// 初始化 Fabric.js 画布
function initFabricCanvas() {
  if (!fabricCanvasRef.value || !fabric) {
    if (!fabric) {
      loadFabric().then(() => {
        if (fabric) {
          initFabricCanvas()
        }
      })
    }
    return
  }
  
  try {
    fabricCanvas.value = new fabric.Canvas(fabricCanvasRef.value, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    })

    // 监听对象变化，更新历史记录
    fabricCanvas.value.on('object:modified', saveHistory)
    fabricCanvas.value.on('object:added', saveHistory)
    fabricCanvas.value.on('object:removed', saveHistory)
  } catch (e) {
    console.error('Fabric.js 初始化失败:', e)
    message.error('画布初始化失败')
  }
}

// 从贴纸资源选择图片
async function handleImageSelect(sticker) {
  if (!sticker || !sticker.url) {
    message.error('图片信息无效')
    return
  }

  selectedImage.value = sticker
  
  if (!fabric) {
    await loadFabric()
    if (!fabric) {
      message.error('Fabric.js 未安装，无法加载图片')
      return
    }
  }

  if (!fabricCanvas.value) {
    initFabricCanvas()
  }

  // 等待画布初始化完成
  await new Promise(resolve => {
    if (fabricCanvas.value) {
      resolve()
    } else {
      setTimeout(resolve, 100)
    }
  })

  // 加载图片到 Fabric.js
  fabric.Image.fromURL(sticker.url, (img) => {
    if (!fabricCanvas.value) {
      initFabricCanvas()
    }

    // 计算缩放以适应画布
    const canvas = fabricCanvas.value
    const scale = Math.min(
      (canvas.width - 40) / img.width,
      (canvas.height - 40) / img.height,
      1
    )
    
    img.scale(scale)
    img.set({
      left: (canvas.width - img.width * scale) / 2,
      top: (canvas.height - img.height * scale) / 2,
      selectable: true,
      hasControls: true,
      hasBorders: true
    })

    canvas.clear()
    canvas.add(img)
    canvas.setActiveObject(img)
    canvas.renderAll()
    
    // 重置历史记录
    history.value = []
    historyIndex.value = -1
    saveHistory()
    
    message.success('图片加载成功')
  }, {
    crossOrigin: 'anonymous'
  })
}

// 保存历史记录
function saveHistory() {
  if (!fabricCanvas.value) return
  
  const json = JSON.stringify(fabricCanvas.value.toJSON())
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
  if (!canUndo.value || !fabricCanvas.value) return
  
  historyIndex.value--
  const json = history.value[historyIndex.value]
  fabricCanvas.value.loadFromJSON(json, () => {
    fabricCanvas.value.renderAll()
    updateUndoRedoState()
  })
}

// 重做
function handleRedo() {
  if (!canRedo.value || !fabricCanvas.value) return
  
  historyIndex.value++
  const json = history.value[historyIndex.value]
  fabricCanvas.value.loadFromJSON(json, () => {
    fabricCanvas.value.renderAll()
    updateUndoRedoState()
  })
}

// 重置
function handleReset() {
  if (!selectedImage.value || !fabricCanvas.value) return
  handleImageSelect(selectedImage.value)
}

// 裁剪 - 使用 Fabric.js 的自由裁剪功能
function handleCrop() {
  if (!fabricCanvas.value) return
  
  const activeObject = fabricCanvas.value.getActiveObject()
  if (!activeObject) {
    message.warning('请先选择图片对象')
    return
  }
  
  // Fabric.js 支持通过调整对象的边界框来实现裁剪效果
  // 用户可以通过拖动控制点来调整图片大小和位置
  message.info('裁剪提示：拖动图片边缘的控制点可以调整大小，移动图片可以调整位置')
}

// 旋转
function handleRotate() {
  if (!fabricCanvas.value) return
  const activeObject = fabricCanvas.value.getActiveObject()
  if (activeObject) {
    activeObject.rotate((activeObject.angle || 0) + 90)
    fabricCanvas.value.renderAll()
    saveHistory()
  }
}

// 水平翻转
function handleFlipH() {
  if (!fabricCanvas.value) return
  const activeObject = fabricCanvas.value.getActiveObject()
  if (activeObject) {
    activeObject.set('flipX', !activeObject.flipX)
    fabricCanvas.value.renderAll()
    saveHistory()
  }
}

// 垂直翻转
function handleFlipV() {
  if (!fabricCanvas.value) return
  const activeObject = fabricCanvas.value.getActiveObject()
  if (activeObject) {
    activeObject.set('flipY', !activeObject.flipY)
    fabricCanvas.value.renderAll()
    saveHistory()
  }
}

// 更换图片
function handleChangeImage() {
  selectedImage.value = null
  if (fabricCanvas.value) {
    fabricCanvas.value.clear()
    fabricCanvas.value.renderAll()
  }
  history.value = []
  historyIndex.value = -1
  updateUndoRedoState()
}

// 导出图片
async function handleExport() {
  if (!fabricCanvas.value) {
    message.warning('请先选择图片')
    return
  }

  try {
    const dataURL = fabricCanvas.value.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1
    })
    
    // 转换为 Blob
    const blob = await fetch(dataURL).then(res => res.blob())
    const file = new File([blob], 'edited-image.png', { type: 'image/png' })
    
    downloadByFile(file)
    message.success('图片导出成功')
  } catch (e) {
    console.error('导出失败:', e)
    message.error('导出失败: ' + e.message)
  }
}

// 上传
function handleUpload() {
  if (!fabricCanvas.value) {
    message.warning('请先选择图片')
    return
  }
  
  // 初始化表单
  uploadForm.value.name = selectedImage.value?.name || '编辑后的图片'
  uploadForm.value.description = selectedImage.value?.description || ''
  // 确保 keywords 是字符串数组
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

// 执行上传
async function doUpload() {
  if (!fabricCanvas.value) return
  
  submitLoading.value = true

  try {
    // 获取画布数据
    const dataURL = fabricCanvas.value.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1
    })
    
    // 转换为 Blob 和 File
    const blob = await fetch(dataURL).then(res => res.blob())
    let file = new File([blob], 'edited-image.png', { type: 'image/png' })

    // 如果开启了自动去除白色边框
    if (uploadForm.value.autoTrim) {
      // 创建临时 canvas 来获取 ImageData
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          resolve()
        }
        img.onerror = reject
        img.src = dataURL
      })
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const trimmed = Utils.trimImageData(imageData)
      file = imageDataToFile(trimmed)
    }

    // 获取文件后缀
    const suffix = file.name.split('.').pop() || 'png'

    // 上传文件到COS
    const cos = await Api.uploadToCOS({
      file: file,
    })

    // 保存到素材库
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
    
    message.success("保存成功")
    submitLoading.value = false
    showUploadModal.value = false
  } catch (e) {
    console.error('保存失败:', e)
    submitLoading.value = false
    message.error("保存失败: " + (e.message || e))
  }
}

onMounted(async () => {
  await loadFabric()
  nextTick(() => {
    initFabricCanvas()
  })
})

onUnmounted(() => {
  if (fabricCanvas.value) {
    fabricCanvas.value.dispose()
  }
})
</script>

<style lang="less" scoped>
.image-editor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.image-editor-layout {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.editor-sidebar {
  width: 360px;
  height: 100%;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 500;
  }
  
  .sidebar-tip {
    margin: 0;
    font-size: 12px;
    color: #999;
  }
}

.sticker-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.editor-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.placeholder-content {
  text-align: center;
  
  p {
    margin-top: 16px;
    color: #999;
    font-size: 14px;
  }
}

.editor-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fabric-canvas-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
  overflow: auto;
  min-height: 0;
}

.fabric-canvas {
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #fff;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fff;
  flex-shrink: 0;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-spacer {
  flex: 1;
}
</style>

