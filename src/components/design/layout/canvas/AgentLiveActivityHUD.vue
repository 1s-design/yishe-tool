<template>
  <div class="agent-live-hud-root">
    <!-- ================= 全局视口极简扁平高质感边框 ================= -->
    <transition name="fade-border">
      <div
        v-if="isVisible"
        class="global-screen-border"
        :class="{
          'global-screen-border--remote': remoteAgentState.active,
          'global-screen-border--station': !remoteAgentState.active && isStationBusy,
        }"
      >
        <!-- 四角极简精细发丝角标 (无多余文字换行) -->
        <div class="hud-corner-mark hud-corner-mark--tl"></div>
        <div class="hud-corner-mark hud-corner-mark--tr"></div>
        <div class="hud-corner-mark hud-corner-mark--bl"></div>
        <div class="hud-corner-mark hud-corner-mark--br"></div>

        <!-- 极简扁平视口微标记 (单行无折行) -->
        <div class="viewport-micro-badge viewport-micro-badge--tl">
          <span class="micro-dot" :class="{ 'is-active': remoteAgentState.isExecuting }"></span>
          <span class="micro-text font-mono">AGENT SESSION ACTIVE</span>
        </div>

        <div class="viewport-micro-badge viewport-micro-badge--tr">
          <span class="micro-text font-mono">1S ENGINE · LIVE SYNC</span>
        </div>
      </div>
    </transition>

    <!-- ================= 顶部居中扁平质感灵动胶囊 HUD ================= -->
    <transition name="hud-slide">
      <div v-if="isVisible" class="agent-floating-island">
        <!-- 分支 1: 外部 Agent (MCP / Antigravity) 操控 -->
        <div v-if="remoteAgentState.active" class="flat-capsule flat-capsule--remote">
          <!-- 身份指示 -->
          <div class="flat-capsule__cell flat-capsule__identity">
            <span
              class="state-dot state-dot--purple"
              :class="{ 'is-pulsing': remoteAgentState.isExecuting }"
            ></span>
            <span class="identity-name">{{ remoteAgentState.caller || '外部 Agent' }}</span>
          </div>

          <div class="flat-capsule__divider"></div>

          <!-- 动作与指令 -->
          <div class="flat-capsule__cell flat-capsule__action">
            <span class="action-title">{{ remoteAgentState.lastOpLabel || '设计操作' }}</span>
            <code class="action-code font-mono">{{ remoteAgentState.lastOp || 'canvas.eval' }}</code>
            <span
              v-if="remoteAgentState.lastOpParamsSummary"
              class="action-param-pill"
              :title="remoteAgentState.lastOpParamsSummary"
            >
              {{ remoteAgentState.lastOpParamsSummary }}
            </span>
          </div>

          <div class="flat-capsule__divider"></div>

          <!-- 状态徽章与步数 -->
          <div class="flat-capsule__cell flat-capsule__status-group">
            <span
              v-if="remoteAgentState.isExecuting"
              class="flat-badge flat-badge--executing"
            >
              <span class="mini-spinner"></span>
              执行中
            </span>
            <span
              v-else-if="remoteAgentState.recentOps[0]?.success"
              class="flat-badge flat-badge--success"
            >
              ✓ 成功
              <template v-if="remoteAgentState.lastOpDurationMs">
                {{ remoteAgentState.lastOpDurationMs }}ms
              </template>
            </span>
            <span
              v-else-if="remoteAgentState.recentOps[0]?.success === false"
              class="flat-badge flat-badge--error"
            >
              ✕ 异常
            </span>

            <span class="step-counter font-mono">#{{ remoteAgentState.totalOps }}步</span>

            <!-- 展开链路抽屉按钮 -->
            <button
              type="button"
              class="flat-btn flat-btn--drawer"
              :class="{ 'is-active': isDrawerOpen }"
              @click="isDrawerOpen = !isDrawerOpen"
              title="查看执行链路详情"
            >
              <span>链路</span>
              <span class="flat-btn__count font-mono">{{ remoteAgentState.recentOps.length }}</span>
              <span class="flat-btn__arrow">{{ isDrawerOpen ? '▲' : '▼' }}</span>
            </button>

            <!-- 关闭 HUD -->
            <button
              type="button"
              class="flat-btn flat-btn--close"
              @click="handleDismiss"
              title="收起 HUD"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- 分支 2: 自动挂机工位 -->
        <div v-else-if="isStationBusy" class="flat-capsule flat-capsule--station">
          <div class="flat-capsule__cell flat-capsule__identity">
            <span class="state-dot state-dot--emerald is-pulsing"></span>
            <span class="identity-name">自动工位</span>
            <span class="station-mode-tag">
              {{ stationState.currentJob?.type === 'rework' ? '返工微调' : '批量生产' }}
            </span>
          </div>

          <div class="flat-capsule__divider"></div>

          <div class="flat-capsule__cell flat-capsule__action">
            <span class="station-job-title" :title="stationState.currentJob?.inspiration?.title">
              {{ stationState.currentJob?.inspiration?.title || "新灵感" }}
            </span>
            <span class="station-stage-desc">
              {{ stationState.currentStage || "制作中..." }}
            </span>
          </div>

          <div class="flat-capsule__divider"></div>

          <div class="flat-capsule__cell flat-capsule__status-group">
            <span class="station-hb-text font-mono">
              保活 {{ stationState.heartbeatRemaining }}s
            </span>
            <button
              type="button"
              class="flat-btn flat-btn--pause"
              @click="stopStation"
            >
              暂停
            </button>
          </div>
        </div>

        <!-- ================= 展开的高质感极简操作审计面板 ================= -->
        <transition name="drawer-drop">
          <div v-if="isDrawerOpen && remoteAgentState.recentOps.length > 0" class="flat-drawer">
            <div class="flat-drawer__header">
              <div class="flat-drawer__title">
                <span class="title-label">操作审计追踪</span>
                <span class="title-count font-mono">共 {{ remoteAgentState.totalOps }} 步</span>
              </div>
              <div class="flat-drawer__actions">
                <button
                  type="button"
                  class="flat-drawer__btn"
                  @click="clearHistory"
                >
                  清空
                </button>
                <button
                  type="button"
                  class="flat-drawer__btn flat-drawer__btn--primary"
                  @click="isDrawerOpen = false"
                >
                  收起
                </button>
              </div>
            </div>

            <div class="flat-drawer__table">
              <div class="flat-table__header font-mono">
                <span class="col-step">步数</span>
                <span class="col-time">时间</span>
                <span class="col-label">操作动作</span>
                <span class="col-code">API 指令</span>
                <span class="col-param">参数摘要</span>
                <span class="col-dur">耗时</span>
                <span class="col-status">状态</span>
              </div>

              <div class="flat-table__body">
                <div
                  v-for="(item, idx) in remoteAgentState.recentOps"
                  :key="item.id"
                  class="flat-table__row"
                  :class="{ 'is-error': !item.success }"
                >
                  <span class="col-step font-mono">#{{ remoteAgentState.totalOps - idx }}</span>
                  <span class="col-time font-mono">{{ item.time }}</span>
                  <span class="col-label">{{ item.opLabel || item.op }}</span>
                  <code class="col-code font-mono">{{ item.op }}</code>
                  <span class="col-param" :title="item.paramsSummary || item.message">
                    {{ item.paramsSummary || item.message || "无" }}
                  </span>
                  <span class="col-dur font-mono">
                    {{ item.durationMs ? item.durationMs + 'ms' : '<1ms' }}
                  </span>
                  <span class="col-status">
                    <span
                      class="row-status-pill"
                      :class="item.success ? 'is-success' : 'is-error'"
                    >
                      {{ item.success ? "成功" : "失败" }}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div class="flat-drawer__footer font-mono">
              <span>● WEBSOCKET REALTIME CHANNEL CONNECTED · 1S NATIVE CANVAS</span>
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

