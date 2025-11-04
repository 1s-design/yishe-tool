<template>
  <div class="image-editor">
    <div class="image-editor-layout">
      <!-- 编辑区域 -->
      <div class="editor-main">
        <div v-if="!selectedImage" class="editor-placeholder">
          <div class="placeholder-content">
            <el-icon :size="64" color="#ccc">
              <Picture></Picture>
            </el-icon>
            <p>请选择一张图片开始编辑</p>
            <el-button type="primary" @click="showSelectModal = true" style="margin-top: 16px">
              选择图片
            </el-button>
          </div>
        </div>

        <div v-else class="editor-workspace">
          <!-- 左侧工具栏 -->
          <div class="editor-sidebar">
            <div class="sidebar-section">
              <div class="tool-item" @click="handleCrop" :class="{ disabled: !fabricCanvas }">
                <div class="tool-icon">✂️</div>
                <span class="tool-label">裁剪</span>
              </div>
              <div class="tool-item" @click="handleRotate" :class="{ disabled: !fabricCanvas }">
                <div class="tool-icon">🔄</div>
                <span class="tool-label">旋转</span>
              </div>
              <div class="tool-item" @click="handleFlipH" :class="{ disabled: !fabricCanvas }">
                <div class="tool-icon">↔️</div>
                <span class="tool-label">水平翻转</span>
              </div>
              <div class="tool-item" @click="handleFlipV" :class="{ disabled: !fabricCanvas }">
                <div class="tool-icon">↕️</div>
                <span class="tool-label">垂直翻转</span>
              </div>
            </div>

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
              <div class="tool-item" @click="handleReset" :class="{ disabled: !fabricCanvas }">
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

          <!-- 右侧画布区域 -->
          <div class="editor-canvas-area">
            <div class="fabric-canvas-wrapper">
              <canvas ref="fabricCanvasRef" class="fabric-canvas"></canvas>
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
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
import Utils from '@/common/utils'
import { imageDataToFile } from '@/common/transform'
import tagsInput from '@/components/design/components/tagsInput/tagsInput.vue'
import { stickerAutoplacementTags } from '@/components/design/components/tagsInput/index.ts'
import stickerSelector from './stickerSelector.vue'
import * as fabric from 'fabric'

const loginStore = useLoginStatusStore()

const fabricCanvasRef = ref(null)
const fabricCanvas = ref(null)
const selectedImage = ref(null)
const canUndo = ref(false)
const canRedo = ref(false)
const uploading = ref(false)
const showUploadModal = ref(false)
const showSelectModal = ref(false)
const submitLoading = ref(false)
const imageLoading = ref(false)

// 窗口 resize 监听器
let resizeHandler = null

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

// 检查是否是 SVG 图片
function isSvgUrl(url) {
  return url && (url.toLowerCase().endsWith('.svg') || url.toLowerCase().includes('data:image/svg+xml'))
}

// 获取 SVG 图片的尺寸
async function getSvgDimensions(svgUrl) {
  try {
    const response = await fetch(svgUrl)
    const svgText = await response.text()
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
    const svgElement = svgDoc.documentElement
    
    let width = parseFloat(svgElement.getAttribute('width')) || 0
    let height = parseFloat(svgElement.getAttribute('height')) || 0
    
    // 如果没有 width 和 height，尝试从 viewBox 获取
    if (!width || !height) {
      const viewBox = svgElement.getAttribute('viewBox')
      if (viewBox) {
        const values = viewBox.split(/\s+/)
        if (values.length >= 4) {
          width = parseFloat(values[2]) || 0
          height = parseFloat(values[3]) || 0
        }
      }
    }
    
    // 如果还是没有，使用默认值
    if (!width || !height) {
      width = 800
      height = 600
    }
    
    return { width, height }
  } catch (error) {
    console.error('获取 SVG 尺寸失败:', error)
    return { width: 800, height: 600 }
  }
}

