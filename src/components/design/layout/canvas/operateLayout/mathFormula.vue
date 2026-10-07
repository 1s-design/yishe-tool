<template>
  >
    <section class="operate-section">
      <h4 class="operate-section__title">公式</h4>
      
        <operate-form-item>
          <template #name>LaTeX</template>
          <template #content>
            <div class="math-formula-editor">
              <div class="math-formula-editor__toolbar">
                <Popover v-model:open="aiPopoverVisible">
                  <PopoverTrigger as-child>
                    <Button size="sm" variant="outline" @click.stop>AI</Button>
                  </PopoverTrigger>
                  <PopoverContent side="right" align="start" class="w-[320px]">
                    <div class="math-ai-popover">
                      <Textarea
                        v-model="aiPrompt"
                        :rows="3"
                        class="resize-y"
                        spellcheck="false"
                        :disabled="aiLoading"
                        placeholder="描述公式，例如：二次方程求根公式 / 水的生成反应"
                        @keydown.enter.ctrl="generateFormulaByAi"
                      ></Textarea>

                      <div class="math-ai-popover__actions">
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
                          @click="generateFormulaByAi"
                        >
                          确定
                        </Button>
                      </div>

                      <div v-if="aiError" class="math-ai-popover__error">{{ aiError }}</div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <Textarea
                v-model="currentOperatingCanvasChild.formula"
                :rows="5"
                class="resize-y"
                spellcheck="false"
                placeholder="\frac{a}{b}=c 或 \ce{2H2 + O2 -> 2H2O}"
              ></Textarea>
            </div>
          </template>
        </operate-form-item>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">样式</h4>
      
        <operateItemFontSize
          label="公式大小"
          v-model="currentOperatingCanvasChild.fontSize"
        ></operateItemFontSize>
        <operateItemFontFamily
          label="公式字体"
          v-model="currentOperatingCanvasChild.fontFamilyInfo"
        ></operateItemFontFamily>
        <operateItemFontColor v-model="currentOperatingCanvasChild.fontColor"></operateItemFontColor>
        <operateItemBackgroundColor v-model="currentOperatingCanvasChild.backgroundColor"></operateItemBackgroundColor>
        <operateItemTextAlign v-model="currentOperatingCanvasChild.textAlign"></operateItemTextAlign>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">尺寸</h4>
      
        <operateItemSize
          label="尺寸"
          v-model:width="currentOperatingCanvasChild.width"
          v-model:height="currentOperatingCanvasChild.height"
        ></operateItemSize>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">通用属性</h4>
      
        <operateItemCommonGroup v-model="currentOperatingCanvasChild"></operateItemCommonGroup>
      
    </section>
  
</template>

<script setup lang="ts">
import { ref } from 'vue'
import operateItemSize from '@/components/design/layout/canvas/operate/size/relativeSize.vue'
import operateItemCommonGroup from '@/components/design/layout/canvas/operate/commonGroup.vue'
import operateItemFontSize from '@/components/design/layout/canvas/operate/fontSize.vue'
import operateItemFontFamily from '@/components/design/layout/canvas/operate/fontFamily/fontFamily.vue'
import operateItemFontColor from '@/components/design/layout/canvas/operate/fontColor.vue'
import operateItemBackgroundColor from '@/components/design/layout/canvas/operate/backgroundColor.vue'
import operateItemTextAlign from '@/components/design/layout/canvas/operate/textAlign.vue'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { currentOperatingCanvasChild } from '../index.tsx'
import { generateMathFormula } from '../children/aiMathService'

const aiPopoverVisible = ref(false)
const aiPrompt = ref('')
const aiLoading = ref(false)
const aiError = ref('')

async function generateFormulaByAi() {
  const prompt = aiPrompt.value.trim()
  if (!prompt || aiLoading.value) return

  aiLoading.value = true
  aiError.value = ''

  try {
    const result = await generateMathFormula(prompt, currentOperatingCanvasChild.value?.formula || '')
    currentOperatingCanvasChild.value.formula = result.formula
    aiPrompt.value = ''
    aiPopoverVisible.value = false
  } catch (error: any) {
    aiError.value = error?.message || 'AI 生成失败，请重试'
  } finally {
    aiLoading.value = false
  }
}
</script>

<style scoped>
.math-formula-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.math-formula-editor__toolbar {
  display: flex;
  justify-content: flex-end;
}

.math-ai-popover {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.math-ai-popover__actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.math-ai-popover__error {
  color: #c45656;
  font-size: 12px;
  line-height: 1.4;
}
</style>
