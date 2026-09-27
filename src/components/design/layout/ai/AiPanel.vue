<template>
  <div
    v-if="open || isOpen"
    ref="panelRef"
    class="ai-panel fixed z-50 flex flex-col overflow-hidden rounded-2xl shadow-lg"
    :class="{ 'is-dragging': isDragging }"
    :style="panelStyle"
  >
    <!-- 顶部 Header 拖拽把手区 -->
    <div
      class="ai-panel-header flex h-11 items-center justify-between px-3.5 select-none transition-colors"
      :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
      @mousedown="onDragStart"
    >
      <!-- 左侧：图标 + 标题 + 模式 Badge -->
      <div class="flex items-center gap-2 min-w-0">
        <div class="ai-panel-logo flex h-6 w-6 items-center justify-center rounded-md shrink-0">
          <Sparkles class="h-3.5 w-3.5" />
        </div>
        <span class="ai-panel-title text-xs font-semibold tracking-tight">AI 设计助手</span>

        <!-- 运行模式 Tag -->
        <Tooltip>
          <TooltipTrigger as-child>
            <Badge
              variant="outline"
              class="ai-panel-mode-badge h-5 px-1.5 text-[10px] font-medium cursor-pointer transition-colors"
              :class="aiSettings.mode === 'direct' ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10' : 'border-blue-500/30 text-blue-600 bg-blue-500/10'"
              @click.stop="showSettingsModal = true"
            >
              {{ aiSettings.mode === 'direct' ? '直连' : '代理' }}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {{ aiSettings.mode === 'direct' ? '当前为前端直连模式（点击设置 API Key）' : '当前为服务端代理模式（点击设置）' }}
          </TooltipContent>
        </Tooltip>

        <!-- 实时执行状态标签 -->
        <Badge
          v-if="isProcessing"
          variant="secondary"
          class="ai-panel-status-badge h-5 gap-1 px-1.5 text-[10px] font-medium border border-amber-400/40 bg-amber-50 text-amber-900"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span class="max-w-[100px] truncate">{{ agentPhaseLabel }}</span>
        </Badge>
      </div>

      <!-- 右侧：控制按钮组 -->
      <div class="flex items-center gap-0.5 shrink-0" @mousedown.stop>
        <Tooltip>
          <TooltipTrigger as-child>
            <button class="ai-panel-icon-btn h-7 w-7" @click="showSettingsModal = true">
              <Settings2 class="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">AI 连接设置</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger as-child>
            <button class="ai-panel-icon-btn h-7 w-7" @click="copyConversationLog">
              <Copy class="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">复制对话日志</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger as-child>
            <button class="ai-panel-icon-btn h-7 w-7" @click="clearChat">
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">清空记录</TooltipContent>
        </Tooltip>

        <button class="ai-panel-icon-btn ai-panel-close-btn h-7 w-7" @click="handleClose">
          <X class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <!-- 计划执行进度条 -->
    <div v-if="planProgress" class="ai-panel-progress relative h-1 w-full overflow-hidden">
      <div
        class="ai-panel-progress-bar h-full bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-500 transition-all duration-300 ease-out"
        :style="{ width: (planProgress.settled / planProgress.total * 100) + '%' }"
      />
    </div>

    <!-- 对话消息列表区 -->
    <div
      ref="messagesRef"
      class="ai-panel-messages flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3.5 min-h-[320px] max-h-[560px] scroll-smooth text-xs"
      @scroll="handleMessagesScroll"
    >
      <!-- 空状态：极简灵感推荐 -->
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center py-5 text-center space-y-3.5">
        <div class="ai-panel-empty-icon flex h-11 w-11 items-center justify-center rounded-2xl border shadow-xs">
          <Wand2 class="h-5 w-5" />
        </div>
        <div class="space-y-0.5 max-w-[280px]">
          <h3 class="text-xs font-semibold ai-panel-text">AI 自动制作贴纸</h3>
          <p class="text-[11px] ai-panel-text-secondary leading-relaxed">
            描述你想要的贴纸、或点击「形式与参数」配置套组与变体，AI 将实时在画布中绘制生成
          </p>
        </div>

        <!-- 快捷灵感卡片 -->
        <div class="grid grid-cols-2 gap-1.5 w-full pt-1">
          <button
            v-for="q in quickPrompts"
            :key="q.label"
            class="ai-panel-quick-card flex items-center gap-1.5 rounded-lg border p-2 text-left text-[11px] font-medium transition-all group"
            @click="sendQuick(q.prompt)"
          >
            <span class="ai-panel-quick-dot h-1.5 w-1.5 rounded-full group-hover:bg-primary transition-colors shrink-0" />
            <span class="truncate">{{ q.label }}</span>
          </button>
        </div>
      </div>

      <!-- 历史消息折叠提示 -->
      <div v-if="hiddenMessageCount > 0" class="text-center text-[10px] ai-panel-text-muted py-1">
        已折叠 {{ hiddenMessageCount }} 条较早记录
      </div>

      <!-- 消息列表渲染 -->
      <template v-for="msg in visibleMessages" :key="msg.id">
        <!-- 用户消息 -->
        <div v-if="msg.role === 'user'" class="flex justify-end w-full">
          <div class="ai-panel-msg-user max-w-[85%] rounded-2xl rounded-tr-xs px-3.5 py-2 text-xs shadow-xs leading-relaxed whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
            {{ msg.content }}
          </div>
        </div>

        <!-- AI 助手消息 -->
        <div v-if="msg.role === 'assistant'" class="flex items-start gap-2.5 w-full min-w-0">
          <div class="ai-panel-avatar flex h-6 w-6 items-center justify-center rounded-full shrink-0 mt-0.5">
            <Sparkles class="h-3 w-3" />
          </div>
          <div class="flex-1 space-y-1.5 min-w-0 max-w-full">
            <!-- 文本内容 -->
            <div v-if="msg.content" class="ai-panel-msg-ai rounded-2xl rounded-tl-xs px-3.5 py-2 text-xs shadow-2xs leading-relaxed whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
              {{ msg.content }}
            </div>

            <!-- 工具调用展示 Pill -->
            <div v-if="msg.tool_calls?.length" class="flex flex-wrap gap-1.5 pt-0.5">
              <span
                v-for="call in msg.tool_calls"
                :key="call.id"
                class="ai-panel-tool-pill inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono"
              >
                <Zap class="h-2.5 w-2.5 text-amber-500" />
                <span>{{ formatToolName(call.function.name) }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 工具执行反馈 -->
        <div v-if="msg.role === 'tool'" class="pl-8 w-full min-w-0">
          <div class="ai-panel-tool-result flex items-start gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-mono w-full min-w-0 whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
            <CheckCircle2 class="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
            <span class="flex-1 min-w-0 leading-normal">{{ parseResult(msg.content).message }}</span>
          </div>
        </div>
      </template>

      <!-- 思考中加载态 -->
      <div v-if="isProcessing" class="flex items-center gap-2.5 pl-1">
        <div class="ai-panel-avatar flex h-6 w-6 items-center justify-center rounded-full shrink-0">
          <Loader2 class="h-3 w-3 animate-spin" />
        </div>
        <div class="ai-panel-thinking flex items-center gap-2 rounded-2xl rounded-tl-xs border px-3 py-2 text-[11px]">
          <span>AI 正在全自动制作贴纸...</span>
          <button v-if="!isWaitingForUser" class="ai-panel-stop-btn h-5 px-1.5 text-[10px] rounded" @click="handleStop">
            停止
          </button>
        </div>
      </div>

      <!-- 用户交互确认卡片 (Human in the Loop) -->
      <div v-if="interactionData" class="ai-panel-interaction rounded-xl border border-amber-400/40 bg-amber-50/60 p-3 space-y-2.5 shadow-sm">
        <div class="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
          <HelpCircle class="h-3.5 w-3.5 text-amber-500" />
          <span>{{ interactionData.question }}</span>
        </div>
        <div v-if="interactionData.options?.length" class="flex flex-wrap gap-1.5">
          <button
            v-for="opt in interactionData.options"
            :key="opt"
            class="ai-panel-option-btn h-6 text-[11px] rounded-md border border-amber-300/60 bg-white px-2.5 hover:bg-amber-100 transition-colors"
            @click="submitInteraction(opt)"
          >
            {{ opt }}
          </button>
        </div>
        <div class="flex items-center gap-1.5 pt-1">
          <input
            v-model="customAnswer"
            placeholder="自定义回答..."
            class="ai-panel-input h-7 text-xs flex-1 rounded-md border px-2.5 py-1 focus:outline-none focus:ring-1"
            @keydown.enter="submitInteraction(customAnswer)"
          />
          <button
            class="ai-panel-send-btn h-7 px-2.5 text-[11px] rounded-md text-white font-medium disabled:opacity-40"
            :disabled="!customAnswer.trim()"
            @click="submitInteraction(customAnswer)"
          >
            发送
          </button>
        </div>
      </div>

      <!-- 制作完成快速动作卡片（已移除） -->

      <!-- 回到底部浮动按钮 -->
      <button
        v-if="hasUnreadMessages"
        class="ai-panel-scroll-btn sticky bottom-1 left-1/2 -translate-x-1/2 rounded-full border px-3 py-1 text-[11px] font-medium shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center gap-1"
        @click="scrollToBottom(true)"
      >
        <ArrowDown class="h-3 w-3" />
        查看最新进度
      </button>
    </div>

    <!-- 底部控制与输入区 -->
    <div
      class="ai-panel-input-area border-t p-3 space-y-2 relative"
      :class="{ 'ring-2 ring-primary/40': isDragOver }"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="handleDrop"
    >
      <!-- 拖拽提示层 -->
      <div
        v-if="isDragOver"
        class="ai-panel-drag-overlay absolute inset-0 z-20 flex items-center justify-center text-xs font-medium gap-2"
      >
        <ImageIcon class="h-4 w-4" />
        <span>松开鼠标上传参考图（将基于此图进行风格制作）</span>
      </div>

      <!-- 💡 参数反显与清除胶囊 (Active Param Banner) -->
      <div
        v-if="isCustomParamActive"
        class="ai-param-banner flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border-2 text-xs shadow-2xs select-none"
      >
        <div
          class="ai-param-banner__content flex items-center gap-1.5 min-w-0 cursor-pointer group"
          @click="showTaskConfigModal = true"
          title="点击重新配置形式与参数"
        >
          <span class="ai-param-badge h-5 px-1.5 text-[10px] font-bold gap-1 rounded inline-flex items-center shrink-0">
            <component :is="activeParamSummary.icon" class="h-3 w-3" />
            <span>{{ activeParamSummary.title }}</span>
          </span>
          <span class="ai-param-banner__desc text-xs font-semibold truncate">{{ activeParamSummary.desc }}</span>
          <span class="ai-param-banner__action text-[10px] font-medium flex items-center gap-0.5 shrink-0 ml-0.5">
            <span>(点击修改)</span>
          </span>
        </div>

        <!-- 一键清除反显，恢复默认单张设计 -->
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              type="button"
              class="ai-param-clear-btn flex h-5 w-5 items-center justify-center rounded-md border transition-colors shrink-0"
              @click="resetParamsToDefault"
            >
              <X class="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">清除自定义参数，恢复默认单张制作</TooltipContent>
        </Tooltip>
      </div>

      <!-- 参考图卡片 -->
      <div v-if="selectedImage" class="ai-ref-image flex items-center justify-between gap-2 rounded-lg border border-amber-400/40 bg-amber-50/50 p-1.5">
        <div class="flex items-center gap-2 min-w-0">
          <img :src="selectedImage.preview" class="h-8 w-8 rounded object-cover border border-border shrink-0" />
          <div class="flex flex-col min-w-0">
            <span class="text-xs font-medium ai-panel-text truncate max-w-[200px]">{{ selectedImage.name }}</span>
            <span class="text-[10px] text-amber-700">{{ selectedImage.size }} · 已开启参考图风格复刻</span>
          </div>
        </div>
        <button class="h-6 w-6 flex items-center justify-center rounded hover:text-red-500 transition-colors" @click="removeImage">
          <X class="h-3.5 w-3.5" />
        </button>
      </div>

      <!-- 图片预处理 Loading -->
      <div v-else-if="isPreparingImage" class="flex items-center gap-2 text-[11px] ai-panel-text-secondary py-1">
        <Loader2 class="h-3.5 w-3.5 animate-spin" />
        <span>正在优化参考图片...</span>
      </div>

      <!-- 输入框与工具条 -->
      <div class="ai-input-box rounded-xl border focus-within:ring-2 shadow-xs transition-all flex flex-col overflow-hidden">
        <!-- 文本域 -->
        <textarea
          ref="textareaRef"
          v-model="inputText"
          class="ai-input-textarea w-full resize-none border-0 bg-transparent px-3.5 pt-3 pb-2 text-xs leading-relaxed focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          :placeholder="dynamicPlaceholder"
          :disabled="isPreparingImage || (isProcessing && !isWaitingForUser)"
          rows="3"
          style="min-height: 76px;"
          @input="adjustTextareaHeight"
          @keydown.enter="handleKeydownEnter"
          @paste="handlePaste"
          @compositionstart="isComposing = true"
          @compositionend="isComposing = false"
        />

        <!-- 输入框底部工具栏 -->
        <div class="ai-input-toolbar flex items-center justify-between px-2.5 pb-2.5 pt-1.5 border-t">
          <div class="flex items-center gap-1.5">
            <!-- 形式与参数弹窗入口 -->
            <Tooltip>
              <TooltipTrigger as-child>
                <button
                  type="button"
                  class="ai-toolbar-btn flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium transition-all"
                  :class="isCustomParamActive ? 'ai-toolbar-btn--active' : 'ai-toolbar-btn--idle'"
                  :disabled="isProcessing"
                  @click="showTaskConfigModal = true"
                >
                  <SlidersHorizontal class="h-3.5 w-3.5" />
                  <span>{{ isCustomParamActive ? activeParamSummary.title : '形式与参数' }}</span>
                  <span v-if="isCustomParamActive" class="h-1.5 w-1.5 rounded-full bg-white animate-pulse shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">点击配置生成形式（单张/系列组图/数量套数）</TooltipContent>
            </Tooltip>

            <!-- 图片上传 -->
            <Tooltip>
              <TooltipTrigger as-child>
                <button
                  type="button"
                  class="ai-toolbar-icon-btn flex h-7 w-7 items-center justify-center rounded-lg transition-colors disabled:opacity-40"
                  :class="{ 'text-amber-600 bg-amber-100 border-amber-400': !!selectedImage }"
                  :disabled="isPreparingImage"
                  @click="triggerImageUpload"
                >
                  <ImageIcon class="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">上传参考图（支持剪贴板粘贴或拖拽）</TooltipContent>
            </Tooltip>
            <input ref="imageInputRef" type="file" accept="image/*" class="hidden" @change="handleImageUpload" />

            <!-- 提示词灵感库 -->
            <Tooltip>
              <TooltipTrigger as-child>
                <button
                  type="button"
                  class="ai-toolbar-icon-btn flex h-7 w-7 items-center justify-center rounded-lg transition-colors disabled:opacity-40"
                  :class="{ 'text-primary bg-primary/10 border-primary/40': showPromptPicker }"
                  :disabled="isProcessing"
                  @click="showPromptPicker = !showPromptPicker"
                >
                  <BookOpen class="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">精选提示词灵感库</TooltipContent>
            </Tooltip>
          </div>

          <!-- 发送 / 停止按钮 -->
          <div>
            <button
              v-if="isProcessing && !isWaitingForUser"
              class="ai-input-send-btn h-7 w-7 rounded-lg shadow-xs flex items-center justify-center bg-red-500 hover:bg-red-600"
              @click="handleStop"
              title="停止生成"
            >
              <Square class="h-3.5 w-3.5 fill-current text-white" />
            </button>
            <button
              v-else
              class="ai-input-send-btn h-7 w-7 rounded-lg shadow-xs flex items-center justify-center transition-all disabled:opacity-40"
              :disabled="(!inputText.trim() && !selectedImage) || (isProcessing && !isWaitingForUser)"
              @click="handleSend"
              title="发送 (Enter)"
            >
              <ArrowUp class="h-4 w-4 stroke-[2.5] text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 💡 设计形式与参数配置弹窗 -->
    <TaskConfigModal
      v-model="showTaskConfigModal"
      :options="taskOptions"
      @update:options="taskOptions = $event"
    />

    <!-- 提示词库弹窗 -->
    <DesignPromptPicker
      v-model="showPromptPicker"
      @select="handlePromptSelect"
    />

    <!-- AI 运行时设置弹窗 -->
    <AiSettingsModal v-model="showSettingsModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick, watch, onMounted, onUnmounted, markRaw } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { designAgent } from "@/ai/langgraph";
import { resolveAIToolName } from "@/ai/shared/tools";
import { pendingPromptInput } from "@/ai/store";
import { prepareImageForAI } from "@/ai/image-preprocess";
import { getAgentPhaseLabel } from "@/ai/agent/presentation";
import {
  resolveAgentTaskSpec,
  validateAgentTaskSpec,
  type AgentTaskOptions,
} from "@/ai/agent/task-spec";
import DesignPromptPicker from "./DesignPromptPicker.vue";
import AiSettingsModal from "./AiSettingsModal.vue";
import TaskConfigModal from "./TaskConfigModal.vue";
import { aiSettings } from "@/ai/settings";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Sparkles,
  Settings2,
  Copy,
  Trash2,
  X,
  Wand2,
  Zap,
  CheckCircle2,
  Loader2,
  HelpCircle,
  ArrowDown,
  ArrowUp,
  Square,
  ImageIcon,
  BookOpen,
  Palette,
  Layers,
  Edit3,
  Edit,
  Flame,
  Save,
  Download,
  SlidersHorizontal,
} from "lucide-vue-next";
import { executeAITool } from "@/ai/shared/execute-tool";
import { currentCanvasControllerInstance } from "@/components/design/layout/canvas/index.tsx";

