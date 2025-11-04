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
              <div class="section-title">图片操作</div>
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
              <div class="tool-item" @click="handleZoomIn" :class="{ disabled: !fabricCanvas }">
                <div class="tool-icon">🔍+</div>
                <span class="tool-label">放大</span>
              </div>
              <div class="tool-item" @click="handleZoomOut" :class="{ disabled: !fabricCanvas }">
                <div class="tool-icon">🔍-</div>
                <span class="tool-label">缩小</span>
              </div>
              <div class="tool-item" @click="handleFitToCanvas" :class="{ disabled: !fabricCanvas }">
                <div class="tool-icon">📐</div>
                <span class="tool-label">适应画布</span>
              </div>
            </div>

            <div class="sidebar-divider"></div>

            <div class="sidebar-section">
              <div class="section-title">添加元素</div>
              <div class="tool-item" @click="handleAddText" :class="{ disabled: !fabricCanvas }">
                <div class="tool-icon">📝</div>
                <span class="tool-label">添加文字</span>
              </div>
              <div class="tool-item" @click="handleAddRect" :class="{ disabled: !fabricCanvas }">
                <div class="tool-icon">▭</div>
                <span class="tool-label">矩形</span>
              </div>
              <div class="tool-item" @click="handleAddCircle" :class="{ disabled: !fabricCanvas }">
                <div class="tool-icon">⭕</div>
                <span class="tool-label">圆形</span>
              </div>
              <div class="tool-item" @click="handleAddLine" :class="{ disabled: !fabricCanvas }">
                <div class="tool-icon">─</div>
                <span class="tool-label">线条</span>
              </div>
              <div class="tool-item" @click="handleAddArrow" :class="{ disabled: !fabricCanvas }">
                <div class="tool-icon">➜</div>
                <span class="tool-label">箭头</span>
              </div>
              <div class="tool-item" @click="handleToggleDraw" :class="{ disabled: !fabricCanvas, active: isDrawingMode }">
                <div class="tool-icon">✏️</div>
                <span class="tool-label">画笔</span>
              </div>
            </div>

            <div class="sidebar-divider"></div>

            <div class="sidebar-section">
              <div class="section-title">滤镜效果</div>
              <div class="tool-item" @click="handleBrightness" :class="{ disabled: !fabricCanvas }">
                <div class="tool-icon">☀️</div>
                <span class="tool-label">亮度</span>
              </div>
              <div class="tool-item" @click="handleContrast" :class="{ disabled: !fabricCanvas }">
                <div class="tool-icon">⚡</div>
                <span class="tool-label">对比度</span>
              </div>
              <div class="tool-item" @click="handleSaturation" :class="{ disabled: !fabricCanvas }">
                <div class="tool-icon">🎨</div>
                <span class="tool-label">饱和度</span>
              </div>
              <div class="tool-item" @click="handleGrayscale" :class="{ disabled: !fabricCanvas }">
                <div class="tool-icon">⚫</div>
                <span class="tool-label">灰度</span>
              </div>
              <div class="tool-item" @click="handleBlur" :class="{ disabled: !fabricCanvas }">
                <div class="tool-icon">💫</div>
                <span class="tool-label">模糊</span>
              </div>
            </div>

            <div class="sidebar-divider"></div>

            <div class="sidebar-section">
              <div class="section-title">对象操作</div>
              <div class="tool-item" @click="handleDeleteObject" :class="{ disabled: !hasActiveObject }">
                <div class="tool-icon">🗑️</div>
                <span class="tool-label">删除</span>
              </div>
              <div class="tool-item" @click="handleCopyObject" :class="{ disabled: !hasActiveObject }">
                <div class="tool-icon">📋</div>
                <span class="tool-label">复制</span>
              </div>
              <div class="tool-item" @click="handlePasteObject" :class="{ disabled: !copiedObject }">
                <div class="tool-icon">📄</div>
                <span class="tool-label">粘贴</span>
              </div>
              <div class="tool-item" @click="handleBringToFront" :class="{ disabled: !hasActiveObject }">
                <div class="tool-icon">⬆️</div>
                <span class="tool-label">置顶</span>
              </div>
              <div class="tool-item" @click="handleSendToBack" :class="{ disabled: !hasActiveObject }">
                <div class="tool-icon">⬇️</div>
                <span class="tool-label">置底</span>
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
const isDrawingMode = ref(false)
const hasActiveObject = ref(false)
const copiedObject = ref(null)

