import { registerOperation } from '../registry'
import { sizePresets, searchPresets, SIZE_PRESET_CATEGORIES } from './size-presets'
import { ratioCategories } from '../../components/design/layout/canvas/crop/ratioData'
import { getCanvasSizeLock } from '../canvas-size-lock'
import {
  applyCanvasBaseFontSize,
  inferCanvasTypographyDensity,
  type CanvasTypographyDensity,
} from '../canvas-typography'

const UNIT_CONVERSION: Record<string, number> = {
  px: 1,
  mm: 3.7795275591,
  cm: 37.795275591,
  in: 96,
}

function normalizeToPx(value: number, unit: string, dpi = 300): number {
  if (unit === 'px') return value
  if (unit === 'in') return value * dpi
  if (unit === 'mm') return (value / 25.4) * dpi
  if (unit === 'cm') return (value / 2.54) * dpi
  return value * (UNIT_CONVERSION[unit] || 1)
}

function parseSizeString(input: string): { width: number; height: number; unit: string } | null {
  // Normalize Chinese unit names to standard tokens
  let cleaned = input.toLowerCase()
    .replace(/英寸|inch(?:es)?/g, 'in')
    .replace(/寸/g, 'in')
    .replace(/厘米|公分/g, 'cm')
    .replace(/毫米/g, 'mm')
    .replace(/像素/g, 'px')
    .replace(/\s+/g, '')

  const patterns = [
    /(\d+(?:\.\d+)?)\s*(?:px|mm|cm|in)?\s*[x×X＊*]\s*(\d+(?:\.\d+)?)\s*(px|mm|cm|in)/,
    /(\d+(?:\.\d+)?)\s*(px|mm|cm|in)\s*[x×X＊*]\s*(\d+(?:\.\d+)?)/,
    /(\d+(?:\.\d+)?)\s*[x×X＊*]\s*(\d+(?:\.\d+)?)\s*(px|mm|cm|in)?/,
  ]

  for (const pattern of patterns) {
    const match = cleaned.match(pattern)
    if (match) {
      const width = parseFloat(match[1])
      const height = parseFloat(match[2])
      let unit = match[3] || (match[2] && isNaN(Number(match[2])) ? match[2] : 'px')
      if (unit !== 'in' && unit !== 'cm' && unit !== 'mm' && unit !== 'px') {
        unit = 'px'
      }

      // Safeguard: if dimensions are small like 3.5x2 and unit was inferred as px, check context
      if (unit === 'px' && width <= 20 && height <= 20) {
        if (/名片|card|寸|inch|in/i.test(input)) {
          unit = 'in'
        }
      }

      if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
        return { width, height, unit }
      }
    }
  }

  return null
}

interface SmartSizeResult {
  presetId?: string
  presetName?: string
  width: number
  height: number
  unit: string
  printArea?: { width: number; height: number; unit: string }
  dpi?: number
  source: 'preset' | 'parsed' | 'ai_reasoning' | 'ratio'
  reason: string
}

// ============ 比例匹配 ============

/** 所有比例扁平列表，按 ratio 从窄到宽 */
const allRatios = ratioCategories.flatMap(c => c.ratios).sort((a, b) => (a.width / a.height) - (b.width / b.height))

/** 根据比例和目标短边计算尺寸（最小边 >= 5000px） */
function ratioToSize(ratioW: number, ratioH: number, minSide = 5000): { width: number; height: number } {
  if (ratioW >= ratioH) {
    // 横版或正方形：高度为短边
    const height = minSide
    const width = Math.round((ratioW / ratioH) * minSide)
    return { width, height }
  } else {
    // 竖版：宽度为短边
    const width = minSide
    const height = Math.round((ratioH / ratioW) * minSide)
    return { width, height }
  }
}

