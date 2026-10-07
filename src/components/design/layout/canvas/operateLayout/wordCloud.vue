<template>
  >
    <section class="operate-section">
      <h4 class="operate-section__title">基础</h4>
      
        <operateItemSize
          label="尺寸"
          v-model:width="currentOperatingCanvasChild.width"
          v-model:height="currentOperatingCanvasChild.height"
        ></operateItemSize>

        <operate-form-item style="align-items: start">
          <template #name>词语列表</template>
          <template #content>
            <Textarea
              v-model="wordListText"
              :rows="5"
              class="resize-y"
              placeholder="每行一个：文字,权重"
              @change="applyWordListText"
              @blur="applyWordListText"
            ></Textarea>
          </template>
        </operate-form-item>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">表现</h4>
      
        <operateItemFontFamily
          v-model="wordcloud2.fontFamilyInfo"
        ></operateItemFontFamily>

        <operate-form-item>
          <template #name>备用字体</template>
          <template #content>
            <Input
              v-model="wordcloud2.fontFamily"
              class="h-6 text-[11px]"
              placeholder="sans-serif"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>字重</template>
          <template #content>
            <Input
              v-model="wordcloud2.fontWeight"
              class="h-6 text-[11px]"
              placeholder="normal / bold / 600"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>颜色模式</template>
          <template #content>
            <Select v-model="wordcloud2.colorMode">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">固定颜色</SelectItem>
                <SelectItem value="palette">调色板</SelectItem>
                <SelectItem value="random-dark">随机深色</SelectItem>
                <SelectItem value="random-light">随机浅色</SelectItem>
              </SelectContent>
            </Select>
          </template>
        </operate-form-item>

        <operateItemColor
          v-if="wordcloud2.colorMode === 'fixed'"
          label="文字颜色"
          v-model="fixedColor"
        ></operateItemColor>

        <operate-form-item
          v-if="wordcloud2.colorMode === 'palette'"
          style="align-items: start"
        >
          <template #name>调色板</template>
          <template #content>
            <Textarea
              v-model="paletteText"
              :rows="2"
              class="resize-y"
              placeholder="#111111, #ff4d6d, #2ec4b6"
              @change="applyPaletteText"
              @blur="applyPaletteText"
            ></Textarea>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>背景色</template>
          <template #content>
            <Input
              v-model="wordcloud2.backgroundColor"
              class="h-6 text-[11px]"
              placeholder="rgba(0,0,0,0)"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>最小绘制阈值</template>
          <template #content>
            <Input
              type="number"
              :model-value="wordcloud2.minSize"
              :min="0"
              class="h-6 text-[11px]"
              @update:model-value="v => (wordcloud2.minSize = Number(v))"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>字号倍率</template>
          <template #content>
            <Input
              type="number"
              :model-value="wordcloud2.weightFactor"
              :min="0"
              :step="0.1"
              class="h-6 text-[11px]"
              @update:model-value="v => (wordcloud2.weightFactor = Number(v))"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>清空画布</template>
          <template #content>
            <Switch v-model:checked="wordcloud2.clearCanvas"></Switch>
          </template>
        </operate-form-item>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">布局</h4>
      
        <operate-form-item>
          <template #name>网格尺寸</template>
          <template #content>
            <Input
              type="number"
              :model-value="wordcloud2.gridSize"
              :min="1"
              class="h-6 text-[11px]"
              @update:model-value="v => (wordcloud2.gridSize = Number(v))"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>中心点 X</template>
          <template #content>
            <Input
              type="number"
              :model-value="originX"
              :min="0"
              placeholder="自动"
              class="h-6 text-[11px]"
              @update:model-value="v => (originX = v === '' ? undefined : Number(v))"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>中心点 Y</template>
          <template #content>
            <Input
              type="number"
              :model-value="originY"
              :min="0"
              placeholder="自动"
              class="h-6 text-[11px]"
              @update:model-value="v => (originY = v === '' ? undefined : Number(v))"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>允许超出</template>
          <template #content>
            <Switch v-model:checked="wordcloud2.drawOutOfBound"></Switch>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>自动缩小</template>
          <template #content>
            <Switch v-model:checked="wordcloud2.shrinkToFit"></Switch>
          </template>
        </operate-form-item>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">遮罩调试</h4>
      
        <operate-form-item>
          <template #name>绘制遮罩</template>
          <template #content>
            <Switch v-model:checked="wordcloud2.drawMask"></Switch>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>遮罩颜色</template>
          <template #content>
            <Input v-model="wordcloud2.maskColor" class="h-6 text-[11px]"></Input>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>遮罩间隔</template>
          <template #content>
            <Input
              type="number"
              :model-value="wordcloud2.maskGapWidth"
              :min="0"
              :step="0.1"
              class="h-6 text-[11px]"
              @update:model-value="v => (wordcloud2.maskGapWidth = Number(v))"
            />
          </template>
        </operate-form-item>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">性能</h4>
      
        <operate-form-item>
          <template #name>绘制等待</template>
          <template #content>
            <Input
              type="number"
              :model-value="wordcloud2.wait"
              :min="0"
              class="h-6 text-[11px]"
              @update:model-value="v => (wordcloud2.wait = Number(v))"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>中止阈值</template>
          <template #content>
            <Input
              type="number"
              :model-value="wordcloud2.abortThreshold"
              :min="0"
              class="h-6 text-[11px]"
              @update:model-value="v => (wordcloud2.abortThreshold = Number(v))"
            />
          </template>
        </operate-form-item>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">旋转</h4>
      
        <operate-form-item>
          <template #name>旋转概率</template>
          <template #content>
            <Input
              type="number"
              :model-value="wordcloud2.rotateRatio"
              :min="0"
              :max="1"
              :step="0.05"
              class="h-6 text-[11px]"
              @update:model-value="v => (wordcloud2.rotateRatio = Number(v))"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>最小角度</template>
          <template #content>
            <Input
              type="number"
              :model-value="minRotationDeg"
              :step="15"
              class="h-6 text-[11px]"
              @update:model-value="v => (minRotationDeg = Number(v))"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>最大角度</template>
          <template #content>
            <Input
              type="number"
              :model-value="maxRotationDeg"
              :step="15"
              class="h-6 text-[11px]"
              @update:model-value="v => (maxRotationDeg = Number(v))"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>角度步数</template>
          <template #content>
            <Input
              type="number"
              :model-value="wordcloud2.rotationSteps"
              :min="0"
              :step="1"
              class="h-6 text-[11px]"
              @update:model-value="v => (wordcloud2.rotationSteps = Number(v))"
            />
          </template>
        </operate-form-item>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">形状</h4>
      
        <operate-form-item>
          <template #name>形状</template>
          <template #content>
            <Select v-model="wordcloud2.shape">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="shape in shapeOptions"
                  :key="shape"
                  :value="shape"
                >
                  {{ shape }}
                </SelectItem>
              </SelectContent>
            </Select>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>扁平度</template>
          <template #content>
            <Input
              type="number"
              :model-value="wordcloud2.ellipticity"
              :min="0.1"
              :step="0.1"
              class="h-6 text-[11px]"
              @update:model-value="v => (wordcloud2.ellipticity = Number(v))"
            />
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>随机顺序</template>
          <template #content>
            <Switch v-model:checked="wordcloud2.shuffle"></Switch>
          </template>
        </operate-form-item>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">通用属性</h4>
      
        <operateItemCommonGroup
          v-model="currentOperatingCanvasChild"
        ></operateItemCommonGroup>
      
    </section>
  
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemColor from "@/components/design/layout/canvas/operate/color/index.vue";
import operateItemFontFamily from "@/components/design/layout/canvas/operate/fontFamily/fontFamily.vue";
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { currentOperatingCanvasChild } from "../index.tsx";
import { createDefaultWordCloud2EngineOptions } from "../children/wordCloud/index.tsx";

