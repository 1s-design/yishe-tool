export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | AiChatContentPart[]
}

export interface AiChatContentPart {
  type: 'text' | 'image_url'
  text?: string
  image_url?: { url: string }
}

/**
 * 请求选项。
 *
 * 硬保证：Key 与模型固定取「AI 使用设置」中该功能绑定的配置，
 * 因此不提供 model / keyId 覆盖项。
 */
export interface AiChatOptions {
  featureCode: string
  messages: AiChatMessage[]
  stream?: boolean
  temperature?: number
  maxTokens?: number
  [key: string]: any
}

export interface AiTextOptions {
  featureCode: string
  prompt: string
  systemPrompt?: string
  stream?: boolean
  temperature?: number
  maxTokens?: number
  responseFormat?: any
  [key: string]: any
}

export interface AiVisionOptions {
  featureCode: string
  prompt: string
  imageUrls: string[]
  systemPrompt?: string
  [key: string]: any
}

export interface AiChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: AiChatChoice[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface AiChatChoice {
  index: number
  message: AiChatMessage
  finish_reason: string
}

export interface AiStreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: AiStreamChoice[]
}

export interface AiStreamChoice {
  index: number
  delta: Partial<AiChatMessage>
  finish_reason: string | null
}

export interface AiRuntimeConfig {
  name: string
  apiKey: string
  baseURL: string
  model: string
  maxTokens?: number
  temperature?: number
  source: 'user' | 'public'
  keyId?: number | null
}

export interface AiMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  loading?: boolean
  error?: string
  featureCode?: string
  meta?: Record<string, any>
}

export interface AiConversation {
  id: string
  title: string
  featureCode: string
  messages: AiMessage[]
  createdAt: number
  updatedAt: number
}
