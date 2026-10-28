<template>
  <div class="agent-live-hud-root">
    <!-- ================= 全局视口科技边框 (全屏高亮覆盖层) ================= -->
    <transition name="fade-border">
      <div
        v-if="isVisible"
        class="global-screen-border"
        :class="{
          'global-screen-border--remote': remoteAgentState.active,
          'global-screen-border--station': !remoteAgentState.active && isStationBusy,
          'is-executing': remoteAgentState.isExecuting,
        }"
      >
        <!-- 边缘扫描激光线 (正在执行指令时循环跑动) -->
        <div v-if="remoteAgentState.isExecuting" class="laser-scanner laser-scanner--top" />
        <div v-if="remoteAgentState.isExecuting" class="laser-scanner laser-scanner--bottom" />

        <!-- 四角 HUD 科技括号与状态标记 -->
        <div class="hud-corner hud-corner--tl">
          <div class="hud-corner-bracket"></div>
          <div class="hud-corner-tag">
            <span class="hud-dot hud-dot--pulse"></span>
            <span class="hud-tag-title">外部 AGENT 远程接管</span>
            <span class="hud-tag-sub">{{ remoteAgentState.caller }}</span>
          </div>
        </div>

        <div class="hud-corner hud-corner--tr">
          <div class="hud-corner-bracket"></div>
          <div class="hud-corner-tag text-right">
            <span class="hud-tag-title">WS 实时协议受控</span>
            <span class="hud-tag-sub font-mono">累计 #{{ remoteAgentState.totalOps }} 步</span>
          </div>
        </div>

        <div class="hud-corner hud-corner--bl">
          <div class="hud-corner-bracket"></div>
          <div class="hud-corner-tag">
            <span class="hud-tag-title font-mono">1S DESIGN ENGINE</span>
            <span class="hud-tag-sub">原生 Canvas 渲染链路</span>
          </div>
        </div>

        <div class="hud-corner hud-corner--br">
          <div class="hud-corner-bracket"></div>
          <div class="hud-corner-tag text-right">
            <span class="hud-tag-title font-mono">{{ remoteAgentState.lastOp || "READY" }}</span>
            <span class="hud-tag-sub font-mono">{{ remoteAgentState.lastOpDurationMs ? remoteAgentState.lastOpDurationMs + 'ms' : 'ONLINE' }}</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- ================= 顶部居中浮动灵动岛 HUD 胶囊 ================= -->
    <transition name="hud-slide">
      <div v-if="isVisible" class="agent-floating-island">
        <!-- 分支 1: 外部 Agent (MCP / Claude / Antigravity) 操控中 -->
        <div v-if="remoteAgentState.active" class="island-capsule island-capsule--remote">
          <!-- 左侧状态图标与身份 -->
          <div class="capsule-identity">
            <span
              class="pulse-indicator"
              :class="{ 'is-executing': remoteAgentState.isExecuting }"
            ></span>
            <span class="capsule-icon">🤖</span>
            <span class="capsule-caller">{{ remoteAgentState.caller }}</span>
            <span class="capsule-badge capsule-badge--purple">MCP</span>
          </div>

          <div class="capsule-divider"></div>

          <!-- 核心操作信息：中文标签 + 代码指令 + 详细参数摘要 -->
          <div class="capsule-action">
            <span class="action-icon">{{ currentOpIcon }}</span>
            <span class="action-label">{{ remoteAgentState.lastOpLabel || "设计操作" }}</span>
            <code class="action-code">{{ remoteAgentState.lastOp || "canvas.eval" }}</code>
            <span
              v-if="remoteAgentState.lastOpParamsSummary"
              class="action-param-pill"
              :title="remoteAgentState.lastOpParamsSummary"
            >
              {{ remoteAgentState.lastOpParamsSummary }}
            </span>
          </div>

          <div class="capsule-divider"></div>

          <!-- 右侧执行状态、耗时与步数 -->
          <div class="capsule-status-group">
            <!-- 执行中 vs 完成状态徽章 -->
            <span
              v-if="remoteAgentState.isExecuting"
              class="status-pill status-pill--executing"
            >
              <span class="mini-spinner">⚡</span> 执行中
            </span>
            <span
              v-else-if="remoteAgentState.recentOps[0]?.success"
              class="status-pill status-pill--success"
            >
              ✓ 成功 <template v-if="remoteAgentState.lastOpDurationMs">{{ remoteAgentState.lastOpDurationMs }}ms</template>
            </span>
            <span
              v-else-if="remoteAgentState.recentOps[0]?.success === false"
              class="status-pill status-pill--error"
            >
              ✕ 异常
            </span>

            <span class="step-tag font-mono">#{{ remoteAgentState.totalOps }}步</span>

            <!-- 展开操作详细链路抽屉 -->
            <button
              type="button"
              class="action-btn action-btn--toggle"
              :class="{ 'is-active': isDrawerOpen }"
              @click="isDrawerOpen = !isDrawerOpen"
              title="查看 Agent 完整操作记录与耗时"
            >
              <span>审计链路</span>
              <span class="badge-count">{{ remoteAgentState.recentOps.length }}</span>
              <span class="chevron">{{ isDrawerOpen ? '▲' : '▼' }}</span>
            </button>

            <!-- 主动收起 HUD 按钮 -->
            <button
              type="button"
              class="action-btn action-btn--close"
              @click="handleDismiss"
              title="收起 HUD"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- 分支 2: 自动制作挂机工位正在创作 -->
        <div v-else-if="isStationBusy" class="island-capsule island-capsule--station">
          <div class="capsule-identity">
            <span class="pulse-indicator pulse-indicator--emerald"></span>
            <span class="capsule-spinner">⚙</span>
            <span class="capsule-caller">自动挂机工位</span>
            <span
              class="capsule-badge"
              :class="stationState.currentJob?.type === 'rework' ? 'capsule-badge--amber' : 'capsule-badge--emerald'"
            >
              {{ stationState.currentJob?.type === 'rework' ? '返工微调' : stationState.currentJob?.type === 'variant' ? '持续变体' : '新稿生产' }}
            </span>
          </div>

          <div class="capsule-divider"></div>

          <div class="capsule-action">
            <span class="station-job-title" :title="stationState.currentJob?.inspiration?.title">
              {{ stationState.currentJob?.inspiration?.title || "新灵感" }}
            </span>
            <span class="station-stage-text">
              {{ stationState.currentStage || "AI 排版制作中..." }}
            </span>
          </div>

          <div class="capsule-divider"></div>

          <div class="capsule-status-group">
            <span class="station-heartbeat font-mono" title="租约心跳倒计时">
              保活 {{ stationState.heartbeatRemaining }}s
            </span>
            <button
              type="button"
              class="station-pause-btn"
              title="暂停自动挂机"
              @click="stopStation"
            >
              暂停
            </button>
          </div>
        </div>

        <!-- ================= 下拉展开的操作审计链路面板 ================= -->
        <transition name="drawer-drop">
          <div v-if="isDrawerOpen && remoteAgentState.recentOps.length > 0" class="audit-drawer">
            <div class="audit-drawer__header">
              <div class="audit-drawer__title">
                <span class="audit-icon">📋</span>
                <strong>Agent 操作审计追踪链路</strong>
                <span class="audit-count">共 {{ remoteAgentState.totalOps }} 次调用</span>
              </div>
              <div class="audit-drawer__actions">
                <button
                  type="button"
                  class="audit-btn audit-btn--clear"
                  @click="clearHistory"
                  title="清空当前链路记录"
                >
                  清空记录
                </button>
                <button
                  type="button"
                  class="audit-btn audit-btn--close"
                  @click="isDrawerOpen = false"
                >
                  收起面板
                </button>
              </div>
            </div>

            <div class="audit-drawer__list">
              <div
                v-for="(item, idx) in remoteAgentState.recentOps"
                :key="item.id"
                class="audit-item"
                :class="{ 'audit-item--error': !item.success }"
              >
                <div class="audit-item__step">
                  #{{ remoteAgentState.totalOps - idx }}
                </div>
                <div class="audit-item__time font-mono">
                  {{ item.time }}
                </div>
                <div class="audit-item__op">
                  <span class="audit-op-label">{{ item.opLabel || item.op }}</span>
                  <code class="audit-op-code">{{ item.op }}</code>
                </div>
                <div class="audit-item__param" :title="item.paramsSummary || item.message">
                  {{ item.paramsSummary || item.message || "无额外参数" }}
                </div>
                <div class="audit-item__duration font-mono">
                  {{ item.durationMs ? item.durationMs + 'ms' : '<1ms' }}
                </div>
                <div class="audit-item__status">
                  <span
                    class="status-tag"
                    :class="item.success ? 'status-tag--success' : 'status-tag--error'"
                  >
                    {{ item.success ? "成功" : "失败" }}
                  </span>
                </div>
              </div>
            </div>

            <div class="audit-drawer__footer">
              <span>● 1s 设计工具 WebSocket 直连通道正常 · 外部 Agent 原生接管已生效</span>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  stationState,
  remoteAgentState,
  stopStation,
  dismissRemoteAgentHUD,
  getOpFriendlyInfo,
} from "@/ai/agent/auto-station";

