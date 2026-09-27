<template>
  <div class="collaborative-chat">
    <!-- 消息列表 -->
    <div class="chat-messages" ref="messagesRef">
      <div
        v-for="msg in displayMessages"
        :key="msg.id"
        :class="['message-item', msg.role === 'user' ? 'user' : 'assistant']"
      >
        <div class="message-avatar">
          {{ msg.role === "user" ? "👤" : "🎨" }}
        </div>
        <div class="message-bubble">
          <div class="message-content">
            <div v-if="msg.content" class="text-content">{{ msg.content }}</div>
            <div v-if="msg.tool_calls?.length" class="tool-calls">
              <div
                v-for="call in msg.tool_calls"
                :key="call.id"
                class="tool-call-item"
              >
                <Badge variant="secondary"
                  >🔧 {{ call.function.name }}</Badge
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="agent.isProcessing.value" class="message-item assistant">
        <div class="message-avatar">🎨</div>
        <div class="message-bubble loading">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <!-- 人工介入弹窗 -->
    <Dialog v-model:open="showInteraction">
      <DialogContent
        class="max-w-[420px]"
        @escape-key-down.prevent
        @interact-outside.prevent
      >
        <DialogHeader>
          <DialogTitle>{{ interactionData?.question || '请选择' }}</DialogTitle>
        </DialogHeader>
      <div
        v-if="interactionData?.type === 'ask_choice'"
        class="interaction-choice"
      >
        <RadioGroup
          v-if="interactionData.options?.length"
          v-model="userAnswer"
          class="options-group"
        >
          <label
            v-for="opt in interactionData.options"
            :key="opt"
            class="option-item flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2"
          >
            <RadioGroupItem :value="opt" />
            <span class="text-xs">{{ opt }}</span>
          </label>
        </RadioGroup>
        <div v-if="interactionData.options?.length" class="flex items-center gap-2">
          <Separator class="flex-1" />
          <span class="text-xs text-muted-foreground">或者</span>
          <Separator class="flex-1" />
        </div>
        <Input
          v-model="userAnswer"
          placeholder="输入你的回答..."
          @keydown.enter="submitAnswer"
        />
      </div>

      <div
        v-if="interactionData?.type === 'request_feedback'"
        class="interaction-feedback"
      >
        <Textarea
          v-model="userAnswer"
          :rows="3"
          placeholder="输入你的反馈..."
          @keydown.enter.ctrl="submitAnswer"
        />
      </div>

      <DialogFooter>
        <Button
          :disabled="!userAnswer.trim()"
          @click="submitAnswer"
          >确定</Button
        >
      </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 输入区域 -->
    <div class="chat-input">
      <div class="flex items-center">
        <Input
          v-model="inputText"
          placeholder="描述你想要的设计..."
          :disabled="agent.isProcessing.value"
          class="rounded-r-none"
          @keydown.enter.exact.prevent="handleSend"
          @compositionstart="isComposing = true"
          @compositionend="isComposing = false"
        />
        <Button
          variant="outline"
          class="rounded-l-none"
          :disabled="agent.isProcessing.value"
          @click="handleSend"
        >
          发送
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from "vue";
import { designAgent } from "@/ai/langgraph";
import type { AgentInteraction } from "@/ai/langgraph";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

const agent = designAgent;

const messagesRef = ref<HTMLElement>();
const inputText = ref("");
const isComposing = ref(false);

const showInteraction = ref(false);
const interactionData = ref<AgentInteraction | null>(null);
const userAnswer = ref("");

const displayMessages = computed(() => {
  return agent.state.value.messages
    .filter((m) => m.role !== "tool")
    .map((m) => ({
      ...m,
      loading: false,
    }));
});

let unsubscribe: (() => void) | null = null;

onMounted(() => {
  unsubscribe = agent.onEvent((event) => {
    if (event.type === "interaction") {
      interactionData.value = event.data;
      showInteraction.value = true;
      userAnswer.value = "";
    }
    if (event.type === "message" || event.type === "done") {
      scrollToBottom();
    }
  });
});

onUnmounted(() => {
  unsubscribe?.();
});

function handleSend() {
  if (isComposing.value) return;
  const text = inputText.value.trim();
  if (!text || agent.isProcessing.value) return;
  agent.chat(text);
  inputText.value = "";
}

function submitAnswer() {
  if (!userAnswer.value.trim()) return;
  agent.submitUserResponse(userAnswer.value.trim());
  showInteraction.value = false;
  userAnswer.value = "";
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
    }
  });
}

watch(
  () => agent.state.value.messages.length,
  () => scrollToBottom(),
);
</script>

<style scoped lang="less">
.collaborative-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--1s-surface-background, #fff);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  gap: 8px;
  max-width: 85%;

  &.user {
    align-self: flex-end;
    flex-direction: row-reverse;

    .message-bubble {
      background: var(--1s-accent-color, #1890ff);
      color: #fff;
      border-radius: 12px 12px 2px 12px;
    }
  }

  &.assistant {
    align-self: flex-start;

    .message-bubble {
      background: var(--1s-elevated-background, #f5f5f5);
      border-radius: 12px 12px 12px 2px;

      &.loading {
        display: flex;
        gap: 4px;
        padding: 12px 16px;

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #999;
          animation: bounce 1.4s infinite ease-in-out;

          &:nth-child(1) {
            animation-delay: -0.32s;
          }
          &:nth-child(2) {
            animation-delay: -0.16s;
          }
        }
      }
    }
  }
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  background: var(--1s-elevated-background, #f5f5f5);
}

.message-bubble {
  padding: 10px 14px;
  line-height: 1.6;
}

.message-content {
  .text-content {
    white-space: pre-wrap;
    word-break: break-word;
  }

  .tool-calls {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
}

.interaction-choice {
  .options-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .option-item {
    width: 100%;
    margin: 0;
  }
}

.chat-input {
  padding: 12px;
  border-top: 1px solid var(--1s-border-color, #e8e8e8);
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
</style>
