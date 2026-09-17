/**
 * Responsive Crop Guide System - Core Engine
 * 裁剪参考线系统 - 核心计算引擎
 *
 * Pure functions for calculating crop regions, safe zones, and optimal canvas ratios.
 * No Vue dependencies - pure computation only.
 */

import type { CropRegion, SafeZone } from './types'

/**
 * Calculate the visible crop region (normalized 0..1) given a design ratio
 * and a target (preset) ratio, using "cover" mode.
 *
 * Cover mode: scale to fill the target, overflow is cropped.
 * - If target is wider than design -> crop top/bottom
 * - If target is narrower than design -> crop left/right
 *
 * @param designRatio - canvas width / canvas height
 * @param targetRatio - preset width / preset height
 * @returns CropRegion with left/top/right/bottom as fractions of canvas dimensions
 */
export function calculateCropRegion(
  designRatio: number,
  targetRatio: number
): CropRegion {
  if (targetRatio > designRatio) {
    // Target is wider than design -> crop top/bottom
    const visibleWidth = 1
    const visibleHeight = designRatio / targetRatio
    const left = 0
    const right = 1
    const top = (1 - visibleHeight) / 2
    const bottom = top + visibleHeight
    return { left, top, right, bottom, visibleWidth, visibleHeight }
  } else {
    // Target is narrower than design -> crop left/right
    const visibleHeight = 1
    const visibleWidth = targetRatio / designRatio
    const top = 0
    const bottom = 1
    const left = (1 - visibleWidth) / 2
    const right = left + visibleWidth
    return { left, top, right, bottom, visibleWidth, visibleHeight }
  }
}

/**
 * 计算像素约束下的裁切区域（居中放置）
 * 如果像素尺寸超过画布，返回 null（表示无法满足约束）
 *
 * @param canvasWidth - 画布像素宽度
 * @param canvasHeight - 画布像素高度
 * @param pixelWidth - 目标像素宽度
 * @param pixelHeight - 目标像素高度
 * @returns CropRegion 或 null（如果像素尺寸超过画布）
 */
export function calculatePixelCropRegion(
  canvasWidth: number,
  canvasHeight: number,
  pixelWidth: number,
  pixelHeight: number
): CropRegion | null {
  // 像素约束必须能放入画布
  if (pixelWidth > canvasWidth || pixelHeight > canvasHeight) {
    return null
  }

  // 居中放置
  const left = (canvasWidth - pixelWidth) / 2 / canvasWidth
  const top = (canvasHeight - pixelHeight) / 2 / canvasHeight
  const right = (canvasWidth + pixelWidth) / 2 / canvasWidth
  const bottom = (canvasHeight + pixelHeight) / 2 / canvasHeight

  return {
    left,
    top,
    right,
    bottom,
    visibleWidth: pixelWidth / canvasWidth,
    visibleHeight: pixelHeight / canvasHeight,
  }
}

/**
 * 统一接口：根据预设类型计算裁切区域
 */
export function calculatePresetCropRegion(
  preset: { type: string; ratio: number; width: number; height: number },
  canvasWidth: number,
  canvasHeight: number
): CropRegion | null {
  if (preset.type === 'pixel') {
    return calculatePixelCropRegion(canvasWidth, canvasHeight, preset.width, preset.height)
  }
  // ratio 模式
  const designRatio = canvasWidth / canvasHeight
  return calculateCropRegion(designRatio, preset.ratio)
}

/**
 * Calculate the safe zone as the intersection of all provided crop regions.
 * Returns a SafeZone with valid=false when regions list is empty or
 * intersection collapses (no common area).
 */
export function calculateSafeZone(regions: CropRegion[]): SafeZone {
  if (regions.length === 0) {
    return { left: 0, top: 0, right: 1, bottom: 1, valid: false }
  }

  const safeLeft = Math.max(...regions.map(r => r.left))
  const safeTop = Math.max(...regions.map(r => r.top))
  const safeRight = Math.min(...regions.map(r => r.right))
  const safeBottom = Math.min(...regions.map(r => r.bottom))

  const valid = safeLeft < safeRight && safeTop < safeBottom

  return { left: safeLeft, top: safeTop, right: safeRight, bottom: safeBottom, valid }
}