const isOpen = useLocalStorage("_1s_ai_panel_open", false);
const showSettingsModal = ref(false);
const showTaskConfigModal = ref(false);

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

watch(() => props.open, (val) => { isOpen.value = val; });

const handleClose = () => {
  isOpen.value = false;
  emit("close");
};

const agent = designAgent;

// State
const inputText = ref("");
const isComposing = ref(false);
const showPromptPicker = ref(false);
const messagesRef = ref<HTMLElement>();
const textareaRef = ref<HTMLTextAreaElement>();
const customAnswer = ref("");
const imageInputRef = ref<HTMLInputElement>();
const selectedImage = ref<{ file: File; preview: string; name: string; size?: string } | null>(null);
const isPreparingImage = ref(false);
const isDragOver = ref(false);
const autoFollowMessages = ref(true);
const hasUnreadMessages = ref(false);

// 任务参数模型 - 默认：标准智能推断模式，保留画布/智能识别意图
const taskOptions = useLocalStorage<AgentTaskOptions>(
  "_1s_ai_task_options_v3",
  {
    preset: "standard",
    source: "current-canvas",
    intent: "edit",
    outputKind: "single",
    jobCount: 1,
    memberCount: 4,
    delivery: "save",
    customInstructions: "",
  },
  { mergeDefaults: true },
);