// 窗口 resize 监听器
let resizeHandler = null
let resizeTimer = null

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
    
    // 监听对象选中状态变化
    fabricCanvas.value.on('selection:created', () => {
      hasActiveObject.value = true
    })
    fabricCanvas.value.on('selection:updated', () => {
      hasActiveObject.value = true
    })
    fabricCanvas.value.on('selection:cleared', () => {
      hasActiveObject.value = false
    })
    fabricCanvas.value.on('object:selected', () => {
      hasActiveObject.value = true
    })
    fabricCanvas.value.on('object:deselected', () => {
      hasActiveObject.value = false
    })

    // 移除旧的 resize 监听器（如果存在）
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
    }

    // 监听窗口大小变化，自动重置画布和图片
    resizeHandler = () => {
      if (fabricCanvas.value && container && selectedImage.value) {
        // 清除之前的定时器，使用防抖避免频繁触发
        if (resizeTimer) {
          clearTimeout(resizeTimer)
        }
        
        // 延迟执行，确保屏幕变化完全结束后再触发重置
        // 延时触发，保证在屏幕尺寸变化稳定后再执行重置
        resizeTimer = setTimeout(() => {
          // 确保在屏幕变化完成后才执行重置
          // 和点击重置按钮效果完全一样
          if (fabricCanvas.value && selectedImage.value) {
            handleReset()
          }
          resizeTimer = null
        }, 500) // 500ms 延时，确保屏幕变化完全结束
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

// ========== 缩放操作 ==========
// 放大
function handleZoomIn() {
  if (!fabricCanvas.value) return
  const activeObject = fabricCanvas.value.getActiveObject()
  if (activeObject) {
    const scale = (activeObject.scaleX || 1) * 1.1
    activeObject.set({
      scaleX: scale,
      scaleY: scale
    })
    fabricCanvas.value.renderAll()
    saveHistory()
  } else {
    message.info('请先选择要放大的对象')
  }
}

// 缩小
function handleZoomOut() {
  if (!fabricCanvas.value) return
  const activeObject = fabricCanvas.value.getActiveObject()
  if (activeObject) {
    const scale = (activeObject.scaleX || 1) * 0.9
    activeObject.set({
      scaleX: scale,
      scaleY: scale
    })
    fabricCanvas.value.renderAll()
    saveHistory()
  } else {
    message.info('请先选择要缩小的对象')
  }
}

// 适应画布
function handleFitToCanvas() {
  if (!fabricCanvas.value) return
  const objects = fabricCanvas.value.getObjects()
  if (objects.length === 0) {
    message.info('画布上没有对象')
    return
  }
  
  const image = objects[0]
  if (image && originalImageSize.value.width && originalImageSize.value.height) {
    const canvasWidth = fabricCanvas.value.width
    const canvasHeight = fabricCanvas.value.height
    const scale = Math.min(canvasWidth / originalImageSize.value.width, canvasHeight / originalImageSize.value.height, 1)
    
    image.set({
      scaleX: scale / (image.width / originalImageSize.value.width),
      scaleY: scale / (image.height / originalImageSize.value.height),
      left: canvasWidth / 2,
      top: canvasHeight / 2,
      originX: 'center',
      originY: 'center'
    })
    fabricCanvas.value.renderAll()
    saveHistory()
  }
}

// ========== 添加元素 ==========
// 添加文字
function handleAddText() {
  if (!fabricCanvas.value) return
  
  const text = new fabric.Textbox('双击编辑文字', {
    left: fabricCanvas.value.width / 2,
    top: fabricCanvas.value.height / 2,
    width: 200,
    fontSize: 20,
    fontFamily: 'Arial',
    fill: '#000000',
    textAlign: 'center',
    originX: 'center',
    originY: 'center'
  })
  
  fabricCanvas.value.add(text)
  fabricCanvas.value.setActiveObject(text)
  fabricCanvas.value.renderAll()
  saveHistory()
  message.success('已添加文字，双击可编辑')
}

// 添加矩形
function handleAddRect() {
  if (!fabricCanvas.value) return
  
  const rect = new fabric.Rect({
    left: fabricCanvas.value.width / 2,
    top: fabricCanvas.value.height / 2,
    width: 100,
    height: 100,
    fill: '#ff0000',
    stroke: '#000000',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center'
  })
  
  fabricCanvas.value.add(rect)
  fabricCanvas.value.setActiveObject(rect)
  fabricCanvas.value.renderAll()
  saveHistory()
}

// 添加圆形
function handleAddCircle() {
  if (!fabricCanvas.value) return
  
  const circle = new fabric.Circle({
    left: fabricCanvas.value.width / 2,
    top: fabricCanvas.value.height / 2,
    radius: 50,
    fill: '#00ff00',
    stroke: '#000000',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center'
  })
  
  fabricCanvas.value.add(circle)
  fabricCanvas.value.setActiveObject(circle)
  fabricCanvas.value.renderAll()
  saveHistory()
}

// 添加线条
function handleAddLine() {
  if (!fabricCanvas.value) return
  
  const line = new fabric.Line([50, 50, 150, 150], {
    left: fabricCanvas.value.width / 2 - 100,
    top: fabricCanvas.value.height / 2 - 100,
    stroke: '#0000ff',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center'
  })
  
  fabricCanvas.value.add(line)
  fabricCanvas.value.setActiveObject(line)
  fabricCanvas.value.renderAll()
  saveHistory()
}

// 添加箭头
function handleAddArrow() {
  if (!fabricCanvas.value) return
  
  const arrow = new fabric.Path('M 0 0 L 100 0 L 90 -10 M 100 0 L 90 10', {
    left: fabricCanvas.value.width / 2,
    top: fabricCanvas.value.height / 2,
    fill: '',
    stroke: '#ff6600',
    strokeWidth: 3,
    originX: 'center',
    originY: 'center'
  })
  
  fabricCanvas.value.add(arrow)
  fabricCanvas.value.setActiveObject(arrow)
  fabricCanvas.value.renderAll()
  saveHistory()
}

// 切换画笔模式
function handleToggleDraw() {
  if (!fabricCanvas.value) return
  
  isDrawingMode.value = !isDrawingMode.value
  fabricCanvas.value.isDrawingMode = isDrawingMode.value
  
  if (isDrawingMode.value) {
    fabricCanvas.value.freeDrawingBrush.width = 5
    fabricCanvas.value.freeDrawingBrush.color = '#000000'
    message.info('画笔模式已开启，在画布上绘制即可')
  } else {
    message.info('画笔模式已关闭')
  }
  
  fabricCanvas.value.renderAll()
}

// ========== 滤镜效果 ==========
// 亮度调整
function handleBrightness() {
  if (!fabricCanvas.value) return
  
  const activeObject = fabricCanvas.value.getActiveObject()
  if (!activeObject || activeObject.type !== 'image') {
    message.warning('请先选择图片对象')
    return
  }
  
  const brightness = prompt('请输入亮度值 (-100 到 100):', '10')
  if (brightness === null) return
  
  const value = parseInt(brightness)
  if (isNaN(value) || value < -100 || value > 100) {
    message.error('亮度值必须在 -100 到 100 之间')
    return
  }
  
  activeObject.filters.push(new fabric.filters.Brightness({ brightness: value / 100 }))
  activeObject.applyFilters()
  fabricCanvas.value.renderAll()
  saveHistory()
}

// 对比度调整
function handleContrast() {
  if (!fabricCanvas.value) return
  
  const activeObject = fabricCanvas.value.getActiveObject()
  if (!activeObject || activeObject.type !== 'image') {
    message.warning('请先选择图片对象')
    return
  }
  
  const contrast = prompt('请输入对比度值 (-100 到 100):', '10')
  if (contrast === null) return
  
  const value = parseInt(contrast)
  if (isNaN(value) || value < -100 || value > 100) {
    message.error('对比度值必须在 -100 到 100 之间')
    return
  }
  
  activeObject.filters.push(new fabric.filters.Contrast({ contrast: value / 100 }))
  activeObject.applyFilters()
  fabricCanvas.value.renderAll()
  saveHistory()
}

// 饱和度调整
function handleSaturation() {
  if (!fabricCanvas.value) return
  
  const activeObject = fabricCanvas.value.getActiveObject()
  if (!activeObject || activeObject.type !== 'image') {
    message.warning('请先选择图片对象')
    return
  }
  
  const saturation = prompt('请输入饱和度值 (-100 到 100):', '10')
  if (saturation === null) return
  
  const value = parseInt(saturation)
  if (isNaN(value) || value < -100 || value > 100) {
    message.error('饱和度值必须在 -100 到 100 之间')
    return
  }
  
  activeObject.filters.push(new fabric.filters.Saturation({ saturation: value / 100 }))
  activeObject.applyFilters()
  fabricCanvas.value.renderAll()
  saveHistory()
}

// 灰度效果
function handleGrayscale() {
  if (!fabricCanvas.value) return
  
  const activeObject = fabricCanvas.value.getActiveObject()
  if (!activeObject || activeObject.type !== 'image') {
    message.warning('请先选择图片对象')
    return
  }
  
  activeObject.filters.push(new fabric.filters.Grayscale())
  activeObject.applyFilters()
  fabricCanvas.value.renderAll()
  saveHistory()
  message.success('已应用灰度效果')
}

// 模糊效果
function handleBlur() {
  if (!fabricCanvas.value) return
  
  const activeObject = fabricCanvas.value.getActiveObject()
  if (!activeObject || activeObject.type !== 'image') {
    message.warning('请先选择图片对象')
    return
  }
  
  const blur = prompt('请输入模糊值 (0 到 10):', '1')
  if (blur === null) return
  
  const value = parseFloat(blur)
  if (isNaN(value) || value < 0 || value > 10) {
    message.error('模糊值必须在 0 到 10 之间')
    return
  }
  
  activeObject.filters.push(new fabric.filters.Blur({ blur: value }))
  activeObject.applyFilters()
  fabricCanvas.value.renderAll()
  saveHistory()
}

// ========== 对象操作 ==========
// 删除对象
function handleDeleteObject() {
  if (!fabricCanvas.value) return
  
  const activeObject = fabricCanvas.value.getActiveObject()
  if (activeObject) {
    fabricCanvas.value.remove(activeObject)
    fabricCanvas.value.renderAll()
    saveHistory()
    hasActiveObject.value = false
  }
}

// 复制对象
function handleCopyObject() {
  if (!fabricCanvas.value) return
  
  const activeObject = fabricCanvas.value.getActiveObject()
  if (activeObject) {
    activeObject.clone((cloned) => {
      copiedObject.value = cloned
      message.success('已复制对象')
    })
  }
}

// 粘贴对象
function handlePasteObject() {
  if (!fabricCanvas.value || !copiedObject.value) return
  
  copiedObject.value.clone((cloned) => {
    cloned.set({
      left: cloned.left + 20,
      top: cloned.top + 20
    })
    fabricCanvas.value.add(cloned)
    fabricCanvas.value.setActiveObject(cloned)
    fabricCanvas.value.renderAll()
    saveHistory()
    message.success('已粘贴对象')
  })
}

// 置顶
function handleBringToFront() {
  if (!fabricCanvas.value) return
  
  const activeObject = fabricCanvas.value.getActiveObject()
  if (activeObject) {
    fabricCanvas.value.bringToFront(activeObject)
    fabricCanvas.value.renderAll()
    saveHistory()
  }
}

// 置底
function handleSendToBack() {
  if (!fabricCanvas.value) return
  
  const activeObject = fabricCanvas.value.getActiveObject()
  if (activeObject) {
    fabricCanvas.value.sendToBack(activeObject)
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
  
  // 添加键盘快捷键支持
  const handleKeyDown = (e) => {
    // Delete 或 Backspace 删除对象
    if ((e.key === 'Delete' || e.key === 'Backspace') && hasActiveObject.value && fabricCanvas.value) {
      e.preventDefault()
      handleDeleteObject()
    }
    
    // Ctrl/Cmd + C 复制
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && hasActiveObject.value && fabricCanvas.value) {
      e.preventDefault()
      handleCopyObject()
    }
    
    // Ctrl/Cmd + V 粘贴
    if ((e.ctrlKey || e.metaKey) && e.key === 'v' && copiedObject.value && fabricCanvas.value) {
      e.preventDefault()
      handlePasteObject()
    }
    
    // Ctrl/Cmd + Z 撤销
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && canUndo.value && fabricCanvas.value) {
      e.preventDefault()
      handleUndo()
    }
    
    // Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y 重做
    if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
        ((e.ctrlKey || e.metaKey) && e.key === 'y' && canRedo.value && fabricCanvas.value)) {
      e.preventDefault()
      handleRedo()
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  
  // 保存键盘监听器引用以便卸载时移除
  const keydownHandlerRef = handleKeyDown
  
  onUnmounted(() => {
    window.removeEventListener('keydown', keydownHandlerRef)
  })
})

onUnmounted(() => {
  // 移除 resize 监听器
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
  
  // 清除 resize 定时器
  if (resizeTimer) {
    clearTimeout(resizeTimer)
    resizeTimer = null
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
  
  &.active {
    background: #e8e8ff;
    
    .tool-icon,
    .tool-label {
      color: #6900ff;
    }
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