const shapeOptions = [
  "circle",
  "cardioid",
  "diamond",
  "square",
  "triangle-forward",
  "triangle",
  "pentagon",
  "star",
];
const wordListText = ref("");
const paletteText = ref("");

const wordcloud2 = computed(() => {
  const child = currentOperatingCanvasChild.value;
  if (!child.wordCloud) {
    child.wordCloud = {
      version: 1,
      engine: "wordcloud2",
      engines: {},
    };
  }
  if (!child.wordCloud.engines) {
    child.wordCloud.engines = {};
  }
  if (!child.wordCloud.engines.wordcloud2) {
    child.wordCloud.engines.wordcloud2 = createDefaultWordCloud2EngineOptions();
  }
  return child.wordCloud.engines.wordcloud2;
});

const fixedColor = computed({
  get() {
    return {
      type: "pure",
      color: wordcloud2.value.color || "#111111",
    };
  },
  set(value: any) {
    wordcloud2.value.color = value?.color || "#111111";
  },
});

const originX = computed({
  get() {
    return Array.isArray(wordcloud2.value.origin)
      ? wordcloud2.value.origin[0]
      : undefined;
  },
  set(value: number | undefined) {
    setOrigin(0, value);
  },
});

const originY = computed({
  get() {
    return Array.isArray(wordcloud2.value.origin)
      ? wordcloud2.value.origin[1]
      : undefined;
  },
  set(value: number | undefined) {
    setOrigin(1, value);
  },
});

const minRotationDeg = computed({
  get() {
    return radToDeg(wordcloud2.value.minRotation);
  },
  set(value: number) {
    wordcloud2.value.minRotation = degToRad(value);
  },
});

const maxRotationDeg = computed({
  get() {
    return radToDeg(wordcloud2.value.maxRotation);
  },
  set(value: number) {
    wordcloud2.value.maxRotation = degToRad(value);
  },
});

function setOrigin(index: number, value: number | undefined) {
  if (value == null || Number.isNaN(Number(value))) {
    wordcloud2.value.origin = null;
    return;
  }

  const origin = Array.isArray(wordcloud2.value.origin)
    ? [...wordcloud2.value.origin]
    : [0, 0];
  origin[index] = Number(value);
  wordcloud2.value.origin = origin;
}

function syncWordListText() {
  wordListText.value = (wordcloud2.value.list || [])
    .map((item: any[]) => `${item[0] ?? ""},${item[1] ?? 0}`)
    .join("\n");
}

function applyWordListText() {
  const list = wordListText.value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [text, weight = "20", ...extra] = line
        .split(",")
        .map((item) => item.trim());
      return [text, Number(weight) || 0, ...extra].filter(
        (item) => item !== "",
      );
    })
    .filter((item) => item[0] && Number(item[1]) > 0);

  wordcloud2.value.list = list;
}

function syncPaletteText() {
  paletteText.value = (wordcloud2.value.colors || []).join(", ");
}

function applyPaletteText() {
  wordcloud2.value.colors = paletteText.value
    .split(/[,\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function radToDeg(value: number) {
  return Math.round(((Number(value) || 0) * 180) / Math.PI);
}

function degToRad(value: number) {
  return ((Number(value) || 0) * Math.PI) / 180;
}

watch(
  wordcloud2,
  () => {
    syncWordListText();
    syncPaletteText();
  },
  { immediate: true },
);
</script>
