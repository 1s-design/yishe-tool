<template>
  <div class="ai-float-chat">
    <transition name="ai-chat-panel">
      <div v-if="open" class="ai-float-chat__panel">
        <div class="ai-float-chat__header">
          <span>AI 设计助手</span>
          <span v-if="isProcessing" class="ai-float-chat__typing"
            >思考中...</span
          >
          <Button
            variant="link"
            size="icon-sm"
            @click="clearChat"
            class="ai-float-chat__clear-btn"
          >
            <Trash2 />
          </Button>
        </div>

        <div class="ai-float-chat__messages" ref="messagesRef">
          <!-- 调试信息 -->
          <div
            style="
              background: var(--1s-control-surface-muted);
              padding: 8px;
              font-size: 12px;
              margin-bottom: 8px;
            "
          >
            调试: messages.length = {{ messages.length }}
          </div>

          <!-- 欢迎页 -->
          <div v-if="messages.length === 0" class="ai-float-chat__empty">
            <div class="ai-float-chat__empty-icon">🎨</div>
            <div>描述你想要的设计，我会帮你创建</div>
            <div class="ai-float-chat__quick-list">
              <div
                v-for="q in quickPrompts"
                :key="q.label"
                class="ai-float-chat__quick"
                @click="sendQuick(q.prompt)"
              >
                {{ q.label }}
              </div>
            </div>
          </div>

          <!-- 消息列表 -->
          <template v-for="msg in messages" :key="msg.id">
            <!-- 调试：显示每条消息 -->
            <div
              style="
                background: var(--1s-control-surface-muted);
                padding: 4px 8px;
                font-size: 11px;
                margin: 4px 0;
              "
            >
              [{{ msg.role }}] {{ msg.content?.substring(0, 50) }}...
            </div>

            <!-- 用户消息 -->
            <div
              v-if="msg.role === 'user'"
              class="ai-float-chat__msg ai-float-chat__msg--user"
            >
              <div class="ai-float-chat__bubble">{{ msg.content }}</div>
            </div>

            <!-- AI 消息 -->
            <div
              v-if="msg.role === 'assistant'"
              class="ai-float-chat__msg ai-float-chat__msg--ai"
            >
              <div class="ai-float-chat__bubble">
                <div v-if="msg.content" class="ai-float-chat__text">
                  {{ msg.content }}
                </div>
                <div v-if="msg.tool_calls?.length" class="ai-float-chat__tools">
                  <Badge
                    v-for="call in msg.tool_calls"
                    :key="call.id"
                    variant="secondary"
                  >
                    🔧 {{ formatToolName(call.function.name) }}
                  </Badge>
                </div>
              </div>
            </div>

            <!-- 工具结果 -->
            <div
              v-if="msg.role === 'tool'"
              class="ai-float-chat__msg ai-float-chat__msg--tool"
            >
              <div class="ai-float-chat__tool-result">
                <span
                  :class="
                    parseResult(msg.content).success ? 'success' : 'error'
                  "
                >
                  {{ parseResult(msg.content).success ? "✓" : "✗" }}
                </span>
                {{ parseResult(msg.content).message }}
              </div>
            </div>
          </template>

          <!-- 加载状态 -->
          <div
            v-if="isProcessing"
            class="ai-float-chat__msg ai-float-chat__msg--ai"
          >
            <div class="ai-float-chat__bubble ai-float-chat__bubble--loading">
              <span class="ai-float-chat__dot"></span>
              <span class="ai-float-chat__dot"></span>
              <span class="ai-float-chat__dot"></span>
            </div>
          </div>
        </div>

        <!-- 人工介入弹窗 -->
        <Dialog
          :open="showInteraction"
          @update:open="v => (showInteraction = v)"
        >
          <DialogContent class="max-w-[360px] w-[360px]" @pointer-down-outside.prevent>
            <DialogHeader>
              <DialogTitle>{{ interactionData?.question || '请选择' }}</DialogTitle>
            </DialogHeader>
            <div
              v-if="interactionData?.options?.length"
              class="interaction-options"
            >
              <div
                v-for="opt in interactionData.options"
                :key="opt"
                class="option-btn"
                @click="submitInteraction(opt)"
              >
                {{ opt }}
              </div>
            </div>
            <div v-if="interactionData?.options?.length" class="flex items-center gap-2">
              <Separator class="flex-1" />
              <span class="text-xs text-muted-foreground">或者</span>
              <Separator class="flex-1" />
            </div>
            <Input
              v-model="customAnswer"
              placeholder="输入你的回答..."
              @keydown.enter="submitInteraction(customAnswer)"
            />
            <DialogFooter>
              <Button
                :disabled="!customAnswer.trim()"
                @click="submitInteraction(customAnswer)"
              >
                确定
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <!-- 输入区域 -->
        <div class="ai-float-chat__input-area">
          <Input
            v-model="inputText"
            placeholder="描述你想要的设计..."
            :disabled="isProcessing"
            @keydown.enter.exact.prevent="handleSend"
            @compositionstart="isComposing = true"
            @compositionend="isComposing = false"
          />
          <Button
            :disabled="isProcessing || !inputText.trim()"
            @click="handleSend"
            size="icon-sm"
            class="rounded-full"
          >
            <Send />
          </Button>
        </div>
      </div>
    </transition>

    <div
      class="ai-float-chat__trigger"
      @click="open = !open"
      :class="{ 'ai-float-chat__trigger--active': open }"
    >
      <div class="ai-float-chat__trigger-mark">
        <Bot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from "vue";