// 判断当前是否开启了非默认的定制参数
const isCustomParamActive = computed(() => {
  const o = taskOptions.value;
  return (
    o.outputKind === "group" ||
    (o.outputKind === "single" && (o.jobCount || 1) > 1) ||
    o.source === "current-canvas" ||
    o.intent === "edit" ||
    o.delivery === "canvas" ||
    o.delivery === "export" ||
    !!o.customInstructions?.trim()
  );
});

// 参数反显文字与图标
const activeParamSummary = computed(() => {
  const o = taskOptions.value;
  if (o.outputKind === "group") {
    const sets = o.jobCount || 1;
    const members = o.memberCount || 4;
    return {
      icon: markRaw(Layers),
      title: "系列组图",
      desc: sets > 1 ? `批量制作 ${sets} 套 (共 ${sets * members} 张)` : `制作一套 ${members} 张系列贴纸`,
    };
  }
  if (o.source === "current-canvas" || o.intent === "edit") {
    return {
      icon: markRaw(Edit3),
      title: "修改当前画布",
      desc: "基于当前画布已有图层进行调整优化",
    };
  }
  if ((o.jobCount || 1) > 1) {
    return {
      icon: markRaw(Palette),
      title: "批量单图",
      desc: `批量生成 ${o.jobCount} 张独立贴纸`,
    };
  }
  if (o.customInstructions?.trim()) {
    return {
      icon: markRaw(SlidersHorizontal),
      title: "附带约束",
      desc: o.customInstructions.trim(),
    };
  }
  return {
    icon: markRaw(Palette),
    title: "单图设计",
    desc: "在画布生成 1 张全新设计并自动保存",
  };
});

