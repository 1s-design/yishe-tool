<template>
  <Accordion
    type="multiple"
    :model-value="activeNames"
    @update:model-value="v => (activeNames = v as string[])"
  >
    <AccordionItem value="source">
      <AccordionTrigger>分子结构</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>输入类型</template>
          <template #content>
            <Select v-model="currentOperatingCanvasChild.inputType">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smiles">SMILES</SelectItem>
                <SelectItem value="molblock">MolBlock</SelectItem>
              </SelectContent>
            </Select>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>源码</template>
          <template #content>
            <div class="molecule-source-editor">
              <div class="molecule-source-editor__toolbar">
                <Popover v-model:open="aiPopoverVisible">
                  <PopoverTrigger as-child>
                    <Button size="sm" variant="outline" @click.stop
                      >AI 生成 SMILES</Button
                    >
                  </PopoverTrigger>
                  <PopoverContent side="right" align="start" class="w-[340px]">
                    <div class="molecule-ai-popover">
                      <Textarea
                        v-model="aiPrompt"
                        :rows="4"
                        class="resize-y"
                        spellcheck="false"
                        :disabled="aiLoading"
                        placeholder="描述分子，例如：阿司匹林、苯环、咖啡因"
                        @keydown.enter.ctrl="generateMoleculeByAi"
                      ></Textarea>

                      <div class="molecule-ai-popover__actions">
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
                          @click="generateMoleculeByAi"
                        >
                          确定
                        </Button>
                      </div>

                      <div v-if="aiError" class="molecule-error">{{ aiError }}</div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <Textarea
                v-model="currentOperatingCanvasChild.source"
                :rows="6"
                class="molecule-source-editor__input resize-y"
                spellcheck="false"
                :placeholder="
                  currentOperatingCanvasChild.inputType === 'molblock'
                    ? '粘贴 MolBlock 格式...'
                    : 'c1ccccc1 (苯)'
                "
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
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="style">
      <AccordionTrigger>样式</AccordionTrigger>
      <AccordionContent>
        <operateItemBackgroundColor
          v-model="currentOperatingCanvasChild.backgroundColor"
        ></operateItemBackgroundColor>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="config">
      <AccordionTrigger>Draw Options</AccordionTrigger>
      <AccordionContent>
        <operate-form-item>
          <template #name>渲染配置</template>
          <template #content>
            <Button size="sm" variant="default" @click="openConfigDialog"
              >编辑配置</Button
            >
          </template>
        </operate-form-item>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="common">
      <AccordionTrigger>通用属性</AccordionTrigger>
      <AccordionContent>
        <operateItemCommonGroup
          v-model="currentOperatingCanvasChild"
        ></operateItemCommonGroup>
      </AccordionContent>
    </AccordionItem>
  </Accordion>

  <Dialog :modal="false" v-model:open="configDialogVisible">
    <DialogContent
      class="molecule-config-dialog max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] rounded-none grid-rows-[auto_1fr_auto]"
    >
      <DialogHeader>
        <DialogTitle>编辑 RDKit Draw Options</DialogTitle>
      </DialogHeader>
      <div class="molecule-config-editor">
        <Textarea
          v-model="configText"
          class="molecule-config-editor__input resize-none"
          spellcheck="false"
          placeholder='{"width":350,"height":350}'
        ></Textarea>
        <div v-if="configError" class="molecule-error">{{ configError }}</div>
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
import { ref, watch } from "vue";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";
import operateItemBackgroundColor from "@/components/design/layout/canvas/operate/backgroundColor.vue";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { currentOperatingCanvasChild } from "../index.tsx";
import { generateMoleculeSmiles } from "../children/aiMoleculeService";

const activeNames = ref(["source", "basic", "style", "config", "common"]);
const aiPopoverVisible = ref(false);
const aiPrompt = ref("");
const aiLoading = ref(false);
const aiError = ref("");
const configDialogVisible = ref(false);
const configText = ref("");
const configError = ref("");

function syncConfigText() {
  configText.value = stringifyConfig(
    currentOperatingCanvasChild.value?.drawOptions || {},
  );
  configError.value = "";
}

