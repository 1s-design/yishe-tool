/**
 * 画布溢出检测和自动修复
 * 用于确保文字和元素不超出画布边界
 */

export interface OverflowIssue {
  element: string
  type: 'text-overflow' | 'element-overflow' | 'font-too-large'
  description: string
  suggestion: string
}

/**
 * 检测 HTML 内容是否存在溢出风险
 */
export function detectOverflowRisks(htmlContent: string): OverflowIssue[] {
  const issues: OverflowIssue[] = []
  
  // 检查固定像素字号（可能导致溢出）
  const pxFontSizeRegex = /font-size:\s*(\d+)px/g
  let match
  while ((match = pxFontSizeRegex.exec(htmlContent)) !== null) {
    const size = parseInt(match[1])
    if (size > 48) {
      issues.push({
        element: match[0],
        type: 'font-too-large',
        description: `固定字号 ${size}px 可能导致溢出`,
        suggestion: `使用 var(--type-hero) 或 var(--type-title) 替代`
      })
    }
  }
  
  // 检查绝对定位可能导致溢出
  const absoluteRegex = /position:\s*absolute[^}]*(?:left|right|top|bottom):\s*-?\d+/g
  while ((match = absoluteRegex.exec(htmlContent)) !== null) {
    issues.push({
      element: match[0].substring(0, 50),
      type: 'element-overflow',
      description: '绝对定位可能超出画布边界',
      suggestion: '使用 flex/grid 布局或确保坐标在画布内'
    })
  }
  
  // 检查缺少 overflow:hidden 的容器
  const containerRegex = /<div[^>]*style="[^"]*width:\s*100%[^"]*"[^>]*>/g
  while ((match = containerRegex.exec(htmlContent)) !== null) {
    if (!match[0].includes('overflow:hidden') && !match[0].includes('overflow: hidden')) {
      issues.push({
        element: match[0].substring(0, 50),
        type: 'element-overflow',
        description: '容器缺少 overflow:hidden',
        suggestion: '添加 overflow:hidden 防止内容溢出'
      })
    }
  }
  
  return issues
}

/**
 * 自动修复 HTML 中的溢出问题
 */
export function autoFixOverflow(htmlContent: string): string {
  let fixed = htmlContent
  
  // 1. 为所有文字元素添加防溢出样式
  fixed = fixed.replace(
    /font-size:\s*var\(--type-([a-z]+)\)/g,
    'font-size:var(--type-$1);max-width:100%;overflow:hidden;text-overflow:ellipsis'
  )
  
  // 2. 为容器添加 overflow:hidden
  fixed = fixed.replace(
    /<div([^>]*?)style="([^"]*?)"/g,
    (match, attrs, styles) => {
      if (!styles.includes('overflow')) {
        return `<div${attrs}style="overflow:hidden;${styles}"`
      }
      return match
    }
  )
  
  // 3. 将固定像素字号转换为响应式
  fixed = fixed.replace(
    /font-size:\s*(\d+)px/g,
    (match, size) => {
      const num = parseInt(size)
      if (num > 48) {
        return 'font-size:var(--type-hero)'
      } else if (num > 36) {
        return 'font-size:var(--type-title)'
      } else if (num > 24) {
        return 'font-size:var(--type-primary)'
      }
      return match
    }
  )
  
  // 4. 为标题添加 nowrap
  fixed = fixed.replace(
    /<h[1-3]([^>]*?)>/g,
    '<h$1 style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'
  )
  
  return fixed
}

/**
 * 验证并修复 HTML 内容
 */
export function validateAndFixHtml(htmlContent: string): {
  fixed: string
  issues: OverflowIssue[]
  wasFixed: boolean
} {
  const issues = detectOverflowRisks(htmlContent)
  const fixed = autoFixOverflow(htmlContent)
  
  return {
    fixed,
    issues,
    wasFixed: fixed !== htmlContent
  }
}
