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
          <!-- Fabric.js 画布容器 -->
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

    <!-- 选择图片弹窗 -->
    <a-modal
      v-model:open="showSelectModal"
      title="选择图片"
      width="1200px"
      :footer="null"
      :z-index="10001"
      :centered="true"
      :body-style="{ padding: '16px', maxHeight: 'calc(100vh - 200px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }"
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
import { Picture, Loading } from '@element-plus/icons-vue'
import { message } from 'ant-design-vue'
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

// 历史记录
const history = ref([])
const historyIndex = ref(-1)

const uploadForm = ref({
  name: '',
  description: '',
  keywords: [],
  autoTrim: true
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

  // 获取容器的可用尺寸
  const containerRect = container.getBoundingClientRect()
  const maxWidth = containerRect.width - 40 // 留一些边距
  const maxHeight = containerRect.height - 100 // 考虑工具栏等占用的空间

  // 计算缩放比例，确保图片能完整显示
  const scale = Math.min(maxWidth / imageWidth, maxHeight / imageHeight, 1)

  return {
    width: Math.floor(imageWidth * scale),
    height: Math.floor(imageHeight * scale),
    scale: scale
  }
}

// 初始化 Fabric.js 画布（根据屏幕尺寸自适应）
function initFabricCanvas(imageWidth, imageHeight) {
  if (!fabricCanvasRef.value) {
    return
  }
  
  try {
    // 如果已存在画布，先销毁
    if (fabricCanvas.value) {
      fabricCanvas.value.dispose()
    }

    // 计算适合屏幕的画布尺寸
    const { width, height } = calculateCanvasSize(imageWidth, imageHeight)

    // 使用计算后的尺寸初始化画布
    fabricCanvas.value = new fabric.Canvas(fabricCanvasRef.value, {
      width: width,
      height: height,
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

onMounted(() => {
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