/**
 * 计算给定画布比例下的安全区域面积占比（仅比例约束）
 * @param canvasRatio - 画布宽高比
 * @param targetRatios - 目标比例数组
 * @returns 安全区域面积占画布的比例 (0-1)
 */
export function calculateSafeAreaRatio(canvasRatio: number, targetRatios: number[]): number {
  if (targetRatios.length === 0) return 1
  if (targetRatios.length === 1) {
    // 单个比例时，安全区域就是裁切区域本身
    const region = calculateCropRegion(canvasRatio, targetRatios[0])
    return region.visibleWidth * region.visibleHeight
  }

  const regions = targetRatios.map(r => calculateCropRegion(canvasRatio, r))
  const safe = calculateSafeZone(regions)
  if (!safe.valid) return 0
  return (safe.right - safe.left) * (safe.bottom - safe.top)
}

/**
 * 计算混合约束下的安全区域（支持比例 + 像素混搭）
 * 用于给定实际画布尺寸时的精确计算
 *
 * @param canvasWidth - 画布像素宽度
 * @param canvasHeight - 画布像素高度
 * @param presets - 预设数组（可混合 ratio 和 pixel 类型）
 * @returns 安全区域的像素尺寸和有效区域信息
 */
export function calculateMixedSafeZone(
  canvasWidth: number,
  canvasHeight: number,
  presets: Array<{ type: string; ratio: number; width: number; height: number }>
): { width: number; height: number; area: number; valid: boolean; coverage: number } {
  if (presets.length === 0) {
    return { width: canvasWidth, height: canvasHeight, area: canvasWidth * canvasHeight, valid: true, coverage: 1 }
  }

  const regions: CropRegion[] = []
  for (const preset of presets) {
    const region = calculatePresetCropRegion(preset, canvasWidth, canvasHeight)
    if (!region) {
      // 像素约束无法满足（画布太小）
      return { width: 0, height: 0, area: 0, valid: false, coverage: 0 }
    }
    regions.push(region)
  }

  const safe = calculateSafeZone(regions)
  if (!safe.valid) {
    return { width: 0, height: 0, area: 0, valid: false, coverage: 0 }
  }

  const width = (safe.right - safe.left) * canvasWidth
  const height = (safe.bottom - safe.top) * canvasHeight
  const area = width * height
  const coverage = area / (canvasWidth * canvasHeight)

  return { width, height, area, valid: true, coverage }
}

/**
 * 寻找最优画布比例 - 使得所有目标比例的交集（安全区域）面积最大
 *
 * 算法：
 * 1. 在目标比例的最小值和最大值之间进行精细搜索
 * 2. 找到最大安全区域面积
 * 3. 在最大面积中，选择最接近"整数比"的比例（更直观）
 *
 * @param targetRatios - 目标比例数组
 * @returns 最优画布比例
 */
