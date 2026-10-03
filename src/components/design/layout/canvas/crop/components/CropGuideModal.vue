<template>
  <teleport to="body">
    <div
      v-if="showCropGuideModal"
      class="crop-guide-overlay"
      @click.self="showCropGuideModal = false"
    >
      <!-- 关闭按钮 -->
      <button class="crop-guide-overlay__close" @click="showCropGuideModal = false">
        <X class="w-5 h-5" />
      </button>

      <!-- 主体 -->
      <div class="crop-guide-fullscreen">
        <!-- 左侧：画布预览 -->
        <div class="crop-guide-fullscreen__preview">
          <div class="crop-guide-fullscreen__preview-header">
            <span class="crop-guide-fullscreen__preview-title">画布预览</span>
            <div class="crop-guide-fullscreen__canvas-size">
              <Input
                type="number"
                :model-value="canvasWidthInput"
                :min="100"
                :max="10000"
                :step="100"
                class="h-6 text-[11px] w-24"
                @update:model-value="v => { canvasWidthInput = Number(v); onCanvasSizeChange(); }"
              />
              <span class="crop-guide-fullscreen__canvas-x">×</span>
              <Input
                type="number"
                :model-value="canvasHeightInput"
                :min="100"
                :max="10000"
                :step="100"
                class="h-6 text-[11px] w-24"
                @update:model-value="v => { canvasHeightInput = Number(v); onCanvasSizeChange(); }"
              />
              <span class="crop-guide-fullscreen__canvas-unit">px</span>
            </div>
          </div>
          <div class="crop-guide-fullscreen__preview-canvas">
            <div class="crop-guide-fullscreen__canvas-area" :style="canvasAreaStyle">
              <!-- 安全区 -->
              <div
                v-if="showSafeZone && safeZone.valid"
                class="crop-guide-fullscreen__safezone"
                :style="safeZoneStyle"
              >
                <span class="crop-guide-fullscreen__safezone-label">
                  安全区 {{ safeZoneSize }}
                </span>
              </div>
              <!-- 裁切框 -->
              <div
                v-for="(item, idx) in activeCropRegions"
                :key="idx"
                class="crop-guide-fullscreen__crop-frame"
                :class="{ 'is-highlighted': highlightedPresetId === item.preset.id }"
                :style="getCropFrameStyle(item)"
                @click="toggleGuideHighlight(item.preset.id)"
              >
                <span
                  class="crop-guide-fullscreen__crop-label"
                  :style="{ backgroundColor: item.guide.color }"
                >
                  {{ item.preset.name }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：设置面板 -->
        <div class="crop-guide-fullscreen__panel">
          <div class="crop-guide-fullscreen__panel-header">
            <Button size="sm" variant="default" @click="showCropGuideModal = false">
              完成
            </Button>
            <span class="crop-guide-fullscreen__panel-title">裁剪参考线设置</span>
          </div>

          <div class="crop-guide-fullscreen__panel-body">
            <!-- 开关 -->
            <div class="crop-guide-modal__toggles">
              <div class="crop-guide-modal__toggle-row">
                <Switch v-model:checked="showCropGuides" />
                <span class="crop-guide-modal__toggle-label">显示裁切框</span>
              </div>
              <div class="crop-guide-modal__toggle-row">
                <Switch v-model:checked="showSafeZone" />
                <span class="crop-guide-modal__toggle-label">显示安全区域</span>
              </div>
              <div class="crop-guide-modal__toggle-row">
                <Switch v-model:checked="showCropLabels" />
                <span class="crop-guide-modal__toggle-label">显示标签</span>
              </div>
            </div>

            <Separator class="my-3" />

            <!-- 当前参考线列表 -->
            <div class="crop-guide-modal__section">
              <div class="crop-guide-modal__section-title">
                当前参考线
                <Badge
                  v-if="cropGuides.length > 0"
                  variant="secondary"
                  style="margin-left: 8px"
                >
                  {{ cropGuides.length }}
                </Badge>
              </div>
              <div v-if="cropGuides.length === 0" class="crop-guide-modal__empty">
                暂无参考线，请从下方添加。添加多个比例后会自动计算安全区域。
              </div>
              <div v-else class="crop-guide-modal__list">
                <CropPresetItem
                  v-for="guide in cropGuides"
                  :key="guide.presetId"
                  :guide="guide"
                  :preset="getPreset(guide.presetId)"
                  @toggle-visibility="toggleGuideVisibility(guide.presetId)"
                  @toggle-highlight="toggleGuideHighlight(guide.presetId)"
                  @remove="removeCropGuide(guide.presetId)"
                  @color-change="(c) => setGuideColor(guide.presetId, c)"
                />
              </div>
            </div>

            <Separator class="my-3" />

            <!-- 安全区域信息 -->
            <div v-if="showSafeZone" class="crop-guide-modal__section">
              <div class="crop-guide-modal__section-title">安全区域</div>
              <div v-if="safeZone.valid" class="crop-guide-modal__safezone-info">
                <div class="crop-guide-modal__safezone-row">
                  <span class="crop-guide-modal__safezone-label">安全区域尺寸</span>
                  <span class="crop-guide-modal__safezone-value">{{ safeZoneSize }}</span>
                </div>
                <div class="crop-guide-modal__safezone-row">
                  <span class="crop-guide-modal__safezone-label">占画布比例</span>
                  <span class="crop-guide-modal__safezone-value">{{ safeZonePercent }}</span>
                </div>
                <div
                  v-if="hasPixelConstraints && currentMixedSafeZone"
                  class="crop-guide-modal__safezone-row"
                >
                  <span class="crop-guide-modal__safezone-label">像素安全区</span>
                  <span class="crop-guide-modal__safezone-value">
                    {{ currentMixedSafeZone.width.toFixed(0) }}×{{
                      currentMixedSafeZone.height.toFixed(0)
                    }}px
                  </span>
                </div>
                <div class="crop-guide-modal__safezone-hint">
                  <Info class="w-3.5 h-3.5 shrink-0" />
                  <span v-if="hasPixelConstraints">
                    安全区域同时满足比例和像素约束，主要内容应放在该区域内以确保所有尺寸下都完整显示。
                  </span>
                  <span v-else>
                    安全区域是所有参考线都能完整显示的核心区域，设计的主要内容应放在这个区域内。
                  </span>
                </div>
              </div>
              <div
                v-else-if="cropGuides.filter(g => g.visible).length > 1"
                class="crop-guide-modal__safezone-warn"
              >
                <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
                <span v-if="pixelConstraintFulfilled === false">
                  当前画布尺寸不满足像素约束要求，请增大画布尺寸。
                </span>
                <span v-else>
                  当前参考线无共同安全区域，请调整比例或减少参考线数量。
                </span>
              </div>
              <div
                v-else-if="cropGuides.filter(g => g.visible).length <= 1"
                class="crop-guide-modal__safezone-hint"
              >
                <Info class="w-3.5 h-3.5 shrink-0" />
                需要至少两个可见的参考线才能计算安全区域。
              </div>
            </div>

            <!-- 最优比例推荐（几何平均数算法） -->
            <div
              v-if="optimalLayout"
              class="crop-guide-modal__section"
            >
              <div class="crop-guide-modal__section-title">最优画布比例</div>
              <div class="crop-guide-modal__optimal">
                <div class="crop-guide-modal__optimal-header">
                  <div class="crop-guide-modal__optimal-ratio">{{ optimalRatioText }}</div>
                  <div v-if="isUsingOptimalRatio" class="crop-guide-modal__optimal-badge">
                    当前
                  </div>
                </div>

                <!-- 安全区详情 -->
                <div class="crop-guide-modal__safearea-grid">
                  <div class="crop-guide-modal__safearea-item">
                    <span class="crop-guide-modal__safearea-label">安全区覆盖率</span>
                    <span class="crop-guide-modal__safearea-value highlight">
                      {{ (safeAreaCoverage * 100).toFixed(1) }}%
                    </span>
                  </div>
                  <div class="crop-guide-modal__safearea-item">
                    <span class="crop-guide-modal__safearea-label">安全区比例</span>
                    <span class="crop-guide-modal__safearea-value">
                      {{ safeAreaAspect ? safeAreaAspect.toFixed(4) : '' }}
                    </span>
                  </div>
                </div>

                <!-- 归一化坐标 -->
                <div class="crop-guide-modal__norm-coords">
                  <div class="crop-guide-modal__norm-title">安全区归一化坐标</div>
                  <div class="crop-guide-modal__norm-values">
                    <span>x: {{ safeAreaNormalized.x.toFixed(4) }}</span>
                    <span>y: {{ safeAreaNormalized.y.toFixed(4) }}</span>
                    <span>w: {{ safeAreaNormalized.width.toFixed(4) }}</span>
                    <span>h: {{ safeAreaNormalized.height.toFixed(4) }}</span>
                  </div>
                </div>

                <!-- 当前 vs 最优对比 -->
                <div class="crop-guide-modal__optimal-stats" v-if="currentSafeAreaRatio">
                  <div class="crop-guide-modal__optimal-stat">
                    <span class="crop-guide-modal__optimal-label">当前安全区</span>
                    <span class="crop-guide-modal__optimal-value">
                      {{ (currentSafeAreaRatio * 100).toFixed(1) }}%
                    </span>
                  </div>
                  <ChevronRight class="crop-guide-modal__optimal-arrow" />
                  <div class="crop-guide-modal__optimal-stat">
                    <span class="crop-guide-modal__optimal-label">最优安全区</span>
                    <span class="crop-guide-modal__optimal-value optimal">
                      {{ (safeAreaCoverage * 100).toFixed(1) }}%
                    </span>
                  </div>
                </div>

                <Button
                  v-if="!isUsingOptimalRatio"
                  variant="default"
                  size="sm"
                  class="crop-guide-modal__optimal-btn"
                  @click="applyOptimalRatio"
                >
                  调整画布到最优比例
                </Button>
                <div v-else class="crop-guide-modal__optimal-done">
                  <Check class="w-3.5 h-3.5" />
                  已是最优比例
                </div>
              </div>
            </div>

            <Separator class="my-3" />

            <!-- 添加参考线 -->
            <div class="crop-guide-modal__section">
              <div class="crop-guide-modal__section-title">添加参考线</div>

              <!-- 常用比例快捷添加 -->
              <div class="crop-guide-modal__quick-add">
                <div class="crop-guide-modal__quick-title">常用比例</div>
                <div class="crop-guide-modal__quick-grid">
                  <Button
                    v-for="preset in quickPresets"
                    :key="preset.id"
                    size="sm"
                    variant="outline"
                    class="rounded-full"
                    :disabled="isAdded(preset.id)"
                    @click="addCropGuide(preset)"
                  >
                    {{ preset.name }}
                  </Button>
                </div>
              </div>

              <!-- 常用像素尺寸快捷添加 -->
              <div class="crop-guide-modal__quick-add">
                <div class="crop-guide-modal__quick-title">常用像素尺寸 (px)</div>
                <div class="crop-guide-modal__quick-grid">
                  <Button
                    v-for="preset in pixelQuickPresets"
                    :key="preset.id"
                    size="sm"
                    variant="outline"
                    class="rounded-full"
                    :disabled="isAdded(preset.id)"
                    @click="addCropGuide(preset)"
                  >
                    {{ preset.name }}
                  </Button>
                </div>
              </div>

              <!-- 分类预设 -->
              <div class="crop-guide-modal__categories">
                <div
                  v-for="category in categorizedPresets"
                  :key="category.label"
                  class="crop-guide-modal__category"
                >
                  <div
                    class="crop-guide-modal__category-header"
                    @click="toggleCategory(category.label)"
                  >
                    <ArrowRight
                      class="crop-guide-modal__category-icon"
                      :class="{ 'is-expanded': expandedCategories.includes(category.label) }"
                    />
                    <span class="crop-guide-modal__category-label">{{ category.label }}</span>
                    <span class="crop-guide-modal__category-desc">{{ category.description }}</span>
                  </div>
                  <div
                    v-if="expandedCategories.includes(category.label)"
                    class="crop-guide-modal__category-grid"
                  >
                    <Button
                      v-for="preset in category.presets"
                      :key="preset.id"
                      size="sm"
                      :variant="isAdded(preset.id) ? 'secondary' : 'default'"
                      :disabled="isAdded(preset.id)"
                      class="rounded-full"
                      @click="addCropGuide(preset)"
                    >
                      {{ preset.name }}
                      <span class="crop-guide-modal__preset-ratio">{{ preset.display }}</span>
                    </Button>
                  </div>
                </div>
              </div>

              <!-- 自定义尺寸 -->
              <div class="crop-guide-modal__custom">
                <div class="crop-guide-modal__custom-title">自定义</div>
                <div class="crop-guide-modal__custom-row">
                  <Input
                    type="number"
                    :model-value="customWidth"
                    :min="1"
                    :max="9999"
                    class="h-6 text-[11px] w-24"
                    placeholder="宽"
                    @update:model-value="v => (customWidth = Number(v))"
                  />
                  <span class="crop-guide-modal__custom-x">:</span>
                  <Input
                    type="number"
                    :model-value="customHeight"
                    :min="1"
                    :max="9999"
                    class="h-6 text-[11px] w-24"
                    placeholder="高"
                    @update:model-value="v => (customHeight = Number(v))"
                  />
                  <Button
                    size="sm"
                    variant="default"
                    :disabled="!customWidth || !customHeight"
                    @click="addCustom"
                  >
                    添加
                  </Button>
                </div>
                <div class="crop-guide-modal__custom-row">
                  <Input
                    v-model="customName"
                    class="h-6 text-[11px] flex-1"
                    placeholder="自定义名称 (可选)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, type CSSProperties } from 'vue'
import { AlertTriangle, ArrowRight, Check, ChevronRight, Info, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import CropPresetItem from './CropPresetItem.vue'
import {
  cropPresets,
  cropGuides,
  showCropGuides,
  showSafeZone,
  showCropLabels,
  showCropGuideModal,
  highlightedPresetId,
  safeZone,
  addCropGuide,
  addCustomCropGuide,
  addPixelCropGuide,
  removeCropGuide,
  toggleGuideVisibility,
  toggleGuideHighlight,
  setGuideColor,
  optimalCanvasRatio,
  currentSafeAreaRatio,
  optimalSafeAreaRatio,
  optimalRatioText,
  currentMixedSafeZone,
  recommendedCanvasSize,
  activeCropRegions,
  optimalLayout,
  safeAreaNormalized,
  safeAreaCoverage,
  safeAreaAspect,
} from '../store'
import { canvasStickerOptionsOnlyChild, canvasStickerOptions } from '../../index'
import type { CropPreset } from '../types'
import { ratioCategories } from '../ratioData'
import { PIXEL_CROP_PRESETS } from '../presets'

// Custom preset inputs
const customWidth = ref<number>(800)
const customHeight = ref<number>(600)
const customName = ref<string>('')

// 分类展开状态
const expandedCategories = ref<string[]>(['竖屏', '正方形'])

function toggleCategory(label: string) {
  const idx = expandedCategories.value.indexOf(label)
  if (idx >= 0) {
    expandedCategories.value.splice(idx, 1)
  } else {
    expandedCategories.value.push(label)
  }
}

// 常用比例（最常使用的几个）
const quickPresets = computed(() => {
  const quickIds = ['ratio-1:1', 'ratio-9:16', 'ratio-3:4', 'ratio-4:5', 'ratio-16:9', 'ratio-2:3', 'ratio-4:3', 'ratio-3:2']
  const result: CropPreset[] = []
  for (const id of quickIds) {
    // 从 ratioCategories 中查找
    for (const cat of ratioCategories) {
      for (const r of cat.ratios) {
        const presetId = `ratio-${r.display}`
        if (presetId === id) {
          result.push({
            id: presetId,
            type: 'ratio' as const,
            name: r.name,
            width: r.width,
            height: r.height,
            ratio: r.width / r.height,
          })
          break
        }
      }
      if (result.length >= quickIds.length) break
    }
  }
  return result
})

// 常用像素尺寸快捷添加
const pixelQuickPresets = computed(() => {
  return PIXEL_CROP_PRESETS.filter(p => p.type === 'pixel')
})

// 分类预设（去重后的）
const categorizedPresets = computed(() => {
  const addedIds = new Set(cropPresets.value.map(p => p.id))
  return ratioCategories.map(cat => {
    const seen = new Set<string>()
    const presets: (CropPreset & { display: string })[] = []
    for (const r of cat.ratios) {
      const presetId = `ratio-${r.display}`
      if (seen.has(r.display)) continue
      seen.add(r.display)
      presets.push({
        id: presetId,
        type: 'ratio' as const,
        name: r.name,
        width: r.width,
        height: r.height,
        ratio: r.width / r.height,
        display: r.display,
      })
    }
    return {
      label: cat.label,
      description: cat.description,
      presets,
    }
  })
})

function isAdded(presetId: string): boolean {
  return cropPresets.value.some(p => p.id === presetId)
}

function getPreset(id: string): CropPreset {
  return cropPresets.value.find(p => p.id === id) || {
    id,
    type: 'ratio',
    name: '未知',
    width: 0,
    height: 0,
    ratio: 1,
  }
}

function addCustom() {
  if (!customWidth.value || !customHeight.value) return
  addCustomCropGuide(
    customWidth.value,
    customHeight.value,
    customName.value || undefined
  )
  customName.value = ''
}

// Safe zone size display
const safeZoneSize = computed(() => {
  if (!safeZone.value.valid) return '-'
  const canvasChild = canvasStickerOptionsOnlyChild.value
  if (!canvasChild) return '-'
  const w = canvasChild.width.value
  const h = canvasChild.height.value
  const safeW = (safeZone.value.right - safeZone.value.left) * w
  const safeH = (safeZone.value.bottom - safeZone.value.top) * h
  return `${safeW.toFixed(0)}×${safeH.toFixed(0)}px`
})

// Safe zone percentage display
const safeZonePercent = computed(() => {
  if (!safeZone.value.valid) return '-'
  const pct = (safeZone.value.right - safeZone.value.left) *
    (safeZone.value.bottom - safeZone.value.top) * 100
  return `${pct.toFixed(1)}%`
})

// 当前画布是否已是最优比例（误差 < 1%）
const isUsingOptimalRatio = computed(() => {
  const canvasChild = canvasStickerOptionsOnlyChild.value
  if (!canvasChild || !optimalCanvasRatio.value) return false
  const currentRatio = canvasChild.width.value / canvasChild.height.value
  const optimal = optimalCanvasRatio.value
  return Math.abs(currentRatio - optimal) / optimal < 0.01
})

// 是否包含像素约束
const hasPixelConstraints = computed(() => {
  return cropPresets.value.some(p => p.type === 'pixel' && cropGuides.value.some(g => g.presetId === p.id && g.visible))
})

// 像素约束是否能被当前画布满足
const pixelConstraintFulfilled = computed(() => {
  if (!hasPixelConstraints.value) return null // 没有像素约束
  const canvasChild = canvasStickerOptionsOnlyChild.value
  if (!canvasChild) return null
  const canvasWidth = canvasChild.width.value
  const canvasHeight = canvasChild.height.value
  const pixelPresets = cropPresets.value.filter(p => p.type === 'pixel' && cropGuides.value.some(g => g.presetId === p.id && g.visible))
  for (const p of pixelPresets) {
    if (p.width > canvasWidth || p.height > canvasHeight) return false
  }
  return true
})

// 应用最优比例到画布
function applyOptimalRatio() {
  const canvasChild = canvasStickerOptionsOnlyChild.value
  if (!canvasChild || !optimalCanvasRatio.value) return

  const optimal = optimalCanvasRatio.value

  // 保持长边不变，调整短边
  const longSide = Math.max(canvasChild.width.value, canvasChild.height.value)
  const unit = canvasChild.width.unit

  let newWidth: number, newHeight: number
  if (optimal >= 1) {
    // 横版或正方形
    newWidth = longSide
    newHeight = Math.round(longSide / optimal)
  } else {
    // 竖版
    newHeight = longSide
    newWidth = Math.round(longSide * optimal)
  }

  // 确保最小尺寸
  if (newWidth < 100) newWidth = 100
  if (newHeight < 100) newHeight = 100

  // 直接修改画布尺寸（与 operation context 相同的逻辑）
  canvasChild.width.value = newWidth
  canvasChild.width.unit = unit
  canvasChild.height.value = newHeight
  canvasChild.height.unit = unit

  // 触发响应式更新
  const children = canvasStickerOptions.value.children
  const index = children.indexOf(canvasChild)
  if (index !== -1) {
    canvasStickerOptions.value.children.splice(index, 1, canvasChild)
  }
}

// ===== 全屏预览画布 =====
// 画布尺寸输入（本地状态，用于预览）
const canvasWidthInput = ref<number>(0)
const canvasHeightInput = ref<number>(0)

// 初始化画布尺寸
function initCanvasSizeInput() {
  const canvasChild = canvasStickerOptionsOnlyChild.value
  if (canvasChild) {
    canvasWidthInput.value = canvasChild.width.value
    canvasHeightInput.value = canvasChild.height.value
  }
}

// 弹窗打开时初始化
watch(showCropGuideModal, (val) => {
  if (val) initCanvasSizeInput()
})

// 画布尺寸外部变化时同步到输入框（实时更新）
watch(
  () => {
    const canvasChild = canvasStickerOptionsOnlyChild.value
    return canvasChild ? [canvasChild.width.value, canvasChild.height.value] : null
  },
  ([w, h]) => {
    if (w && h && w > 0 && h > 0) {
      canvasWidthInput.value = w
      canvasHeightInput.value = h
    }
  },
  { immediate: true }
)

// 画布尺寸变化时应用到实际画布
function onCanvasSizeChange() {
  const canvasChild = canvasStickerOptionsOnlyChild.value
  if (!canvasChild) return
  if (canvasWidthInput.value > 0 && canvasHeightInput.value > 0) {
    canvasChild.width.value = canvasWidthInput.value
    canvasChild.height.value = canvasHeightInput.value
    // 触发响应式更新
    const children = canvasStickerOptions.value.children
    const index = children.indexOf(canvasChild)
    if (index !== -1) {
      canvasStickerOptions.value.children.splice(index, 1, canvasChild)
    }
  }
}

// 预览画布区域样式（保持比例缩放至适合预览区）
const canvasAreaStyle = computed((): CSSProperties => {
  const maxW = 600
  const maxH = 500
  const w = canvasWidthInput.value || 2000
  const h = canvasHeightInput.value || 2000
  const scale = Math.min(maxW / w, maxH / h, 1)
  return {
    width: `${w * scale}px`,
    height: `${h * scale}px`,
    backgroundColor: 'var(--1s-checkerboard-base, #ffffff)',
    border: '2px solid var(--1s-border-color-strong, rgba(0,0,0,0.18))',
    boxShadow: 'var(--1s-shadow-md)',
    position: 'relative',
    overflow: 'hidden',
  }
})

// 安全区样式
const safeZoneStyle = computed((): CSSProperties => {
  if (!safeZone.value.valid) return {}
  const left = safeZone.value.left * 100
  const top = safeZone.value.top * 100
  const width = (safeZone.value.right - safeZone.value.left) * 100
  const height = (safeZone.value.bottom - safeZone.value.top) * 100
  return {
    position: 'absolute',
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`,
    backgroundColor: 'color-mix(in srgb, var(--1s-accent-color, #0b57d0) 12%, transparent)',
    border: '2px solid var(--1s-accent-color, #0b57d0)',
    boxSizing: 'border-box',
    pointerEvents: 'none',
  }
})

// 获取裁切框样式
function getCropFrameStyle(item: { guide: any; preset: any; region: any }): CSSProperties {
  const { guide, region } = item
  const color = guide.color
  const left = region.left * 100
  const top = region.top * 100
  const width = region.visibleWidth * 100
  const height = region.visibleHeight * 100
  return {
    position: 'absolute',
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`,
    border: `2px dashed ${color}`,
    boxSizing: 'border-box',
    cursor: 'pointer',
  }
}
</script>

<style scoped>
/* ============================================================
 * 裁剪参考线弹窗 - 全屏布局
 * 使用 1s 设计系统令牌，支持明暗模式
 * ============================================================ */

/* 确保容器元素 border-box */
.crop-guide-fullscreen,
.crop-guide-fullscreen__preview,
.crop-guide-fullscreen__preview-header,
.crop-guide-fullscreen__preview-canvas,
.crop-guide-fullscreen__panel,
.crop-guide-fullscreen__panel-header,
.crop-guide-fullscreen__panel-body {
  box-sizing: border-box;
}

.crop-guide-modal {
  padding: 0 4px;
}

.crop-guide-modal__toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
}

.crop-guide-modal__toggle-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.crop-guide-modal__toggle-label {
  font-size: var(--1s-font-size-base, 13px);
  color: var(--1s-text-color, #1f1f1f);
}

.crop-guide-modal__section {
  margin-bottom: 4px;
}

.crop-guide-modal__section-title {
  font-size: var(--1s-font-size-md, 14px);
  font-weight: 600;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  color: var(--1s-text-color, #1f1f1f);
}

.crop-guide-modal__empty {
  text-align: center;
  padding: 12px;
  color: var(--1s-text-color-tertiary, #747775);
  font-size: var(--1s-font-size-base, 13px);
  background: var(--1s-control-surface-muted, #f0f4f9);
  border-radius: var(--1s-radius-sm, 6px);
}

.crop-guide-modal__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

/* 常用快捷添加 */
.crop-guide-modal__quick-add {
  margin-bottom: 12px;
}

.crop-guide-modal__quick-title {
  font-size: var(--1s-font-size-sm, 12px);
  color: var(--1s-text-color-secondary, #444746);
  margin-bottom: 6px;
  font-weight: 500;
}

.crop-guide-modal__quick-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.crop-guide-modal__quick-grid .el-button.is-disabled {
  opacity: 0.4;
}

/* 分类预设 */
.crop-guide-modal__categories {
  margin-bottom: 12px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--1s-border-color, rgba(0, 0, 0, 0.12));
  border-radius: var(--1s-radius-md, 8px);
}

.crop-guide-modal__category {
  border-bottom: 1px solid var(--1s-border-color, rgba(0, 0, 0, 0.12));
}

.crop-guide-modal__category:last-child {
  border-bottom: none;
}

.crop-guide-modal__category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  user-select: none;
  transition: background-color var(--1s-duration-fast, 80ms);
}

.crop-guide-modal__category-header:hover {
  background-color: var(--1s-control-hover-background, rgba(11, 87, 208, 0.08));
}

.crop-guide-modal__category-icon {
  font-size: 12px;
  transition: transform var(--1s-duration-base, 120ms);
  color: var(--1s-text-color-secondary, #444746);
}

.crop-guide-modal__category-icon.is-expanded {
  transform: rotate(90deg);
}

.crop-guide-modal__category-label {
  font-size: var(--1s-font-size-base, 13px);
  font-weight: 600;
  color: var(--1s-text-color, #1f1f1f);
}

.crop-guide-modal__category-desc {
  font-size: var(--1s-font-size-xs, 11px);
  color: var(--1s-text-color-tertiary, #747775);
  margin-left: auto;
}

.crop-guide-modal__category-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px 12px;
  background: var(--1s-control-surface-muted, #f0f4f9);
  border-top: 1px solid var(--1s-border-color, rgba(0, 0, 0, 0.12));
}

.crop-guide-modal__preset-ratio {
  font-size: var(--1s-font-size-xs, 11px);
  opacity: 0.7;
  margin-left: 4px;
}

.crop-guide-modal__category-grid .el-button.is-disabled {
  opacity: 0.4;
}

/* 自定义 */
.crop-guide-modal__custom {
  background: var(--1s-control-surface-muted, #f0f4f9);
  border-radius: var(--1s-radius-md, 8px);
  padding: 12px;
}

.crop-guide-modal__custom-title {
  font-size: var(--1s-font-size-base, 13px);
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--1s-text-color-secondary, #444746);
}

.crop-guide-modal__custom-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.crop-guide-modal__custom-row:last-child {
  margin-bottom: 0;
}

.crop-guide-modal__custom-x {
  font-size: var(--1s-font-size-md, 14px);
  color: var(--1s-text-color-tertiary, #747775);
  font-weight: 600;
}

/* 安全区域信息 */
.crop-guide-modal__safezone-info {
  background: color-mix(in srgb, var(--1s-accent-color, #0b57d0) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--1s-accent-color, #0b57d0) 25%, transparent);
  border-radius: var(--1s-radius-md, 8px);
  padding: 12px;
}

.crop-guide-modal__safezone-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--1s-font-size-base, 13px);
  padding: 3px 0;
}

.crop-guide-modal__safezone-label {
  color: var(--1s-text-color-secondary, #444746);
}

.crop-guide-modal__safezone-value {
  font-weight: 600;
  color: var(--1s-accent-color, #0b57d0);
  font-family: var(--1s-font-family-mono, monospace);
}

.crop-guide-modal__safezone-hint {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 8px;
  padding: 8px;
  background: color-mix(in srgb, var(--1s-accent-color, #0b57d0) 6%, transparent);
  border-radius: var(--1s-radius-sm, 6px);
  color: var(--1s-accent-color, #0b57d0);
  font-size: var(--1s-font-size-sm, 12px);
  line-height: 1.5;
}

.crop-guide-modal__safezone-warn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: color-mix(in srgb, oklch(0.577 0.245 27.325) 12%, transparent);
  border: 1px solid color-mix(in srgb, oklch(0.577 0.245 27.325) 30%, transparent);
  border-radius: var(--1s-radius-md, 8px);
  color: var(--destructive, oklch(0.577 0.245 27.325));
  font-size: var(--1s-font-size-base, 13px);
}

/* 最优比例推荐 */
.crop-guide-modal__optimal {
  background: color-mix(in srgb, var(--1s-accent-color, #0b57d0) 5%, transparent);
  border: 2px solid color-mix(in srgb, var(--1s-accent-color, #0b57d0) 30%, transparent);
  border-radius: var(--1s-radius-md, 8px);
  padding: 14px;
  transition: all var(--1s-duration-base, 120ms);
}

.crop-guide-modal__optimal.is-optimal {
  background: color-mix(in srgb, var(--1s-accent-color, #0b57d0) 8%, transparent);
  border-color: var(--1s-accent-color, #0b57d0);
}

.crop-guide-modal__optimal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.crop-guide-modal__optimal-ratio {
  font-size: 24px;
  font-weight: 700;
  color: var(--1s-accent-foreground, #0b57d0);
  font-family: var(--1s-font-family-mono, monospace);
}

.crop-guide-modal__optimal-badge {
  background: var(--1s-accent-color, #0b57d0);
  color: var(--1s-accent-color-soft, #fff);
  font-size: var(--1s-font-size-xs, 11px);
  padding: 2px 8px;
  border-radius: var(--1s-radius-pill, 10px);
  font-weight: 600;
}

/* 安全区详情网格 */
.crop-guide-modal__safearea-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.crop-guide-modal__safearea-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px;
  background: var(--1s-control-surface-muted);
  border-radius: var(--1s-radius-sm);
}

.crop-guide-modal__safearea-label {
  font-size: 10px;
  color: var(--1s-text-color-tertiary);
}

.crop-guide-modal__safearea-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--1s-text-color);
  font-family: var(--1s-font-family-mono, monospace);

  &.highlight {
    color: var(--1s-accent-color);
  }
}

/* 归一化坐标 */
.crop-guide-modal__norm-coords {
  padding: 8px 10px;
  background: var(--1s-control-surface-muted);
  border-radius: var(--1s-radius-sm);
  margin-bottom: 12px;
}

.crop-guide-modal__norm-title {
  font-size: 10px;
  color: var(--1s-text-color-tertiary);
  margin-bottom: 4px;
}

.crop-guide-modal__norm-values {
  display: flex;
  gap: 12px;
  font-size: 11px;
  font-family: var(--1s-font-family-mono, monospace);
  color: var(--1s-text-color-secondary);
}

.crop-guide-modal__optimal-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.crop-guide-modal__optimal-stat {
  text-align: center;
}

.crop-guide-modal__optimal-label {
  display: block;
  font-size: var(--1s-font-size-xs, 11px);
  color: var(--1s-text-color-secondary, #444746);
  margin-bottom: 2px;
}

.crop-guide-modal__optimal-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--1s-text-color, #1f1f1f);
  font-family: var(--1s-font-family-mono, monospace);
}

.crop-guide-modal__optimal-value.optimal {
  color: var(--1s-accent-color, #0b57d0);
}

.crop-guide-modal__optimal-arrow {
  font-size: 18px;
  color: var(--1s-accent-color, #0b57d0);
}

.crop-guide-modal__optimal-btn {
  width: 100%;
}

.crop-guide-modal__optimal-done {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--1s-accent-color, #0b57d0);
  font-size: var(--1s-font-size-base, 13px);
  font-weight: 500;
}

/* ===== 全屏遮罩 ===== */
.crop-guide-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
}

/* 关闭按钮 - 右上角 */
.crop-guide-overlay__close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10000;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--1s-surface-background, #ffffff);
  color: var(--1s-text-color, #1f1f1f);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--1s-shadow-md);
  transition: background-color 0.15s;
}

.crop-guide-overlay__close:hover {
  background: var(--1s-control-hover-background, rgba(11, 87, 208, 0.08));
}

/* 全屏容器 - 左右分栏 */
.crop-guide-fullscreen {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--1s-surface-background, #ffffff);
}

/* 左侧预览区 */
.crop-guide-fullscreen__preview {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--1s-panel-background, #f3f6fb);
  border-right: 1px solid var(--1s-border-color, rgba(0, 0, 0, 0.12));
  overflow: hidden;
}

.crop-guide-fullscreen__preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  flex-shrink: 0;
}

.crop-guide-fullscreen__preview-title {
  font-size: var(--1s-font-size-md, 14px);
  font-weight: 600;
  color: var(--1s-text-color, #1f1f1f);
}

.crop-guide-fullscreen__canvas-size {
  display: flex;
  align-items: center;
  gap: 8px;
}

.crop-guide-fullscreen__canvas-x,
.crop-guide-fullscreen__canvas-unit {
  font-size: var(--1s-font-size-md, 14px);
  color: var(--1s-text-color-secondary, #444746);
  font-weight: 600;
}

.crop-guide-fullscreen__preview-canvas {
  flex: 1;
  min-width: 0;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 24px;
}

.crop-guide-fullscreen__canvas-area {
  background: var(--1s-checkerboard-base, #ffffff);
  background-image:
    linear-gradient(45deg, var(--1s-checkerboard-cell-dark, #f0f2f5) 25%, transparent 25%),
    linear-gradient(-45deg, var(--1s-checkerboard-cell-dark, #f0f2f5) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--1s-checkerboard-cell-dark, #f0f2f5) 75%),
    linear-gradient(-45deg, transparent 75%, var(--1s-checkerboard-cell-dark, #f0f2f5) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0;
  box-shadow: var(--1s-shadow-md);
  transition: width var(--1s-duration-base, 120ms), height var(--1s-duration-base, 120ms);
}

.crop-guide-fullscreen__safezone {
  border: 2px dashed var(--1s-accent-color, #0b57d0);
  background: color-mix(in srgb, var(--1s-accent-color, #0b57d0) 8%, transparent);
}

.crop-guide-fullscreen__safezone-label {
  position: absolute;
  bottom: 4px;
  left: 4px;
  font-size: var(--1s-font-size-xs, 11px);
  font-weight: 600;
  color: var(--1s-accent-color, #0b57d0);
  background: var(--1s-surface-background, #ffffff);
  padding: 2px 6px;
  border-radius: var(--1s-radius-xs, 4px);
  pointer-events: none;
  white-space: nowrap;
  box-shadow: var(--1s-shadow-xs);
}

.crop-guide-fullscreen__crop-frame {
  border: 2px solid;
  border-color: var(--1s-accent-color, #0b57d0);
  transition: border-color var(--1s-duration-fast, 80ms);
}

.crop-guide-fullscreen__crop-frame:hover {
  border-width: 3px !important;
}

.crop-guide-fullscreen__crop-frame.is-highlighted {
  border-width: 3px !important;
}

.crop-guide-fullscreen__crop-label {
  position: absolute;
  top: -20px;
  left: 0;
  font-size: var(--1s-font-size-xs, 11px);
  font-weight: 600;
  color: #fff;
  padding: 1px 6px;
  border-radius: var(--1s-radius-xs, 3px);
  white-space: nowrap;
  pointer-events: none;
}

/* 右侧面板 - 固定宽度，内容超出滚动 */
.crop-guide-fullscreen__panel {
  width: 520px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--1s-surface-background, #ffffff);
  overflow: hidden;
}

.crop-guide-fullscreen__panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--1s-border-color, rgba(0, 0, 0, 0.12));
  flex-shrink: 0;
}

.crop-guide-fullscreen__panel-title {
  font-size: var(--1s-font-size-lg, 16px);
  font-weight: 600;
  color: var(--1s-text-color, #1f1f1f);
}

.crop-guide-fullscreen__panel-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px;
}

/* 滚动条样式 */
.crop-guide-fullscreen__panel-body::-webkit-scrollbar {
  width: 6px;
}

.crop-guide-fullscreen__panel-body::-webkit-scrollbar-track {
  background: transparent;
}

.crop-guide-fullscreen__panel-body::-webkit-scrollbar-thumb {
  background: var(--1s-scrollbar-background, rgba(0, 0, 0, 0.24));
  border-radius: var(--1s-radius-pill, 9999px);
}

.crop-guide-fullscreen__panel-body::-webkit-scrollbar-thumb:hover {
  background: var(--1s-scrollbar-background-hover, rgba(0, 0, 0, 0.4));
}

/* Element Plus 组件适配 */
.crop-guide-modal__toggles :deep(.el-switch.is-checked .el-switch__core) {
  background-color: var(--1s-accent-color, #0b57d0);
  border-color: var(--1s-accent-color, #0b57d0);
}

.crop-guide-modal :deep(.el-divider) {
  margin: 12px 0;
  border-color: var(--1s-divider-color, rgba(0, 0, 0, 0.08));
}
</style>