const isDrawerOpen = ref(false);

const isStationBusy = computed(() => {
  return (
    stationState.enabled &&
    ["producing", "reworking", "saving", "claiming"].includes(stationState.status)
  );
});

const isVisible = computed(() => {
  return remoteAgentState.active || isStationBusy.value;
});

const currentOpIcon = computed(() => {
  const info = getOpFriendlyInfo(remoteAgentState.lastOp);
  return info.icon || "⚡";
});

function handleDismiss() {
  isDrawerOpen.value = false;
  dismissRemoteAgentHUD();
}

function clearHistory() {
  remoteAgentState.recentOps = [];
  remoteAgentState.totalOps = 0;
  isDrawerOpen.value = false;
}
</script>

<style scoped>
.agent-live-hud-root {
  pointer-events: none;
  user-select: none;
}

/* ================= 全局视口科技边框 ================= */
.global-screen-border {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 99998;
  border-style: solid;
  border-width: 3px;
  box-sizing: border-box;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 外部 Agent 操控边框: 梦幻紫霓虹 + 环境光晕 */
.global-screen-border--remote {
  border-color: rgba(168, 85, 247, 0.85);
  box-shadow:
    inset 0 0 0 1px rgba(236, 72, 153, 0.4),
    inset 0 0 40px rgba(168, 85, 247, 0.3),
    0 0 20px rgba(168, 85, 247, 0.4);
}

.global-screen-border--remote.is-executing {
  border-color: #c084fc;
  box-shadow:
    inset 0 0 0 2px rgba(236, 72, 153, 0.7),
    inset 0 0 50px rgba(168, 85, 247, 0.45),
    0 0 30px rgba(168, 85, 247, 0.6);
  animation: border-breathe-purple 2.4s ease-in-out infinite;
}

/* 自动工位边框: 翡翠绿霓虹 */
.global-screen-border--station {
  border-color: rgba(16, 185, 129, 0.8);
  box-shadow:
    inset 0 0 0 1px rgba(52, 211, 153, 0.4),
    inset 0 0 35px rgba(16, 185, 129, 0.25),
    0 0 20px rgba(16, 185, 129, 0.35);
}

@keyframes border-breathe-purple {
  0%, 100% {
    opacity: 0.88;
    filter: brightness(1);
  }
  50% {
    opacity: 1;
    filter: brightness(1.2);
  }
}

/* 激光扫描线动画 */
.laser-scanner {
  position: absolute;
  height: 3px;
  width: 25vw;
  background: linear-gradient(90deg, transparent, #ec4899, #c084fc, #a855f7, transparent);
  filter: drop-shadow(0 0 8px #a855f7);
  animation: laser-sweep 2.8s linear infinite;
}

.laser-scanner--top {
  top: -3px;
  left: 0;
}

.laser-scanner--bottom {
  bottom: -3px;
  right: 0;
  animation-direction: reverse;
}

@keyframes laser-sweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(500%); }
}

/* 四角 HUD 科技括号 */
.hud-corner {
  position: absolute;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.hud-corner-bracket {
  width: 28px;
  height: 28px;
  border-color: rgba(216, 180, 254, 0.9);
  border-style: solid;
  border-width: 0;
}

.hud-corner--tl {
  top: 10px;
  left: 12px;
}
.hud-corner--tl .hud-corner-bracket {
  border-top-width: 3px;
  border-left-width: 3px;
}

.hud-corner--tr {
  top: 10px;
  right: 12px;
  align-items: flex-end;
}
.hud-corner--tr .hud-corner-bracket {
  border-top-width: 3px;
  border-right-width: 3px;
}

.hud-corner--bl {
  bottom: 10px;
  left: 12px;
}
.hud-corner--bl .hud-corner-bracket {
  border-bottom-width: 3px;
  border-left-width: 3px;
}

.hud-corner--br {
  bottom: 10px;
  right: 12px;
  align-items: flex-end;
}
.hud-corner--br .hud-corner-bracket {
  border-bottom-width: 3px;
  border-right-width: 3px;
}

.hud-corner-tag {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.hud-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #a855f7;
  display: inline-block;
}

.hud-dot--pulse {
  animation: pulse-ring-purple 1.6s infinite;
}

.hud-tag-title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #f3e8ff;
  text-shadow: 0 0 6px rgba(168, 85, 247, 0.8);
  display: flex;
  align-items: center;
  gap: 5px;
}

.hud-tag-sub {
  font-size: 9px;
  color: rgba(233, 213, 255, 0.7);
  letter-spacing: 0.04em;
}

/* ================= 顶部居中浮动灵动岛 HUD 胶囊 ================= */
.agent-floating-island {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: auto;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.island-capsule {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 12px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow:
    0 16px 36px -4px rgba(0, 0, 0, 0.4),
    0 8px 16px -4px rgba(147, 51, 234, 0.25);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.island-capsule--remote {
  background: rgba(18, 14, 28, 0.92);
  border: 1px solid rgba(168, 85, 247, 0.55);
  color: #f3e8ff;
}

.island-capsule--station {
  background: rgba(12, 22, 24, 0.92);
  border: 1px solid rgba(16, 185, 129, 0.5);
  color: #f8fafc;
}

.capsule-identity {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.pulse-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #a855f7;
  box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.8);
  animation: pulse-ring-purple 1.6s infinite;
}

.pulse-indicator.is-executing {
  background: #ec4899;
  animation: pulse-ring-pink 1s infinite;
}

.pulse-indicator--emerald {
  background: #10b981;
  animation: pulse-ring-emerald 1.6s infinite;
}

@keyframes pulse-ring-purple {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.8); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 7px rgba(168, 85, 247, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
}

@keyframes pulse-ring-pink {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.8); }
  70% { transform: scale(1.15); box-shadow: 0 0 0 8px rgba(236, 72, 153, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(236, 72, 153, 0); }
}

@keyframes pulse-ring-emerald {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.8); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 7px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.capsule-icon {
  font-size: 13px;
}

.capsule-caller {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.capsule-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 9999px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.capsule-badge--purple {
  background: rgba(168, 85, 247, 0.25);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.4);
}

.capsule-badge--emerald {
  background: rgba(16, 185, 129, 0.25);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.4);
}

