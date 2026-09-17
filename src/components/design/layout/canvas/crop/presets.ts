/**
 * 裁剪参考线系统 - 默认预设
 * 使用共享比例数据源
 */

import type { CropPreset } from './types'
import { ratioCategories } from './ratioData'

/** 从共享比例数据生成裁剪预设（去重，只保留独立比例） */
function buildCropPresets(): CropPreset[] {
  const seen = new Set<string>()
  const presets: CropPreset[] = []

  for (const cat of ratioCategories) {
    for (const r of cat.ratios) {
      const key = r.display
      if (seen.has(key)) continue
      seen.add(key)
      presets.push({
        id: `ratio-${key}`,
        type: 'ratio',
        name: `${r.display} ${r.name}`,
        width: r.width,
        height: r.height,
        ratio: r.width / r.height,
      })
    }
  }

  return presets
}

export const DEFAULT_CROP_PRESETS: CropPreset[] = buildCropPresets()

/** 常用像素尺寸预设（固定输出尺寸） */
export const PIXEL_CROP_PRESETS: CropPreset[] = [
  { id: 'pixel-1920x1080', type: 'pixel', name: '1920×1080 (Full HD)', width: 1920, height: 1080, ratio: 1920 / 1080 },
  { id: 'pixel-1280x720', type: 'pixel', name: '1280×720 (HD)', width: 1280, height: 720, ratio: 1280 / 720 },
  { id: 'pixel-3840x2160', type: 'pixel', name: '3840×2160 (4K UHD)', width: 3840, height: 2160, ratio: 3840 / 2160 },
  { id: 'pixel-2560x1440', type: 'pixel', name: '2560×1440 (2K QHD)', width: 2560, height: 1440, ratio: 2560 / 1440 },
  { id: 'pixel-1080x1080', type: 'pixel', name: '1080×1080 (Instagram)', width: 1080, height: 1080, ratio: 1 },
  { id: 'pixel-1080x1350', type: 'pixel', name: '1080×1350 (Instagram 4:5)', width: 1080, height: 1350, ratio: 1080 / 1350 },
  { id: 'pixel-1080x1920', type: 'pixel', name: '1080×1920 (Story/Reels)', width: 1080, height: 1920, ratio: 1080 / 1920 },
  { id: 'pixel-800x600', type: 'pixel', name: '800×600 (SVGA)', width: 800, height: 600, ratio: 800 / 600 },
  { id: 'pixel-2480x3508', type: 'pixel', name: '2480×3508 (A4 300dpi)', width: 2480, height: 3508, ratio: 2480 / 3508 },
]
