<template>
  <Accordion
    type="multiple"
    :model-value="activeNames"
    @update:model-value="v => (activeNames = v as string[])"
  >
    <AccordionItem value="source">
      <AccordionTrigger>源码</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>Mermaid</template>
          <template #content>
            <div class="mermaid-source-editor">
              <div class="mermaid-source-editor__toolbar">
                <Popover v-model:open="aiPopoverVisible">
                  <PopoverTrigger as-child>
                    <Button size="sm" variant="outline" @click.stop>AI</Button>
                  </PopoverTrigger>
                  <PopoverContent side="right" align="start" class="w-[340px]">
                    <div class="mermaid-ai-popover">
                      <Textarea
                        v-model="aiPrompt"
                        :rows="4"
                        class="resize-y"
                        spellcheck="false"
                        :disabled="aiLoading"
                        placeholder="描述图表，例如：生成一个 AI 绘图流程图，包含输入、模型、审核、输出"
                        @keydown.enter.ctrl="generateSourceByAi"
                      ></Textarea>

                      <div class="mermaid-ai-popover__actions">
                        <Button
                          size="sm"
                          variant="ghost"
                          @click="aiPopoverVisible = false"
                          >取消</Button
                        >
                        <Button
                          size="sm"
                          variant="default"
                          :disabled="!aiPrompt.trim() || aiLoading"
                          @click="generateSourceByAi"
                        >
                          确定
                        </Button>
                      </div>

                      <div v-if="aiError" class="mermaid-error">{{ aiError }}</div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <Textarea
                v-model="currentOperatingCanvasChild.source"
                :rows="10"
                class="mermaid-source-editor__input resize-y"
                spellcheck="false"
                placeholder="flowchart TD&#10;  A[开始] --> B[完成]"
              ></Textarea>
            </div>
          </template>
        </operate-form-item>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="basic">
      <AccordionTrigger>基础</AccordionTrigger>
      <AccordionContent>
        <operateItemSize
          label="尺寸"
          v-model:width="currentOperatingCanvasChild.width"
          v-model:height="currentOperatingCanvasChild.height"
        ></operateItemSize>

        <operate-form-item>
          <template #name>主题</template>
          <template #content>
            <Select v-model="mermaidConfig.theme">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="base">Base</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="forest">Forest</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </template>
        </operate-form-item>

        <operateItemBackgroundColor v-model="currentOperatingCanvasChild.backgroundColor"></operateItemBackgroundColor>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="config">
      <AccordionTrigger>Config</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>原生配置</template>
          <template #content>
            <Button size="sm" variant="default" @click="openConfigDialog">编辑配置</Button>
          </template>
        </operate-form-item>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="common">
      <AccordionTrigger>通用属性</AccordionTrigger>
      <AccordionContent>
        <operateItemCommonGroup v-model="currentOperatingCanvasChild"></operateItemCommonGroup>
      </AccordionContent>
    </AccordionItem>
  </Accordion>

  <Dialog :modal="false" v-model:open="configDialogVisible">
    <DialogContent
      class="mermaid-config-dialog max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] rounded-none grid-rows-[auto_1fr_auto]"
    >
      <DialogHeader>
        <DialogTitle>编辑 Mermaid Config</DialogTitle>
      </DialogHeader>
      <div class="mermaid-config-editor">
        <div class="mermaid-config-editor__toolbar">
          <Popover v-model:open="configAiPopoverVisible">
            <PopoverTrigger as-child>
              <Button size="sm" variant="outline" @click.stop>AI 生成配置</Button>
            </PopoverTrigger>
            <PopoverContent side="right" align="start" class="w-[360px]">
              <div class="mermaid-ai-popover">
                <Textarea
                  v-model="configAiPrompt"
                  :rows="4"
                  class="resize-y"
                  spellcheck="false"
                  :disabled="configAiLoading"
                  placeholder="描述配置风格，例如：白底蓝紫科技风，文字大一些，线条更粗"
                  @keydown.enter.ctrl="generateConfigByAi"
                ></Textarea>

                <div class="mermaid-ai-popover__actions">
                  <Button
                    size="sm"
                    variant="ghost"
                    @click="configAiPopoverVisible = false"
                    >取消</Button
                  >
                  <Button
                    size="sm"
                    variant="default"
                    :disabled="!configAiPrompt.trim() || configAiLoading"
                    @click="generateConfigByAi"
                  >
                    确定
                  </Button>
                </div>

                <div v-if="configAiError" class="mermaid-error">{{ configAiError }}</div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Textarea
          v-model="configText"
          class="mermaid-config-editor__input resize-none"
          spellcheck="false"
          placeholder="{ theme: 'base', themeVariables: { fontSize: '28px' } }"
        ></Textarea>
        <div v-if="configError" class="mermaid-error">{{ configError }}</div>
      </div>

      <DialogFooter>
        <Button size="sm" variant="outline" @click="configDialogVisible = false">取消</Button>
        <Button size="sm" variant="outline" @click="formatConfigText">格式化</Button>
        <Button size="sm" variant="default" @click="confirmConfigText">应用配置</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import operateItemSize from '@/components/design/layout/canvas/operate/size/relativeSize.vue'
