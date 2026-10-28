<template>
  <div class="station-capsule-wrapper">
    <Popover v-model:open="isOpen">
      <PopoverTrigger as-child>
        <button
          type="button"
          class="station-capsule"
          :class="{
            'station-capsule--active': stationState.enabled,
            'station-capsule--error': stationState.status === 'paused_error',
            'station-capsule--busy': ['producing', 'reworking', 'saving'].includes(stationState.status),
          }"
        >
          <!-- 呼吸灯状态点 -->
          <span class="station-capsule__indicator">
            <span class="station-capsule__dot"></span>
            <span v-if="stationState.enabled" class="station-capsule__ping"></span>
          </span>

          <!-- 模式标签 -->
          <span class="station-capsule__title">自动工位</span>

          <!-- 状态文字 -->
          <span class="station-capsule__status">
            {{ statusLabel }}
          </span>

          <!-- 今日产出数字 -->
          <span v-if="stationState.todayProduced > 0 || stationState.todayReworked > 0" class="station-capsule__counter">
            {{ stationState.todayProduced }}<span v-if="stationState.todayReworked > 0" class="station-capsule__rework">+{{ stationState.todayReworked }}R</span>
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent class="w-80 p-0 shadow-2xl border border-border/80 bg-background/95 backdrop-blur-md rounded-xl overflow-hidden" align="end" side="bottom" :side-offset="8">
        <!-- 头部 -->
        <div class="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-muted/30">
          <div class="flex items-center gap-2">
            <div class="h-2.5 w-2.5 rounded-full" :class="stationState.enabled ? 'bg-emerald-500 ring-2 ring-emerald-500/30' : 'bg-muted-foreground/40'" />
            <span class="font-bold text-xs tracking-tight text-foreground">自动制作挂机工位</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-muted-foreground font-mono">#{{ stationState.workerId.slice(-6) }}</span>
            <button
              type="button"
              class="px-2 py-0.5 text-[11px] font-medium rounded-full transition-all cursor-pointer"
              :class="stationState.enabled ? 'bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 border border-rose-500/30' : 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border border-emerald-500/30'"
              @click="toggleStation"
            >
              {{ stationState.enabled ? '停止挂机' : '开启挂机' }}
            </button>
          </div>
        </div>

        <!-- 当前任务动态 -->
        <div class="p-3 border-b border-border/40 bg-card/40 space-y-2 text-xs">
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-muted-foreground">工位状态：</span>
            <span class="font-semibold text-foreground flex items-center gap-1.5">
              <span v-if="['producing', 'reworking', 'saving'].includes(stationState.status)" class="inline-block animate-spin text-primary">⚙</span>
              {{ statusDetail }}
            </span>
          </div>

          <div v-if="stationState.currentJob" class="p-2 rounded-lg bg-muted/40 border border-border/50 text-[11px] space-y-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-foreground truncate max-w-[170px]">
                {{ stationState.currentJob.inspiration?.title || '灵感制作中' }}
              </span>
              <span class="text-[10px] px-1.5 py-0.2 rounded font-mono" :class="stationState.currentJob.type === 'rework' ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'">
                {{ stationState.currentJob.type === 'rework' ? '返工微调' : stationState.currentJob.type === 'variant' ? '持续变体' : '新稿生产' }}
              </span>
            </div>
            <div class="flex items-center justify-between text-muted-foreground text-[10px]">
              <span>阶段: {{ stationState.currentStage || '执行中' }}</span>
              <span>心跳租约: {{ stationState.heartbeatRemaining }}s</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1">
            <div class="p-2 rounded-lg bg-muted/20 border border-border/30 text-center">
              <div class="text-[10px] text-muted-foreground">今日新产入库</div>
              <div class="text-base font-bold text-foreground mt-0.5">{{ stationState.todayProduced }} <span class="text-[10px] font-normal">张</span></div>
            </div>
            <div class="p-2 rounded-lg bg-muted/20 border border-border/30 text-center">
              <div class="text-[10px] text-muted-foreground">微调返工完成</div>
              <div class="text-base font-bold text-amber-500 mt-0.5">{{ stationState.todayReworked }} <span class="text-[10px] font-normal">张</span></div>
            </div>
          </div>
        </div>

        <!-- 实时流水日志 -->
        <div class="p-3 space-y-2">
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-muted-foreground font-medium">工位流水日志 ({{ stationState.logs.length }})</span>
            <button type="button" class="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer" @click="clearStationLogs">
              清空
            </button>
          </div>

          <div class="h-36 overflow-y-auto space-y-1.5 pr-1 font-mono text-[10px] select-text">
            <div
              v-for="log in stationState.logs"
              :key="log.id"
              class="leading-tight rounded p-1 flex items-start gap-1.5"
              :class="{
                'bg-emerald-500/10 text-emerald-600': log.type === 'success',
                'bg-rose-500/10 text-rose-500': log.type === 'error',
                'bg-amber-500/10 text-amber-500': log.type === 'warn',
                'bg-muted/30 text-muted-foreground': log.type === 'info',
              }"
            >
              <span class="text-[9px] opacity-60 flex-shrink-0">{{ log.time }}</span>
              <span class="break-all">{{ log.text }}</span>
            </div>
            <div v-if="!stationState.logs.length" class="text-center py-8 text-muted-foreground/60 text-[11px]">
              暂无工位流水
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { stationState, startStation, stopStation, clearStationLogs } from "@/ai/agent/auto-station";