import { Bot, Trash2, Send } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { designAgent } from "@/ai/langgraph";
import type { AgentInteraction } from "@/ai/langgraph";

// Agent
const agent = designAgent;

// 状态
const open = ref(false);
const inputText = ref("");
const isComposing = ref(false);
const messagesRef = ref<HTMLElement>();
const showInteraction = ref(false);
const interactionData = ref<AgentInteraction | null>(null);
const customAnswer = ref("");

// 计算属性 - 直接使用 agent.state.messages
const messages = computed(() => agent.state.messages);
const isProcessing = computed(() => agent.isProcessing.value);

// 快捷提示
const quickPrompts = [
  {
    label: "圆形贴纸",
    prompt: '创建一个圆形贴纸，红色背景，白色 "SALE 50%" 粗体大字居中',
  },
  {
    label: "T恤印花",
    prompt:
      "为 T恤前胸创建一个印花设计，主图案是一只简约线条猫，居中，黑底白线",
  },
  {
    label: "马克杯",
    prompt: '为马克杯创建一个印花设计，写 "GOOD MORNING"，手写风格',
  },
  {
    label: "海报",
    prompt: '创建一个 A3 海报设计，极简风格，黑底白字 "EXHIBITION"',
  },
];

// 监听事件
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  unsubscribe = agent.onEvent((event) => {
    if (event.type === "interaction") {
      interactionData.value = event.data;
      showInteraction.value = true;
      customAnswer.value = "";
    }
    scrollToBottom();
  });
});

onUnmounted(() => {
  unsubscribe?.();
});

// 发送消息
function handleSend() {
  if (isComposing.value) return;
  const text = inputText.value.trim();
  if (!text || isProcessing.value) return;
  agent.chat(text);
  inputText.value = "";
}

// 快捷发送
function sendQuick(prompt: string) {
  inputText.value = prompt;
  handleSend();
}

// 清空对话
function clearChat() {
  agent.clearMessages();
}

// 提交交互
function submitInteraction(answer: string) {
  if (!answer.trim()) return;
  agent.submitUserResponse(answer.trim());
  showInteraction.value = false;
  customAnswer.value = "";
}

// 格式化工具名称
function formatToolName(name: string): string {
  const map: Record<string, string> = {
    get_canvas_state: "查看画布",
    add_text: "添加文字",
    add_rect: "添加矩形",
    set_background: "设置背景",
    ask_choice: "询问",
    request_feedback: "反馈",
  };
  return map[name] || name;
}

// 解析结果
function parseResult(content: string) {
  try {
    const parsed = JSON.parse(content);
    return {
      success: parsed.success !== false,
      message: parsed.message || (parsed.success ? "成功" : "失败"),
    };
  } catch {
    return { success: true, message: content };
  }
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
    }
  });
}

watch(() => messages.value.length, scrollToBottom);
</script>

