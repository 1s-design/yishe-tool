/**
 * 安全版 useLocalStorage 封装。
 *
 * localStorage 只有约 5MB 配额；画布状态（canvasStickerOptions）、
 * AI 对话记录等大对象叠加若干工作区后很容易触发 QuotaExceededError，
 * 而 @vueuse/core 的 useLocalStorage 默认直接把异常抛出，导致整个 pinia
 * store 的 setup 失败、应用半瘫。
 *
 * 这里用 onError 吞掉配额异常：读失败回退默认值，写失败静默跳过（不影响运行），
 * 并打印 warning 便于排查。同时暴露 `isQuotaExceeded()` 给业务层做降级提示。
 */
import { useLocalStorage as useVueLocalStorage } from '@vueuse/core'

let _quotaExceeded = false

const isQuotaError = (e: unknown): boolean => {
  if (!e) return false
  if (typeof DOMException !== 'undefined' && e instanceof DOMException) {
    return e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
  }
  const msg = String((e as any)?.message || (e as any)?.name || '')
  return /quota/i.test(msg) || /exceeded/i.test(msg)
}

export function useLocalStorage<T>(key: string, defaultValue: T, storage?: Storage) {
  return useVueLocalStorage<T>(key, defaultValue, {
    storage,
    onError: (e) => {
      if (isQuotaError(e)) {
        if (!_quotaExceeded) {
          _quotaExceeded = true
          console.warn(
            '[storage] localStorage 配额已用尽，写入将被跳过。可清理浏览器站点数据或访问过的工作区来释放空间。',
          )
        }
      } else {
        console.warn('[storage] useLocalStorage 发生异常:', key, e)
      }
    },
  })
}

export const isQuotaExceeded = () => _quotaExceeded

/** 粗略估算当前 localStorage 用量（kb），用于 debug 或降级提示。 */
export function estimateStorageUsage(): number {
  try {
    let total = 0
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || ''
      const v = localStorage.getItem(k) || ''
      total += k.length + v.length
    }
    return Math.round((total * 2) / 1024)
  } catch {
    return 0
  }
}
