<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  timelineEvents,
  timelineClear,
  timelineStepSummary,
  type TimelineEvent,
  type StepCategory,
} from "@/ai/agent-timeline";
import {
  Brain,
  Search,
  Palette,
  Layout,
  Save,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Zap,
  Activity,
  Loader2,
} from "lucide-vue-next";

defineProps<{
  modelValue: boolean;
}>();

defineEmits<{
  (e: "update:modelValue", val: boolean): void;
}>();

const activeFilter = ref<string>("all");
const searchQuery = ref<string>("");
const expandedId = ref<string | null>(null);
const copiedId = ref<string | null>(null);

const stepSummary = computed(() => timelineStepSummary());

const stepCategories = computed(() => [
  {
    key: "thinking",
    label: "思考",
    icon: Brain,
    durationText: `${(stepSummary.value.thinking.totalMs / 1000).toFixed(1)}s`,
    count: stepSummary.value.thinking.count,
  },
  {
    key: "search",
    label: "搜索",
    icon: Search,
    durationText: `${(stepSummary.value.search.totalMs / 1000).toFixed(1)}s`,
    count: stepSummary.value.search.count,
  },
  {
    key: "generate",
    label: "生成",
    icon: Palette,
    durationText: `${(stepSummary.value.generate.totalMs / 1000).toFixed(1)}s`,
    count: stepSummary.value.generate.count,
  },
  {
    key: "render",
    label: "渲染",
    icon: Layout,
    durationText: `${(stepSummary.value.render.totalMs / 1000).toFixed(1)}s`,
    count: stepSummary.value.render.count,
  },
  {
    key: "save",
    label: "保存",
    icon: Save,
    durationText: `${(stepSummary.value.save.totalMs / 1000).toFixed(1)}s`,
    count: stepSummary.value.save.count,
  },
]);

function categoryLabel(cat: StepCategory) {
  const map: Record<StepCategory, string> = {
    thinking: "思考推理",
    search: "素材搜索",
    generate: "HTML生成",
    render: "画布渲染",
    save: "入库保存",
    llm: "接口请求",
    system: "系统事件",
  };
  return map[cat] || cat;
}

