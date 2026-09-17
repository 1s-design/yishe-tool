/**
 * CropOverlay - 裁剪参考线覆盖层
 *
 * 放置在 canvas container 外部。
 * 裁切线从画布边缘向外延伸，直观显示裁切位置。
 *
 * 视觉层次：
 * 1. 危险区域（红色斜线）- 某些比例下会被裁掉
 * 2. 安全区域（绿色）- 所有比例都能完整显示
 * 3. 单比例裁切框 + 向外延伸角线
 */

import { defineComponent, computed } from 'vue'
import {
  activeCropRegions,
  safeZone,
  showCropGuides,
  showSafeZone,
  showCropLabels,
  highlightedPresetId,
} from '../store'

function getAdaptiveStyle(canvasWidth: number, canvasHeight: number) {
  const minSide = Math.min(canvasWidth, canvasHeight)
  const baseFontSize = Math.max(14, Math.min(48, Math.round(14 + (minSide - 1000) / (10000 - 1000) * (36 - 14))))
  const basePadding = Math.max(3, Math.round(baseFontSize * 0.35))
  const baseRadius = Math.max(2, Math.round(baseFontSize * 0.25))
  const baseLineHeight = Math.round(baseFontSize * 1.3)
  const baseBorderWidth = Math.max(2, Math.min(6, Math.round(2 + (minSide - 1000) / (10000 - 1000) * (4 - 2))))
  return { baseFontSize, basePadding, baseRadius, baseLineHeight, baseBorderWidth }
}

function formatPxSize(w: number, h: number): string {
  return `${Math.round(w)}×${Math.round(h)}`
}

/** 裁切线向外延伸长度 */
const CROP_MARK_EXTEND = 30

export const CropOverlay = defineComponent({
  name: 'CropOverlay',
  props: {
    canvasWidth: { type: Number, required: true },
    canvasHeight: { type: Number, required: true },
  },
  setup(props) {
    const isVisible = computed(() => showCropGuides.value || showSafeZone.value)

    return () => {
      if (!isVisible.value) return null

      const ext = CROP_MARK_EXTEND
      const cw = props.canvasWidth
      const ch = props.canvasHeight

      return (
        <div
          style={{
            position: 'absolute',
            top: `${-ext}px`,
            left: `${-ext}px`,
            width: `${cw + ext * 2}px`,
            height: `${ch + ext * 2}px`,
            pointerEvents: 'none',
            zIndex: 50,
            overflow: 'visible',
          }}
        >
          {/* 内层：画布区域（带 overflow hidden） */}
          <div
            style={{
              position: 'absolute',
              top: `${ext}px`,
              left: `${ext}px`,
              width: `${cw}px`,
              height: `${ch}px`,
              overflow: 'hidden',
            }}
          >
            {/* 危险区域 */}
            {showSafeZone.value && safeZone.value.valid && renderDangerZone(cw, ch)}
            {/* 安全区域 */}
            {showSafeZone.value && safeZone.value.valid && renderSafeZone(cw, ch)}
            {/* 单比例裁切框 */}
            {showCropGuides.value &&
              activeCropRegions.value.map(item => {
                const isHighlighted = highlightedPresetId.value === item.preset.id
                return renderCropGuideRegion(item, cw, ch, isHighlighted)
              })}
          </div>

          {/* 裁切线 - 延伸到画布外面 */}
          {showCropGuides.value &&
            activeCropRegions.value.map(item => renderCropMarks(item, cw, ch, ext))}
        </div>
      )
    }
  },
})

/**
 * 渲染危险区域（红色斜线）- 安全区之外、画布之内的部分
 */
