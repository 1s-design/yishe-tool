/**
 * 轻量指令，替代 element-plus 的 v-loading / v-infinite-scroll，
 * 便于整体移除 element-plus 依赖。
 */
import type { App, Directive, DirectiveBinding } from 'vue'

interface LoadingEl extends HTMLElement {
  __s1LoadingOverlay?: HTMLElement | null
}

const loadingDirective: Directive<LoadingEl, boolean> = {
  mounted(el, binding) {
    updateLoading(el, binding.value)
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      updateLoading(el, binding.value)
    }
  },
  unmounted(el) {
    removeLoading(el)
  },
}

function updateLoading(el: LoadingEl, loading: boolean) {
  if (loading) {
    if (el.__s1LoadingOverlay) return
    const overlay = document.createElement('div')
    overlay.className = 's1-loading-overlay'
    overlay.innerHTML = '<div class="s1-loading-spinner"></div>'
    overlay.setAttribute('aria-busy', 'true')
    const style = getComputedStyle(el)
    if (style.position === 'static') {
      el.style.position = 'relative'
    }
    el.appendChild(overlay)
    el.__s1LoadingOverlay = overlay
    el.classList.add('s1-is-loading')
  } else {
    removeLoading(el)
  }
}

function removeLoading(el: LoadingEl) {
  el.__s1LoadingOverlay?.remove()
  el.__s1LoadingOverlay = null
  el.classList.remove('s1-is-loading')
}

interface InfiniteScrollEl extends HTMLElement {
  __s1InfiniteScroll?: {
    onScroll: () => void
    disabled: boolean
  }
}

const infiniteScrollDirective: Directive<InfiniteScrollEl, () => void> = {
  mounted(el, binding) {
    if (typeof binding.value !== 'function') return
    let pending = false
    const distance = Number(el.getAttribute('infinite-scroll-distance') || 150)
    const onScroll = () => {
      if (pending) return
      const threshold = el.scrollTop + el.clientHeight >= el.scrollHeight - distance
      if (threshold) {
        pending = true
        Promise.resolve(binding.value()).finally(() => {
          pending = false
        })
      }
    }
    el.__s1InfiniteScroll = { onScroll, disabled: false }
    el.addEventListener('scroll', onScroll, { passive: true })
    // 初始触发一次，兼容旧 el-infinite-scroll 的首屏加载
    onScroll()
  },
  updated(el, binding) {
    const state = el.__s1InfiniteScroll
    if (!state || typeof binding.value !== 'function') return
    // 依赖 binding.value 的闭包保持最新：用 wrapper 重新取值
    const onScroll = () => {
      const distance = Number(el.getAttribute('infinite-scroll-distance') || 150)
      const threshold = el.scrollTop + el.clientHeight >= el.scrollHeight - distance
      if (threshold) {
        el.removeEventListener('scroll', state.onScroll)
        const next = () => {
          el.addEventListener('scroll', state.onScroll, { passive: true })
        }
        Promise.resolve(binding.value()).finally(next)
      }
    }
    el.removeEventListener('scroll', state.onScroll)
    state.onScroll = onScroll
    el.addEventListener('scroll', onScroll, { passive: true })
  },
  unmounted(el) {
    const state = el.__s1InfiniteScroll
    if (state) {
      el.removeEventListener('scroll', state.onScroll)
      delete el.__s1InfiniteScroll
    }
  },
}

export const lightDirectivesPlugin = {
  install(app: App) {
    app.directive('loading', loadingDirective)
    app.directive('infinite-scroll', infiniteScrollDirective)
  },
}
