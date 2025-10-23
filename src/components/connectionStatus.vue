<template>
  <div class="connection-status">
    <!-- 本地客户端状态 -->
    <!-- <el-tooltip
      :content="isLocalConnected ? '本地客户端已启动' : '本地客户端未启动'"
      placement="bottom"
    >
      <div class="status-item">
        <div
          class="status-dot"
          :class="{ 'connected': isLocalConnected, 'disconnected': !isLocalConnected }"
        />
        <span class="status-text" :class="{ 'connected': isLocalConnected, 'disconnected': !isLocalConnected }">
          {{ isLocalConnected ? '客户端已启动' : '客户端未启动' }}
        </span>
      </div>
    </el-tooltip> -->

    <!-- 远程服务状态 -->
    <el-tooltip
      :content="isRemoteConnected ? '远程服务已连接' : '远程服务未连接'"
      placement="bottom"
    >
      <div class="status-item">
        <div
          class="status-dot"
          :class="{ 'connected': isRemoteConnected, 'disconnected': !isRemoteConnected }"
        />
        <span class="status-text" :class="{ 'connected': isRemoteConnected, 'disconnected': !isRemoteConnected }">
          {{ isRemoteConnected ? '远程已连接' : '远程未连接' }}
        </span>
      </div>
    </el-tooltip>

    <!-- 管理系统状态 -->
    <el-tooltip
      :content="isAdminConnected ? '管理系统已连接' : '管理系统未连接'"
      placement="bottom"
    >
      <div class="status-item">
        <div
          class="status-dot"
          :class="{ 'connected': isAdminConnected, 'disconnected': !isAdminConnected }"
        />
        <span class="status-text" :class="{ 'connected': isAdminConnected, 'disconnected': !isAdminConnected }">
          {{ isAdminConnected ? '管理系统已连接' : '管理系统未连接' }}
        </span>
      </div>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { 
  // isLocalConnected, 
  isRemoteConnected,
  isAdminConnected,
  startConnectionChecks,
  clearConnectionChecks
} from '@/store/stores/connectionStatus'

let timers: { localTimer: number, remoteTimer: number } | null = null

onMounted(() => {
  timers = startConnectionChecks()
})

onUnmounted(() => {
  if (timers) {
    clearConnectionChecks(timers)
  }
})
</script>

<style scoped lang="less">
.connection-status {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &.connected {
    background-color: #67C23A;
    box-shadow: 0 0 8px rgba(103, 194, 58, 0.5);
  }
  
  &.disconnected {
    background-color: #F56C6C;
    box-shadow: 0 0 8px rgba(245, 108, 108, 0.5);
  }
}

.status-text {
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  
  &.connected {
    color: #67C23A;
  }
  
  &.disconnected {
    color: #F56C6C;
  }
}
</style> 