export function findOptimalCanvasRatio(targetRatios: number[]): number {
  if (targetRatios.length === 0) return 1
  if (targetRatios.length === 1) return targetRatios[0]

  const minRatio = Math.min(...targetRatios)
  const maxRatio = Math.max(...targetRatios)

  // 搜索范围：最小目标比例到最大目标比例
  const steps = 10000
  let bestRatio = minRatio
  let bestArea = 0

  for (let i = 0; i <= steps; i++) {
    const ratio = minRatio + (maxRatio - minRatio) * (i / steps)
    const area = calculateSafeAreaRatio(ratio, targetRatios)
    if (area > bestArea) {
      bestArea = area
      bestRatio = ratio
    }
  }

  // 精细化搜索：在最优点附近进行二次搜索
  const range = (maxRatio - minRatio) / steps * 10
  const fineSteps = 10000
  const fineMin = Math.max(minRatio, bestRatio - range)
  const fineMax = Math.min(maxRatio, bestRatio + range)

  for (let i = 0; i <= fineSteps; i++) {
    const ratio = fineMin + (fineMax - fineMin) * (i / fineSteps)
    const area = calculateSafeAreaRatio(ratio, targetRatios)
    if (area > bestArea) {
      bestArea = area
      bestRatio = ratio
    }
  }

  // 在最大面积附近，找一个更"整"的比例（最接近常见整数比）
  // 这样用户看到的推荐比例更直观
  const tolerance = (maxRatio - minRatio) / steps * 5
  const niceRatios = [
    0.5, 2/3, 0.75, 1, 4/3, 1.5, 16/9, 2, 21/9, 3/4, 3/2, 5/4, 4/5, 9/16, 9/21
  ]

  // 在找到的最优点附近，找一个最接近"整数比"的值
  for (const nice of niceRatios) {
    if (Math.abs(nice - bestRatio) < tolerance) {
      const niceArea = calculateSafeAreaRatio(nice, targetRatios)
      // 如果整数比的面积与最优面积相差不大（<1%），使用整数比
      if (niceArea >= bestArea * 0.99) {
        return nice
      }
    }
  }

  return bestRatio
}

/**
 * 根据最优比例和目标短边长度，计算推荐画布尺寸
 * 保持面积尽可能大，同时满足所有比例要求
 *
 * @param optimalRatio - 最优画布比例
 * @param targetRatios - 目标比例数组
 * @param minShortSide - 最小短边像素值（默认 1000）
 * @returns 推荐的 {width, height}
 */
export function calculateOptimalCanvasSize(
  optimalRatio: number,
  targetRatios: number[],
  minShortSide: number = 1000
): { width: number; height: number; area: number; ratio: number } {
  // 找到所有比例中短边最小的那个，确保安全区域不会太小
  // 简单策略：以最优比例为基础，短边至少 minShortSide
  const shortSide = minShortSide
  const longSide = shortSide * optimalRatio

  // 确保宽 >= 高（横版）或高 >= 宽（竖版）
  const width = optimalRatio >= 1 ? longSide : shortSide
  const height = optimalRatio >= 1 ? shortSide : longSide

  const area = calculateSafeAreaRatio(optimalRatio, targetRatios)

  return {
    width: Math.round(width),
    height: Math.round(height),
    area,
    ratio: optimalRatio,
  }
}

/**
 * 将比例格式化为最简整数比显示
 * 例如 1.777 -> "16:9", 0.75 -> "3:4"
 */
export function formatRatioAsText(ratio: number): string {
  if (ratio === 1) return '1:1'

  // 尝试匹配常见比例
  const commonRatios = [
    { value: 16 / 9, text: '16:9' },
    { value: 9 / 16, text: '9:16' },
    { value: 4 / 3, text: '4:3' },
    { value: 3 / 4, text: '3:4' },
    { value: 3 / 2, text: '3:2' },
    { value: 2 / 3, text: '2:3' },
    { value: 5 / 4, text: '5:4' },
    { value: 4 / 5, text: '4:5' },
    { value: 21 / 9, text: '21:9' },
    { value: 9 / 21, text: '9:21' },
    { value: 18 / 9, text: '18:9' },
    { value: 9 / 18, text: '9:18' },
    { value: 2 / 1, text: '2:1' },
    { value: 1 / 2, text: '1:2' },
    { value: 5 / 6, text: '5:6' },
    { value: 6 / 5, text: '6:5' },
    { value: 5 / 7, text: '5:7' },
    { value: 7 / 5, text: '7:5' },
    { value: 7 / 8, text: '7:8' },
    { value: 8 / 7, text: '8:7' },
  ]

  for (const r of commonRatios) {
    if (Math.abs(r.value - ratio) < 0.01) {
      return r.text
    }
  }

  // 没有匹配的常见比例，计算最简整数比
  const g = gcd(Math.round(ratio * 100), 100)
  const w = Math.round(ratio * 100 / g)
  const h = Math.round(100 / g)

  if (w > 100 || h > 100) {
    return `${ratio.toFixed(2)}:1`
  }
  return `${w}:${h}`
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a))
  b = Math.abs(Math.round(b))
  if (b === 0) return a || 1
  return gcd(b, a % b)
}

