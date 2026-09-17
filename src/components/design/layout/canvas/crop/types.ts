/**
 * Responsive Crop Guide System - Type Definitions
 * 裁剪参考线系统 - 类型定义
 */

/** 裁剪预设类型：按比例 或 按像素尺寸 */
export type CropPresetType = 'ratio' | 'pixel'

/** A crop preset represents a target product size */
export interface CropPreset {
  id: string
  name: string
  /** 类型：'ratio' = 按比例裁剪, 'pixel' = 按固定像素尺寸裁剪 */
  type: CropPresetType
  /** 比例模式：ratio = width / height */
  /** 像素模式：width = 像素宽度, height = 像素高度 */
  width: number
  height: number
  ratio: number // width / height, precomputed (两种模式都有)
}

/** Runtime state for an active crop guide overlay */
export interface CropGuide {
  presetId: string
  color: string
  visible: boolean
  locked: boolean
  highlighted: boolean
}

/** Result of the crop calculation (all values normalized 0..1 relative to canvas) */
export interface CropRegion {
  left: number
  top: number
  right: number
  bottom: number
  visibleWidth: number
  visibleHeight: number
}

/** The safe zone (intersection of all visible crop guides) */
export interface SafeZone {
  left: number
  top: number
  right: number
  bottom: number
  valid: boolean
}
