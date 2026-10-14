/**
 * 画布溢出检测和自动修复（画布感知版）
 *
 * 两件事：
 * 1) 不再裁切文字——历史实现用 overflow:hidden / text-overflow:ellipsis / white-space:nowrap
 *    把溢出部分裁掉，表现为「文字显示不全」。现在改为换行 + 限宽。
 * 2) 按画布尺寸约束字号——设计里常把字号开到画布高度的 38%，竖排后副文案被挤出画布。
 *    另外 vw/vh 是「浏览器视口」单位，不是画布尺寸，必须换算成画布像素再封顶。
 */

export interface OverflowIssue {
  element: string
  type: 'text-overflow' | 'element-overflow' | 'font-too-large'
  description: string
  suggestion: string
}

export interface OverflowFixOptions {
  canvasWidth?: number
  canvasHeight?: number
  /** 画布基础字号，用于把 em/rem 换算成 px */
  baseFontSize?: number
}

/** 主文案最大字号：不超过画布高度的 26%、宽度的 50% */
const MAX_FONT_HEIGHT_RATIO = 0.26
const MAX_FONT_WIDTH_RATIO = 0.5

/** 会被注入到 HTML 顶部的全局防溢出样式（只做「适配」，不裁切文字） */
const OVERFLOW_GUARD_STYLE = `<style data-ai-overflow-guard="1">
  div, p, h1, h2, h3, h4, h5, h6, span, strong, em {
    overflow-wrap: anywhere;
    word-break: break-word;
    text-overflow: clip;
    white-space: normal;
  }
  [style*="translate(-50%"] {
    max-width: 88% !important;
    max-height: 84% !important;
    white-space: normal !important;
    text-wrap: balance;
  }
</style>`

function defaultOptions(options: OverflowFixOptions = {}) {
  return {
    w: Number(options.canvasWidth) || 3000,
    h: Number(options.canvasHeight) || 1376,
    base: Number(options.baseFontSize) || 22,
  }
}

/**
 * 把各种字号写法换算成画布像素。
 * 注意：vw/vh 是浏览器视口单位，在画布里是错的，必须按画布尺寸换算。
 */
function resolvePx(value: string, c: { w: number; h: number; base: number }): number | null {
  const v = String(value || '').trim()
  if (!v) return null
  let m

  if ((m = v.match(/^(-?[\d.]+)px$/i))) return Math.abs(parseFloat(m[1]))
  if ((m = v.match(/^(-?[\d.]+)em$/i))) return Math.abs(parseFloat(m[1])) * c.base
  if ((m = v.match(/^(-?[\d.]+)rem$/i))) return Math.abs(parseFloat(m[1])) * c.base
  if ((m = v.match(/^(-?[\d.]+)vw$/i))) return (Math.abs(parseFloat(m[1])) * c.w) / 100
  if ((m = v.match(/^(-?[\d.]+)vh$/i))) return (Math.abs(parseFloat(m[1])) * c.h) / 100
  if ((m = v.match(/^calc\(\s*var\(--canvas-html-vw\)\s*\*\s*(-?[\d.]+)\s*\)$/i))) {
    return (Math.abs(parseFloat(m[1])) * c.w) / 100
  }
  if ((m = v.match(/^calc\(\s*var\(--canvas-html-vh\)\s*\*\s*(-?[\d.]+)\s*\)$/i))) {
    return (Math.abs(parseFloat(m[1])) * c.h) / 100
  }
  if ((m = v.match(/^clamp\(\s*([^,]+),([^,]+),([^)]+)\s*\)$/i))) {
    return resolvePx(m[2].trim(), c) ?? resolvePx(m[1].trim(), c)
  }
  return null
}

/**
 * 检测 HTML 内容是否存在溢出风险
 */