.capsule-badge--amber {
  background: rgba(245, 158, 11, 0.25);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.capsule-divider {
  width: 1px;
  height: 14px;
  background: rgba(255, 255, 255, 0.15);
}

.capsule-action {
  display: flex;
  align-items: center;
  gap: 7px;
}

.action-icon {
  font-size: 12px;
}

.action-label {
  font-weight: 600;
  color: #e9d5ff;
  font-size: 12px;
  white-space: nowrap;
}

.action-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  color: #c084fc;
  font-size: 11px;
  border: 1px solid rgba(168, 85, 247, 0.25);
}

.action-param-pill {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 7px;
  border-radius: 4px;
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.capsule-status-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 9999px;
  white-space: nowrap;
}

.status-pill--executing {
  background: rgba(236, 72, 153, 0.2);
  color: #f472b6;
  border: 1px solid rgba(236, 72, 153, 0.35);
}

.mini-spinner {
  display: inline-block;
  animation: pulse-ring-pink 0.8s infinite;
}

.status-pill--success {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.status-pill--error {
  background: rgba(244, 63, 94, 0.2);
  color: #fb7185;
  border: 1px solid rgba(244, 63, 94, 0.35);
}

.step-tag {
  color: #a855f7;
  font-weight: 700;
  font-size: 11px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  color: rgba(255, 255, 255, 0.8);
  padding: 2px 8px;
  font-size: 11px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(168, 85, 247, 0.3);
  color: #f3e8ff;
  border-color: rgba(168, 85, 247, 0.5);
}

.action-btn--toggle.is-active {
  background: rgba(168, 85, 247, 0.35);
  color: #ffffff;
  border-color: #a855f7;
}

.badge-count {
  background: rgba(168, 85, 247, 0.45);
  color: #ffffff;
  font-size: 9px;
  padding: 0 4px;
  border-radius: 9999px;
  font-weight: 700;
}

.chevron {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.6);
}