// 计算适合屏幕的画布尺寸
function calculateCanvasSize(imageWidth, imageHeight) {
  // 如果尺寸无效，使用默认值
  if (!imageWidth || !imageHeight || imageWidth <= 0 || imageHeight <= 0) {
    return {
      width: 800,
      height: 600,
      scale: 1
    }
  }

  // 获取画布容器的尺寸（考虑工具栏等占用的空间）
  const container = fabricCanvasRef.value?.parentElement
  if (!container) {
    // 如果容器不存在，使用默认值
    const maxWidth = window.innerWidth * 0.8
    const maxHeight = window.innerHeight * 0.7
    const scale = Math.min(maxWidth / imageWidth, maxHeight / imageHeight, 1)
    return {
      width: Math.floor(imageWidth * scale),
      height: Math.floor(imageHeight * scale),
      scale: scale
    }
  }

  // 获取容器的可用尺寸（使用整个右侧区域）
  const containerRect = container.getBoundingClientRect()
  const maxWidth = containerRect.width // 使用整个宽度
  const maxHeight = containerRect.height // 使用整个高度

  // 计算缩放比例，确保图片能完整显示
  const scale = Math.min(maxWidth / imageWidth, maxHeight / imageHeight, 1)

  return {
    width: Math.floor(imageWidth * scale),
    height: Math.floor(imageHeight * scale),
    scale: scale
  }
}

// 初始化 Fabric.js 画布（使用整个右侧区域）
function initFabricCanvas(imageWidth, imageHeight) {
  if (!fabricCanvasRef.value) {
    return
  }
  
  try {
    // 如果已存在画布，先销毁
    if (fabricCanvas.value) {
      fabricCanvas.value.dispose()
    }

    // 获取容器尺寸（直接使用整个右侧区域）
    const container = fabricCanvasRef.value.parentElement
    if (!container) {
      console.error('画布容器不存在')
      return
    }

    const containerRect = container.getBoundingClientRect()
    // 留出边距（上下左右各 20px）
    const padding = 40
    const availableWidth = containerRect.width - padding
    const availableHeight = containerRect.height - padding
    let canvasWidth = availableWidth
    let canvasHeight = availableHeight

    // 如果有图片尺寸，计算适合的缩放比例，确保图片完整显示在可用区域内
    if (imageWidth && imageHeight) {
      const scale = Math.min(availableWidth / imageWidth, availableHeight / imageHeight, 1)
      canvasWidth = Math.floor(imageWidth * scale)
      canvasHeight = Math.floor(imageHeight * scale)
    }

    // 使用计算后的尺寸初始化画布（填满整个右侧区域）
    fabricCanvas.value = new fabric.Canvas(fabricCanvasRef.value, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: '#ffffff'
    })

    // 监听对象变化，更新历史记录
    fabricCanvas.value.on('object:modified', saveHistory)
    fabricCanvas.value.on('object:added', saveHistory)
    fabricCanvas.value.on('object:removed', saveHistory)

    // 移除旧的 resize 监听器（如果存在）
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
    }

    // 监听窗口大小变化，重新调整画布尺寸
    resizeHandler = () => {
      if (fabricCanvas.value && container) {
        const newRect = container.getBoundingClientRect()
        const padding = 40
        const availableWidth = newRect.width - padding
        const availableHeight = newRect.height - padding
        const image = fabricCanvas.value.getObjects()[0]
        if (image && originalImageSize.value.width && originalImageSize.value.height) {
          const scale = Math.min(availableWidth / originalImageSize.value.width, availableHeight / originalImageSize.value.height, 1)
          const newWidth = Math.floor(originalImageSize.value.width * scale)
          const newHeight = Math.floor(originalImageSize.value.height * scale)
          fabricCanvas.value.setDimensions({ width: newWidth, height: newHeight })
          fabricCanvas.value.renderAll()
        } else {
          fabricCanvas.value.setDimensions({ width: availableWidth, height: availableHeight })
          fabricCanvas.value.renderAll()
        }
      }
    }

    window.addEventListener('resize', resizeHandler)
  } catch (e) {
    console.error('Fabric.js 初始化失败:', e)
    message.error('画布初始化失败')
  }
}

// 从弹窗选择图片
async function handleImageSelectFromModal(sticker) {
  showSelectModal.value = false
  await handleImageSelect(sticker)
}

