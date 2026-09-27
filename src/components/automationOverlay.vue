<template>
  <div v-if="isAutomationRunning" class="automation-overlay">
    <div class="automation-content">
      <!-- 关闭按钮 -->
      <div class="close-button" @click="handleClose">
        <Close class="w-4 h-4" />
      </div>
      
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <div class="automation-message">
        <h3>自动化操作进行中</h3>
        <p class="description">{{ automationDescription || '请稍候，正在处理您的请求...' }}</p>
        <div class="warning-box">
          <AlertTriangle class="warning-icon w-4 h-4" />
          <span>请勿关闭页面，以免操作中断</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isAutomationRunning, automationDescription } from '@/store/stores/app';
import { stopAutomation } from '@/common/utils/automation';
import { X as Close, AlertTriangle as Warning } from 'lucide-vue-next';

function handleClose() {
  stopAutomation();
}
</script>

<style scoped lang="less">
.automation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}

.automation-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  padding: 48px 40px;
  text-align: center;
  max-width: 420px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  animation: slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--1s-text-color-secondary);
  
  &:hover {
    background: rgba(0, 0, 0, 0.2);
    color: var(--1s-text-color);
    transform: scale(1.1);
  }
}

.loading-spinner {
  margin-bottom: 32px;
}

.spinner {
  width: 56px;
  height: 56px;
  border: 3px solid #f0f0f0;
  border-top: 3px solid #409eff;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.automation-message {
  h3 {
    margin: 0 0 16px 0;
    color: #2c3e50;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .description {
    margin: 0 0 24px 0;
    color: #5a6c7d;
    font-size: 14px;
    line-height: 1.6;
    font-weight: 400;
  }

  .warning-box {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #fff5f5 0%, #fef0f0 100%);
    border-radius: 12px;
    border: 1px solid #fecaca;
    color: #dc2626;
    font-size: 13px;
    font-weight: 500;
    
    .warning-icon {
      font-size: 16px;
      color: #f87171;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
