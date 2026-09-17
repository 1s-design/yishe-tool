/**
 * Crop Guide System - State Management
 *
 * Uses useLocalStorage for persistence across page refreshes.
 */

import { ref, computed, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { CropPreset, CropGuide, CropRegion, SafeZone } from './types'
import { calculateCropRegion, calculateSafeZone, findOptimalCanvasRatio, calculateSafeAreaRatio, calculatePresetCropRegion, calculateMixedSafeZone, findOptimalCanvasSizeMixed, formatRatioAsText } from './engine'
import { canvasStickerOptionsOnlyChild } from '../index'
import { DEFAULT_CROP_PRESETS } from './presets'

// -- Available presets catalog --
export const availablePresets = ref<CropPreset[]>([...DEFAULT_CROP_PRESETS])

// -- Persisted state via localStorage --
export const cropPresets = useLocalStorage<CropPreset[]>('crop-guide-presets', [], { deep: true })
export const cropGuides = useLocalStorage<CropGuide[]>('crop-guide-guides', [], { deep: true })
export const showCropGuides = useLocalStorage<boolean>('crop-guide-show', false)
export const showSafeZone = useLocalStorage<boolean>('crop-guide-safezone', true)
export const showCropLabels = useLocalStorage<boolean>('crop-guide-labels', true)

// -- Non-persisted UI state --
export const highlightedPresetId = ref<string | null>(null)
export const showCropGuideModal = ref(false)

// -- Actions --

export function addCropGuide(preset: CropPreset) {
  if (cropPresets.value.find(p => p.id === preset.id)) return

  cropPresets.value.push({ ...preset })
  cropGuides.value.push({
    presetId: preset.id,
    color: getNextColor(),
    visible: true,
    locked: false,
    highlighted: false,
  })
  if (!showCropGuides.value) {
    showCropGuides.value = true
  }
}

/**
 * 添加比例型裁剪参考线
 */
export function addRatioCropGuide(width: number, height: number, name?: string) {
  const ratio = width / height
  const id = `ratio-${width}-${height}-${Date.now()}`
  const preset: CropPreset = {
    id,
    type: 'ratio',
    name: name || `${width}:${height}`,
    width,
    height,
    ratio,
  }
  addCropGuide(preset)
}

/**
 * 添加像素型裁剪参考线（固定像素尺寸，不随画布缩放）
 * 例如：1920×1080、800×600 等
 */
export function addPixelCropGuide(pixelWidth: number, pixelHeight: number, name?: string) {
  const ratio = pixelWidth / pixelHeight
  const id = `pixel-${pixelWidth}x${pixelHeight}-${Date.now()}`
  const preset: CropPreset = {
    id,
    type: 'pixel',
    name: name || `${pixelWidth}×${pixelHeight}`,
    width: pixelWidth,
    height: pixelHeight,
    ratio,
  }
  addCropGuide(preset)
}

/**
 * 添加自定义裁剪参考线（根据输入自动判断类型）
 * 如果宽高都 ≤ 100，认为是比例；否则认为是像素尺寸
 */
export function addCustomCropGuide(width: number, height: number, name?: string) {
  // 判断：如果宽高都较小（≤100），视为比例；否则视为像素
  if (width <= 100 && height <= 100) {
    addRatioCropGuide(width, height, name)
  } else {
    addPixelCropGuide(width, height, name)
  }
}

export function removeCropGuide(id: string) {
  cropPresets.value = cropPresets.value.filter(p => p.id !== id)
  cropGuides.value = cropGuides.value.filter(g => g.presetId !== id)
  if (highlightedPresetId.value === id) {
    highlightedPresetId.value = null
  }
}

export function toggleGuideVisibility(presetId: string) {
  const guide = cropGuides.value.find(g => g.presetId === presetId)
  if (guide) guide.visible = !guide.visible
}

export function toggleGuideHighlight(presetId: string) {
  highlightedPresetId.value =
    highlightedPresetId.value === presetId ? null : presetId
}

export function setGuideColor(presetId: string, color: string) {
  const guide = cropGuides.value.find(g => g.presetId === presetId)
  if (guide) guide.color = color
}

// -- Computed: all active crop regions for the overlay renderer --
export const activeCropRegions = computed(() => {
  const canvasChild = canvasStickerOptionsOnlyChild.value
  if (!canvasChild || !showCropGuides.value) return []

  const canvasWidth = canvasChild.width.value
  const canvasHeight = canvasChild.height.value

  return cropGuides.value
    .filter(g => g.visible)
    .map(g => {
      const preset = cropPresets.value.find(p => p.id === g.presetId)
      if (!preset) return null
      const region = calculatePresetCropRegion(preset, canvasWidth, canvasHeight)
      if (!region) return null // 像素约束无法满足
      return {
        guide: g,
        preset,
        region,
      }
    })
    .filter(Boolean) as Array<{ guide: CropGuide; preset: CropPreset; region: CropRegion }>
})

// -- Computed: safe zone --
export const safeZone = computed<SafeZone>(() => {
  const canvasChild = canvasStickerOptionsOnlyChild.value
  if (!canvasChild || !showSafeZone.value) {
    return { left: 0, top: 0, right: 1, bottom: 1, valid: false }
  }

  const canvasWidth = canvasChild.width.value
  const canvasHeight = canvasChild.height.value

  const visibleRegions = cropGuides.value
    .filter(g => g.visible)
    .map(g => {
      const preset = cropPresets.value.find(p => p.id === g.presetId)
      if (!preset) return null
      return calculatePresetCropRegion(preset, canvasWidth, canvasHeight)
    })
    .filter(Boolean) as CropRegion[]

  return calculateSafeZone(visibleRegions)
})

// -- Computed: unadded presets (available to add) --
export const unaddedPresets = computed(() => {
  const activeIds = new Set(cropPresets.value.map(p => p.id))
  return availablePresets.value.filter(p => !activeIds.has(p.id))
})

// -- Computed: 当前所有可见参考线的目标比例 --
export const activeTargetRatios = computed(() => {
  return cropGuides.value
    .filter(g => g.visible)
    .map(g => {
      const preset = cropPresets.value.find(p => p.id === g.presetId)
      return preset?.ratio
    })
    .filter((r): r is number => r !== undefined)
})

// -- Computed: 最优画布比例 - 使得安全区域最大化 --
export const optimalCanvasRatio = computed(() => {
  const ratios = activeTargetRatios.value
  if (ratios.length === 0) return null
  if (ratios.length === 1) return ratios[0]
  return findOptimalCanvasRatio(ratios)
})

// -- Computed: 当前画布的安全区域占比 --
export const currentSafeAreaRatio = computed(() => {
  const canvasChild = canvasStickerOptionsOnlyChild.value
  if (!canvasChild) return null
  const canvasRatio = canvasChild.width.value / canvasChild.height.value
  const ratios = activeTargetRatios.value
  if (ratios.length === 0) return null
  return calculateSafeAreaRatio(canvasRatio, ratios)
})

// -- Computed: 最优比例下的安全区域占比 --
export const optimalSafeAreaRatio = computed(() => {
  const ratios = activeTargetRatios.value
  if (ratios.length < 2) return null
  const optimal = optimalCanvasRatio.value
  if (!optimal) return null
  return calculateSafeAreaRatio(optimal, ratios)
})

// -- Computed: 最优比例的显示文本 --
export const optimalRatioText = computed(() => {
  const ratio = optimalCanvasRatio.value
  if (!ratio) return ''
  return formatRatioAsText(ratio)
})

// -- Computed: 所有可见预设的完整信息（含类型）--
export const activePresets = computed(() => {
  return cropGuides.value
    .filter(g => g.visible)
    .map(g => {
      const preset = cropPresets.value.find(p => p.id === g.presetId)
      return preset
    })
    .filter((p): p is CropPreset => p !== undefined)
})

// -- Computed: 当前画布的安全区（支持混合约束）--
export const currentMixedSafeZone = computed(() => {
  const canvasChild = canvasStickerOptionsOnlyChild.value
  if (!canvasChild) return null
  const canvasWidth = canvasChild.width.value
  const canvasHeight = canvasChild.height.value
  const presets = activePresets.value
  if (presets.length === 0) return null
  return calculateMixedSafeZone(canvasWidth, canvasHeight, presets)
})

// -- Computed: 推荐画布尺寸（支持混合约束）--
export const recommendedCanvasSize = computed(() => {
  const presets = activePresets.value
  if (presets.length === 0) return null
  return findOptimalCanvasSizeMixed(presets)
})

// -- Color rotation for new guides --
const GUIDE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
]
let colorIndex = 0
function getNextColor(): string {
  const color = GUIDE_COLORS[colorIndex % GUIDE_COLORS.length]
  colorIndex++
  return color
}