// 重置参数为默认智能标准模式
function resetParamsToDefault() {
  taskOptions.value = {
    preset: "standard",
    source: "current-canvas",
    intent: "edit",
    outputKind: "single",
    jobCount: 1,
    memberCount: 4,
    delivery: "save",
    customInstructions: "",
  };
}

const dynamicPlaceholder = computed(() => {
  if (isWaitingForUser.value) return "请输入选择...";
  if (selectedImage.value) return "描述你想如何参考此图的构图、配色进行贴纸制作...";
  if (taskOptions.value.outputKind === "group") {
    return "描述系列主题，如：设计一套 4 个不同季节的柴犬表情包贴纸...";
  }
  if (taskOptions.value.outputKind === "independent-batch") {
    return "描述批量创意，如：设计 3 款不同风格的复古旅行箱贴纸...";
  }
  if (taskOptions.value.source === "current-canvas" || taskOptions.value.intent === "edit") {
    return "描述修改需求，如：把背景改成浅米色，标题文字放大并居中...";
  }
  return "描述你想要的贴纸设计，如：设计一个复古美式咖啡杯贴纸，带暖色调与粗边框...";
});

// Quick prompts
const quickPrompts = [
  { label: "促销圆形徽章", prompt: '创建一个促销徽章贴纸，黄色背景，居中写粗体 "HOT SALE 50%"，带有放射状光芒装饰' },
  { label: "可爱萌宠小狗", prompt: '制作一个可爱的柯基小狗卡通贴纸，搭配温暖柔和色调，周围有点缀爱心和爪印' },
  { label: "复古美式咖啡", prompt: '为咖啡品牌设计一个复古美式复古标签，居中文字 "FRESH COFFEE"，带有细腻线条边框' },
  { label: "赛博霓虹标语", prompt: '创建一个赛博朋克风格贴纸，深色背景，发光霓虹字体 "CYBER CITY"，带有故障风线条' },
];

function adjustTextareaHeight() {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = "auto";
  const newHeight = Math.min(el.scrollHeight, 200);
  el.style.height = `${Math.max(76, newHeight)}px`;
}

function handleKeydownEnter(e: KeyboardEvent) {
  if (e.shiftKey) return;
  if (isComposing.value) return;
  e.preventDefault();
  handleSend();
}

function resetTextareaHeight() {
  inputText.value = "";
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = "76px";
    }
  });
}

watch(inputText, (val) => {
  if (!val) {
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.style.height = "76px";
      }
    });
  } else {
    nextTick(adjustTextareaHeight);
  }
});