import operateItemCommonGroup from '@/components/design/layout/canvas/operate/commonGroup.vue'
import operateItemBackgroundColor from '@/components/design/layout/canvas/operate/backgroundColor.vue'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { canvasStickerOptionsOnlyChild, currentOperatingCanvasChild } from '../index.tsx'
import { formatSizeOptionToPixelValue } from '../helper'
import { generateMermaidConfig, generateMermaidSource } from '../children/aiMermaidService'

const activeNames = ref(['source', 'basic', 'config', 'common'])
const aiPopoverVisible = ref(false)
const aiPrompt = ref('')
const aiLoading = ref(false)
const aiError = ref('')
const configDialogVisible = ref(false)
const configText = ref('')
const configError = ref('')
const configAiPopoverVisible = ref(false)
const configAiPrompt = ref('')
const configAiLoading = ref(false)
const configAiError = ref('')

const mermaidConfig = computed(() => {
  const child = currentOperatingCanvasChild.value
  if (!child.config || typeof child.config !== 'object' || Array.isArray(child.config)) {
    child.config = {}
  }
  if (!child.config.theme) {
    child.config.theme = 'default'
  }
  return child.config
})

function syncConfigText() {
  configText.value = stringifyConfig(mermaidConfig.value || {})
  configError.value = ''
}

function openConfigDialog() {
  syncConfigText()
  configDialogVisible.value = true
}

function confirmConfigText() {
  try {
    const nextConfig = parseConfigText(configText.value)
    if (!nextConfig || typeof nextConfig !== 'object' || Array.isArray(nextConfig)) {
      configError.value = 'Config 必须是一个对象'
      return
    }
    currentOperatingCanvasChild.value.config = nextConfig
    configText.value = stringifyConfig(nextConfig)
    configError.value = ''
    configDialogVisible.value = false
  } catch (error: any) {
    configError.value = error?.message || '配置解析失败'
  }
}

function formatConfigText() {
  try {
    configText.value = stringifyConfig(parseConfigText(configText.value))
    configError.value = ''
  } catch (error: any) {
    configError.value = error?.message || '配置解析失败'
  }
}

function parseConfigText(text: string) {
  const source = (text || '{}').trim()
  if (!source) return {}

  try {
    return JSON.parse(source)
  } catch {
    // Continue with JavaScript object literal parsing.
  }

  try {
    return Function(
      '"use strict";\n' +
      'const window = undefined, document = undefined, globalThis = undefined, global = undefined, process = undefined, require = undefined, importScripts = undefined, fetch = undefined, XMLHttpRequest = undefined;\n' +
      `return (${source});`,
    )()
  } catch (error: any) {
    throw new Error(error?.message ? `配置解析失败：${error.message}` : '配置解析失败')
  }
}

