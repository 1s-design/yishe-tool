import { toast } from '@/components/ui/toast'
import { confirm } from '@/components/ui/confirm'

/**
 * 兼容 ant-design-vue message API 的 shadcn 实现
 *
 * 支持两种调用方式：
 *   message.success('文本')
 *   message.success({ content: '文本', key: 'xxx', duration: 1 })
 */
type MessageArgs = string | { content: string; key?: string; duration?: number; type?: string }

// 按 key 复用同一条 toast：loading 常驻，成功/失败时就地替换并自动消失，
// 否则 message.loading(duration:0) 会永久留在页面上。
const keyToToastId = new Map<string, number>()

function handle(msg: MessageArgs, type: 'success' | 'error' | 'warning' | 'info' | 'default') {
  if (typeof msg === 'string') {
    return toast[type === 'default' ? 'default' : type](msg)
  }
  const duration = msg.duration != null ? msg.duration * 1000 : undefined
  if (msg.key) {
    const existingId = keyToToastId.get(msg.key)
    if (existingId != null) {
      toast.dismiss(existingId)
      keyToToastId.delete(msg.key)
    }
    const id = toast[type](msg.content, duration)
    if (duration === 0) keyToToastId.set(msg.key, id)
    return id
  }
  return toast[type](msg.content, duration)
}

export const message = {
  success: (msg: MessageArgs) => handle(msg, 'success'),
  error: (msg: MessageArgs) => handle(msg, 'error'),
  warning: (msg: MessageArgs) => handle(msg, 'warning'),
  warn: (msg: MessageArgs) => handle(msg, 'warning'),
  info: (msg: MessageArgs) => handle(msg, 'info'),
  loading: (msg: MessageArgs) => handle(msg, 'info'),
  open: (opts: { content: string; type?: string; duration?: number }) => {
    const type = (opts.type || 'info') as 'success' | 'error' | 'warning' | 'info'
    const duration = opts.duration != null ? opts.duration * 1000 : undefined
    return toast[type](opts.content, duration)
  },
  destroy: (key?: string) => {
    if (!key) return
    const id = keyToToastId.get(key)
    if (id == null) return
    toast.dismiss(id)
    keyToToastId.delete(key)
  },
  // 兼容 ant-design-vue message.config（本实现为无操作）
  config: (_opts: unknown) => {},
}

/**
 * 兼容 ant-design-vue Modal.confirm API 的 shadcn 实现
 */
export const Modal = {
  confirm: (opts: {
    title?: string
    content?: string
    okText?: string
    cancelText?: string
    onOk?: () => void
    onCancel?: () => void
    centered?: boolean
    icon?: any
  }) => {
    confirm({
      title: opts.title || '提示',
      description: opts.content,
      okText: opts.okText as string,
      cancelText: opts.cancelText as string,
    }).then((ok) => {
      if (ok) opts.onOk?.()
      else opts.onCancel?.()
    })
  },
  destroyAll: () => {},
}

/**
 * 项目内已有的 confirm 封装，返回 Promise<boolean>
 */
export const s1Confirm = (opt: any = {}) => {
  return confirm({
    title: '提示',
    okText: '确定',
    cancelText: '取消',
    ...opt,
  })
}