const filteredEvents = computed(() => {
  let list = timelineEvents.value.slice().reverse();

  if (activeFilter.value === "errors") {
    list = list.filter((e) => e.status === "error");
  } else if (activeFilter.value !== "all") {
    list = list.filter((e) => e.category === activeFilter.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(
      (e) =>
        e.label.toLowerCase().includes(q) ||
        e.detail.toLowerCase().includes(q) ||
        e.runId.toLowerCase().includes(q),
    );
  }

  return list;
});

const totalDurationMs = computed(() => {
  return timelineEvents.value.reduce((acc, cur) => acc + (cur.durationMs || 0), 0);
});

const maxStepDuration = computed(() => {
  let max = 1000;
  for (const e of timelineEvents.value) {
    if (e.durationMs && e.durationMs > max) {
      max = e.durationMs;
    }
  }
  return max;
});

function fmtTime(ts: number) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms}`;
}

function fmtDur(e: TimelineEvent) {
  if (e.durationMs === null) return "执行中…";
  if (e.durationMs >= 1000) return `${(e.durationMs / 1000).toFixed(2)}s`;
  return `${e.durationMs}ms`;
}

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id;
}

async function copyText(text: string, id: string) {
  try {
    await navigator.clipboard.writeText(text);
    copiedId.value = id;
    setTimeout(() => {
      if (copiedId.value === id) copiedId.value = null;
    }, 1800);
  } catch (err) {
    console.error("复制失败:", err);
  }
}

function exportJSON() {
  const data = JSON.stringify(timelineEvents.value, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `agent-timeline-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <Dialog :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <DialogContent class="w-[92vw] sm:max-w-[640px] h-[78vh] max-h-[700px] p-0 gap-0 overflow-hidden flex flex-col select-none border border-border">
      <!-- 1. Header (预留右侧关闭按钮空间，避免冲突) -->
      <DialogHeader class="px-5 pt-4 pb-3 border-b border-border/80 shrink-0 pr-10 text-left">
        <DialogTitle class="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Activity class="h-4 w-4 text-primary" />
          <span>Agent 步骤与耗时时间线</span>
        </DialogTitle>
        <DialogDescription class="text-xs text-muted-foreground mt-0.5">
          实时记录思考推理、素材搜索、HTML生成、画布渲染与入库保存耗时（纯内存记录）
        </DialogDescription>
      </DialogHeader>

      <!-- 2. 5 大步骤极简阶段速览带 (Figma UI3 中性风格，单行平滑滚动，绝不折行) -->
      <div class="px-4 py-2 border-b border-border/60 bg-muted/30 shrink-0 flex items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 overflow-x-auto min-w-0 py-0.5">
          <button
            v-for="cat in stepCategories"
            :key="cat.key"
            type="button"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--1s-radius-sm)] border text-[11px] whitespace-nowrap transition-colors cursor-pointer shrink-0"
            :class="
              activeFilter === cat.key
                ? 'bg-primary text-primary-foreground border-primary font-medium'
                : 'bg-background border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/40'
            "
            @click="activeFilter = activeFilter === cat.key ? 'all' : cat.key"
          >
            <component :is="cat.icon" class="h-3 w-3 shrink-0 opacity-80" />
            <span>{{ cat.label }}</span>
            <span class="font-mono text-[10px] opacity-85 font-semibold">{{ cat.durationText }}</span>
          </button>
        </div>

        <div class="text-[11px] font-mono text-muted-foreground shrink-0 pl-1 border-l border-border/60">
          总计 {{ (totalDurationMs / 1000).toFixed(1) }}s
        </div>
      </div>

      <!-- 3. 操作工具条 (Toolbar) -->
      <div class="flex items-center justify-between px-4 py-2 border-b border-border/60 bg-background shrink-0 gap-2">
        <!-- 分类过滤 Pills -->
        <div class="flex items-center gap-1 text-[11px] shrink-0">
          <button
            type="button"
            class="px-2 py-0.5 rounded-[var(--1s-radius-sm)] transition-colors"
            :class="
              activeFilter === 'all'
                ? 'bg-muted text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="activeFilter = 'all'"
          >
            全部 ({{ timelineEvents.length }})
          </button>
          <button
            type="button"
            class="px-2 py-0.5 rounded-[var(--1s-radius-sm)] transition-colors"
            :class="
              activeFilter === 'errors'
                ? 'bg-destructive/15 text-destructive font-medium'
                : 'text-muted-foreground hover:text-destructive'
            "
            @click="activeFilter = 'errors'"
          >
            异常
          </button>
        </div>

        <!-- 搜索与导出/清空操作 -->
        <div class="flex items-center gap-1.5 min-w-0">
          <div class="relative w-36 sm:w-44 shrink-0">
            <Search class="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索步骤..."
              class="w-full text-[11px] pl-6 pr-5 py-1 rounded-[var(--1s-radius-sm)] border border-border/80 bg-muted/20 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span
              v-if="searchQuery"
              class="absolute right-1.5 top-1.5 text-[10px] text-muted-foreground cursor-pointer"
              @click="searchQuery = ''"
            >
              ✕
            </span>
          </div>

          <button
            type="button"
            class="flex items-center gap-1 h-6 px-2 rounded-[var(--1s-radius-sm)] border border-border/80 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors shrink-0"
            @click="exportJSON"
            title="导出 JSON"
          >
            <Download class="h-3 w-3" />
            <span class="hidden sm:inline">导出</span>
          </button>

          <button
            type="button"
            class="flex items-center gap-1 h-6 px-2 rounded-[var(--1s-radius-sm)] border border-border/80 text-[11px] text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-colors shrink-0"
            @click="timelineClear()"
            title="清空记录"
          >
            <Trash2 class="h-3 w-3" />
            <span class="hidden sm:inline">清空</span>
          </button>
        </div>
      </div>

      <!-- 4. 步骤流列表 (可平滑滚动的列表区，容器绝对防溢出) -->
      <div class="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0 bg-background/50">
        <!-- 空状态 -->
        <div
          v-if="filteredEvents.length === 0"
          class="flex flex-col items-center justify-center py-16 text-center text-muted-foreground space-y-2"
        >
          <Clock class="h-8 w-8 opacity-25 stroke-[1.5]" />
          <div class="text-xs font-semibold">暂无步骤记录</div>
          <p class="text-[11px] opacity-70 max-w-[220px] leading-relaxed">
            当 Agent 运行思考、素材搜索、HTML生成或渲染时，每一步动作将在此呈现精准耗时。
          </p>
        </div>

        <!-- 步骤列表项 (Figma UI3 规范：极简中性、层次清晰、防溢出) -->
        <div
          v-for="e in filteredEvents"
          :key="e.id"
          class="border rounded-[var(--1s-radius-md)] p-2.5 transition-colors cursor-pointer select-none"
          :class="[
            e.status === 'error'
              ? 'border-destructive/40 bg-destructive/5'
              : expandedId === e.id
                ? 'border-primary/60 bg-muted/40'
                : 'border-border/70 bg-card hover:bg-muted/20',
          ]"
          @click="toggleExpand(e.id)"
        >
          <!-- 步骤主行 -->
          <div class="flex items-center justify-between gap-2 min-w-0">
            <!-- 左侧：分类微徽标 + 操作名 + 参数预览 -->
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <span
                class="px-1.5 py-0.5 rounded-[var(--1s-radius-xs)] text-[10px] font-medium shrink-0 border border-border/60 bg-muted/60 text-muted-foreground"
              >
                {{ categoryLabel(e.category) }}
              </span>

              <span class="font-mono text-xs font-medium text-foreground truncate shrink-0 max-w-[160px] sm:max-w-[200px]">
                {{ e.label }}
              </span>

              <span class="text-[11px] text-muted-foreground truncate min-w-0 flex-1 leading-normal">
                {{ e.detail || '(无补充参数)' }}
              </span>
            </div>

            <!-- 右侧：耗时 + 状态图标 -->
            <div class="flex items-center gap-1.5 shrink-0 text-right">
              <span
                class="font-mono text-[11px] tabular-nums font-medium"
                :class="{
                  'text-amber-500 font-bold': (e.durationMs || 0) > 3000,
                  'text-amber-500 animate-pulse': e.status === 'running',
                  'text-muted-foreground': e.status === 'done' && (e.durationMs || 0) <= 3000,
                }"
              >
                {{ fmtDur(e) }}
              </span>

              <CheckCircle2 v-if="e.status === 'done'" class="h-3.5 w-3.5 text-muted-foreground/60" />
              <AlertCircle v-else-if="e.status === 'error'" class="h-3.5 w-3.5 text-destructive" />
              <Loader2 v-else class="h-3.5 w-3.5 animate-spin text-amber-500" />

              <ChevronDown v-if="expandedId === e.id" class="h-3 w-3 text-muted-foreground ml-0.5" />
              <ChevronRight v-else class="h-3 w-3 text-muted-foreground/50 ml-0.5" />
            </div>
          </div>

          <!-- 极简耗时横条 (中性比例微条，不突兀) -->
          <div v-if="e.durationMs" class="mt-2 h-0.5 w-full rounded-full bg-muted/60 overflow-hidden">
            <div
              class="h-full rounded-full bg-primary/40 transition-all duration-300"
              :style="{ width: `${Math.min(100, Math.max(3, (e.durationMs / maxStepDuration) * 100))}%` }"
            />
          </div>

          <!-- 展开详情抽屉 (点击展开，完整查看参数与返回值) -->
          <div
            v-if="expandedId === e.id"
            class="mt-2.5 pt-2 border-t border-border/50 text-xs space-y-2 select-text"
            @click.stop
          >
            <div class="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>时刻: {{ fmtTime(e.startedAt) }}</span>
              <span>精确耗时: {{ e.durationMs !== null ? `${e.durationMs}ms` : '计算中' }}</span>
              <span v-if="e.runId && e.runId !== '-'">Run: {{ e.runId }}</span>
            </div>

            <div class="rounded-[var(--1s-radius-sm)] border border-border bg-muted/30 p-2">
              <div class="flex items-center justify-between pb-1 border-b border-border/40 mb-1">
                <span class="text-[10px] font-semibold text-muted-foreground">参数 / 返回信息</span>
                <button
                  type="button"
                  class="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-[var(--1s-radius-xs)] border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  @click="copyText(e.detail, e.id)"
                >
                  <Check v-if="copiedId === e.id" class="h-2.5 w-2.5 text-emerald-500" />
                  <Copy v-else class="h-2.5 w-2.5" />
                  <span>{{ copiedId === e.id ? '已复制' : '复制' }}</span>
                </button>
              </div>
              <pre class="font-mono text-[10px] text-foreground/90 whitespace-pre-wrap break-all max-h-40 overflow-y-auto leading-relaxed select-text">{{ e.detail || '(无补充参数)' }}</pre>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
