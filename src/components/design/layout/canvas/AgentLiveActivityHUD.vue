<template>
  <div class="agent-canvas-hud-container" :class="{ 'has-active-agent': isVisible }">
    <!-- 画布外围边缘环境呼吸光晕 (外部 Agent 控制或自动生成时) -->
    <div
      v-if="remoteAgentState.active"
      class="canvas-ambient-glow canvas-ambient-glow--remote"
    />
    <div
      v-else-if="isStationBusy"
      class="canvas-ambient-glow canvas-ambient-glow--station"
    />

    <!-- 顶部中央浮动胶囊 HUD -->
    <transition name="hud-slide">
      <div v-if="isVisible" class="agent-canvas-hud">
        <!-- 分支 1: 外部 Agent (MCP / Claude / Codex) 操控中 -->
        <div v-if="remoteAgentState.active" class="hud-capsule hud-capsule--remote">
          <div class="hud-leading">
            <span class="hud-pulse-ring hud-pulse-ring--purple"></span>
            <span class="hud-icon">🤖</span>
            <span class="hud-title">外部 Agent 操控中</span>
            <span class="hud-badge hud-badge--purple">MCP</span>
          </div>

          <div class="hud-divider"></div>

          <div class="hud-body">
            <span class="hud-op-label">执行指令:</span>
            <code class="hud-op-code">{{ remoteAgentState.lastOp || 'canvas.eval' }}</code>
            <span class="hud-count-tag">#{{ remoteAgentState.totalOps }}步</span>
          </div>

          <div class="hud-status-text">
            {{ remoteAgentState.currentMessage }}
          </div>
        </div>

        <!-- 分支 2: 自动制作挂机工位正在创作 -->
        <div v-else-if="isStationBusy" class="hud-capsule hud-capsule--station">
          <div class="hud-leading">
            <span class="hud-pulse-ring hud-pulse-ring--emerald"></span>
            <span class="hud-spinner">⚙</span>
            <span class="hud-title">自动工位制作中</span>
            <span
              class="hud-badge"
              :class="stationState.currentJob?.type === 'rework' ? 'hud-badge--amber' : 'hud-badge--emerald'"
            >
              {{ stationState.currentJob?.type === 'rework' ? '返工微调' : stationState.currentJob?.type === 'variant' ? '持续变体' : '新稿生产' }}
            </span>
          </div>

          <div class="hud-divider"></div>

          <div class="hud-body">
            <span class="hud-job-title" :title="stationState.currentJob?.inspiration?.title">
              {{ stationState.currentJob?.inspiration?.title || '新灵感' }}
            </span>
            <span class="hud-stage-text">
              {{ stationState.currentStage || 'AI 排版制作中...' }}
            </span>
          </div>

          <div class="hud-meta">
            <span class="hud-heartbeat" title="租约心跳倒计时">
              保活 {{ stationState.heartbeatRemaining }}s
            </span>
            <button
              type="button"
              class="hud-mini-btn"
              title="暂停自动挂机"
              @click="stopStation"
            >
              暂停
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { stationState, remoteAgentState, stopStation } from "@/ai/agent/auto-station";

const isStationBusy = computed(() => {
  return (
    stationState.enabled &&
    ["producing", "reworking", "saving", "claiming"].includes(stationState.status)
  );
});

const isVisible = computed(() => {
  return remoteAgentState.active || isStationBusy.value;
});
</script>

<style scoped>
.agent-canvas-hud-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 45;
  overflow: hidden;
}

/* ================= 画布外围科技环境光晕 ================= */
.canvas-ambient-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: all 0.5s ease;
}

.canvas-ambient-glow--remote {
  box-shadow: inset 0 0 24px rgba(168, 85, 247, 0.28), inset 0 0 4px rgba(168, 85, 247, 0.4);
  animation: glow-pulse-purple 3s ease-in-out infinite;
}

.canvas-ambient-glow--station {
  box-shadow: inset 0 0 20px rgba(16, 185, 129, 0.2), inset 0 0 3px rgba(16, 185, 129, 0.35);
  animation: glow-pulse-emerald 3.5s ease-in-out infinite;
}

@keyframes glow-pulse-purple {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes glow-pulse-emerald {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.9; }
}

/* ================= 浮动胶囊 HUD ================= */
.agent-canvas-hud {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: auto;
  user-select: none;
}

.hud-capsule {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 12px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 外部 Agent 样式 */
.hud-capsule--remote {
  background: rgba(24, 20, 36, 0.88);
  border: 1px solid rgba(168, 85, 247, 0.45);
  color: #f3e8ff;
  box-shadow: 0 8px 24px -4px rgba(147, 51, 234, 0.3), 0 0 0 1px rgba(168, 85, 247, 0.2);
}

/* 自动工位挂机样式 */
.hud-capsule--station {
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #f8fafc;
  box-shadow: 0 8px 24px -4px rgba(16, 185, 129, 0.25), 0 0 0 1px rgba(16, 185, 129, 0.15);
}

.hud-leading {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.hud-pulse-ring {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.hud-pulse-ring--purple {
  background: #a855f7;
  box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7);
  animation: pulse-ring-purple 1.6s infinite;
}

.hud-pulse-ring--emerald {
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse-ring-emerald 1.6s infinite;
}

@keyframes pulse-ring-purple {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(168, 85, 247, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
}

@keyframes pulse-ring-emerald {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.hud-spinner {
  display: inline-block;
  animation: spin-slow 2s linear infinite;
  color: #34d399;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.hud-title {
  font-size: 12px;
  white-space: nowrap;
}

.hud-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 9999px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.hud-badge--purple {
  background: rgba(168, 85, 247, 0.25);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.35);
}

.hud-badge--emerald {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.hud-badge--amber {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.hud-divider {
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.15);
}

.hud-body {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.hud-op-label {
  color: rgba(255, 255, 255, 0.6);
}

.hud-op-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background: rgba(255, 255, 255, 0.1);
  padding: 1px 5px;
  border-radius: 4px;
  color: #e9d5ff;
  font-size: 11px;
}

.hud-count-tag {
  color: #a855f7;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-weight: 600;
  font-size: 11px;
}

.hud-status-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hud-job-title {
  font-weight: 600;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #e2e8f0;
}

.hud-stage-text {
  color: #94a3b8;
  font-size: 11px;
}

.hud-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.hud-heartbeat {
  color: #64748b;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 10px;
}

.hud-mini-btn {
  padding: 1px 8px;
  border-radius: 9999px;
  font-size: 10px;
  background: rgba(244, 63, 94, 0.2);
  color: #fb7185;
  border: 1px solid rgba(244, 63, 94, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
}

.hud-mini-btn:hover {
  background: rgba(244, 63, 94, 0.35);
}

/* ================= 动画过渡 ================= */
.hud-slide-enter-active,
.hud-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.hud-slide-enter-from,
.hud-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -12px) scale(0.95);
}
</style>
