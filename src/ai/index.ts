export {
  AI_FEATURE_REGISTRY,
  DESIGN_TOOL_FEATURE_CODES,
  getFeatureByCode,
  getFeaturesByGroup,
  getFeaturesByScene,
} from "./feature-codes";
export type { AiFeatureItem, DesignToolFeatureCode } from "./feature-codes";

export type {
  AiChatMessage,
  AiChatContentPart,
  AiChatOptions,
  AiTextOptions,
  AiVisionOptions,
  AiChatResponse,
  AiChatChoice,
  AiStreamChunk,
  AiStreamChoice,
  AiRuntimeConfig,
  AiMessage,
  AiConversation,
} from "./types";

export {
  aiSettings,
  getAiSettings,
  updateAiSettings,
  resetAiSettings,
  testAiConnection,
  DEFAULT_AI_SETTINGS,
} from "./settings";
export type {
  AiRequestMode,
  AiSettings,
  ConnectionTestResult,
} from "./settings";

export {
  aiChat,
  aiText,
  aiVision,
  aiGetUsageOptions,
  aiGetFeatureRegistry,
} from "./api";

export {
  aiConversations,
  aiCurrentConversationId,
  currentConversation,
  isAiPanelOpen,
  aiIsProcessing,
  createConversation,
  setCurrentConversation,
  deleteConversation,
  clearConversations,
  addMessage,
  updateMessage,
  appendToMessage,
} from "./store";

export {
  initAIConfig,
  isAIInitialized,
  getAIConfig,
  clearAIConfigCache,
  directChat,
  directChatStream,
} from "./direct-client";

export { captureCanvasForAI, getCanvasStateSummary } from "./capture";