function openConfigDialog() {
  syncConfigText();
  configDialogVisible.value = true;
}

function confirmConfigText() {
  try {
    const nextConfig = parseConfigText(configText.value);
    if (
      !nextConfig ||
      typeof nextConfig !== "object" ||
      Array.isArray(nextConfig)
    ) {
      configError.value = "Draw Options 必须是一个对象";
      return;
    }
    currentOperatingCanvasChild.value.drawOptions = nextConfig;
    configText.value = stringifyConfig(nextConfig);
    configError.value = "";
    configDialogVisible.value = false;
  } catch (error: any) {
    configError.value = error?.message || "配置解析失败";
  }
}

function formatConfigText() {
  try {
    configText.value = stringifyConfig(parseConfigText(configText.value));
    configError.value = "";
  } catch (error: any) {
    configError.value = error?.message || "配置解析失败";
  }
}

function parseConfigText(text: string) {
  const source = (text || "{}").trim();
  if (!source) return {};

  try {
    return JSON.parse(source);
  } catch {
    // Continue with JavaScript object literal parsing.
  }

  try {
    return Function(
      '"use strict";\n' +
        "const window = undefined, document = undefined, globalThis = undefined, global = undefined, process = undefined, require = undefined, importScripts = undefined, fetch = undefined, XMLHttpRequest = undefined;\n" +
        `return (${source});`,
    )();
  } catch (error: any) {
    throw new Error(
      error?.message ? `配置解析失败：${error.message}` : "配置解析失败",
    );
  }
}

function stringifyConfig(
  value: any,
  indent = 0,
  seen = new WeakSet<object>(),
): string {
  const space = "  ".repeat(indent);
  const nextSpace = "  ".repeat(indent + 1);

  if (value === null) return "null";

  const valueType = typeof value;
  if (valueType === "function") return value.toString();
  if (valueType === "string") return JSON.stringify(value);
  if (valueType === "number")
    return Number.isFinite(value) ? String(value) : "null";
  if (valueType === "boolean") return String(value);
  if (valueType === "undefined") return "undefined";

  if (typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (seen.has(value)) {
    return "undefined";
  }
  seen.add(value);

  if (Array.isArray(value)) {
    if (!value.length) {
      seen.delete(value);
      return "[]";
    }
    const items = value.map(
      (item) => `${nextSpace}${stringifyConfig(item, indent + 1, seen)}`,
    );
    seen.delete(value);
    return `[\n${items.join(",\n")}\n${space}]`;
  }

  const keys = Object.keys(value);
  if (!keys.length) {
    seen.delete(value);
    return "{}";
  }

  const entries = keys.map((key) => {
    const safeKey = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
    return `${nextSpace}${safeKey}: ${stringifyConfig(value[key], indent + 1, seen)}`;
  });
  seen.delete(value);

  return `{\n${entries.join(",\n")}\n${space}}`;
}

async function generateMoleculeByAi() {
  const prompt = aiPrompt.value.trim();
  if (!prompt || aiLoading.value) return;

  aiLoading.value = true;
  aiError.value = "";

  try {
    const result = await generateMoleculeSmiles(
      prompt,
      currentOperatingCanvasChild.value?.source || "",
    );
    currentOperatingCanvasChild.value.source = result.smiles;
    aiPrompt.value = "";
    aiPopoverVisible.value = false;
  } catch (error: any) {
    aiError.value = error?.message || "AI 生成失败，请重试";
  } finally {
    aiLoading.value = false;
  }
}

watch(
  () => currentOperatingCanvasChild.value?.id,
  () => {
    syncConfigText();
    aiError.value = "";
  },
  { immediate: true },
);
</script>

<style scoped>
.molecule-source-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.molecule-source-editor__toolbar {
  display: flex;
  justify-content: flex-end;
}

.molecule-ai-popover {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.molecule-ai-popover__actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.molecule-error {
  color: #c45656;
  font-size: 12px;
  line-height: 1.4;
}

.molecule-source-editor__input {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.55;
}

.molecule-config-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.molecule-config-editor__input {
  flex: 1;
  min-height: 0;
  height: 100%;
}
</style>