watch(pendingPromptInput, (val) => {
  if (val) {
    inputText.value = val;
    pendingPromptInput.value = null;
    nextTick(() => {
      textareaRef.value?.focus();
      adjustTextareaHeight();
    });
  }
});

// Dragging logic & panel dimensions
const PANEL_WIDTH = 480;
const panelRef = ref<HTMLElement>();
const isDragging = ref(false);
const dragOffset = reactive({ x: 0, y: 0 });
const panelPosition = reactive({ x: -1, y: -1 });

let rafId: number | null = null;
let targetX = -1;
let targetY = -1;

const panelStyle = computed(() => {
  if (panelPosition.x >= 0) {
    return {
      left: `${panelPosition.x}px`,
      top: `${panelPosition.y}px`,
      right: 'auto',
      bottom: 'auto',
      width: `${PANEL_WIDTH}px`,
      willChange: isDragging.value ? 'left, top' : 'auto',
    };
  }
  return {
    right: '24px',
    bottom: '24px',
    width: `${PANEL_WIDTH}px`,
  };
});

function onDragStart(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
  isDragging.value = true;
  const rect = panelRef.value?.getBoundingClientRect();
  if (rect) {
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    if (panelPosition.x < 0) {
      panelPosition.x = rect.left;
      panelPosition.y = rect.top;
    }
  }
  document.body.style.userSelect = 'none';
  document.addEventListener('mousemove', onDragMove, { passive: true });
  document.addEventListener('mouseup', onDragEnd);
}

function onDragMove(e: MouseEvent) {
  if (!isDragging.value) return;
  targetX = Math.max(10, Math.min(window.innerWidth - (PANEL_WIDTH + 10), e.clientX - dragOffset.x));
  targetY = Math.max(10, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y));

  if (rafId === null) {
    rafId = requestAnimationFrame(() => {
      panelPosition.x = targetX;
      panelPosition.y = targetY;
      rafId = null;
    });
  }
}

function onDragEnd() {
  isDragging.value = false;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  document.body.style.userSelect = '';
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
}

// Computed message data
const messages = computed(() => agent.state.messages);
const visibleMessages = computed(() => messages.value.slice(-50));
const hiddenMessageCount = computed(() => Math.max(0, messages.value.length - 50));
const isProcessing = computed(() => agent.isProcessing.value);
const isWaitingForUser = computed(() => agent.isWaitingForUser.value);
const interactionData = computed(() => agent.state.pendingInteraction);

const currentPlan = computed(() => agent.currentPlan.value);
const agentPhaseLabel = computed(() =>
  getAgentPhaseLabel(agent.state.status, currentPlan.value),
);

const planProgress = computed(() => {
  if (!currentPlan.value?.steps) return null;
  const done = currentPlan.value.steps.filter((s: any) => s.status === 'done').length;
  const failed = currentPlan.value.steps.filter((s: any) => s.status === 'failed').length;
  return {
    settled: done + failed,
    done,
    failed,
    total: currentPlan.value.steps.length,
    goal: currentPlan.value.goal,
  };
});


function scrollToBottom(force = false) {
  nextTick(() => {
    const el = messagesRef.value;
    if (!el) return;
    if (force || autoFollowMessages.value) {
      el.scrollTop = el.scrollHeight;
      hasUnreadMessages.value = false;
    }
  });
}

function handleMessagesScroll() {
  const el = messagesRef.value;
  if (!el) return;
  const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
  autoFollowMessages.value = distanceToBottom < 40;
  if (autoFollowMessages.value) {
    hasUnreadMessages.value = false;
  }
}

// Events
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  unsubscribe = agent.onEvent(() => {
    scrollToBottom();
  });
});

onUnmounted(() => {
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
  unsubscribe?.();
});

// Send handler
function handleSend() {
  if (isComposing.value) return;
  if (selectedImage.value) {
    const text = inputText.value.trim() || "请分析这张参考图片的设计风格，并全自动制作一个高品质的类似贴纸设计";
    const resolvedTask = resolveAgentTaskSpec(text, taskOptions.value, {
      hasReferenceImage: true,
    });
    const taskError = validateAgentTaskSpec(resolvedTask, {
      hasReferenceImage: true,
    });
    if (taskError) {
      alert(taskError);
      return;
    }
    agent.chatWithImage(text, selectedImage.value.preview, {
      task: { ...taskOptions.value },
    });
    selectedImage.value = null;
    resetTextareaHeight();
    scrollToBottom(true);
    return;
  }
  const text = inputText.value.trim();
  if (!text) return;
  if (isWaitingForUser.value) {
    agent.submitUserResponse(text);
    resetTextareaHeight();
    scrollToBottom(true);
    return;
  }
  if (isProcessing.value) return;
  const resolvedTask = resolveAgentTaskSpec(text, taskOptions.value, {
    hasReferenceImage: false,
  });
  const taskError = validateAgentTaskSpec(resolvedTask, {
    hasReferenceImage: false,
  });
  if (taskError) {
    alert(taskError);
    return;
  }
  agent.chat(text, { task: { ...taskOptions.value } });
  resetTextareaHeight();
  scrollToBottom(true);
}

function handleStop() {
  agent.stop();
}

function copyConversationLog() {
  const msgs = messages.value;
  if (msgs.length === 0) return;

  const lines: string[] = [];
  const sep = '='.repeat(60);
  lines.push(sep);
  lines.push(`AI 对话日志  ${new Date().toLocaleString()}`);
  lines.push(`消息总数: ${msgs.length}`);
  lines.push(sep);
  lines.push('');

  for (const msg of msgs) {
    const time = new Date(msg.timestamp).toLocaleTimeString();
    const iter = (msg.meta as any)?.iteration ? ` [第${(msg.meta as any).iteration}轮]` : '';
    const dur = (msg.meta as any)?.duration ? ` (${(msg.meta as any).duration}ms)` : '';
    lines.push(`--- ${msg.role.toUpperCase()}${iter}${dur} ${time} ---`);

    if (msg.content) lines.push(msg.content);

    if (msg.tool_calls?.length) {
      for (const call of msg.tool_calls) {
        lines.push(`\n工具调用: ${formatToolName(call.function.name)}`);
        try {
          const args = typeof call.function.arguments === 'string'
            ? JSON.parse(call.function.arguments)
            : call.function.arguments;
          lines.push('参数: ' + JSON.stringify(args, null, 2));
        } catch {
          lines.push('参数: ' + String(call.function.arguments));
        }
      }
    }

    if (msg.role === 'tool' && (msg.meta as any)?.toolResult) {
      lines.push('执行结果: ' + JSON.stringify((msg.meta as any).toolResult, null, 2));
    }

    lines.push('');
  }

  const log = lines.join('\n');
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(log);
  }
}

