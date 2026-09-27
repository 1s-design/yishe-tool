<template>
  <Accordion
    type="multiple"
    :model-value="activeNames"
    @update:model-value="v => (activeNames = v as string[])"
  >
    <AccordionItem value="source">
      <AccordionTrigger>代码</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>源码</template>
          <template #content>
            <div class="code-block-source-editor">
              <div class="code-block-source-editor__toolbar">
                <Popover v-model:open="aiPopoverVisible">
                  <PopoverTrigger as-child>
                    <Button size="sm" variant="outline">AI</Button>
                  </PopoverTrigger>
                  <PopoverContent side="right" align="start" class="w-[340px]">
                    <div class="code-block-ai-popover">
                      <Textarea
                        v-model="aiPrompt"
                        :rows="4"
                        class="resize-vertical"
                        spellcheck="false"
                        :disabled="aiLoading"
                        placeholder="描述代码，例如：写一个 Vue 组合式函数，处理倒计时"
                        @keydown.enter.ctrl="generateCodeByAi"
                      />

                      <div class="code-block-ai-popover__actions">
                        <Button size="sm" variant="outline" @click="aiPopoverVisible = false">取消</Button>
                        <Button
                          size="sm"
                          :disabled="!aiPrompt.trim() || aiLoading"
                          @click="generateCodeByAi"
                        >
                          确定
                        </Button>
                      </div>

                      <div v-if="aiError" class="code-block-error">{{ aiError }}</div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <Textarea
                v-model="currentOperatingCanvasChild.source"
                :rows="10"
                class="code-block-source-editor__input resize-vertical"
                spellcheck="false"
                placeholder="const message = 'Hello Shiki'"
              />
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
          <template #name>语言</template>
          <template #content>
            <Select v-model="currentOperatingCanvasChild.language">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="lang in CODE_BLOCK_LANGUAGES"
                  :key="lang"
                  :value="lang"
                >
                  {{ lang }}
                </SelectItem>
              </SelectContent>
            </Select>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>主题</template>
          <template #content>
            <Select v-model="currentOperatingCanvasChild.theme">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="theme in CODE_BLOCK_THEMES"
                  :key="theme"
                  :value="theme"
                >
                  {{ theme }}
                </SelectItem>
              </SelectContent>
            </Select>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>文件名</template>
          <template #content>
            <Input
              v-model="currentOperatingCanvasChild.filename"
              class="h-6 text-[11px]"
              placeholder="example.ts"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>显示项</template>
          <template #content>
            <div class="code-block-switches">
              <div class="flex items-center gap-1.5">
                <Checkbox v-model:checked="currentOperatingCanvasChild.showHeader" id="code-block-show-header" />
                <Label for="code-block-show-header">标题栏</Label>
              </div>
              <div class="flex items-center gap-1.5">
                <Checkbox v-model:checked="currentOperatingCanvasChild.showLineNumbers" id="code-block-show-line-numbers" />
                <Label for="code-block-show-line-numbers">行号</Label>
              </div>
              <div class="flex items-center gap-1.5">
                <Checkbox v-model:checked="currentOperatingCanvasChild.wrap" id="code-block-wrap" />
                <Label for="code-block-wrap">换行</Label>
              </div>
            </div>
          </template>
        </operate-form-item>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="style">
      <AccordionTrigger>样式</AccordionTrigger>
      <AccordionContent>
        <operateItemFontSize
          label="代码字号"
          v-model="currentOperatingCanvasChild.fontSize"
        ></operateItemFontSize>
        <operateItemFontFamily
          label="代码字体"
          v-model="currentOperatingCanvasChild.fontFamilyInfo"
        ></operateItemFontFamily>
        <operateItemBackgroundColor v-model="currentOperatingCanvasChild.backgroundColor"></operateItemBackgroundColor>

        <operate-form-item>
          <template #name>行高</template>
          <template #content>
            <Input
              type="number"
              :model-value="currentOperatingCanvasChild.lineHeight"
              :min="0.8"
              :max="3"
              :step="0.05"
              class="h-6 text-[11px]"
              @update:model-value="v => (currentOperatingCanvasChild.lineHeight = Number(v))"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>内边距</template>
          <template #content>
            <Input
              type="number"
              :model-value="currentOperatingCanvasChild.padding.value"
              :min="0"
              :max="1000"
              class="h-6 text-[11px]"
              @update:model-value="v => (currentOperatingCanvasChild.padding.value = Number(v))"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>圆角</template>
          <template #content>
            <Input
              type="number"
              :model-value="currentOperatingCanvasChild.borderRadius.value"
              :min="0"
              :max="1000"
              class="h-6 text-[11px]"
              @update:model-value="v => (currentOperatingCanvasChild.borderRadius.value = Number(v))"
            />
          </template>
        </operate-form-item>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="config">
      <AccordionTrigger>Config</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>原生配置</template>
          <template #content>
            <Button size="sm" @click="openConfigDialog">编辑配置</Button>
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
    <DialogContent class="code-block-config-dialog max-w-none h-screen w-screen rounded-none">
      <DialogHeader>
        <DialogTitle>编辑 Shiki Config</DialogTitle>
      </DialogHeader>

      <div class="code-block-config-editor">
        <Textarea
          v-model="configText"
          class="resize-none"
          spellcheck="false"
          placeholder="{ transformers: [] }"
        />
        <div v-if="configError" class="code-block-error">{{ configError }}</div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="configDialogVisible = false">取消</Button>
        <Button variant="outline" @click="formatConfigText">格式化</Button>
        <Button @click="confirmConfigText">应用配置</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import operateItemSize from '@/components/design/layout/canvas/operate/size/relativeSize.vue'
