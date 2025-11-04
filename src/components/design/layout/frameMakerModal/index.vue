<template>
  <Transition name="frame-maker-modal">
    <div v-if="isOpen" class="frame-maker-modal-overlay" @click.self="handleClose">
      <div class="frame-maker-modal-container">
        <div class="frame-maker-modal-body">
          <div class="frame-maker-close-btn-wrapper">
            <el-button 
              text 
              type="primary" 
              @click="handleClose"
              class="frame-maker-close-btn"
              circle
            >
              <el-icon><Close></Close></el-icon>
            </el-button>
          </div>
          <KeepAlive>
            <frameMaker v-if="isOpen"></frameMaker>
          </KeepAlive>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, onUnmounted } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { showFrameMakerModal } from '../../store'
import frameMaker from './frameMaker.vue'

const isOpen = computed({
  get: () => showFrameMakerModal.value,
  set: (val) => {
    showFrameMakerModal.value = val
  }
})

function handleClose() {
  showFrameMakerModal.value = false
}

// 监听 ESC 键关闭
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && isOpen.value) {
    handleClose()
  }
}

if (typeof window !== 'undefined') {
  document.addEventListener('keydown', handleKeyDown)
  
  // 组件卸载时移除监听器
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
}
</script>

<style lang="less" scoped>
.frame-maker-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  z-index: 10000;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  overflow: hidden;
}

.frame-maker-modal-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.frame-maker-modal-body {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
}

.frame-maker-close-btn-wrapper {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
}

.frame-maker-close-btn {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

// 动画效果
.frame-maker-modal-enter-active,
.frame-maker-modal-leave-active {
  transition: opacity 0.3s ease;
}

.frame-maker-modal-enter-active .frame-maker-modal-container,
.frame-maker-modal-leave-active .frame-maker-modal-container {
  transition: transform 0.3s ease;
}

.frame-maker-modal-enter-from {
  opacity: 0;
  
  .frame-maker-modal-container {
    transform: scale(0.95);
  }
}

.frame-maker-modal-leave-to {
  opacity: 0;
  
  .frame-maker-modal-container {
    transform: scale(0.95);
  }
}
</style>