function triggerImageUpload() {
  imageInputRef.value?.click();
}

async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  input.value = "";
  await processUploadedFile(file);
}

function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf("image") !== -1) {
      const file = item.getAsFile();
      if (file) {
        e.preventDefault();
        processUploadedFile(file);
        break;
      }
    }
  }
}

function handleDrop(e: DragEvent) {
  isDragOver.value = false;
  const files = e.dataTransfer?.files;
  if (!files || files.length === 0) return;
  const file = files[0];
  if (file.type.startsWith("image/")) {
    processUploadedFile(file);
  }
}

async function processUploadedFile(file: File) {
  if (file.size > 10 * 1024 * 1024) {
    alert("图片不能超过 10MB");
    return;
  }
  isPreparingImage.value = true;
  try {
    const prepared = await prepareImageForAI(file);
    selectedImage.value = {
      file,
      preview: prepared.preview,
      name: file.name,
      size: formatFileSize(file.size),
    };
  } catch (error: any) {
    const reader = new FileReader();
    const preview = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    selectedImage.value = {
      file,
      preview,
      name: file.name,
      size: formatFileSize(file.size),
    };
  } finally {
    isPreparingImage.value = false;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function removeImage() {
  selectedImage.value = null;
}

function sendQuick(prompt: string) {
  inputText.value = prompt;
  handleSend();
}

function handlePromptSelect(content: string) {
  inputText.value = content;
  showPromptPicker.value = false;
  nextTick(() => {
    textareaRef.value?.focus();
    adjustTextareaHeight();
  });
}

function clearChat() {
  agent.clearMessages();
}

function submitInteraction(answer: string) {
  if (!answer.trim()) return;
  agent.submitUserResponse(answer.trim());
  customAnswer.value = "";
}

function formatToolName(name: string): string {
  const resolvedName = resolveAIToolName(name);
  const compactName = resolvedName.replace(/\./g, "_");
  const map: Record<string, string> = {
    canvas_clear: "清空画布",
    canvas_addChild: "添加元素",
    canvas_smartSize: "设置尺寸",
    canvas_setSize: "设置尺寸",
    canvas_setSizeByPreset: "预设尺寸",
    canvas_setBackgroundColor: "设置背景",
    canvas_remove: "删除元素",
    canvas_analyze: "分析画布",
    canvas_updateAndSaveSticker: "保存贴纸",
    element_setStyle: "修改样式",
    element_setTextContent: "修改文字",
    element_setBackground: "修改背景",
    resource_searchImage: "搜索图片",
    resource_searchSticker: "搜索贴纸素材",
    resource_searchFont: "搜索字体",
    resource_searchCustomSticker: "搜索模板",
    canvas_loadCustomSticker: "加载模板",
    ask_choice: "询问",
    request_feedback: "反馈",
  };
  return map[compactName] || map[name] || resolvedName.split('.').pop() || resolvedName;
}

function parseResult(content: string) {
  try {
    const parsed = JSON.parse(content);
    return { success: parsed.success !== false, message: parsed.message || (parsed.success ? "完成" : "失败") };
  } catch {
    return { success: true, message: content };
  }
}
</script>

<style scoped>
/* ===== AI Panel Container ===== */
.ai-panel {
  background-color: var(--1s-surface-background);
  color: var(--1s-text-color);
  border: 1px solid var(--1s-border-color);
  box-shadow: var(--1s-shadow-popover);
  transition: box-shadow var(--1s-transition-base);
}

.ai-panel.is-dragging {
  box-shadow: var(--1s-shadow-float);
  cursor: grabbing;
}

/* ===== Header ===== */
.ai-panel-header {
  background-color: var(--1s-control-surface-muted);
  border-bottom: 1px solid var(--1s-border-color);
}
.ai-panel-header:hover {
  background-color: var(--1s-control-hover-background);
}
.ai-panel-header.cursor-grabbing {
  background-color: var(--1s-control-hover-background);
}

.ai-panel-logo {
  background-color: var(--1s-accent-color);
  color: #ffffff;
}

.ai-panel-title {
  color: var(--1s-text-color);
}

.ai-panel-mode-badge {
  border-color: var(--1s-border-color);
  background: var(--1s-control-surface-muted);
  color: var(--1s-text-color-secondary);
}
.ai-panel-mode-badge:hover {
  background: var(--1s-control-hover-background);
}

.ai-panel-status-badge {
  border-color: rgba(245, 158, 11, 0.4);
  background: #fffbeb;
  color: #92400e;
}

.ai-panel-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--1s-text-color-secondary);
  transition:
    color var(--1s-transition-base),
    background-color var(--1s-transition-base),
    transform var(--1s-transition-base);
}
.ai-panel-icon-btn:hover {
  color: var(--1s-text-color);
  background-color: var(--1s-control-hover-background);
}
.ai-panel-icon-btn:active {
  transform: scale(0.92);
}
.ai-panel-close-btn:hover {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}