import operateItemCommonGroup from '@/components/design/layout/canvas/operate/commonGroup.vue'
import operateItemFontSize from '@/components/design/layout/canvas/operate/fontSize.vue'
import operateItemFontFamily from '@/components/design/layout/canvas/operate/fontFamily/fontFamily.vue'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
import { currentOperatingCanvasChild } from '../index.tsx'
import { CODE_BLOCK_LANGUAGES, CODE_BLOCK_THEMES } from '../children/codeBlock'
import { generateCodeBlockSource } from '../children/aiCodeBlockService'

const activeNames = ref(['source', 'basic', 'style', 'config', 'common'])
const aiPopoverVisible = ref(false)
const aiPrompt = ref('')
const aiLoading = ref(false)
const aiError = ref('')
const configDialogVisible = ref(false)
const configText = ref('')
const configError = ref('')

function syncConfigText() {
  configText.value = stringifyConfig(currentOperatingCanvasChild.value?.config || {})
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

async function generateCodeByAi() {
  const prompt = aiPrompt.value.trim()
  if (!prompt || aiLoading.value) return

  aiLoading.value = true
  aiError.value = ''

  try {
    const result = await generateCodeBlockSource(
      prompt,
      currentOperatingCanvasChild.value?.language || 'text',
      currentOperatingCanvasChild.value?.source || '',
    )
    currentOperatingCanvasChild.value.source = result.source
    aiPrompt.value = ''
    aiPopoverVisible.value = false
  } catch (error: any) {
    aiError.value = error?.message || 'AI 生成失败，请重试'
  } finally {
    aiLoading.value = false
  }
}

watch(
  () => currentOperatingCanvasChild.value?.id,
  () => {
    syncConfigText()
    aiError.value = ''
  },
  { immediate: true },
)
</script>

<style scoped>
.code-block-source-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.code-block-source-editor__toolbar {
  display: flex;
  justify-content: flex-end;
}

.code-block-ai-popover {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.code-block-ai-popover__actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.code-block-error {
  color: #c45656;
  font-size: 12px;
  line-height: 1.4;
}

.code-block-switches {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.code-block-source-editor__input,
.code-block-config-editor :deep(textarea) {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.55;
}

.code-block-config-editor {
  height: calc(100vh - 142px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.code-block-config-editor :deep(textarea) {
  flex: 1;
  min-height: 0;
  height: 100%;
}
</style>