// 从贴纸资源选择图片
async function handleImageSelect(sticker) {
  if (!sticker || !sticker.url) {
    message.error('图片信息无效')
    return
  }

  // 显示 loading
  imageLoading.value = true

  // 先设置 selectedImage，触发 DOM 更新显示画布容器
  selectedImage.value = sticker
  // 等待 DOM 更新完成
  await nextTick()
  
  // 确保画布容器已渲染
  if (!fabricCanvasRef.value) {
    // 如果还没有渲染，再等待一下
    let retries = 0
    while (!fabricCanvasRef.value && retries < 20) {
      await new Promise(resolve => setTimeout(resolve, 50))
      retries++
    }
  }

  if (!fabricCanvasRef.value) {
    message.error('画布容器未准备好，请重试')
    return
  }

  // 确保画布已初始化
  if (!fabricCanvas.value) {
    initFabricCanvas()
  }

  // 等待画布初始化完成
  let retries = 0
  while (!fabricCanvas.value && retries < 20) {
    await new Promise(resolve => setTimeout(resolve, 50))
    retries++
  }

  if (!fabricCanvas.value) {
    message.error('画布初始化失败，请重试')
    return
  }

  // 加载图片到 Fabric.js
  return new Promise(async (resolve, reject) => {
    console.log('开始加载图片:', sticker.url)
    console.log('fabric 对象:', fabric)
    console.log('fabric.Image:', fabric.Image)
    
    // 设置超时处理
    const timeout = setTimeout(() => {
      console.error('图片加载超时')
      imageLoading.value = false
      reject(new Error('图片加载超时'))
    }, 30000) // 30秒超时
    
    try {
      // 检查 fabric.Image 是否存在
      if (!fabric || !fabric.Image) {
        console.error('fabric.Image 不存在')
        clearTimeout(timeout)
        imageLoading.value = false
        reject(new Error('Fabric.js Image 类不存在'))
        return
      }
      
      // 尝试使用 Promise 方式（fabric.js v6 可能支持）
      try {
        console.log('尝试使用 Promise 方式加载图片')
        
        // 检查是否是 SVG
        let imageWidth, imageHeight
        if (isSvgUrl(sticker.url)) {
          console.log('检测到 SVG 图片，获取尺寸...')
          const svgDims = await getSvgDimensions(sticker.url)
          imageWidth = svgDims.width
          imageHeight = svgDims.height
          console.log('SVG 尺寸:', imageWidth, imageHeight)
        }
        
        const img = await fabric.Image.fromURL(sticker.url, {
          crossOrigin: 'anonymous'
        })
        
        clearTimeout(timeout)
        console.log('图片加载成功(Promise方式)，开始处理:', img)
        console.log('图片原始尺寸:', img.width, img.height)
        
        // 对于 SVG，使用获取到的尺寸；对于其他图片，使用 fabric 加载后的尺寸
        if (isSvgUrl(sticker.url) && imageWidth && imageHeight) {
          // SVG 使用之前获取的尺寸
          originalImageSize.value = {
            width: imageWidth,
            height: imageHeight
          }
        } else {
          // 普通图片使用 fabric 加载后的尺寸
          originalImageSize.value = {
            width: img.width,
            height: img.height
          }
        }

        // 计算适合屏幕的画布尺寸
        const { width: canvasWidth, height: canvasHeight, scale } = calculateCanvasSize(
          originalImageSize.value.width,
          originalImageSize.value.height
        )
        console.log('画布尺寸:', canvasWidth, canvasHeight, '缩放比例:', scale)

        // 使用计算后的尺寸初始化画布
        initFabricCanvas(originalImageSize.value.width, originalImageSize.value.height)
        
        // 等待画布重新初始化
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (!fabricCanvas.value) {
          reject(new Error('画布重新初始化失败'))
          return
        }

        const canvas = fabricCanvas.value
        
        // 图片需要缩放以适应画布
        img.scale(scale)
        img.set({
          left: 0,
          top: 0,
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
        
        // 隐藏 loading
        imageLoading.value = false
        message.success('图片加载成功')
        resolve()
      } catch (promiseError) {
        console.log('Promise 方式失败，尝试回调方式:', promiseError)
        
        // 如果 Promise 方式失败，尝试回调方式
        // 对于 SVG，先获取尺寸
        let svgDimensions = null
        if (isSvgUrl(sticker.url)) {
          try {
            svgDimensions = await getSvgDimensions(sticker.url)
            console.log('SVG 尺寸:', svgDimensions)
          } catch (svgError) {
            console.warn('获取 SVG 尺寸失败，使用默认值:', svgError)
          }
        }
        
        fabric.Image.fromURL(
          sticker.url,
          (img) => {
            clearTimeout(timeout)
            console.log('图片加载成功(回调方式)，开始处理:', img)
            console.log('图片原始尺寸:', img.width, img.height)
            
            try {
              // 对于 SVG，使用获取到的尺寸；对于其他图片，使用 fabric 加载后的尺寸
              if (isSvgUrl(sticker.url) && svgDimensions && svgDimensions.width && svgDimensions.height) {
                originalImageSize.value = {
                  width: svgDimensions.width,
                  height: svgDimensions.height
                }
              } else {
                originalImageSize.value = {
                  width: img.width,
                  height: img.height
                }
              }

              // 计算适合屏幕的画布尺寸
              const { width: canvasWidth, height: canvasHeight, scale } = calculateCanvasSize(
                originalImageSize.value.width,
                originalImageSize.value.height
              )
              console.log('画布尺寸:', canvasWidth, canvasHeight, '缩放比例:', scale)

              // 使用计算后的尺寸初始化画布
              initFabricCanvas(originalImageSize.value.width, originalImageSize.value.height)
              
              // 等待画布重新初始化
              setTimeout(() => {
                if (!fabricCanvas.value) {
                  reject(new Error('画布重新初始化失败'))
                  return
                }

                const canvas = fabricCanvas.value
                
                // 图片需要缩放以适应画布
                img.scale(scale)
                img.set({
                  left: 0,
                  top: 0,
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
                
                // 隐藏 loading
                imageLoading.value = false
                message.success('图片加载成功')
                resolve()
              }, 100)
            } catch (error) {
              console.error('图片处理失败:', error)
              imageLoading.value = false
              message.error('图片处理失败: ' + error.message)
              reject(error)
            }
          },
          {
            crossOrigin: 'anonymous'
          }
        )
      }
    } catch (error) {
      clearTimeout(timeout)
      imageLoading.value = false
      console.error('图片加载异常:', error)
      message.error('图片加载异常: ' + error.message)
      reject(error)
    }
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
  showSelectModal.value = true
}

// 导出图片
async function handleExport() {
  if (!fabricCanvas.value) {
    message.warning('请先选择图片')
    return
  }

  try {
    // 获取画布上的所有对象
    const objects = fabricCanvas.value.getObjects()
    if (objects.length === 0) {
      message.warning('画布上没有图片')
      return
    }

    // 获取所有对象的精确边界框（考虑旋转、缩放等变换）
    // 只计算画布内可见的部分，不包含画布外的区域
    const canvas = fabricCanvas.value
    const boundingBox = fabricCanvas.value.getObjects().reduce((bounds, obj) => {
      // 使用 getBoundingRect 获取变换后的边界框
      const objBounds = obj.getBoundingRect()
      
      // 只计算画布内可见的部分
      const visibleLeft = Math.max(0, objBounds.left)
      const visibleTop = Math.max(0, objBounds.top)
      const visibleRight = Math.min(canvas.width, objBounds.left + objBounds.width)
      const visibleBottom = Math.min(canvas.height, objBounds.top + objBounds.height)
      
      // 只计算可见区域的边界
      if (visibleRight > visibleLeft && visibleBottom > visibleTop) {
        return {
          minX: Math.min(bounds.minX, visibleLeft),
          minY: Math.min(bounds.minY, visibleTop),
          maxX: Math.max(bounds.maxX, visibleRight),
          maxY: Math.max(bounds.maxY, visibleBottom)
        }
      }
      
      return bounds
    }, {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    })

    // 如果边界框无效，使用整个画布
    if (boundingBox.minX === Infinity) {
      boundingBox.minX = 0
      boundingBox.minY = 0
      boundingBox.maxX = canvas.width
      boundingBox.maxY = canvas.height
    }

    // 计算图片的实际内容尺寸（不包含任何边距，只包含画布内可见部分）
    const contentWidth = Math.ceil(boundingBox.maxX - boundingBox.minX)
    const contentHeight = Math.ceil(boundingBox.maxY - boundingBox.minY)

    if (contentWidth <= 0 || contentHeight <= 0) {
      message.warning('图片尺寸无效')
      return
    }

    // 获取第一个对象（图片）
    const firstObject = objects[0]
    
    // 使用保存的原始图片尺寸
    const originalWidth = originalImageSize.value.width || firstObject.width
    const originalHeight = originalImageSize.value.height || firstObject.height

    // 计算当前显示尺寸（考虑缩放）
    const currentDisplayWidth = firstObject.width * firstObject.scaleX
    const currentDisplayHeight = firstObject.height * firstObject.scaleY

    // 计算缩放比例：使用原始尺寸和当前显示尺寸的比值来计算 multiplier
    // 这样可以保持原始分辨率，不会失真
    const scaleRatio = Math.max(1, Math.min(originalWidth / currentDisplayWidth, originalHeight / currentDisplayHeight))

    // 导出尺寸 = 内容尺寸 * 缩放比例（保持高分辨率）
    const exportWidth = Math.ceil(contentWidth * scaleRatio)
    const exportHeight = Math.ceil(contentHeight * scaleRatio)

    console.log('导出信息:', {
      contentWidth,
      contentHeight,
      exportWidth,
      exportHeight,
      scaleRatio,
      originalWidth,
      originalHeight,
      currentDisplayWidth,
      currentDisplayHeight
    })

    // 使用高分辨率导出整个画布
    const canvasDataURL = fabricCanvas.value.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: scaleRatio
    })

    // 创建临时画布，只包含图片内容，不添加任何边距
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = exportWidth
    tempCanvas.height = exportHeight
    const tempCtx = tempCanvas.getContext('2d')

    // 加载画布图片
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = () => {
        // 计算裁剪区域（考虑 multiplier）
        const sourceX = Math.floor(boundingBox.minX * scaleRatio)
        const sourceY = Math.floor(boundingBox.minY * scaleRatio)
        const sourceWidth = Math.ceil(contentWidth * scaleRatio)
        const sourceHeight = Math.ceil(contentHeight * scaleRatio)

        // 直接裁剪绘制，不添加任何背景色或边距
        tempCtx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, exportWidth, exportHeight
        )
        resolve()
      }
      img.onerror = reject
      img.src = canvasDataURL
    })

    // 导出裁剪后的图片（只包含实际内容，无空白）
    const finalDataURL = tempCanvas.toDataURL('image/png', 1)
    const blob = await fetch(finalDataURL).then(res => res.blob())
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

// 执行上传（使用与导出相同的逻辑）
async function doUpload() {
  if (!fabricCanvas.value) {
    message.error('画布未初始化，无法上传')
    return
  }
  
  submitLoading.value = true

  try {
    // 获取画布上的所有对象
    const objects = fabricCanvas.value.getObjects()
    if (objects.length === 0) {
      message.error('画布上没有图片，无法上传')
      submitLoading.value = false
      return
    }

    // 获取所有对象的精确边界框（只计算画布内可见的部分）
    const canvas = fabricCanvas.value
    const boundingBox = fabricCanvas.value.getObjects().reduce((bounds, obj) => {
      const objBounds = obj.getBoundingRect()
      
      // 只计算画布内可见的部分
      const visibleLeft = Math.max(0, objBounds.left)
      const visibleTop = Math.max(0, objBounds.top)
      const visibleRight = Math.min(canvas.width, objBounds.left + objBounds.width)
      const visibleBottom = Math.min(canvas.height, objBounds.top + objBounds.height)
      
      // 只计算可见区域的边界
      if (visibleRight > visibleLeft && visibleBottom > visibleTop) {
        return {
          minX: Math.min(bounds.minX, visibleLeft),
          minY: Math.min(bounds.minY, visibleTop),
          maxX: Math.max(bounds.maxX, visibleRight),
          maxY: Math.max(bounds.maxY, visibleBottom)
        }
      }
      
      return bounds
    }, {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    })

    // 如果边界框无效，使用整个画布
    if (boundingBox.minX === Infinity) {
      boundingBox.minX = 0
      boundingBox.minY = 0
      boundingBox.maxX = canvas.width
      boundingBox.maxY = canvas.height
    }

    // 计算图片的实际内容尺寸（不包含任何边距，只包含画布内可见部分）
    const contentWidth = Math.ceil(boundingBox.maxX - boundingBox.minX)
    const contentHeight = Math.ceil(boundingBox.maxY - boundingBox.minY)

    if (contentWidth <= 0 || contentHeight <= 0) {
      message.error('图片尺寸无效，无法上传')
      submitLoading.value = false
      return
    }

    // 获取第一个对象（图片）
    const firstObject = objects[0]
    
    // 使用保存的原始图片尺寸
    const originalWidth = originalImageSize.value.width || firstObject.width
    const originalHeight = originalImageSize.value.height || firstObject.height

    // 计算当前显示尺寸（考虑缩放）
    const currentDisplayWidth = firstObject.width * firstObject.scaleX
    const currentDisplayHeight = firstObject.height * firstObject.scaleY

    // 计算缩放比例：使用原始尺寸和当前显示尺寸的比值来计算 multiplier
    const scaleRatio = Math.max(1, Math.min(originalWidth / currentDisplayWidth, originalHeight / currentDisplayHeight))

    // 导出尺寸 = 内容尺寸 * 缩放比例（保持高分辨率）
    const exportWidth = Math.ceil(contentWidth * scaleRatio)
    const exportHeight = Math.ceil(contentHeight * scaleRatio)

    // 使用高分辨率导出整个画布
    const canvasDataURL = fabricCanvas.value.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: scaleRatio
    })

    // 创建临时画布，只包含图片内容，不添加任何边距
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = exportWidth
    tempCanvas.height = exportHeight
    const tempCtx = tempCanvas.getContext('2d')

    // 加载画布图片
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          // 计算裁剪区域（考虑 multiplier）
          const sourceX = Math.floor(boundingBox.minX * scaleRatio)
          const sourceY = Math.floor(boundingBox.minY * scaleRatio)
          const sourceWidth = Math.ceil(contentWidth * scaleRatio)
          const sourceHeight = Math.ceil(contentHeight * scaleRatio)

          // 直接裁剪绘制，不添加任何背景色或边距
          tempCtx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, exportWidth, exportHeight
          )
          resolve()
        } catch (err) {
          reject(new Error('图片处理失败: ' + (err.message || err)))
        }
      }
      img.onerror = (err) => {
        reject(new Error('图片加载失败，无法上传'))
      }
      img.src = canvasDataURL
    })

    // 导出裁剪后的图片（只包含实际内容，无空白）
    const finalDataURL = tempCanvas.toDataURL('image/png', 1)
    const blob = await fetch(finalDataURL).then(res => res.blob())
    const file = new File([blob], 'edited-image.png', { type: 'image/png' })

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
  nextTick(() => {
    initFabricCanvas()
  })
})

onUnmounted(() => {
  // 移除 resize 监听器
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
  
  // 销毁画布
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

:deep(.select-image-modal) {
  .ant-modal {
    top: 50%;
    transform: translateY(-50%);
    margin: 0 auto;
    padding-bottom: 0;
  }
  
  .ant-modal-body {
    display: flex;
    flex-direction: column;
    padding: 16px;
    max-height: calc(100vh - 200px);
    overflow: hidden;
  }
}

.select-modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  
  .select-modal-tip {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: #666;
    flex-shrink: 0;
  }
  
  .sticker-list-container {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
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
  flex-direction: row;
  overflow: hidden;
}

.editor-sidebar {
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

.editor-canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  width: 100%;
  height: 100%;
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
  width: 100%;
  height: 100%;
  position: relative;
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

.fabric-canvas {
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #fff;
  display: block;
  max-width: 100%;
  max-height: 100%;
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

