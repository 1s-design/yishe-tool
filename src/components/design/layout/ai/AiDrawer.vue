<template>
  <aside v-if="open" class="ai-drawer">
    <div class="drawer-header">
      <div class="header-left">
        <span class="header-icon">🎨</span>
        <span class="header-title">AI 设计助手</span>
      </div>
      <Button variant="ghost" size="sm" @click="clearChat" :disabled="isProcessing">
        <Trash2 class="h-3.5 w-3.5 mr-1" /> 清空对话
      </Button>
    </div>

    <!-- 消息区域 -->
    <div class="messages-container" ref="messagesRef">
      <!-- 欢迎页 -->
      <div v-if="messages.length === 0" class="welcome">
        <div class="welcome-icon">🎨</div>
        <h3>AI 设计助手</h3>
        <p>描述你想要的设计，我会帮你创建</p>

        <div class="quick-actions">
          <div class="quick-title">快速开始</div>
          <div
            v-for="q in quickPrompts"
            :key="q.label"
            class="quick-item"
            @click="sendQuick(q.prompt)"
          >
            <span class="quick-icon">{{ q.icon }}</span>
            <span>{{ q.label }}</span>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-else class="messages-list">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['message', `message--${msg.role}`]"
        >
          <!-- 用户消息 -->
          <template v-if="msg.role === 'user'">
            <div class="message-bubble user-bubble">
              {{ msg.content }}
            </div>
          </template>

          <!-- AI 消息 -->
          <template v-if="msg.role === 'assistant'">
            <div class="message-header">
              <span class="ai-avatar">AI</span>
              <span class="ai-name">设计助手</span>
            </div>
            <div class="message-bubble ai-bubble">
              <div v-if="msg.content" class="message-text">
                {{ msg.content }}
              </div>
              <div v-if="msg.tool_calls?.length" class="tool-calls">
                <div
                  v-for="call in msg.tool_calls"
                  :key="call.id"
                  class="tool-call"
                >
                  <span class="tool-icon">⚡</span>
                  <span>{{ formatToolName(call.function.name) }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- 工具结果 -->
          <template v-if="msg.role === 'tool'">
            <div class="tool-result">
              <span
                :class="parseResult(msg.content).success ? 'success' : 'error'"
              >
                {{ parseResult(msg.content).success ? "✓" : "✗" }}
              </span>
              <span>{{ parseResult(msg.content).message }}</span>
            </div>
          </template>
        </div>

        <!-- 加载状态 -->
        <div v-if="isProcessing" class="message message--assistant">
          <div class="message-header">
            <span class="ai-avatar">AI</span>
            <span class="ai-name">设计助手</span>
          </div>
          <div class="message-bubble ai-bubble">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <!-- 用户交互区域（内嵌在对话中） -->
        <div v-if="interactionData" class="interaction-section">
          <div class="interaction-header">
            <span class="ai-avatar">AI</span>
            <span class="ai-name">需要你的选择</span>
          </div>
          <div class="interaction-content">
            <div class="interaction-question">
              {{ interactionData.question }}
            </div>

            <div
              v-if="interactionData.options?.length"
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

            <div v-if="interactionData.options?.length" class="divider-text">
              或者
            </div>

            <div class="interaction-input flex items-center gap-1.5">
              <Input
                v-model="customAnswer"
                placeholder="输入你的回答..."
                class="h-7 flex-1"
                @keydown.enter="submitInteraction(customAnswer)"
              />
              <Button
                size="sm"
                class="h-7"
                :disabled="!customAnswer.trim()"
                @click="submitInteraction(customAnswer)"
              >
                发送
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <Textarea
        v-model="inputText"
        :rows="3"
        placeholder="描述你想要的设计..."
        :disabled="isProcessing"
        class="min-h-[64px] resize-none"
        @keydown.enter.exact.prevent="handleSend"
        @compositionstart="isComposing = true"
        @compositionend="isComposing = false"
      />
      <div class="input-footer">
        <span class="input-hint">按 Enter 发送</span>
        <Button
          size="sm"
          :disabled="!inputText.trim() || isProcessing"
          @click="handleSend"
        >
          发送
        </Button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from "vue";
import { Trash2 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { designAgent } from "@/ai/langgraph";
import type { AgentInteraction } from "@/ai/langgraph";

// Agent
const agent = designAgent;

// 状态
const open = defineModel<boolean>("open", { default: false });
const inputText = ref("");
const isComposing = ref(false);
const messagesRef = ref<HTMLElement>();
const customAnswer = ref("");

// 计算属性
const messages = computed(() => agent.state.messages);
const isProcessing = computed(() => agent.isProcessing.value);
const interactionData = computed(() => agent.state.pendingInteraction);

// 快捷提示
const quickPrompts = [
  {
    icon: "🔴",
    label: "圆形贴纸",
    prompt: '创建一个圆形贴纸，红色背景，白色 "SALE 50%" 粗体大字居中',
  },
  {
    icon: "👕",
    label: "T恤印花",
    prompt:
      "为 T恤前胸创建一个印花设计，主图案是一只简约线条猫，居中，黑底白线",
  },
  {
    icon: "☕",
    label: "马克杯",
    prompt: '为马克杯创建一个印花设计，写 "GOOD MORNING"，手写风格',
  },
  {
    icon: "🎨",
    label: "海报设计",
    prompt: '创建一个 A3 海报设计，极简风格，黑底白字 "EXHIBITION"',
  },
];

// 监听事件
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  unsubscribe = agent.onEvent((event) => {
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
  scrollToBottom();
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
  customAnswer.value = "";
}

// 格式化工具名称
function formatToolName(name: string): string {
  const map: Record<string, string> = {
    get_canvas_state: "查看画布",
    add_text: "添加文字",
    add_rect: "添加矩形",
    set_background: "设置背景",
    canvas_smartSize: "设置尺寸",
    ask_choice: "询问用户",
    request_feedback: "请求反馈",
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
.ai-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 480px;
  max-width: 100vw;
  height: 100vh;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto;
  background: var(--1s-panel-background, hsl(var(--background)));
  border-left: 1px solid var(--1s-border-color, hsl(var(--border)));
  box-shadow: var(--1s-shadow-lg);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  flex-shrink: 0;
  padding: 16px 20px;
  border-bottom: 1px solid var(--1s-border-color, hsl(var(--border)));
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 20px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
}

// 消息容器
.messages-container {
  overflow-y: auto;
  padding: 20px;
  height: calc(100% - 140px);
}

// 欢迎页
.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 40px 20px;
}

.welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.welcome h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.welcome p {
  color: var(--1s-text-color-secondary);
  margin-bottom: 32px;
}

.quick-actions {
  width: 100%;
  max-width: 300px;
}

.quick-title {
  font-size: 12px;
  color: var(--1s-text-color-tertiary);
  margin-bottom: 12px;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--1s-control-surface-muted);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--1s-hover-background);
  }
}

