<template>
  <Accordion type="multiple" :model-value="activeNames" @update:model-value="v => activeNames = v as string[]">
    <AccordionItem value="data">
      <AccordionTrigger>分子数据</AccordionTrigger>
      <AccordionContent>
      <operate-form-item>
        <template #name>PDB ID</template>
        <template #content>
          <div class="threemol-pdbid-row">
            <Input
              v-model="currentOperatingCanvasChild.pdbId"
              placeholder="例如 1BNA, 4HHB"
              class="flex-1"
            ></Input>
            <Popover v-model:open="aiPopoverVisible">
              <PopoverTrigger as-child>
                <Button size="sm" variant="outline">AI 生成</Button>
              </PopoverTrigger>
              <PopoverContent side="right" align="start" class="w-[340px]">
                <div class="threemol-ai-popover">
                  <Textarea
                    v-model="aiPrompt"
                    :rows="4"
                    spellcheck="false"
                    :disabled="aiLoading"
                    placeholder="描述分子，例如：血红蛋白、DNA 双螺旋、胰岛素"
                    @keydown.enter.ctrl="generateByAi"
                  ></Textarea>

                  <div class="threemol-ai-popover__actions">
                    <Button size="sm" variant="ghost" @click="aiPopoverVisible = false"
                      >取消</Button
                    >
                    <Button
                      size="sm"
                      variant="default"
                      :disabled="!aiPrompt.trim() || aiLoading"
                      @click="generateByAi"
                    >
                      确定
                    </Button>
                  </div>

                  <div v-if="aiError" class="threemol-error">{{ aiError }}</div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </template>
      </operate-form-item>

      <operate-form-item>
        <template #name>格式</template>
        <template #content>
          <Select v-model="currentOperatingCanvasChild.format">
            <SelectTrigger class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdb">PDB</SelectItem>
              <SelectItem value="sdf">SDF</SelectItem>
              <SelectItem value="xyz">XYZ</SelectItem>
              <SelectItem value="mol2">MOL2</SelectItem>
            </SelectContent>
          </Select>
        </template>
      </operate-form-item>

      <operate-form-item>
        <template #name>数据</template>
        <template #content>
          <Textarea
            v-model="currentOperatingCanvasChild.data"
            :rows="6"
            spellcheck="false"
            placeholder="粘贴 PDB/SDF/XYZ 数据..."
            class="threemol-data-input"
          ></Textarea>
        </template>
      </operate-form-item>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="style">
      <AccordionTrigger>渲染样式</AccordionTrigger>
      <AccordionContent>
      <operate-form-item>
        <template #name>样式</template>
        <template #content>
          <Select v-model="currentOperatingCanvasChild.style">
            <SelectTrigger class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stick">棍棒 (Stick)</SelectItem>
              <SelectItem value="sphere">球体 (Sphere)</SelectItem>
              <SelectItem value="cartoon">卡通 (Cartoon)</SelectItem>
              <SelectItem value="line">线条 (Line)</SelectItem>
              <SelectItem value="cross">十字 (Cross)</SelectItem>
            </SelectContent>
          </Select>
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
      />
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="bg">
      <AccordionTrigger>背景</AccordionTrigger>
      <AccordionContent>
      <operateItemBackgroundColor
        v-model="currentOperatingCanvasChild.backgroundColor"
      />
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="common">
      <AccordionTrigger>通用属性</AccordionTrigger>
      <AccordionContent>
      <operateItemCommonGroup v-model="currentOperatingCanvasChild" />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemBackgroundColor from "@/components/design/layout/canvas/operate/backgroundColor.vue";
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";
import { currentOperatingCanvasChild } from "../index.tsx";
import { generateThreeMolecule } from "../children/aiThreeMoleculeService";

const activeNames = ref(["data", "style", "basic", "bg", "common"]);
const aiPopoverVisible = ref(false);
const aiPrompt = ref("");
const aiLoading = ref(false);
const aiError = ref("");

async function generateByAi() {
  const prompt = aiPrompt.value.trim();
  if (!prompt || aiLoading.value) return;

  aiLoading.value = true;
  aiError.value = "";

  try {
    const result = await generateThreeMolecule(
      prompt,
      currentOperatingCanvasChild.value?.pdbId || "",
      currentOperatingCanvasChild.value?.data || "",
    );

    if (result.pdbId) {
      currentOperatingCanvasChild.value.pdbId = result.pdbId;
      currentOperatingCanvasChild.value.data = "";
    } else if (result.data) {
      currentOperatingCanvasChild.value.data = result.data;
      currentOperatingCanvasChild.value.pdbId = "";
      if (result.format) {
        currentOperatingCanvasChild.value.format = result.format;
      }
    }

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
    aiError.value = "";
  },
  { immediate: true },
);
</script>

<style scoped>
.threemol-pdbid-row {
  display: flex;
  gap: 6px;
  width: 100%;
}

.threemol-pdbid-row .el-input {
  flex: 1;
}

.threemol-ai-popover {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.threemol-ai-popover__actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;

  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}

.threemol-error {
  color: #c45656;
  font-size: 12px;
  line-height: 1.4;
}

.threemol-data-input :deep(.el-textarea__inner) {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.55;
}
</style>
