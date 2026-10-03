import { registerOperation } from '../registry'
import {
  currentCanvasControllerInstance,
  renderingLoading,
} from '@/components/design/layout/canvas'
import { canvasToFile, downloadByFile } from '@/common/transform'
import Utils from '@/common/utils'

registerOperation({
  id: 'canvas.exportPng',
  name: '导出画布为 PNG',
  description: '将当前画布内容渲染并导出为 PNG 文件下载',
  group: '画布',
  params: [
    {
      name: 'autoTrim',
      label: '自动裁剪',
      type: 'boolean',
      default: true,
      description: '自动去除白色/透明边框',
    },
    {
      name: 'filename',
      label: '文件名',
      type: 'string',
      default: 'design',
      placeholder: '输出文件名',
      description: '导出文件的名称（不含扩展名）',
    },
  ],
  async execute(params, ctx) {
    const { autoTrim = true, filename = 'design' } = params

    const controller = currentCanvasControllerInstance.value
    if (!controller) {
      return { success: false, message: '画布控制器未初始化' }
    }

    try {
      await Promise.race([
        controller.activeUpdateRenderingCanvas(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('画布渲染启动超时 (15s)')), 15_000),
        ),
      ])

      const waitForRender = () =>
        new Promise<void>((resolve, reject) => {
          let attempts = 0
          const check = () => {
            if (!controller.loading.value && !renderingLoading.value) {
              resolve()
              return
            }
            attempts++
            if (attempts > 100) {
              reject(new Error('画布渲染超时 (5s)'))
              return
            }
            setTimeout(check, 50)
          }
          check()
        })

      await waitForRender()

      const canvasEl = controller.canvasEl
      if (!canvasEl) {
        return { success: false, message: '画布元素未找到' }
      }

      let file: File
      if (autoTrim) {
        const trimmedCanvas = Utils.trimCanvas(canvasEl)
        file = await canvasToFile(trimmedCanvas, `${filename}.png`)
      } else {
        file = await canvasToFile(canvasEl, `${filename}.png`)
      }

      downloadByFile(file)

      return {
        success: true,
        message: `已导出 ${filename}.png`,
        data: { filename: `${filename}.png`, width: canvasEl.width, height: canvasEl.height },
      }
    } catch (err: any) {
      return {
        success: false,
        message: `导出失败: ${err?.message || '未知错误'}`,
      }
    }
  },
})