function renderDangerZone(cw: number, ch: number) {
  const sz = safeZone.value
  if (!sz || !sz.valid) return null

  const zones: any[] = []
  const pattern = 'repeating-linear-gradient(45deg, rgba(244,67,54,0.18) 0px, rgba(244,67,54,0.18) 5px, rgba(244,67,54,0.04) 5px, rgba(244,67,54,0.04) 10px)'

  if (sz.top > 0.001) {
    zones.push(
      <div key="d-top" style={{ position: 'absolute', left: '0', top: '0', width: '100%', height: `${(sz.top * 100).toFixed(2)}%`, background: pattern }} />,
    )
  }
  if (sz.bottom < 0.999) {
    zones.push(
      <div key="d-bottom" style={{ position: 'absolute', left: '0', top: `${(sz.bottom * 100).toFixed(2)}%`, width: '100%', height: `${((1 - sz.bottom) * 100).toFixed(2)}%`, background: pattern }} />,
    )
  }
  if (sz.left > 0.001) {
    zones.push(
      <div key="d-left" style={{ position: 'absolute', left: '0', top: `${(sz.top * 100).toFixed(2)}%`, width: `${(sz.left * 100).toFixed(2)}%`, height: `${((sz.bottom - sz.top) * 100).toFixed(2)}%`, background: pattern }} />,
    )
  }
  if (sz.right < 0.999) {
    zones.push(
      <div key="d-right" style={{ position: 'absolute', left: `${(sz.right * 100).toFixed(2)}%`, top: `${(sz.top * 100).toFixed(2)}%`, width: `${((1 - sz.right) * 100).toFixed(2)}%`, height: `${((sz.bottom - sz.top) * 100).toFixed(2)}%`, background: pattern }} />,
    )
  }

  return <div>{zones}</div>
}

/**
 * 渲染安全区域 - 绿色高亮
 */