/** 解析比例字符串如 "16:9" "3:4" "1.618:1" */
function parseRatioString(input: string): { w: number; h: number } | null {
  const cleaned = input.replace(/\s+/g, '')
  const match = cleaned.match(/^(\d+(?:\.\d+)?)\s*[:：\/]\s*(\d+(?:\.\d+)?)$/)
  if (match) {
    const w = parseFloat(match[1])
    const h = parseFloat(match[2])
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      return { w, h }
    }
  }
  return null
}

/** 尝试匹配比例相关请求 */
function matchRatioRequest(text: string): SmartSizeResult | null {
  const lower = text.toLowerCase().trim()

  // 1. 直接比例格式 "16:9" "3:4" "9:16"
  const ratioMatch = parseRatioString(lower)
  if (ratioMatch) {
    // 在预设比例中查找最接近的
    const targetRatio = ratioMatch.w / ratioMatch.h
    let bestMatch = allRatios[0]
    let bestDiff = Infinity
    for (const r of allRatios) {
      const diff = Math.abs(r.width / r.height - targetRatio)
      if (diff < bestDiff) {
        bestDiff = diff
        bestMatch = r
      }
    }
    // 容差 0.05 内视为匹配
    if (bestDiff < 0.05) {
      const size = ratioToSize(bestMatch.width, bestMatch.height)
      return {
        width: size.width,
        height: size.height,
        unit: 'px',
        source: 'ratio',
        reason: `比例 ${bestMatch.display}（${bestMatch.name}：${bestMatch.usage}）`,
      }
    }
    // 没有接近的预设，直接用用户给的比例
    const size = ratioToSize(ratioMatch.w, ratioMatch.h)
    return {
      width: size.width,
      height: size.height,
      unit: 'px',
      source: 'ratio',
      reason: `自定义比例 ${ratioMatch.w}:${ratioMatch.h}`,
    }
  }

  // 2. 方向性关键词
  const orientationKeywords: Record<string, { w: number; h: number; name: string }> = {
    '竖屏': { w: 9, h: 16, name: '竖屏 9:16' },
    '竖版': { w: 3, h: 4, name: '竖版 3:4' },
    '竖图': { w: 2, h: 3, name: '竖图 2:3' },
    '横屏': { w: 16, h: 9, name: '横屏 16:9' },
    '横版': { w: 4, h: 3, name: '横版 4:3' },
    '横图': { w: 3, h: 2, name: '横图 3:2' },
    '方形': { w: 1, h: 1, name: '正方形 1:1' },
    '正方': { w: 1, h: 1, name: '正方形 1:1' },
    '宽屏': { w: 16, h: 9, name: '宽屏 16:9' },
    '全屏': { w: 9, h: 16, name: '全屏 9:16' },
    '手机': { w: 9, h: 16, name: '手机竖屏 9:16' },
    'banner': { w: 3, h: 1, name: 'Banner 3:1' },
    '横幅': { w: 3, h: 1, name: '横幅 3:1' },
    '易拉宝': { w: 1, h: 2, name: '易拉宝 1:2' },
    '展架': { w: 9, h: 14, name: '展架 9:14' },
    '故事': { w: 9, h: 16, name: 'Story 9:16' },
    'story': { w: 9, h: 16, name: 'Story 9:16' },
    'reels': { w: 9, h: 16, name: 'Reels 9:16' },
    '抖音': { w: 9, h: 16, name: '抖音 9:16' },
    '快手': { w: 9, h: 16, name: '快手 9:16' },
    '小红书': { w: 3, h: 4, name: '小红书 3:4' },
    'instagram': { w: 1, h: 1, name: 'Instagram 1:1' },
    'youtube': { w: 16, h: 9, name: 'YouTube 16:9' },
    'pinterest': { w: 2, h: 3, name: 'Pinterest 2:3' },
    '带鱼屏': { w: 21, h: 9, name: '带鱼屏 21:9' },
    '海报': { w: 3, h: 4, name: '竖版海报 3:4' },
    '名片': { w: 9, h: 5, name: '名片 9:5' },
    '公众号': { w: 2.35, h: 1, name: '公众号首图 2.35:1' },
  }

  for (const [keyword, config] of Object.entries(orientationKeywords)) {
    if (lower.includes(keyword)) {
      const size = ratioToSize(config.w, config.h)
      return {
        width: size.width,
        height: size.height,
        unit: 'px',
        source: 'ratio',
        reason: `按「${keyword}」推断为 ${config.name}`,
      }
    }
  }

  // 3. 比例名称匹配 "16:9" "9:16" "3:4" "4:3" "1:1" 等
  for (const r of allRatios) {
    if (lower.includes(r.display.toLowerCase()) || lower.includes(r.name.toLowerCase())) {
      const size = ratioToSize(r.width, r.height)
      return {
        width: size.width,
        height: size.height,
        unit: 'px',
        source: 'ratio',
        reason: `匹配比例 ${r.display}（${r.name}：${r.usage}）`,
      }
    }
  }

  return null
}