.quick-icon {
  font-size: 18px;
}

// 消息列表
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  &--user {
    display: flex;
    justify-content: flex-end;
  }

  &--assistant {
    display: flex;
    flex-direction: column;
  }
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.ai-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--1s-text-color);
}

.message-bubble {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.6;

  &.user-bubble {
    background: #667eea;
    color: #fff;
    border-bottom-right-radius: 4px;
  }

  &.ai-bubble {
    background: var(--1s-control-surface-muted);
    border-bottom-left-radius: 4px;
  }
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.tool-calls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--1s-border-color);
}

.tool-call {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--1s-surface-background);
  border-radius: 6px;
  font-size: 12px;
  color: var(--1s-text-color-secondary);
}

.tool-icon {
  font-size: 14px;
}

.tool-result {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  color: var(--1s-text-color-secondary);

  .success {
    color: #52c41a;
  }
  .error {
    color: #ff4d4f;
  }
}

// 打字指示器
.typing-indicator {
  display: flex;
  gap: 4px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--1s-text-color-tertiary);
    animation: bounce 1.4s infinite ease-in-out;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

// 交互区域
.interaction-section {
  background: var(--1s-surface-background);
  border: 1px solid var(--1s-border-color);
  border-radius: 12px;
  overflow: hidden;
  margin-top: 8px;
}

.interaction-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--1s-control-surface-muted);
  border-bottom: 1px solid var(--1s-border-color);
}

.interaction-content {
  padding: 16px;
}

.interaction-question {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 16px;
}

.interaction-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.option-btn {
  padding: 12px 16px;
  background: var(--1s-control-surface-muted);
  border: 1px solid var(--1s-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;

  &:hover {
    border-color: var(--1s-accent-color);
    background: var(--1s-hover-background);
    color: var(--1s-accent-color);
  }
}

.divider-text {
  text-align: center;
  color: var(--1s-text-color-tertiary);
  font-size: 12px;
  margin: 12px 0;
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background: var(--1s-divider-color);
  }

  &::before {
    left: 0;
  }
  &::after {
    right: 0;
  }
}

.interaction-input {
  // 样式
}

// 输入区域
.input-area {
  flex-shrink: 0;
  padding: 16px 20px;
  border-top: 1px solid var(--1s-border-color);
  background: var(--1s-surface-background);
}

.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.input-hint {
  font-size: 12px;
  color: var(--1s-text-color-tertiary);
}
</style>