/* ===== Progress Bar ===== */
.ai-panel-progress {
  background-color: var(--1s-control-surface-muted);
}
.ai-panel-progress-bar {
  background: linear-gradient(to right, #10b981, #0ea5e9, var(--1s-accent-color));
}

/* ===== Messages Area ===== */
.ai-panel-messages {
  background-color: var(--1s-surface-background);
  color: var(--1s-text-color);
}

/* Empty state */
.ai-panel-empty-icon {
  background: linear-gradient(135deg, color-mix(in srgb, var(--1s-accent-color) 8%, transparent), var(--1s-control-surface-muted));
  border-color: var(--1s-border-color);
  color: var(--1s-accent-color);
}
.ai-panel-empty-icon > svg {
  color: var(--1s-accent-color);
}

.ai-panel-quick-card {
  border-color: var(--1s-border-color);
  background-color: var(--1s-surface-background);
  color: var(--1s-text-color);
}
.ai-panel-quick-card:hover {
  background-color: var(--1s-control-hover-background);
  border-color: var(--1s-border-color-strong);
  box-shadow: var(--1s-shadow-xs);
}
.ai-panel-quick-dot {
  background-color: color-mix(in srgb, var(--1s-accent-color) 40%, transparent);
}

/* Text colors */
.ai-panel-text {
  color: var(--1s-text-color);
}
.ai-panel-text-secondary {
  color: var(--1s-text-color-secondary);
}
.ai-panel-text-muted {
  color: var(--1s-text-color-tertiary);
}

/* Message bubbles */
.ai-panel-msg-user {
  background-color: var(--1s-accent-color);
  color: #ffffff;
  animation: ai-msg-in 0.2s var(--1s-easing-standard) both;
}

.ai-panel-avatar {
  background-color: var(--1s-control-surface-muted);
  border: 1px solid var(--1s-border-color);
  color: var(--1s-text-color);
}

.ai-panel-msg-ai {
  background-color: var(--1s-control-surface-muted);
  border: 1px solid var(--1s-border-color);
  color: var(--1s-text-color);
  animation: ai-msg-in 0.2s var(--1s-easing-standard) both;
}

@keyframes ai-msg-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-panel-tool-pill {
  border-color: var(--1s-border-color);
  background-color: var(--1s-surface-background);
  color: var(--1s-text-color-secondary);
}

.ai-panel-tool-result {
  background-color: var(--1s-control-surface-muted);
  border-color: var(--1s-border-color);
  color: var(--1s-text-color-secondary);
}

/* Thinking state */
.ai-panel-thinking {
  background-color: var(--1s-control-surface-muted);
  border-color: var(--1s-border-color);
  color: var(--1s-text-color-secondary);
}
.ai-panel-stop-btn {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}
.ai-panel-stop-btn:hover {
  background-color: rgba(239, 68, 68, 0.2);
}

/* Interaction card */
.ai-panel-interaction {
  border-color: rgba(245, 158, 11, 0.4);
  background-color: #fffbeb;
}
.ai-panel-interaction .text-amber-900 {
  color: #78350f;
}
.ai-panel-option-btn {
  border-color: rgba(245, 158, 11, 0.4);
  background-color: var(--1s-control-surface-background);
  color: #78350f;
}
.ai-panel-option-btn:hover {
  background-color: #fef3c7;
}
.ai-panel-input {
  border-color: var(--1s-border-color);
  background-color: var(--1s-control-surface-background);
  color: var(--1s-text-color);
}
.ai-panel-input:focus {
  outline: none;
  border-color: var(--1s-accent-color);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--1s-accent-color) 15%, transparent);
}
.ai-panel-send-btn {
  background-color: var(--1s-accent-color);
  color: #ffffff;
}
.ai-panel-send-btn:hover {
  opacity: 0.9;
}

/* Scroll to bottom button */
.ai-panel-scroll-btn {
  border-color: var(--1s-border-color);
  background-color: var(--1s-surface-background);
  color: var(--1s-text-color);
}
.ai-panel-scroll-btn:hover {
  background-color: var(--1s-control-hover-background);
}

/* ===== Input Area ===== */
.ai-panel-input-area {
  background-color: var(--1s-surface-background);
  border-top: 1px solid var(--1s-border-color);
}

.ai-panel-drag-overlay {
  background-color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(4px);
  color: var(--1s-accent-color);
}