.action-btn--close {
  padding: 2px 6px;
  color: rgba(255, 255, 255, 0.4);
}
.action-btn--close:hover {
  color: #fb7185;
  background: rgba(244, 63, 94, 0.2);
  border-color: rgba(244, 63, 94, 0.4);
}

/* 挂机工位专用元素 */
.capsule-spinner {
  display: inline-block;
  animation: spin-slow 2s linear infinite;
  color: #34d399;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.station-job-title {
  font-weight: 600;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #e2e8f0;
}

.station-stage-text {
  color: #94a3b8;
  font-size: 11px;
}

.station-heartbeat {
  color: #64748b;
  font-size: 10px;
}

.station-pause-btn {
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 10px;
  background: rgba(244, 63, 94, 0.2);
  color: #fb7185;
  border: 1px solid rgba(244, 63, 94, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
}

.station-pause-btn:hover {
  background: rgba(244, 63, 94, 0.35);
}

/* ================= 展开的操作审计链路面板 ================= */
.audit-drawer {
  margin-top: 10px;
  width: 620px;
  max-height: 400px;
  background: rgba(18, 14, 28, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(168, 85, 247, 0.45);
  border-radius: 14px;
  box-shadow:
    0 20px 45px -10px rgba(0, 0, 0, 0.6),
    0 0 25px rgba(168, 85, 247, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #f3e8ff;
}

.audit-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.audit-drawer__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.audit-count {
  font-size: 11px;
  color: #c084fc;
  background: rgba(168, 85, 247, 0.2);
  padding: 1px 7px;
  border-radius: 9999px;
}

.audit-drawer__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.audit-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  padding: 2px 8px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.audit-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.audit-btn--clear:hover {
  border-color: #fb7185;
  color: #fb7185;
}

.audit-drawer__list {
  padding: 8px 12px;
  overflow-y: auto;
  max-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.audit-item {
  display: grid;
  grid-template-columns: 42px 64px 180px 1fr 55px 44px;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 11px;
  transition: background 0.15s ease;
}

.audit-item:hover {
  background: rgba(168, 85, 247, 0.12);
  border-color: rgba(168, 85, 247, 0.25);
}

.audit-item--error {
  background: rgba(244, 63, 94, 0.08);
  border-color: rgba(244, 63, 94, 0.25);
}

.audit-item__step {
  color: #a855f7;
  font-weight: 700;
  font-size: 10px;
}

.audit-item__time {
  color: rgba(255, 255, 255, 0.45);
  font-size: 10px;
}

.audit-item__op {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.audit-op-label {
  font-weight: 600;
  color: #e9d5ff;
}

.audit-op-code {
  font-size: 10px;
  color: rgba(192, 132, 252, 0.8);
}

.audit-item__param {
  color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audit-item__duration {
  color: rgba(255, 255, 255, 0.5);
  font-size: 10px;
  text-align: right;
}

.status-tag {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 4px;
  font-weight: 600;
}

.status-tag--success {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.status-tag--error {
  background: rgba(244, 63, 94, 0.2);
  color: #fb7185;
}

.audit-drawer__footer {
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
}

/* ================= 动画过渡 ================= */
.fade-border-enter-active,
.fade-border-leave-active {
  transition: opacity 0.4s ease;
}
.fade-border-enter-from,
.fade-border-leave-to {
  opacity: 0;
}

.hud-slide-enter-active,
.hud-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.hud-slide-enter-from,
.hud-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -16px) scale(0.95);
}

.drawer-drop-enter-active,
.drawer-drop-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-drop-enter-from,
.drawer-drop-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