// ============ 产品匹配 ============

const PRODUCT_SIZE_RULES: Array<{
  keywords: string[]
  presetId: string
  reason: string
}> = [
  { keywords: ['t恤', 'tshirt', 'tee', '短袖', '上衣'], presetId: 'tee-front-large', reason: 'T恤前胸印花区域' },
  { keywords: ['t恤后背', 'tee back', 't恤背面'], presetId: 'tee-back', reason: 'T恤后背印花区域' },
  { keywords: ['卫衣', 'hoodie', '连帽衫', '帽衫'], presetId: 'hoodie-front', reason: '卫衣前胸印花区域' },
  { keywords: ['卫衣后背', 'hoodie back'], presetId: 'hoodie-back', reason: '卫衣后背印花区域' },
  { keywords: ['马克杯', 'mug', '杯子', '咖啡杯'], presetId: 'mug-11oz', reason: '标准马克杯印花区域' },
  { keywords: ['手机壳', 'phone case', 'iphone', '手机套'], presetId: 'phone-iphone-15', reason: 'iPhone 手机壳' },
  { keywords: ['海报', 'poster', '招贴'], presetId: 'poster-a3', reason: 'A3 海报' },
  { keywords: ['贴纸', 'sticker', '粘贴'], presetId: 'sticker-3x3', reason: '3英寸圆形贴纸' },
  { keywords: ['鼠标垫', 'mousepad', '鼠标垫'], presetId: 'mousepad-standard', reason: '标准鼠标垫' },
  { keywords: ['桌垫', 'deskmat', '桌面垫'], presetId: 'deskmat-xl', reason: '超大桌垫' },
  { keywords: ['帆布袋', 'tote', '托特袋', '环保袋'], presetId: 'tote-standard', reason: '标准帆布袋' },
  { keywords: ['帽子', 'cap', '棒球帽', '鸭舌帽'], presetId: 'cap-front', reason: '棒球帽正面' },
  { keywords: ['抱枕', 'pillow', '靠垫', '枕头'], presetId: 'pillow-18x18', reason: '18英寸抱枕' },
  { keywords: ['名片', 'business card'], presetId: 'business-card', reason: '标准名片' },
  { keywords: ['明信片', 'postcard'], presetId: 'postcard', reason: '标准明信片' },
  { keywords: ['贺卡', 'greeting card', '生日卡'], presetId: 'greeting-card-5x7', reason: '5×7英寸贺卡' },
  { keywords: ['社交媒体', 'social', 'instagram', '微信', '朋友圈', '方形图'], presetId: 'social-square', reason: '社交媒体方形图' },
  { keywords: ['story', '故事', '竖版图', '短视频封面'], presetId: 'social-story', reason: '社交媒体竖版故事' },
  { keywords: ['小图', 'logo', '胸标', '左胸', '右胸'], presetId: 'tee-front-small', reason: 'T恤胸前小图区域' },
]

