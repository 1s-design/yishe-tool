import { registerOperation, executeOperation } from '../registry'
import type { OperationContext } from '../types'

interface StickerElement {
  type: 'text' | 'background' | 'rect' | 'ellipse'
  content?: string
  color?: string
  fontSize?: number
  fontWeight?: string
  zIndex?: number
  backgroundColor?: string
  width?: number
  height?: number
  rotateZ?: number
  center?: boolean
  left?: number
  top?: number
  opacity?: number
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
}

registerOperation({
  id: 'canvas.createSticker',
  name: '创建贴纸',
  description: '一句话创建一个完整贴纸，自动设置画布尺寸、背景和多个元素',
  group: '贴纸',
  params: [
    {
      name: 'width',
      label: '画布宽度',
      type: 'number',
      default: 2400,
      min: 100,
      max: 10000,
      description: '画布宽度（px），默认采用 2400px 超清规格',
    },
    {
      name: 'height',
      label: '画布高度',
      type: 'number',
      default: 2400,
      min: 100,
      max: 10000,
      description: '画布高度（px），默认采用 2400px 超清规格',
    },
    {
      name: 'backgroundColor',
      label: '背景颜色',
      type: 'color',
      default: '#ffffff',
      description: '贴纸背景颜色',
    },
    {
      name: 'mainText',
      label: '主文字',
      type: 'string',
      placeholder: '输入主标题文字',
      description: '贴纸的主要文字内容',
    },
    {
      name: 'mainTextColor',
      label: '主文字颜色',
      type: 'color',
      default: '#000000',
      description: '主文字颜色',
    },
    {
      name: 'mainTextFontSize',
      label: '主文字大小',
      type: 'number',
      default: 360,
      min: 10,
      max: 2000,
      description: '主文字字号（px）',
    },
    {
      name: 'mainTextFontWeight',
      label: '主文字粗细',
      type: 'select',
      default: '700',
      options: [
        { label: '正常', value: '400' },
        { label: '半粗', value: '600' },
        { label: '加粗', value: '700' },
        { label: '黑体', value: '900' },
      ],
      description: '主文字粗细',
    },
    {
      name: 'subText',
      label: '副文字',
      type: 'string',
      placeholder: '输入副标题文字',
      description: '贴纸的副文字（可选）',
    },
    {
      name: 'subTextColor',
      label: '副文字颜色',
      type: 'color',
      default: '#666666',
      description: '副文字颜色',
    },
    {
      name: 'subTextFontSize',
      label: '副文字大小',
      type: 'number',
      default: 140,
      min: 10,
      max: 1000,
      description: '副文字字号（px）',
    },
  ],
  async execute(params, ctx) {
    const {
      width = 2400,
      height = 2400,
      backgroundColor,
      mainText,
      mainTextColor,
      mainTextFontSize = 360,
      mainTextFontWeight,
      subText,
      subTextColor,
      subTextFontSize = 140,
    } = params

    const results: string[] = []

    const r1 = await executeOperation('canvas.setSize', { width, height }, ctx)
    results.push(r1.message)

    const r2 = await executeOperation('canvas.setBackgroundColor', { color: backgroundColor }, ctx)
    results.push(r2.message)

    if (mainText) {
      const r3 = await executeOperation('canvas.addText', {
        textContent: mainText,
        fontColor: mainTextColor || '#000000',
        fontSize: mainTextFontSize || 200,
        fontWeight: mainTextFontWeight || '700',
        center: true,
      }, ctx)
      results.push(r3.message)
    }

    if (subText) {
      const r4 = await executeOperation('canvas.addText', {
        textContent: subText,
        fontColor: subTextColor || '#666666',
        fontSize: subTextFontSize || 80,
        fontWeight: '400',
        center: true,
      }, ctx)
      results.push(r4.message)
    }

    return {
      success: true,
      message: `贴纸创建完成！${results.join(' → ')}`,
      data: { steps: results },
    }
  },
})

registerOperation({
  id: 'canvas.createFromDescription',
  name: '智能创建贴纸',
  description: '根据自然语言描述自动创建贴纸，AI 会自行拆解为多个操作执行',
  group: '贴纸',
  params: [
    {
      name: 'description',
      label: '贴纸描述',
      type: 'string',
      required: true,
      placeholder: '例如：一个写着"加油"的红色励志贴纸',
      description: '用自然语言描述你想要的贴纸效果',
    },
    {
      name: 'width',
      label: '画布宽度',
      type: 'number',
      default: 1000,
      min: 100,
      max: 10000,
      description: '画布宽度（px）',
    },
    {
      name: 'height',
      label: '画布高度',
      type: 'number',
      default: 1000,
      min: 100,
      max: 10000,
      description: '画布高度（px）',
    },
  ],
  async execute(params, ctx) {
    const { description, width, height } = params
    const desc = description.toLowerCase()

    const r1 = await executeOperation('canvas.setSize', { width: width || 1000, height: height || 1000 }, ctx)

    let bgColor = '#ffffff'
    if (desc.includes('黑') || desc.includes('暗') || desc.includes('dark')) bgColor = '#1a1a1a'
    else if (desc.includes('红') || desc.includes('red')) bgColor = '#ff4d4f'
    else if (desc.includes('蓝') || desc.includes('blue')) bgColor = '#1890ff'
    else if (desc.includes('粉') || desc.includes('pink')) bgColor = '#ff85c0'
    else if (desc.includes('绿') || desc.includes('green')) bgColor = '#52c41a'
    else if (desc.includes('黄') || desc.includes('yellow')) bgColor = '#faad14'
    else if (desc.includes('紫') || desc.includes('purple')) bgColor = '#722ed1'
    else if (desc.includes('橙') || desc.includes('orange')) bgColor = '#fa8c16'

    await executeOperation('canvas.setBackgroundColor', { color: bgColor }, ctx)

    const textColor = (bgColor === '#1a1a1a' || bgColor === '#1890ff' || bgColor === '#722ed1')
      ? '#ffffff' : '#000000'

    const textMatch = description.match(/["「【](.+?)["」】]/)
    const mainText = textMatch ? textMatch[1] : description.replace(/创建|生成|制作|一个|贴纸|的|写|着|风格|色|暗|黑|红|蓝|粉|绿|黄|紫|橙/g, '').trim()

    if (mainText) {
      await executeOperation('canvas.addText', {
        textContent: mainText,
        fontColor: textColor,
        fontSize: 200,
        fontWeight: '700',
        center: true,
      }, ctx)
    }

    return {
      success: true,
      message: `已根据描述创建贴纸：画布 ${width || 1000}x${height || 1000}，背景 ${bgColor}，文字 "${mainText || '（无）'}"`,
      data: { bgColor, mainText, textColor },
    }
  },
})
