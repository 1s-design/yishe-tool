<template>
  <Dialog :open="showAutocreateModal" @update:open="handleDialogOpenChange">
    <DialogContent class="sm:max-w-[560px] p-5 gap-4">
      <!-- 1. 配置状态 (idle) -->
      <template v-if="batchProgress.status === 'idle'">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2 text-sm font-bold">
            <Sparkles class="h-4 w-4 text-primary" />
            <span>自动批量制作与创作配置</span>
          </DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground">
            设置批量创作形式与参数，AI 将全自动拆解需求、排版绘制并批量保存入库
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-1 text-xs">
          <!-- 1. 核心二选一：单图设计 vs 系列组图 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-foreground text-xs">1. 选择创作形式</span>
              <span
                class="text-[11px] font-bold text-primary bg-primary/15 px-2.5 py-0.5 rounded-full border border-primary/30"
              >
                当前生效：{{ currentFormatLabel }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <!-- 单图设计 -->
              <button
                type="button"
                class="flex flex-col items-start gap-2.5 p-3 rounded-lg border-2 text-left transition-all duration-150 relative overflow-hidden select-none cursor-pointer"
                :class="
                  config.outputKind === 'independent-batch'
                    ? 'border-primary bg-primary/10 text-foreground font-[550]'
                    : 'border-border/70 bg-transparent text-muted-foreground hover:bg-muted/30 opacity-70'
                "
                @click="setFormat('independent-batch')"
              >
                <div class="absolute top-2.5 right-2.5">
                  <div
                    v-if="config.outputKind === 'independent-batch'"
                    class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30"
                  >
                    <Check class="h-3 w-3 stroke-[3.5]" />
                  </div>
                  <div
                    v-else
                    class="h-4.5 w-4.5 rounded-full border-2 border-dashed border-border/80 bg-background/40"
                  />
                </div>

                <div
                  class="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                  :class="
                    config.outputKind === 'independent-batch'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/80 text-muted-foreground/60'
                  "
                >
                  <Palette class="h-4 w-4" />
                </div>
                <div>
                  <div
                    class="text-xs"
                    :class="
                      config.outputKind === 'independent-batch'
                        ? 'font-bold text-foreground'
                        : 'font-medium'
                    "
                  >
                    单图批量制作
                  </div>
                  <div class="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                    批量制作多款独立的单张贴纸作品
                  </div>
                </div>
              </button>

              <!-- 系列组图 -->
              <button
                type="button"
                class="flex flex-col items-start gap-2.5 p-3 rounded-lg border-2 text-left transition-all duration-150 relative overflow-hidden select-none cursor-pointer"
                :class="
                  config.outputKind === 'group'
                    ? 'border-primary bg-primary/10 text-foreground font-[550]'
                    : 'border-border/70 bg-transparent text-muted-foreground hover:bg-muted/30 opacity-70'
                "
                @click="setFormat('group')"
              >
                <div class="absolute top-2.5 right-2.5">
                  <div
                    v-if="config.outputKind === 'group'"
                    class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30"
                  >
                    <Check class="h-3 w-3 stroke-[3.5]" />
                  </div>
                  <div
                    v-else
                    class="h-4.5 w-4.5 rounded-full border-2 border-dashed border-border/80 bg-background/40"
                  />
                </div>

                <div
                  class="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                  :class="
                    config.outputKind === 'group'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/80 text-muted-foreground/60'
                  "
                >
                  <Layers class="h-4 w-4" />
                </div>
                <div>
                  <div
                    class="text-xs"
                    :class="
                      config.outputKind === 'group'
                        ? 'font-bold text-foreground'
                        : 'font-medium'
                    "
                  >
                    系列组图套装
                  </div>
                  <div class="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                    制作成套同风格/主题的系列贴纸并打包
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- 2. 数量与套数设置滑块 -->
          <!-- 单图模式下的数量设置 -->
          <div
            v-if="config.outputKind === 'independent-batch'"
            class="space-y-2 rounded-lg border-2 border-primary/40 bg-primary/10 dark:bg-primary/20 p-3 shadow-xs animate-in fade-in-50 duration-200"
          >
            <div class="flex items-center justify-between">
              <div class="font-bold text-foreground text-xs flex items-center gap-1.5">
                <Palette class="h-3.5 w-3.5 text-primary" />
                <span>制作张数设置</span>
              </div>
              <span
                class="text-xs font-bold font-mono px-2 py-0.5 rounded bg-primary text-primary-foreground shadow-xs"
              >
                {{ config.count || 5 }} 张
              </span>
            </div>
            <div class="flex items-center gap-3 pt-1">
              <input
                v-model.number="config.count"
                type="range"
                min="1"
                max="20"
                step="1"
                class="w-full accent-primary cursor-pointer h-1.5"
              />
            </div>
            <div class="text-[10px] text-muted-foreground leading-tight">
              <span>💡 将自动拆解并连续制作 {{ config.count || 5 }} 款不同构图的贴纸设计并保存入库</span>
            </div>
          </div>

          <!-- 组图模式下的张数与套数设置 -->
          <div
            v-if="config.outputKind === 'group'"
            class="space-y-2.5 rounded-lg border-2 border-primary/40 bg-primary/10 dark:bg-primary/20 p-3 shadow-xs animate-in fade-in-50 duration-200"
          >
            <div class="flex items-center justify-between">
              <div class="font-bold text-foreground text-xs flex items-center gap-1.5">
                <Layers class="h-3.5 w-3.5 text-primary" />
                <span>组图张数与套数设置</span>
              </div>
              <span
                class="text-xs font-bold font-mono px-2 py-0.5 rounded bg-primary text-primary-foreground shadow-xs"
              >
                共 {{ (config.count || 1) * (config.membersPerGroup || 2) }} 张贴纸
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2.5 pt-1">
              <!-- 每套张数 -->
              <div class="space-y-1 bg-background/70 p-2 rounded-lg border border-border/60">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted-foreground font-medium">每套组图张数:</span>
                  <span class="font-bold text-primary font-mono">{{ config.membersPerGroup || 2 }} 张/套</span>
                </div>
                <input
                  v-model.number="config.membersPerGroup"
                  type="range"
                  min="2"
                  max="8"
                  step="1"
                  class="w-full accent-primary cursor-pointer h-1.5"
                />
              </div>

              <!-- 套组数量 -->
              <div class="space-y-1 bg-background/70 p-2 rounded-lg border border-border/60">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted-foreground font-medium">生成组图套数:</span>
                  <span class="font-bold text-primary font-mono">{{ config.count || 1 }} 套</span>
                </div>
                <input
                  v-model.number="config.count"
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  class="w-full accent-primary cursor-pointer h-1.5"
                />
              </div>
            </div>

            <div class="text-[10px] text-muted-foreground leading-tight">
              <span
                >💡 制作规则：将生成 {{ config.count || 1 }} 套系列贴纸，每套包含
                {{ config.membersPerGroup || 2 }} 张同风格贴纸，自动打包分组保存。</span
              >
            </div>
          </div>

          <!-- 3. 需求提示词输入区 -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="font-bold text-foreground text-xs flex items-center gap-1.5">
                <SlidersHorizontal class="h-3.5 w-3.5 text-primary" />
                <span>需求提示词 (Prompt)</span>
              </label>
              <span class="text-[10px] text-muted-foreground">支持中英文及风格描述</span>
            </div>
            <textarea
              v-model="config.description"
              rows="3"
              class="w-full rounded-lg border border-border/80 bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
              placeholder="例如：做一组 1024x1024 的黄色咖啡猫咪贴纸，日系手账风，透明背景带白边，每张有不同姿态和短文案，合格后自动保存到素材库"
            />
          </div>

          <!-- 4. 附加偏好约束 (可选) -->
          <div class="space-y-1.5">
            <label class="font-bold text-foreground text-xs">附加偏好与约束 (可选)</label>
            <Input
              v-model="config.customInstructions"
              placeholder="例如：每套保持统一配色，成员构图必须不同，字体使用 Google Fonts..."
              class="h-8 text-xs bg-background"
            />
          </div>

          <!-- 5. 高级选项：分析优化 -->
          <div class="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/50">
            <div class="flex items-center gap-2">
              <input
                id="enable-opt"
                v-model="config.enableAnalysisOptimization"
                type="checkbox"
                class="accent-primary h-3.5 w-3.5 rounded cursor-pointer"
              />
              <label for="enable-opt" class="text-xs font-medium text-foreground cursor-pointer">
                启用多轮自我评估与视觉微调
              </label>
            </div>
            <span class="text-[10px] text-muted-foreground">开启后可提升出图精度</span>
          </div>

          <!-- 6. 保持当前画布尺寸 -->
          <div class="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/50">
            <div class="flex items-center gap-2">
              <input
                id="preserve-size"
                v-model="config.preserveCanvasSize"
                type="checkbox"
                class="accent-primary h-3.5 w-3.5 rounded cursor-pointer"
              />
              <label for="preserve-size" class="text-xs font-medium text-foreground cursor-pointer">
                保持当前画布尺寸不变
              </label>
            </div>
            <span class="text-[10px] text-muted-foreground">AI 不会修改画布宽高</span>
          </div>
        </div>

        <DialogFooter class="flex items-center justify-between gap-2 pt-2 border-t border-border/70">
          <Button
            variant="ghost"
            size="sm"
            class="text-xs text-muted-foreground hover:text-foreground"
            @click="handleResetConfig"
          >
            重置默认
          </Button>
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              class="text-xs"
              @click="showAutocreateModal = false"
            >
              取消
            </Button>
            <Button
              size="sm"
              class="text-xs font-bold px-4 gap-1.5 shadow-sm"
              :disabled="!canStart"
              @click="handleStart"
            >
              <Play class="h-3.5 w-3.5 fill-current" />
              立即开始制作
            </Button>
          </div>
        </DialogFooter>
      </template>

      <!-- 2. 运行中状态 (preparing / running / paused) -->
      <template
        v-else-if="
          batchProgress.status === 'running' ||
          batchProgress.status === 'paused' ||
          batchProgress.status === 'preparing'
        "
      >
        <DialogHeader>
          <DialogTitle class="flex items-center justify-between text-sm font-bold">
            <div class="flex items-center gap-2">
              <span class="flex h-2.5 w-2.5 rounded-full bg-primary animate-ping" />
              <span>全自动制作进行中...</span>
            </div>
            <span class="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              已运行 {{ elapsedText }}
            </span>
          </DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground">
            AI 正在全自动执行制作流水线，完成后将自动存入素材库与组图
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-3.5 py-1 text-xs">
          <!-- 进度条与统计 -->
          <div class="space-y-1.5 bg-muted/20 p-3 rounded-lg border border-border/60">
            <div class="flex items-center justify-between text-xs font-medium">
              <span class="text-muted-foreground">整体生产进度</span>
              <span class="font-bold text-foreground font-mono">
                {{ doneCount }} / {{ batchProgress.items.length }} ({{ progressPercent }}%)
              </span>
            </div>
            <div class="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary transition-all duration-300 rounded-full"
                :style="{ width: `${progressPercent}%` }"
              />
            </div>
            <div class="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <div class="flex items-center gap-1.5">
                <span class="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span v-if="batchProgress.status === 'preparing'">正在拆解生产 Brief...</span>
                <span v-else-if="currentItem">
                  {{ currentItem.brief.title }} · {{ statusText(currentItem) }}
                </span>
              </div>
              <span v-if="currentItem?.score !== null" class="font-bold text-primary">
                评分: {{ currentItem.score }}/10
              </span>
            </div>
          </div>

          <!-- 任务项实时流列表 -->
          <div class="max-h-[220px] overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
            <div
              v-for="item in batchProgress.items"
              :key="item.index"
              class="flex items-center justify-between p-2 rounded-lg border text-xs transition-colors"
              :class="
                item.status === 'done'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-foreground'
                  : item.status === 'failed'
                  ? 'border-red-500/30 bg-red-500/10 text-foreground'
                  : item.status === 'skipped'
                  ? 'border-amber-500/30 bg-amber-500/10 text-muted-foreground'
                  : item.status === 'pending'
                  ? 'border-border/40 bg-muted/10 text-muted-foreground'
                  : 'border-primary/40 bg-primary/10 text-foreground font-bold shadow-xs'
              "
            >
              <div class="flex items-center gap-2 min-w-0">
                <!-- 状态点 -->
                <span
                  class="h-2 w-2 rounded-full shrink-0"
                  :class="
                    item.status === 'done'
                      ? 'bg-emerald-500'
                      : item.status === 'failed'
                      ? 'bg-red-500'
                      : item.status === 'skipped'
                      ? 'bg-amber-500'
                      : item.status === 'pending'
                      ? 'bg-border'
                      : 'bg-primary animate-ping'
                  "
                />
                <span class="truncate text-xs" :title="item.error || item.brief.prompt">
                  {{ item.brief.title }}
                </span>
                <span
                  v-if="item.revisionCount > 0"
                  class="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground"
                >
                  修订 {{ item.revisionCount }}
                </span>
              </div>

              <div class="flex items-center gap-2 shrink-0 text-[11px]">
                <span v-if="item.groupId" class="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">
                  组图
                </span>
                <span v-if="item.score !== null" class="font-mono font-bold text-primary">
                  {{ item.score }}分
                </span>
                <span class="text-muted-foreground font-medium">
                  {{ statusText(item) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter class="flex items-center justify-between pt-2 border-t border-border/70">
          <Button
            variant="destructive"
            size="sm"
            class="text-xs font-bold gap-1"
            @click="handleStop"
          >
            <Square class="h-3 w-3 fill-current" />
            停止制作
          </Button>

          <div class="flex items-center gap-2">
            <Button
              v-if="batchProgress.status === 'paused'"
              size="sm"
              class="text-xs font-bold gap-1"
              @click="handleResume"
            >
              <Play class="h-3 w-3 fill-current" />
              继续运行
            </Button>
            <Button
              v-else
              variant="outline"
              size="sm"
              class="text-xs gap-1"
              @click="handlePause"
            >
              <Pause class="h-3 w-3 fill-current" />
              暂停
            </Button>
          </div>
        </DialogFooter>
      </template>

      <!-- 3. 制作完成/停止状态 (done / stopped) -->
      <template v-else>
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2 text-sm font-bold">
            <CheckCircle2
              class="h-4 w-4"
              :class="batchProgress.status === 'done' ? 'text-emerald-500' : 'text-amber-500'"
            />
            <span>{{ batchProgress.status === 'done' ? '批量制作已全部完成！' : '批量制作已结束' }}</span>
          </DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground">
            所有生成的作品均已自动同步至图库与组图模块
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-3 py-1 text-xs">
          <!-- 统计概览卡片 -->
          <div class="grid grid-cols-4 gap-2 text-center">
            <div class="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div class="text-[10px] text-muted-foreground">成功入库</div>
              <div class="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {{ successCount }}
              </div>
            </div>
            <div class="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div class="text-[10px] text-muted-foreground">已跳过</div>
              <div class="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">
                {{ skipCount }}
              </div>
            </div>
            <div class="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <div class="text-[10px] text-muted-foreground">失败</div>
              <div class="text-sm font-bold font-mono text-red-600 dark:text-red-400">
                {{ failCount }}
              </div>
            </div>
            <div class="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <div class="text-[10px] text-muted-foreground">平均得分</div>
              <div class="text-sm font-bold font-mono text-primary">
                {{ avgScore || '-' }}
              </div>
            </div>
          </div>

          <!-- 成果列表 -->
          <div class="max-h-[220px] overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
            <div
              v-for="item in batchProgress.items"
              :key="item.index"
              class="flex items-center justify-between p-2 rounded-lg border text-xs"
              :class="
                item.status === 'done'
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-border/40 bg-muted/10 text-muted-foreground'
              "
            >
              <div class="flex items-center gap-2 min-w-0">
                <span
                  class="h-2 w-2 rounded-full shrink-0"
                  :class="item.status === 'done' ? 'bg-emerald-500' : 'bg-red-500'"
                />
                <span class="truncate font-medium">{{ item.brief.title }}</span>
              </div>
              <div class="flex items-center gap-2 shrink-0 text-[11px]">
                <a
                  v-if="item.savedUrl"
                  :href="item.savedUrl"
                  target="_blank"
                  class="text-primary hover:underline font-bold"
                >
                  查看贴纸
                </a>
                <span v-if="item.groupId" class="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">
                  已入组图
                </span>
                <span v-if="item.score !== null" class="font-mono text-primary font-bold">
                  {{ item.score }}分
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter class="flex items-center justify-between pt-2 border-t border-border/70">
          <Button
            variant="outline"
            size="sm"
            class="text-xs"
            @click="showAutocreateModal = false"
          >
            关闭
          </Button>
          <Button
            size="sm"
            class="text-xs font-bold px-4 gap-1.5 shadow-sm"
            @click="handleReset"
          >
            <RotateCcw class="h-3.5 w-3.5" />
            再来一批新制作
          </Button>
        </DialogFooter>
      </template>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from "vue";
import { useNow } from "@vueuse/core";
import { showAutocreateModal } from "./index";
import {
  batchProgress,
  startBatch,
  pauseBatch,
  resumeBatch,
  stopBatch,
  resetBatch,
} from "@/ai/agent/batch";
import type { AutoBatchConfig, BatchItem } from "@/ai/agent/batch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Palette,
  Layers,
  SlidersHorizontal,
  Check,
  Play,
  Pause,
  Square,
  CheckCircle2,
  RotateCcw,
} from "lucide-vue-next";

const config = reactive<AutoBatchConfig>({
  description: "",
  count: 5,
  taskPreset: "standard",
  outputKind: "independent-batch",
  membersPerGroup: 2,
  customInstructions: "",
  enableAnalysisOptimization: false,
  preserveCanvasSize: true,
});

const currentFormatLabel = computed(() => {
  if (config.outputKind === "group") {
    const total = Number(config.count || 1) * Number(config.membersPerGroup || 2);
    return `系列组图 (${config.count || 1} 套 × 每套 ${config.membersPerGroup || 2} 张 = 共 ${total} 张)`;
  }
  return `单图批量 (${config.count || 5} 张独立制作)`;
});

function setFormat(kind: "independent-batch" | "group") {
  config.outputKind = kind;
  if (kind === "group") {
    config.taskPreset = "group";
    if (!config.count || config.count > 10) config.count = 2;
    if (!config.membersPerGroup) config.membersPerGroup = 2;
  } else {
    config.taskPreset = "standard";
    if (!config.count) config.count = 5;
  }
}

function handleDialogOpenChange(val: boolean) {
  if (batchProgress.status === "idle" || batchProgress.status === "done") {
    showAutocreateModal.value = val;
  }
}

function handleResetConfig() {
  config.description = "";
  config.outputKind = "independent-batch";
  config.taskPreset = "standard";
  config.count = 5;
  config.membersPerGroup = 2;
  config.customInstructions = "";
  config.enableAnalysisOptimization = false;
  config.preserveCanvasSize = true;
}

const now = useNow({ interval: 1000 });
const elapsedText = computed(() => {
  if (!batchProgress.startedAt) return "0秒";
  const seconds = Math.max(
    0,
    Math.floor((now.value.getTime() - batchProgress.startedAt) / 1000),
  );
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes > 0 ? `${minutes}分${rest}秒` : `${rest}秒`;
});

const currentItem = computed<BatchItem | null>(() => {
  if (
    batchProgress.current >= 0 &&
    batchProgress.current < batchProgress.items.length
  ) {
    return batchProgress.items[batchProgress.current];
  }
  return null;
});

const canStart = computed(() => Boolean((config.description || "").trim()));

const doneCount = computed(
  () =>
    batchProgress.items.filter((i) =>
      ["done", "failed", "skipped"].includes(i.status),
    ).length,
);

const successCount = computed(
  () => batchProgress.items.filter((i) => i.status === "done").length,
);

const failCount = computed(
  () => batchProgress.items.filter((i) => i.status === "failed").length,
);

const skipCount = computed(
  () => batchProgress.items.filter((i) => i.status === "skipped").length,
);

const progressPercent = computed(() => {
  if (batchProgress.items.length === 0) return 0;
  return Math.round((doneCount.value / batchProgress.items.length) * 100);
});

const avgScore = computed(() => {
  const scored = batchProgress.items.filter((i) => i.score !== null);
  if (scored.length === 0) return null;
  const sum = scored.reduce((acc, i) => acc + (i.score || 0), 0);
  return (sum / scored.length).toFixed(1);
});

function statusText(item: BatchItem): string {
  switch (item.status) {
    case "pending":
      return "等待中";
    case "designing":
      return "设计中";
    case "evaluating":
      return "评估中";
    case "revising":
      return "修订中";
    case "saving":
      return "保存中";
    case "grouping":
      return "创建组图";
    case "done":
      return "已完成";
    case "skipped":
      return "已跳过";
    case "failed":
      return item.error || "失败";
    default:
      return "";
  }
}

async function handleStart() {
  if (!canStart.value) return;
  await startBatch({ ...config });
}

function handlePause() {
  pauseBatch();
}
function handleResume() {
  resumeBatch();
}
function handleStop() {
  stopBatch();
}
function handleReset() {
  resetBatch();
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
