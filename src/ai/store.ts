import { ref, computed, watch } from 'vue'
import { useLocalStorage } from '@/utils/localStorage'
import type { AiMessage, AiConversation } from './types'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const conversations = useLocalStorage<AiConversation[]>('_1s_ai_conversations', [])
const currentConversationId = ref<string | null>(null)
const isAiPanelOpen = ref(false)
const pendingPromptInput = ref<string | null>(null)
const isProcessing = ref(false)

export const currentConversation = computed(() => {
  if (!currentConversationId.value) return null
  return conversations.value.find((c) => c.id === currentConversationId.value) || null
})

export function createConversation(featureCode: string, title?: string): AiConversation {
  const conv: AiConversation = {
    id: generateId(),
    title: title || '新对话',
    featureCode,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  conversations.value.unshift(conv)
  currentConversationId.value = conv.id
  return conv
}

export function setCurrentConversation(id: string | null) {
  currentConversationId.value = id
}

export function deleteConversation(id: string) {
  const idx = conversations.value.findIndex((c) => c.id === id)
  if (idx !== -1) {
    conversations.value.splice(idx, 1)
  }
  if (currentConversationId.value === id) {
    currentConversationId.value = conversations.value[0]?.id || null
  }
}

export function clearConversations() {
  conversations.value = []
  currentConversationId.value = null
}

export function addMessage(conversationId: string, message: Omit<AiMessage, 'id' | 'timestamp'>): AiMessage {
  const conv = conversations.value.find((c) => c.id === conversationId)
  if (!conv) throw new Error(`Conversation ${conversationId} not found`)

  const msg: AiMessage = {
    ...message,
    id: generateId(),
    timestamp: Date.now(),
  }
  conv.messages.push(msg)
  conv.updatedAt = Date.now()

  if (conv.messages.length === 1 && message.role === 'user') {
    const text = typeof message.content === 'string' ? message.content : ''
    conv.title = text.slice(0, 20) || '新对话'
  }

  return msg
}

export function updateMessage(
  conversationId: string,
  messageId: string,
  updates: Partial<Pick<AiMessage, 'content' | 'loading' | 'error' | 'meta'>>
) {
  const conv = conversations.value.find((c) => c.id === conversationId)
  if (!conv) return
  const msg = conv.messages.find((m) => m.id === messageId)
  if (!msg) return
  Object.assign(msg, updates)
  conv.updatedAt = Date.now()
}

export function appendToMessage(conversationId: string, messageId: string, chunk: string) {
  const conv = conversations.value.find((c) => c.id === conversationId)
  if (!conv) return
  const msg = conv.messages.find((m) => m.id === messageId)
  if (!msg) return
  msg.content = (msg.content || '') + chunk
  conv.updatedAt = Date.now()
}

export {
  conversations as aiConversations,
  currentConversationId as aiCurrentConversationId,
  isAiPanelOpen,
  isProcessing as aiIsProcessing,
  pendingPromptInput,
}