<style lang="less" scoped>
.ai-float-chat {
  position: fixed;
  left: 24px;
  bottom: 24px;
  z-index: 10000;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.ai-float-chat__trigger {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--1s-dialog-border);
  border-radius: 50%;
  background: var(--1s-elevated-background);
  box-: none;
  color: var(--1s-text-color);
  cursor: pointer;
  transition:
    transform 0.22s ease,
    box- 0.22s ease,
    border-color 0.22s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    border-color: var(--1s-accent-color);
    box-: none;
  }

  &--active {
    color: var(--1s-menu-selected-text);
    border-color: var(--1s-accent-color);
    background: var(--1s-accent-color);
  }
}

.ai-float-chat__trigger-mark {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--1s-accent-color);
  color: var(--1s-primary-foreground);
  font-size: 16px;
  font-weight: 550;
  flex-shrink: 0;

  .ai-float-chat__trigger--active & {
    background: transparent;
  }
}

.ai-float-chat__panel {
  position: absolute;
  bottom: 48px;
  left: 0;
  width: 380px;
  height: 520px;
  background: var(--1s-surface-background);
  border: 1px solid var(--1s-dialog-border);
  border-radius: 18px;
  box-: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-float-chat__header {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  background: var(--1s-panel-background);
  color: var(--1s-text-color);
  font-size: 14px;
  font-weight: 700;
  gap: 8px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--1s-border-color);
}

.ai-float-chat__typing {
  font-size: 11px;
  font-weight: 400;
  opacity: 0.8;
}

.ai-float-chat__clear-btn {
  margin-left: auto;
  color: var(--1s-text-color-secondary) !important;

  &:hover {
    color: var(--1s-text-color) !important;
  }
}

.ai-float-chat__messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-float-chat__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--1s-text-color-tertiary);
  font-size: 13px;
  gap: 12px;
}

.ai-float-chat__empty-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: var(--1s-radius-medium);
  background: var(--1s-accent-color-soft);
  color: var(--1s-text-color-secondary);
  font-size: 24px;
}

.ai-float-chat__quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  max-width: 300px;
}

.ai-float-chat__quick {
  padding: 4px 10px;
  background: var(--1s-control-surface-muted);
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--1s-text-color);

  &:hover {
    background: var(--1s-hover-background);
  }
}

.ai-float-chat__msg {
  display: flex;

  &--user {
    justify-content: flex-end;
  }

  &--ai {
    justify-content: flex-start;
  }

  &--tool {
    justify-content: center;
  }
}

.ai-float-chat__bubble {
  max-width: 85%;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;

  .ai-float-chat__msg--user & {
    background: var(--1s-accent-color);
    color: var(--1s-primary-foreground);
    border-bottom-right-radius: 4px;
  }

  .ai-float-chat__msg--ai & {
    background: var(--1s-control-surface-muted);
    color: var(--1s-text-color);
    border-bottom-left-radius: 4px;
  }
}

.ai-float-chat__text {
  white-space: pre-wrap;
}

.ai-float-chat__tools {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.ai-float-chat__tool-result {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: var(--1s-control-surface-muted);
  border-radius: 12px;
  font-size: 11px;
  color: var(--1s-text-color-secondary);

  .success {
    color: #52c41a;
  }
  .error {
    color: #ff4d4f;
  }
}

.ai-float-chat__bubble--loading {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}

.ai-float-chat__dot {
  width: 6px;
  height: 6px;
  background: var(--1s-text-color-tertiary);
  border-radius: 50%;
  animation: dotPulse 1.4s infinite ease-in-out;

  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  &:nth-child(3) {
    animation-delay: 0.4s;
  }
}

@keyframes dotPulse {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.ai-float-chat__input-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--1s-border-color, #eee);
  flex-shrink: 0;
}

// 交互选项
.interaction-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.option-btn {
  padding: 10px 14px;
  background: var(--1s-control-surface-muted);
  border: 1px solid var(--1s-dialog-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  font-size: 13px;

  &:hover {
    border-color: var(--1s-accent-color);
    background: var(--1s-hover-background);
  }
}

// 动画
.ai-float-chat-panel-enter-active,
.ai-float-chat-panel-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.ai-float-chat-panel-enter-from,
.ai-float-chat-panel-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}
</style>