function renderSafeZone(cw: number, ch: number) {
  const sz = safeZone.value
  if (!sz || !sz.valid) return null

  const { baseFontSize, basePadding, baseRadius, baseLineHeight, baseBorderWidth } = getAdaptiveStyle(cw, ch)

  const left = sz.left * cw
  const top = sz.top * ch
  const width = (sz.right - sz.left) * cw
  const height = (sz.bottom - sz.top) * ch
  const sizeText = formatPxSize(width, height)
  const pct = ((sz.right - sz.left) * (sz.bottom - sz.top) * 100).toFixed(1)

  const fillStyle = {
    position: 'absolute' as const,
    left: left + 'px',
    top: top + 'px',
    width: width + 'px',
    height: height + 'px',
    backgroundColor: 'rgba(76,175,80,0.18)',
  }
  const borderWidthPx = (baseBorderWidth + 1) + 'px'
  const borderStyle2 = {
    position: 'absolute' as const,
    left: left + 'px',
    top: top + 'px',
    width: width + 'px',
    height: height + 'px',
    border: borderWidthPx + ' solid #4CAF50',
    boxSizing: 'border-box',
  }

  return (
    <div>
      {/* 填充 */}
      <div style={fillStyle} />
      {/* 边框 */}
      <div style={borderStyle2} />
      {/* 四角圆点 */}
      {[[left, top], [sz.right * cw, top], [left, sz.bottom * ch], [sz.right * cw, sz.bottom * ch]].map((point, idx) => {
        const dotLeft = (point[0] - 4) + 'px'
        const dotTop = (point[1] - 4) + 'px'
        const dotStyle = {
          position: 'absolute' as const,
          left: dotLeft,
          top: dotTop,
          width: '8px',
          height: '8px',
          backgroundColor: '#4CAF50',
          borderRadius: '50%',
        }
        return <div key={idx} style={dotStyle} />
      })}
      {/* 标签 */}
      {showCropLabels.value && (() => {
        const labelStyle = {
          position: 'absolute' as const,
          left: left + 'px',
          top: (top + height - baseLineHeight - basePadding * 2) + 'px',
          backgroundColor: '#4CAF50',
          color: '#fff',
          fontSize: baseFontSize + 'px',
          padding: basePadding + 'px ' + (basePadding * 2) + 'px',
          borderRadius: baseRadius + 'px 0 0 0',
          fontWeight: '700',
          lineHeight: baseLineHeight + 'px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }
        const labelText = '安全区域 ' + sizeText + ' (' + pct + '%)'
        return (
          <div style={labelStyle}>
            {labelText}
          </div>
        )
      })()}
    </div>
  )
}

/**
 * 渲染裁切线 - 从裁剪区域的四个角向外延伸到画布外面
 * 注意：crop marks 位于外层 div 中，坐标系原点在画布左上角外侧 ext 处
 * 因此所有坐标需要加上 ext 偏移量
 */
function renderCropMarks(item: { guide: any; preset: any; region: any }, cw: number, ch: number, ext: number) {
  const { guide, region } = item
  const color = guide.color

  const w = 2 // 线宽

  // 裁剪区域在 outer div 坐标系中的位置（加上 ext 偏移）
  const leftEdge = region.left * cw + ext
  const topEdge = region.top * ch + ext
  const rightEdge = region.right * cw + ext
  const bottomEdge = region.bottom * ch + ext

  // 四个角，每个角两条线（水平+垂直），从角点向外延伸 ext 长度
  const marks = [
    // 左上角：向左 + 向上
    { left: leftEdge - ext, top: topEdge - w / 2, width: ext, height: w },
    { left: leftEdge - w / 2, top: topEdge - ext, width: w, height: ext },
    // 右上角：向右 + 向上
    { left: rightEdge, top: topEdge - w / 2, width: ext, height: w },
    { left: rightEdge - w / 2, top: topEdge - ext, width: w, height: ext },
    // 左下角：向左 + 向下
    { left: leftEdge - ext, top: bottomEdge - w / 2, width: ext, height: w },
    { left: leftEdge - w / 2, top: bottomEdge, width: w, height: ext },
    // 右下角：向右 + 向下
    { left: rightEdge, top: bottomEdge - w / 2, width: ext, height: w },
    { left: rightEdge - w / 2, top: bottomEdge, width: w, height: ext },
  ]

  const markKey = 'mark-' + item.preset.id
  return (
    <div key={markKey}>
      {marks.map((m, i) => {
        const mStyle = {
          position: 'absolute' as const,
          left: m.left + 'px',
          top: m.top + 'px',
          width: m.width + 'px',
          height: m.height + 'px',
          backgroundColor: color,
          pointerEvents: 'none' as const,
        }
        return <div key={i} style={mStyle} />
      })}
    </div>
  )
}

/**
 * 渲染单个比例的裁切框
 */
function renderCropGuideRegion(item: { guide: any; preset: any; region: any }, cw: number, ch: number, isHighlighted: boolean) {
  const { guide, preset, region } = item
  const color = guide.color
  const { baseFontSize, basePadding, baseRadius, baseLineHeight, baseBorderWidth } = getAdaptiveStyle(cw, ch)
  const borderPx = isHighlighted ? baseBorderWidth + 1 : baseBorderWidth
  const borderStyle = isHighlighted ? 'solid' : 'dashed'
  const overlayOpacity = isHighlighted ? 0.15 : 0.06

  const left = region.left * cw
  const top = region.top * ch
  const width = region.visibleWidth * cw
  const height = region.visibleHeight * ch
  const sizeText = formatPxSize(width, height)

  const cropBase = { position: 'absolute' as const, backgroundColor: color, opacity: String(overlayOpacity) }

  const topPx = top + 'px'
  const leftPx = left + 'px'
  const widthPx = width + 'px'
  const heightPx = height + 'px'
  const bottomTopPx = (region.bottom * ch) + 'px'
  const bottomHeightPx = (ch - region.bottom * ch) + 'px'
  const rightLeftPx = (region.right * cw) + 'px'
  const rightWidthPx = (cw - region.right * cw) + 'px'
  const borderPxStr = borderPx + 'px'

  return (
    <div key={preset.id}>
      {/* 上 */}
      {region.top > 0.001 && <div style={{ ...cropBase, top: '0', left: '0', width: '100%', height: topPx }} />}
      {/* 下 */}
      {region.bottom < 0.999 && <div style={{ ...cropBase, top: bottomTopPx, left: '0', width: '100%', height: bottomHeightPx }} />}
      {/* 左 */}
      {region.left > 0.001 && <div style={{ ...cropBase, top: topPx, left: '0', width: leftPx, height: heightPx }} />}
      {/* 右 */}
      {region.right < 0.999 && <div style={{ ...cropBase, top: topPx, left: rightLeftPx, width: rightWidthPx, height: heightPx }} />}
      {/* 边界线 */}
      <div style={{ position: 'absolute', left: leftPx, top: topPx, width: widthPx, height: heightPx, border: borderPxStr + ' ' + borderStyle + ' ' + color, boxSizing: 'border-box' }} />
      {/* 标签 */}
      {showCropLabels.value && (() => {
        const labelStyle2 = {
          position: 'absolute' as const,
          left: leftPx,
          top: topPx,
          backgroundColor: color,
          color: '#fff',
          fontSize: baseFontSize + 'px',
          padding: basePadding + 'px ' + (basePadding * 2) + 'px',
          borderRadius: '0 0 ' + baseRadius + 'px 0',
          whiteSpace: 'nowrap',
          fontWeight: '600',
          lineHeight: baseLineHeight + 'px',
          maxWidth: widthPx,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }
        return (
          <div style={labelStyle2}>
            {preset.name + ' ' + sizeText}
          </div>
        )
      })()}
    </div>
  )
}
