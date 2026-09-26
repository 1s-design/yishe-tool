<template>
  <Dialog :open="showLoginFormModal" @update:open="showLoginFormModal = $event">
    <DialogContent class="max-w-[380px] p-6 gap-0">
      <VisuallyHidden>
        <DialogTitle>登录</DialogTitle>
        <DialogDescription>输入账号和密码登录 1s design tool</DialogDescription>
      </VisuallyHidden>
      <password-login />
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { showLoginFormModal } from '@/modules/main/view/user/login/index.tsx'
import passwordLogin from './passwordLogin.vue'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { VisuallyHidden } from 'radix-vue'
</script>