/* ================= 全局视口极简扁平高质感边框 ================= */
.global-screen-border {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 99998;
  border-style: solid;
  border-width: 1.5px;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

/* 外部 Agent 操控边框: 哑光浅紫细线 + 微弱环境光 */
.global-screen-border--remote {
  border-color: rgba(168, 85, 247, 0.45);
  box-shadow: inset 0 0 24px rgba(168, 85, 247, 0.08);
}

/* 自动工位边框: 哑光翡翠绿细线 */
.global-screen-border--station {
  border-color: rgba(16, 185, 129, 0.45);
  box-shadow: inset 0 0 24px rgba(16, 185, 129, 0.08);
}

/* 四角极简精细发丝角标 */
.hud-corner-mark {
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: rgba(255, 255, 255, 0.4);
  border-style: solid;
  border-width: 0;
}

.hud-corner-mark--tl {
  top: 6px;
  left: 6px;
  border-top-width: 1.5px;
  border-left-width: 1.5px;
}

.hud-corner-mark--tr {
  top: 6px;
  right: 6px;
  border-top-width: 1.5px;
  border-right-width: 1.5px;
}

.hud-corner-mark--bl {
  bottom: 6px;
  left: 6px;
  border-bottom-width: 1.5px;
  border-left-width: 1.5px;
}

.hud-corner-mark--br {
  bottom: 6px;
  right: 6px;
  border-bottom-width: 1.5px;
  border-right-width: 1.5px;
}

/* 视口角部微标记：单行无折行 */
.viewport-micro-badge {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.viewport-micro-badge--tl {
  top: 10px;
  left: 24px;
}

.viewport-micro-badge--tr {
  top: 10px;
  right: 24px;
}

.micro-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #a855f7;
  opacity: 0.6;
}

.micro-dot.is-active {
  background: #c084fc;
  opacity: 1;
  box-shadow: 0 0 8px #c084fc;
}

/* ================= 顶部居中扁平质感灵动胶囊 HUD ================= */
.agent-floating-island {
  position: fixed;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: auto;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 扁平高质感胶囊体: 单行绝不折行 */
.flat-capsule {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  padding: 0 12px;
  border-radius: 9999px;
  background: rgba(18, 20, 26, 0.88);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.45);
  font-size: 12px;
  white-space: nowrap;
  flex-wrap: nowrap;
  box-sizing: border-box;
}

.flat-capsule--remote {
  border-color: rgba(168, 85, 247, 0.35);
}

.flat-capsule--station {
  border-color: rgba(16, 185, 129, 0.35);
}

.flat-capsule__cell {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  white-space: nowrap;
}

.flat-capsule__divider {
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
}

/* 状态圆点 */
.state-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.state-dot--purple {
  background: #a855f7;
}

.state-dot--emerald {
  background: #10b981;
}

.state-dot.is-pulsing {
  box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.8);
  animation: dot-breathe 1.5s infinite;
}