const isOpen = ref(false);

const statusLabel = computed(() => {
  if (!stationState.enabled) return "待机中";
  switch (stationState.status) {
    case "claiming":
      return "认领中…";
    case "producing":
      return "设计中";
    case "reworking":
      return "返工微调";
    case "saving":
      return "存库中…";
    case "waiting":
      return "等待队列";
    case "paused_error":
      return "熔断暂停";
    default:
      return "运行中";
  }
});

const statusDetail = computed(() => {
  if (!stationState.enabled) return "已暂停挂机";
  switch (stationState.status) {
    case "claiming":
      return "正在从服务端认领高优任务";
    case "producing":
      return `正在制作新贴纸 (${stationState.currentStage})`;
    case "reworking":
      return `正在根据反馈返工微调 (${stationState.currentStage})`;
    case "saving":
      return "正在落库并提交审核";
    case "waiting":
      return "队列空闲，定时巡检中";
    case "paused_error":
      return "连续 5 次报错，已触发熔断保护";
    default:
      return "挂机运行就绪";
  }
});

function toggleStation() {
  if (stationState.enabled) {
    stopStation();
  } else {
    startStation();
  }
}
</script>

<style scoped>
.station-capsule-wrapper {
  display: inline-flex;
  align-items: center;
}

.station-capsule {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid var(--border);
  background: var(--background);
  color: var(--foreground);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.station-capsule:hover {
  background: var(--muted);
  border-color: var(--ring);
}

.station-capsule--active {
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.08);
}

.station-capsule--busy {
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(99, 102, 241, 0.1);
}

.station-capsule--error {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.station-capsule__indicator {
  position: relative;
  display: inline-flex;
  width: 7px;
  height: 7px;
}

.station-capsule__dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: #9ca3af;
}

.station-capsule--active .station-capsule__dot {
  background: #10b981;
}

.station-capsule--busy .station-capsule__dot {
  background: #6366f1;
}

.station-capsule--error .station-capsule__dot {
  background: #ef4444;
}

.station-capsule__ping {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  background: #10b981;
  opacity: 0.75;
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2.2);
    opacity: 0;
  }
}

.station-capsule__title {
  font-weight: 600;
  opacity: 0.85;
}

.station-capsule__status {
  font-size: 10px;
  color: var(--muted-foreground);
}

.station-capsule__counter {
  margin-left: 2px;
  padding: 0 5px;
  height: 16px;
  line-height: 16px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 700;
  font-family: monospace;
  background: rgba(16, 185, 129, 0.2);
  color: #059669;
}

.station-capsule__rework {
  color: #f59e0b;
  margin-left: 1px;
}
</style>