function stringifyConfig(value: any, indent = 0, seen = new WeakSet<object>()): string {
  const space = '  '.repeat(indent)
  const nextSpace = '  '.repeat(indent + 1)

  if (value === null) return 'null'

  const valueType = typeof value
  if (valueType === 'function') return value.toString()
  if (valueType === 'string') return JSON.stringify(value)
  if (valueType === 'number') return Number.isFinite(value) ? String(value) : 'null'
  if (valueType === 'boolean') return String(value)
  if (valueType === 'undefined') return 'undefined'

  if (typeof value !== 'object') {
    return JSON.stringify(value)
  }

  if (seen.has(value)) {
    return 'undefined'
  }
  seen.add(value)

  if (Array.isArray(value)) {
    if (!value.length) {
      seen.delete(value)
      return '[]'
    }
    const items = value.map((item) => `${nextSpace}${stringifyConfig(item, indent + 1, seen)}`)
    seen.delete(value)
    return `[\n${items.join(',\n')}\n${space}]`
  }

  const keys = Object.keys(value)
  if (!keys.length) {
    seen.delete(value)
    return '{}'
  }

  const entries = keys.map((key) => {
    const safeKey = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)
    return `${nextSpace}${safeKey}: ${stringifyConfig(value[key], indent + 1, seen)}`
  })
  seen.delete(value)

  return `{\n${entries.join(',\n')}\n${space}}`
}

async function generateSourceByAi() {
  const prompt = aiPrompt.value.trim()
  if (!prompt || aiLoading.value) return

  aiLoading.value = true
  aiError.value = ''

  try {
    const canvasChild = canvasStickerOptionsOnlyChild.value
    const mermaidChild = currentOperatingCanvasChild.value
    const result = await generateMermaidSource(prompt, mermaidChild?.source || '', {
      canvasWidth: Number(canvasChild?.width?.value),
      canvasHeight: Number(canvasChild?.height?.value),
      unit: canvasChild?.width?.unit || 'px',
      elementWidth: Number(formatSizeOptionToPixelValue(mermaidChild?.width)),
      elementHeight: Number(formatSizeOptionToPixelValue(mermaidChild?.height)),
    })
    currentOperatingCanvasChild.value.source = result.source
    aiPrompt.value = ''
    aiPopoverVisible.value = false
  } catch (error: any) {
    aiError.value = error?.message || 'AI 生成失败，请重试'
  } finally {
    aiLoading.value = false
  }
}

async function generateConfigByAi() {
  const prompt = configAiPrompt.value.trim()
  if (!prompt || configAiLoading.value) return

  configAiLoading.value = true
  configAiError.value = ''

  try {
    const canvasChild = canvasStickerOptionsOnlyChild.value
    const mermaidChild = currentOperatingCanvasChild.value
    let currentConfig = mermaidConfig.value || {}
    try {
      currentConfig = parseConfigText(configText.value)
      configError.value = ''
    } catch (error: any) {
      configError.value = error?.message || '当前配置解析失败，AI 已基于已应用配置生成'
    }

    const result = await generateMermaidConfig(prompt, mermaidChild?.source || '', currentConfig, {
      canvasWidth: Number(canvasChild?.width?.value),
      canvasHeight: Number(canvasChild?.height?.value),
      unit: canvasChild?.width?.unit || 'px',
      elementWidth: Number(formatSizeOptionToPixelValue(mermaidChild?.width)),
      elementHeight: Number(formatSizeOptionToPixelValue(mermaidChild?.height)),
    })

    currentOperatingCanvasChild.value.config = result.config
    configText.value = stringifyConfig(result.config)
    configError.value = ''
    configAiPrompt.value = ''
    configAiPopoverVisible.value = false
  } catch (error: any) {
    configAiError.value = error?.message || 'AI 生成失败，请重试'
  } finally {
    configAiLoading.value = false
  }
}

watch(
  () => currentOperatingCanvasChild.value?.id,
  () => {
    syncConfigText()
    aiError.value = ''
    configAiError.value = ''
  },
  { immediate: true },
)
</script>

<style scoped>
.mermaid-source-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mermaid-source-editor__toolbar {
  display: flex;
  justify-content: flex-end;
}

.mermaid-ai-popover {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mermaid-ai-popover__actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.mermaid-error {
  color: #c45656;
  font-size: 12px;
  line-height: 1.4;
}

.mermaid-source-editor__input,
.mermaid-config-editor__input {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.55;
}

.mermaid-config-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.mermaid-config-editor__toolbar {
  display: flex;
  justify-content: flex-start;
}

.mermaid-config-editor__input {
  flex: 1;
  min-height: 0;
  height: 100%;
}
</style>