export function detectOverflowRisks(htmlContent: string): OverflowIssue[] {
  const issues: OverflowIssue[] = []
  let match

  const pxFontSizeRegex = /font-size:\s*(\d+)px/gi
  while ((match = pxFontSizeRegex.exec(htmlContent)) !== null) {
    const size = parseInt(match[1])
    if (size > 48) {
      issues.push({
        element: match[0],
        type: 'font-too-large',
        description: `固定字号 ${size}px 可能导致溢出`,
        suggestion: `使用 var(--type-hero) 或 var(--type-title) 替代`,
      })
    }
  }

  const absRegex = /position:\s*absolute[^}]*(?:left|right|top|bottom):\s*-?\d+/g
  while ((match = absRegex.exec(htmlContent)) !== null) {
    issues.push({
      element: match[0].substring(0, 50),
      type: 'element-overflow',
      description: '绝对定位可能超出画布边界',
      suggestion: '确保坐标在画布内，或改用居中定位',
    })
  }

  const ellipsisRegex = /text-overflow:\s*ellipsis/gi
  while ((match = ellipsisRegex.exec(htmlContent)) !== null) {
    issues.push({
      element: match[0],
      type: 'text-overflow',
      description: '使用了 text-overflow:ellipsis，长文案会被截断',
      suggestion: '改为允许换行（overflow-wrap:anywhere）或减小字号',
    })
  }

  const nowrapRegex = /white-space:\s*nowrap/gi
  while ((match = nowrapRegex.exec(htmlContent)) !== null) {
    issues.push({
      element: match[0],
      type: 'text-overflow',
      description: '使用了 white-space:nowrap，长文案会溢出',
      suggestion: '主文案容器改用 white-space:normal 允许换行',
    })
  }

  // 视口单位做字号：在固定尺寸画布里必然和画布尺寸不匹配
  const viewportRegex = /font-size:\s*[^;"]*\b(vw|vh)\b/gi
  while ((match = viewportRegex.exec(htmlContent)) !== null) {
    issues.push({
      element: match[0].substring(0, 40),
      type: 'font-too-large',
      description: `${match[1]} 是浏览器视口单位，字号会与画布尺寸不匹配`,
      suggestion: '改用 var(--type-xxx) 或基于画布尺寸的 px',
    })
  }

  return issues
}

/**
 * 自动修复 HTML 中的溢出问题（只做适配，不裁切文字；字号按画布尺寸封顶）
 */
export function autoFixOverflow(
  htmlContent: string,
  options: OverflowFixOptions = {},
): string {
  const c = defaultOptions(options)
  let fixed = htmlContent

  // 1) 去掉会截断文案的写法
  fixed = fixed.replace(/text-overflow:\s*ellipsis;?/gi, 'text-overflow:clip;')
  fixed = fixed.replace(
    /white-space:\s*nowrap;?/gi,
    'white-space:normal;overflow-wrap:anywhere;',
  )

  // 2) 字号按画布尺寸封顶（vw/vh/clamp/em/px 统一换算成 px 后截断）
  const maxFontPx = Math.round(Math.min(c.h * MAX_FONT_HEIGHT_RATIO, c.w * MAX_FONT_WIDTH_RATIO))
  fixed = fixed.replace(/font-size:\s*([^;\"}\s][^;\"}]*)/gi, (full, raw) => {
    const px = resolvePx(raw, c)
    if (px == null || !Number.isFinite(px) || px <= 0) return full
    const capped = Math.min(px, maxFontPx)
    return `font-size:${Math.round(capped)}px`
  })

  // 3) 文字元素：允许换行并约束在容器内
  fixed = fixed.replace(
    /font-size:\s*var\(--type-([a-z]+)\)/gi,
    'font-size:var(--type-$1);max-width:100%;overflow-wrap:anywhere;word-break:break-word',
  )

  // 4) 注入全局防溢出样式（幂等）
  if (!fixed.includes('data-ai-overflow-guard')) {
    fixed = OVERFLOW_GUARD_STYLE + fixed
  }

  return fixed
}

/**
 * 验证并修复 HTML 内容
 */
export function validateAndFixHtml(
  htmlContent: string,
  options: OverflowFixOptions = {},
): {
  fixed: string
  issues: OverflowIssue[]
  wasFixed: boolean
} {
  const issues = detectOverflowRisks(htmlContent)
  const fixed = autoFixOverflow(htmlContent, options)

  return {
    fixed,
    issues,
    wasFixed: fixed !== htmlContent,
  }
}
