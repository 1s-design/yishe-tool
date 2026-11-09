import { reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default'

export interface ToastItem {
  id: number
  message: string
  title?: string
  type: ToastType
  duration: number
}

export const toasts = reactive<ToastItem[]>([])

let _id = 0

function push(message: string, type: ToastType = 'default', duration = 3000) {
  const id = ++_id
  toasts.push({ id, message, type, duration })
  if (duration > 0) {
    setTimeout(() => remove(id), duration)
  }
  return id
}

export function update(id: number, patch: Partial<Pick<ToastItem, 'message' | 'title' | 'type'>>) {
  const item = toasts.find(t => t.id === id)
  if (!item) return
  if (patch.message !== undefined) item.message = patch.message
  if (patch.title !== undefined) item.title = patch.title
  if (patch.type !== undefined) item.type = patch.type
}

export function remove(id: number) {
  const idx = toasts.findIndex(t => t.id === id)
  if (idx !== -1) toasts.splice(idx, 1)
}

export const toast = {
  success: (msg: string, duration?: number) => push(msg, 'success', duration),
  error: (msg: string, duration?: number) => push(msg, 'error', duration ?? 4000),
  warning: (msg: string, duration?: number) => push(msg, 'warning', duration ?? 4000),
  info: (msg: string, duration?: number) => push(msg, 'info', duration),
  default: (msg: string, duration?: number) => push(msg, 'default', duration),
  /** 常驻进度提示，返回 id，配合 update 更新文案、dismiss 关闭 */
  loading: (msg: string) => push(msg, 'info', 0),
  update,
  dismiss: remove,
}

export default toast
