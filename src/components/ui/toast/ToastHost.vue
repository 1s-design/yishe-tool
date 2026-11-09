<template>
  <Teleport to="body">
    <TransitionGroup
      tag="div"
      name="toast"
      class="toast-host fixed top-4 right-4 flex flex-col items-end gap-2"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast-card pointer-events-auto group relative flex w-[320px] max-w-[calc(100vw-32px)] items-center gap-2.5 overflow-hidden rounded-lg border py-2.5 pl-3 pr-2 shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-md"
        :data-type="t.type"
      >
        <span class="toast-accent" aria-hidden="true" />
        <span class="toast-icon flex h-4 w-4 shrink-0 items-center justify-center">
          <Loader2 v-if="t.type === 'info' && t.duration === 0" class="h-4 w-4 animate-spin" />
          <CheckCircle2 v-else-if="t.type === 'success'" class="h-4 w-4" />
          <AlertCircle v-else-if="t.type === 'error'" class="h-4 w-4" />
          <AlertTriangle v-else-if="t.type === 'warning'" class="h-4 w-4" />
          <Info v-else class="h-4 w-4" />
        </span>
        <div class="min-w-0 flex-1">
          <p v-if="t.title" class="text-xs font-semibold leading-5" style="color: var(--1s-menu-text)">
            {{ t.title }}
          </p>
          <p class="text-xs leading-5 break-words" style="color: var(--1s-menu-text)">
            {{ t.message }}
          </p>
        </div>
        <button
          class="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-40 transition-opacity hover:opacity-100"
          style="color: var(--1s-menu-text-secondary)"
          aria-label="关闭"
          @click="remove(t.id)"
        >
          <X class="h-3.5 w-3.5" />
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, Loader2 } from 'lucide-vue-next'
import { toasts, remove } from './toast'
</script>

<style scoped>
/* 必须高于全屏编辑器(z-50)、用户菜单与遮罩(z-[1000])，确保任何弹层之上都可见 */
.toast-host {
  z-index: 100000;
  pointer-events: none;
}

.toast-card {
  background-color: color-mix(in srgb, var(--1s-menu-background) 92%, transparent);
  border-color: var(--1s-menu-border);
  color: var(--1s-menu-text);
}

/* 左侧类型色条 */
.toast-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #7cc4f8;
}
.toast-card[data-type='success'] .toast-accent { background: #4ade80; }
.toast-card[data-type='error'] .toast-accent { background: #f87171; }
.toast-card[data-type='warning'] .toast-accent { background: #facc15; }

.toast-icon { color: #7cc4f8; }
.toast-card[data-type='success'] .toast-icon { color: #4ade80; }
.toast-card[data-type='error'] .toast-icon { color: #f87171; }
.toast-card[data-type='warning'] .toast-icon { color: #facc15; }

/* 进入 / 离开动画 */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
.toast-move {
  transition: transform 0.22s ease;
}
</style>