/* Param banner */
.ai-param-banner {
  border-color: var(--1s-accent-color-soft);
  background-color: var(--1s-hover-background);
  transition: all 0.2s ease;
}
.ai-param-banner:hover {
  border-color: var(--1s-accent-color);
  background-color: var(--1s-active-background);
}
.ai-param-banner__content {
  transition: opacity 0.2s ease;
}
.ai-param-banner__content:hover {
  opacity: 0.95;
}
.ai-param-badge {
  background-color: var(--1s-accent-color) !important;
  color: #ffffff !important;
  box-shadow: 0 1px 2px color-mix(in srgb, var(--1s-accent-color) 25%, transparent);
}
.ai-param-badge * {
  color: #ffffff !important;
}
.ai-param-banner__desc {
  color: var(--1s-text-color);
  transition: color 0.15s ease;
}
.ai-param-banner__content:hover .ai-param-banner__desc {
  color: var(--1s-accent-color);
}
.ai-param-banner__action {
  color: var(--1s-accent-color);
  opacity: 0.85;
  transition: all 0.15s ease;
}
.ai-param-banner__content:hover .ai-param-banner__action {
  opacity: 1;
  text-decoration: underline;
}
.ai-param-clear-btn {
  background-color: var(--1s-surface-background, #ffffff);
  border-color: var(--1s-border-color, #e2e8f0);
  color: var(--1s-text-color-secondary, #64748b);
  transition: all 0.2s ease;
}
.ai-param-clear-btn:hover {
  background-color: #ef4444;
  color: #ffffff;
  border-color: #ef4444;
}

/* Reference image card */
.ai-ref-image {
  border-color: rgba(245, 158, 11, 0.4);
  background-color: #fffbeb;
}
.ai-ref-image .text-amber-700 {
  color: #92400e;
}

/* Input box */
.ai-input-box {
  border-color: var(--1s-border-color);
  background-color: var(--1s-surface-background);
}
.ai-input-box:focus-within {
  border-color: var(--1s-accent-color);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--1s-accent-color) 12%, transparent);
}
:global(html.dark) .ai-input-box:focus-within,
:global(.dark) .ai-input-box:focus-within,
:global(body.designiy-dark) .ai-input-box:focus-within {
  box-shadow: 0 0 0 2px rgba(250, 250, 250, 0.15);
}

.ai-input-textarea {
  color: var(--1s-text-color);
}
.ai-input-textarea::placeholder {
  color: var(--1s-text-color-tertiary);
}

.ai-input-toolbar {
  border-top-color: var(--1s-border-color);
  background-color: var(--1s-control-surface-muted);
}

/* Toolbar buttons */
.ai-toolbar-btn {
  border: 1px solid transparent;
}
.ai-toolbar-btn--idle {
  color: var(--1s-text-color-secondary);
  background-color: var(--1s-control-surface-muted);
  border-color: var(--1s-border-color);
}
.ai-toolbar-btn--idle:hover {
  color: var(--1s-text-color);
  background-color: var(--1s-control-hover-background);
}
.ai-toolbar-btn--active {
  background-color: var(--1s-accent-color);
  color: #ffffff;
  border-color: var(--1s-accent-color);
  box-shadow: var(--1s-shadow-xs);
}

.ai-toolbar-icon-btn {
  color: var(--1s-text-color-secondary);
  background-color: var(--1s-control-surface-muted);
  border: 1px solid var(--1s-border-color);
}
.ai-toolbar-icon-btn:hover {
  color: var(--1s-text-color);
  background-color: var(--1s-control-hover-background);
}

/* Send button */
.ai-input-send-btn {
  background-color: var(--1s-accent-color);
  transition:
    background-color var(--1s-transition-base),
    transform var(--1s-transition-base),
    box-shadow var(--1s-transition-base);
}
.ai-input-send-btn:hover {
  transform: scale(1.08);
  box-shadow: var(--1s-shadow-sm);
}
.ai-input-send-btn:active {
  transform: scale(0.95);
}

/* ===== Dark mode overrides ===== */
:global(html.dark) .ai-panel-header,
:global(.dark) .ai-panel-header,
:global(body.designiy-dark) .ai-panel-header {
  background-color: var(--1s-control-surface-muted);
  border-bottom-color: var(--1s-border-color);
}

:global(html.dark) .ai-panel-status-badge,
:global(.dark) .ai-panel-status-badge,
:global(body.designiy-dark) .ai-panel-status-badge {
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
}

:global(html.dark) .ai-panel-interaction,
:global(.dark) .ai-panel-interaction,
:global(body.designiy-dark) .ai-panel-interaction {
  background-color: rgba(120, 53, 15, 0.2);
}
:global(html.dark) .ai-panel-interaction .text-amber-900,
:global(.dark) .ai-panel-interaction .text-amber-900,
:global(body.designiy-dark) .ai-panel-interaction .text-amber-900 {
  color: #fde68a;
}
:global(html.dark) .ai-panel-option-btn,
:global(.dark) .ai-panel-option-btn,
:global(body.designiy-dark) .ai-panel-option-btn {
  background-color: var(--1s-surface-background);
  color: #fde68a;
}
:global(html.dark) .ai-panel-option-btn:hover,
:global(.dark) .ai-panel-option-btn:hover,
:global(body.designiy-dark) .ai-panel-option-btn:hover {
  background-color: rgba(245, 158, 11, 0.2);
}
:global(html.dark) .ai-panel-input,
:global(.dark) .ai-panel-input,
:global(body.designiy-dark) .ai-panel-input {
  background-color: var(--1s-surface-background);
}

:global(html.dark) .ai-ref-image,
:global(.dark) .ai-ref-image,
:global(body.designiy-dark) .ai-ref-image {
  background-color: rgba(120, 53, 15, 0.15);
}
:global(html.dark) .ai-ref-image .text-amber-700,
:global(.dark) .ai-ref-image .text-amber-700,
:global(body.designiy-dark) .ai-ref-image .text-amber-700 {
  color: #fbbf24;
}

:global(html.dark) .ai-panel-drag-overlay,
:global(.dark) .ai-panel-drag-overlay,
:global(body.designiy-dark) .ai-panel-drag-overlay {
  background-color: rgba(0, 0, 0, 0.85);
}

:global(html.dark) .ai-param-banner,
:global(.dark) .ai-param-banner,
:global(body.designiy-dark) .ai-param-banner {
  border-color: var(--1s-accent-color-soft);
  background-color: var(--1s-hover-background);
}
:global(html.dark) .ai-param-banner:hover,
:global(.dark) .ai-param-banner:hover,
:global(body.designiy-dark) .ai-param-banner:hover {
  border-color: var(--1s-accent-color);
  background-color: var(--1s-active-background);
}
:global(html.dark) .ai-param-banner .ai-param-badge,
:global(.dark) .ai-param-banner .ai-param-badge,
:global(body.designiy-dark) .ai-param-banner .ai-param-badge {
  background-color: var(--1s-accent-color) !important;
  color: #ffffff !important;
}
:global(html.dark) .ai-param-banner .ai-param-banner__desc,
:global(.dark) .ai-param-banner .ai-param-banner__desc,
:global(body.designiy-dark) .ai-param-banner .ai-param-banner__desc {
  color: var(--1s-text-color);
}
:global(html.dark) .ai-param-banner .ai-param-banner__content:hover .ai-param-banner__desc,
:global(.dark) .ai-param-banner .ai-param-banner__content:hover .ai-param-banner__desc,
:global(body.designiy-dark) .ai-param-banner .ai-param-banner__content:hover .ai-param-banner__desc {
  color: var(--1s-accent-color);
}
:global(html.dark) .ai-param-banner .ai-param-banner__action,
:global(.dark) .ai-param-banner .ai-param-banner__action,
:global(body.designiy-dark) .ai-param-banner .ai-param-banner__action {
  color: var(--1s-accent-color);
}

/* ===== Scrollbar ===== */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