/**
 * 寻找最优画布尺寸（支持比例 + 像素混搭约束）
 *
 * 算法：
 * 1. 从比例约束确定最优比例区间 [rMin, rMax]
 * 2. 从像素约束确定最小画布尺寸
 * 3. 在最优比例下，找到能容纳所有像素约束的最小画布
 *
 * @param presets - 混合预设数组
 * @returns 推荐的画布尺寸和安全区信息
 */
export function findOptimalCanvasSizeMixed(
  presets: Array<{ type: string; ratio: number; width: number; height: number }>,
  minShortSide: number = 1000
): {
  width: number
  height: number
  ratio: number
  safeZoneWidth: number
  safeZoneHeight: number
  coverage: number
  ratioPresets: number
  pixelPresets: number
} {
  if (presets.length === 0) {
    return { width: 2000, height: 2000, ratio: 1, safeZoneWidth: 2000, safeZoneHeight: 2000, coverage: 1, ratioPresets: 0, pixelPresets: 0 }
  }

  // 分离比例约束和像素约束
  const ratioPresets = presets.filter(p => p.type === 'ratio')
  const pixelPresets = presets.filter(p => p.type === 'pixel')

  // 像素约束要求的最小画布尺寸
  const minWidth = pixelPresets.length > 0 ? Math.max(...pixelPresets.map(p => p.width)) : 0
  const minHeight = pixelPresets.length > 0 ? Math.max(...pixelPresets.map(p => p.height)) : 0

  // 比例约束决定最优比例
  let optimalRatio = 1
  if (ratioPresets.length === 1) {
    optimalRatio = ratioPresets[0].ratio
  } else if (ratioPresets.length >= 2) {
    optimalRatio = findOptimalCanvasRatio(ratioPresets.map(p => p.ratio))
  } else if (pixelPresets.length === 1) {
    // 只有一个像素约束，比例就用它的比例
    optimalRatio = pixelPresets[0].ratio
  } else if (pixelPresets.length >= 2) {
    // 多个像素约束，用它们的比例均值
    optimalRatio = pixelPresets.reduce((s, p) => s + p.ratio, 0) / pixelPresets.length
  }

  // 计算满足所有约束的最小画布尺寸
  // 画布必须：1) ≥ 所有像素约束  2) 比例 = optimalRatio
  let canvasWidth: number
  let canvasHeight: number

  if (optimalRatio >= 1) {
    // 横版：width >= height
    canvasHeight = Math.max(minHeight, minShortSide)
    canvasWidth = Math.max(minWidth, canvasHeight * optimalRatio)
  } else {
    // 竖版：height > width
    canvasWidth = Math.max(minWidth, minShortSide)
    canvasHeight = Math.max(minHeight, canvasWidth / optimalRatio)
  }

  // 确保像素约束都能放下（可能需要扩大画布）
  // 像素约束居中放置，画布必须 ≥ 像素尺寸
  if (pixelPresets.length > 0) {
    const maxPixelWidth = Math.max(...pixelPresets.map(p => p.width))
    const maxPixelHeight = Math.max(...pixelPresets.map(p => p.height))
    canvasWidth = Math.max(canvasWidth, maxPixelWidth)
    canvasHeight = Math.max(canvasHeight, maxPixelHeight)
  }

  // 计算安全区
  const safeResult = calculateMixedSafeZone(canvasWidth, canvasHeight, presets)

  return {
    width: Math.round(canvasWidth),
    height: Math.round(canvasHeight),
    ratio: optimalRatio,
    safeZoneWidth: Math.round(safeResult.width),
    safeZoneHeight: Math.round(safeResult.height),
    coverage: safeResult.coverage,
    ratioPresets: ratioPresets.length,
    pixelPresets: pixelPresets.length,
  }
}