@keyframes dot-breathe {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.identity-name {
  font-weight: 600;
  color: #f8fafc;
  font-size: 12px;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

/* 动作指令描述 */
.action-title {
  font-weight: 500;
  color: #e2e8f0;
  font-size: 12px;
  white-space: nowrap;
}

.action-code {
  font-size: 11px;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.06);
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}

.action-param-pill {
  font-size: 11px;
  color: #94a3b8;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 扁平状态徽章 */
.flat-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  padding: 1px 7px;
  border-radius: 9999px;
  white-space: nowrap;
}

.flat-badge--executing {
  background: rgba(236, 72, 153, 0.15);
  color: #f472b6;
  border: 1px solid rgba(236, 72, 153, 0.25);
}

.flat-badge--success {
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.22);
}

.flat-badge--error {
  background: rgba(244, 63, 94, 0.12);
  color: #fb7185;
  border: 1px solid rgba(244, 63, 94, 0.22);
}

.mini-spinner {
  width: 7px;
  height: 7px;
  border: 1.5px solid rgba(244, 114, 182, 0.3);
  border-top-color: #f472b6;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.step-counter {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
}

/* 扁平微按钮 */
.flat-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
  color: #cbd5e1;
  padding: 2px 7px;
  font-size: 11px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.flat-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.22);
}

