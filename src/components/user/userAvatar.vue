<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button
        class="user-avatar-trigger inline-flex items-center justify-center h-7 w-7 min-w-[28px] max-w-[28px] shrink-0 p-0 m-0 border-0 outline-none rounded-full overflow-hidden select-none cursor-pointer"
        aria-label="用户菜单"
      >
        <Avatar class="h-7 w-7 min-w-[28px] max-w-[28px] shrink-0 aspect-square rounded-full border border-border/80 shadow-xs hover:opacity-90 transition-opacity">
          <AvatarImage :src="avatar" alt="用户头像" class="h-full w-full object-cover" />
          <AvatarFallback class="text-[10px] font-semibold bg-primary text-primary-foreground">
            {{ initials }}
          </AvatarFallback>
        </Avatar>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      class="user-dropdown-content w-60 p-2 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 z-[1000]"
      :side-offset="8"
    >
      <!-- User info card -->
      <div class="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 mb-1.5 border border-zinc-200/60 dark:border-zinc-700/50">
        <Avatar class="h-9 w-9 shrink-0 ring-1 ring-border shadow-xs">
          <AvatarImage :src="avatar" />
          <AvatarFallback class="text-xs font-bold bg-primary text-primary-foreground">
            {{ initials }}
          </AvatarFallback>
        </Avatar>
        <div class="flex flex-col min-w-0">
          <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {{ userInfo.name || userInfo.account || '用户' }}
          </span>
          <span class="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
            {{ userInfo.company?.name || '个人空间' }}
          </span>
        </div>
      </div>

      <DropdownMenuSeparator class="my-1 bg-zinc-200 dark:bg-zinc-800" />

      <DropdownMenuItem
        class="gap-2.5 text-xs py-2 px-2.5 rounded-lg cursor-pointer text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800 transition-colors font-medium"
        @click="goTool"
      >
        <LayoutDashboard class="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        <span>进入设计工具</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator class="my-1 bg-zinc-200 dark:bg-zinc-800" />

      <DropdownMenuItem
        class="gap-2.5 text-xs py-2 px-2.5 rounded-lg cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 focus:bg-red-50 dark:focus:bg-red-950/40 transition-colors font-medium"
        @click="handleLogout"
      >
        <LogOut class="h-4 w-4" />
        <span>退出登录</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginStatusStore } from '@/store/stores/login'
import { doLogout } from '@/store/stores/loginAction'
import Utils from '@/common/utils'
import { Modal } from '@/common/message'
import { LayoutDashboard, LogOut } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'

const router = useRouter()
const loginStore = useLoginStatusStore()

const avatar = computed(() => loginStore.userInfo?.avatar || Utils.const.defaultUserAvatarPC)
const userInfo = computed(() => loginStore.userInfo || {})
const initials = computed(() => {
  const name = userInfo.value?.name || userInfo.value?.account || '?'
  return name.slice(0, 2).toUpperCase()
})

function goTool() {
  router.push({ name: 'Design' })
}

async function handleLogout() {
  await Modal.confirm({
    cancelText: '取消',
    okText: '确定',
    content: '确认要退出吗？',
    onOk: () => {
      doLogout()
      router.replace({ name: 'Design' })
    },
  })
}
</script>

<style scoped>
.user-avatar-trigger {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  max-width: 28px !important;
  min-height: 28px !important;
  max-height: 28px !important;
  flex-shrink: 0 !important;
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
  outline: none !important;
  box-shadow: none !important;
  border-radius: 50% !important;
  box-sizing: border-box !important;
  /* 防止 data-state 变化时宽度跳动 */
  contain: size !important;
}

.user-avatar-trigger:focus,
.user-avatar-trigger:focus-visible,
.user-avatar-trigger[data-state="open"],
.user-avatar-trigger[data-state="closed"] {
  outline: none !important;
  box-shadow: none !important;
  width: 28px !important;
  min-width: 28px !important;
  max-width: 28px !important;
}
</style>

<style>
/* 确保下拉菜单 Portal 挂载到 body 上时拥有实体纯色背景 */
.user-dropdown-content,
[data-radix-dropdown-menu-content] {
  background-color: var(--1s-surface-background) !important;
  color: var(--1s-text-color) !important;
  opacity: 1 !important;
  border-color: var(--1s-border-color) !important;
  box-shadow: var(--1s-shadow-lg) !important;
}

.dark .user-dropdown-content,
.dark [data-radix-dropdown-menu-content] {
  background-color: var(--1s-surface-background) !important;
  color: var(--1s-text-color) !important;
  border-color: var(--1s-border-color) !important;
  box-shadow: var(--1s-shadow-lg) !important;
}
</style>