function matchProductRule(text: string): SmartSizeResult | null {
  const lower = text.toLowerCase()
  for (const rule of PRODUCT_SIZE_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      const preset = sizePresets.find((p) => p.id === rule.presetId)
      if (preset) {
        return {
          presetId: preset.id,
          presetName: preset.name,
          width: preset.width,
          height: preset.height,
          unit: preset.unit,
          printArea: preset.printArea,
          dpi: preset.dpi,
          source: 'preset',
          reason: rule.reason,
        }
      }
    }
  }
  return null
}

// ============ 注册操作 ============

registerOperation({
  id: 'canvas.smartSize',
  name: '智能设置画布尺寸',
  description: '根据自然语言描述智能推断并设置画布尺寸。支持产品名称、具体尺寸数值、比例（如 16:9、3:4）、方向（竖屏、横版、方形）、分类关键词等。',
  group: '画布',
  params: [
    {
      name: 'description',
      label: '尺寸描述',
      type: 'string',
      required: true,
      placeholder: '如：16:9、竖屏、T恤前胸、A3海报、4000x5000px、马克杯、Instagram 方形图',
      description: '用自然语言描述你想要的画布尺寸，可以是比例（16:9）、方向（竖屏/横版/方形）、产品名称、具体尺寸、或分类',
    },
    {
      name: 'typographyDensity',
      label: '排版密度',
      type: 'select',
      options: [
        { label: '密集长文', value: 'dense' },
        { label: '标准排版', value: 'balanced' },
        { label: '标题展示', value: 'display' },
      ],
      description: '可选。不传时根据 description 自动判断；兰亭序/长文用 dense，常规设计用 balanced，单字/标语/艺术字用 display。',
    },
    {
      name: 'baseFontSize',
      label: '画布基础字号',
      type: 'number',
      min: 4,
      max: 500,
      description: '可选的明确基础字号（px）；通常不传，由画布尺寸和排版密度自动计算。',
    },
  ],
  execute(params, ctx) {
    const lock = getCanvasSizeLock()
    if (lock) {
      return {
        success: true,
        message: `当前任务已锁定画布尺寸为 ${lock.width}×${lock.height} ${lock.unit}，禁止修改尺寸。`,
        data: { width: lock.width, height: lock.height, unit: lock.unit, locked: true },
      }
    }

    const { description, baseFontSize } = params

    if (!description || !description.trim()) {
      return {
        success: false,
        message: `请提供尺寸描述。支持：
1. 比例：16:9、3:4、9:16、1:1、21:9 等
2. 方向：竖屏、横版、方形、宽屏、全屏、手机、banner
3. 平台：抖音、小红书、Instagram、YouTube、Pinterest
4. 产品：${SIZE_PRESET_CATEGORIES.join('、')}
5. 具体尺寸：4000x5000px 或 10x10cm`,
      }
    }

    const trimmed = description.trim()
    const typographyDensity = (
      params.typographyDensity || inferCanvasTypographyDensity(trimmed)
    ) as CanvasTypographyDensity
    const applyTypography = (width: number, height: number, unit: string) =>
      applyCanvasBaseFontSize(ctx, {
        width,
        height,
        unit,
        density: typographyDensity,
        fontSize: baseFontSize,
      })

    // 1. 先尝试解析具体尺寸
    const parsed = parseSizeString(trimmed)
    if (parsed) {
      const pxW = Math.round(normalizeToPx(parsed.width, parsed.unit))
      const pxH = Math.round(normalizeToPx(parsed.height, parsed.unit))
      const finalW = Math.max(10, Math.min(20000, pxW))
      const finalH = Math.max(10, Math.min(20000, pxH))

      ctx.setCanvasSize(finalW, finalH, 'px')
      const typography = applyTypography(finalW, finalH, 'px')

      return {
        success: true,
        message: `已按您指定的尺寸设置画布：${finalW}×${finalH} px` +
          (parsed.unit !== 'px' ? `（从 ${parsed.width}×${parsed.height} ${parsed.unit} 转换）` : '') +
          `；基础字号 ${typography.baseFontSize}px（${typography.typographyDensityLabel}）`,
        data: {
          width: finalW,
          height: finalH,
          unit: 'px',
          source: 'parsed',
          originalValue: `${parsed.width}x${parsed.height}${parsed.unit}`,
          ...typography,
        },
      }
    }

    // 2. 尝试匹配比例
    const ratioResult = matchRatioRequest(trimmed)
    if (ratioResult) {
      ctx.setCanvasSize(ratioResult.width, ratioResult.height, ratioResult.unit)
      const typography = applyTypography(ratioResult.width, ratioResult.height, ratioResult.unit)
      return {
        success: true,
        message: `已将画布设置为 ${ratioResult.width}×${ratioResult.height} ${ratioResult.unit}（${ratioResult.reason}）；基础字号 ${typography.baseFontSize}px（${typography.typographyDensityLabel}）`,
        data: { ...ratioResult, ...typography },
      }
    }

    // 3. 尝试匹配产品预设
    const presetResults = searchPresets(trimmed)
    if (presetResults.length === 1) {
      const preset = presetResults[0]
      ctx.setCanvasSize(preset.width, preset.height, preset.unit)
      const typography = applyTypography(preset.width, preset.height, preset.unit)
      return {
        success: true,
        message: `已将画布设置为「${preset.name}」尺寸：${preset.width}×${preset.height} ${preset.unit}` +
          (preset.printArea ? `（印刷区 ${preset.printArea.width}×${preset.printArea.height} ${preset.printArea.unit}）` : '') +
          `；基础字号 ${typography.baseFontSize}px（${typography.typographyDensityLabel}）`,
        data: {
          presetId: preset.id,
          presetName: preset.name,
          width: preset.width,
          height: preset.height,
          unit: preset.unit,
          printArea: preset.printArea,
          dpi: preset.dpi,
          source: 'preset',
          reason: `关键词匹配到 ${preset.name}`,
          ...typography,
        },
      }
    }

    // 4. 尝试产品规则匹配
    const ruleMatch = matchProductRule(trimmed)
    if (ruleMatch) {
      ctx.setCanvasSize(ruleMatch.width, ruleMatch.height, ruleMatch.unit)
      const typography = applyTypography(ruleMatch.width, ruleMatch.height, ruleMatch.unit)
      return {
        success: true,
        message: `已将画布设置为「${ruleMatch.presetName}」尺寸：${ruleMatch.width}×${ruleMatch.height} ${ruleMatch.unit}（${ruleMatch.reason}）；基础字号 ${typography.baseFontSize}px（${typography.typographyDensityLabel}）`,
        data: { ...ruleMatch, ...typography },
      }
    }

    // 5. 多个预设匹配，取第一个
    if (presetResults.length > 1) {
      const top = presetResults[0]
      ctx.setCanvasSize(top.width, top.height, top.unit)
      const typography = applyTypography(top.width, top.height, top.unit)
      return {
        success: true,
        message: `已将画布设置为「${top.name}」尺寸：${top.width}×${top.height} ${top.unit}；基础字号 ${typography.baseFontSize}px（${typography.typographyDensityLabel}）。其他匹配：${presetResults.slice(1, 4).map((p) => p.name).join('、')}`,
        data: {
          presetId: top.id,
          presetName: top.name,
          width: top.width,
          height: top.height,
          unit: top.unit,
          printArea: top.printArea,
          dpi: top.dpi,
          source: 'preset',
          reason: `模糊匹配，共 ${presetResults.length} 个候选`,
          alternatives: presetResults.slice(1, 4).map((p) => ({ id: p.id, name: p.name })),
          ...typography,
        },
      }
    }

    // 6. 兜底
    return {
      success: false,
      message: `无法根据「${trimmed}」推断尺寸。请尝试：
1. 比例：16:9、3:4、9:16、1:1、21:9
2. 方向：竖屏、横版、方形、宽屏、banner
3. 平台：抖音、小红书、Instagram、YouTube
4. 产品：${SIZE_PRESET_CATEGORIES.join('、')}
5. 具体尺寸：4000x5000px 或 10x10cm`,
    }
  },
})