.flat-btn--drawer.is-active {
  background: rgba(168, 85, 247, 0.2);
  border-color: rgba(168, 85, 247, 0.4);
  color: #e9d5ff;
}

.flat-btn__count {
  font-size: 10px;
  color: #94a3b8;
}

.flat-btn__arrow {
  font-size: 8px;
  color: #64748b;
}

.flat-btn--close {
  padding: 2px 5px;
  color: #64748b;
  border: none;
}

.flat-btn--close:hover {
  color: #f87171;
  background: rgba(244, 63, 94, 0.1);
}

/* 挂机工位专用元素 */
.station-mode-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.station-job-title {
  font-weight: 500;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #f1f5f9;
}

.station-stage-desc {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
}

.station-hb-text {
  font-size: 10px;
  color: #64748b;
  white-space: nowrap;
}

.flat-btn--pause {
  color: #fb7185;
  border-color: rgba(244, 63, 94, 0.25);
}

/* ================= 展开的高质感极简操作审计面板 ================= */
.flat-drawer {
  margin-top: 8px;
  width: 640px;
  max-height: 420px;
  background: rgba(18, 20, 26, 0.94);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #f8fafc;
}

.flat-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.flat-drawer__title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-label {
  font-size: 12px;
  font-weight: 600;
  color: #f1f5f9;
}

.title-count {
  font-size: 11px;
  color: #94a3b8;
}

.flat-drawer__actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.flat-drawer__btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #94a3b8;
  padding: 2px 8px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.flat-drawer__btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.flat-drawer__btn--primary {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
}

/* 扁平单行表格：严禁换行 */
.flat-drawer__table {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.flat-table__header {
  display: flex;
  align-items: center;
  padding: 6px 14px;
  font-size: 10px;
  color: #64748b;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}

.flat-table__body {
  overflow-y: auto;
  max-height: 280px;
  padding: 4px 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.flat-table__row {
  display: flex;
  align-items: center;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 11px;
  transition: background 0.12s ease;
  white-space: nowrap;
}

.flat-table__row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.flat-table__row.is-error {
  background: rgba(244, 63, 94, 0.06);
}

/* 表格列宽与对齐 */
.col-step {
  width: 38px;
  flex-shrink: 0;
  color: #94a3b8;
  font-size: 10px;
  white-space: nowrap;
}

.col-time {
  width: 60px;
  flex-shrink: 0;
  color: #64748b;
  font-size: 10px;
  white-space: nowrap;
}

.col-label {
  width: 95px;
  flex-shrink: 0;
  font-weight: 500;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-code {
  width: 125px;
  flex-shrink: 0;
  font-size: 10px;
  color: #a855f7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-param {
  flex: 1;
  min-width: 0;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 8px;
}

.col-dur {
  width: 48px;
  flex-shrink: 0;
  color: #64748b;
  font-size: 10px;
  text-align: right;
  white-space: nowrap;
}

.col-status {
  width: 48px;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  white-space: nowrap;
}

.row-status-pill {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 4px;
  font-weight: 500;
  white-space: nowrap;
}

.row-status-pill.is-success {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.row-status-pill.is-error {
  background: rgba(244, 63, 94, 0.15);
  color: #fb7185;
}

.flat-drawer__footer {
  padding: 6px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.2);
  font-size: 9px;
  color: #475569;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

/* ================= 极简平滑过渡 ================= */
.fade-border-enter-active,
.fade-border-leave-active {
  transition: opacity 0.25s ease;
}
.fade-border-enter-from,
.fade-border-leave-to {
  opacity: 0;
}

.hud-slide-enter-active,
.hud-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.hud-slide-enter-from,
.hud-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px) scale(0.98);
}

.drawer-drop-enter-active,
.drawer-drop-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-drop-enter-from,
.drawer-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
