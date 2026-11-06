<template>
  <Dialog v-model:open="showReplaceColorModal">
    <DialogContent class="sm:max-w-[920px] max-h-[92dvh] p-0 gap-0 overflow-y-auto">
      <DialogHeader class="sticky top-0 z-10 border-b border-border bg-background px-5 py-4">
        <DialogTitle class="text-base font-semibold flex items-center gap-2">
          <PaintBucket class="h-4 w-4 text-primary" />
          画布换色
        </DialogTitle>
        <DialogDescription class="text-xs text-muted-foreground">
          把画布里的某个颜色整体换成另一个颜色，文字、HTML、图片、图表一并替换
        </DialogDescription>
      </DialogHeader>

      <div class="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_300px] sm:min-h-[420px]">
        <div class="relative flex min-h-[240px] items-center justify-center bg-muted/30 p-4 sm:min-h-0">
          <canvas ref="previewRef" class="max-h-[440px] max-w-full rounded-md shadow-sm" />
          <div
            v-if="loading"
            class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 text-xs text-muted-foreground backdrop-blur-sm"
          >
            <Loader2 class="h-5 w-5 animate-spin" />
            正在渲染画布…
          </div>
          <div
            v-else-if="empty"
            class="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground"
          >
            画布是空的，先添加一些内容
          </div>
          <div v-else class="absolute left-2 top-2 flex rounded-md border border-border bg-background/90 p-0.5 text-[11px]">
            <button
              type="button"
              class="rounded px-2 py-1 transition-colors"
              :class="showOriginal ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'"
              @click="showOriginal = true"
            >
              原图
            </button>
            <button
              type="button"
              class="rounded px-2 py-1 transition-colors"
              :class="!showOriginal ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'"
              @click="showOriginal = false"
            >
              换色后
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-5 border-t border-border p-4 sm:border-l sm:border-t-0">
          <section class="space-y-2">
            <div class="flex items-center justify-between">
              <Label class="text-xs font-medium">源颜色</Label>
              <span class="font-mono text-[11px] text-muted-foreground">{{ fromColor }}</span>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model="fromColor"
                type="color"
                class="h-8 w-9 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
                aria-label="源颜色"
              />
              <Input v-model="fromColorText" class="h-8 font-mono text-xs" placeholder="#FF0000" />
            </div>
            <div v-if="palette.length" class="space-y-1.5">
              <div class="text-[11px] text-muted-foreground">画布主色</div>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="c in palette"
                  :key="c.hex"
                  type="button"
                  class="group relative h-7 w-7 rounded-md transition-transform hover:scale-110"
                  :class="
                    isSame(c.hex, fromColor)
                      ? 'ring-2 ring-primary ring-offset-1'
                      : 'border border-border/60 ring-1 ring-inset ring-black/10'
                  "
                  :style="{ backgroundColor: c.hex }"
                  :title="`${c.hex} · ${(c.ratio * 100).toFixed(1)}%`"
                  @click="pickSource(c.hex)"
                >
                  <span
                    v-if="isSame(c.hex, fromColor)"
                    class="absolute inset-0 flex items-center justify-center"
                  >
                    <Check class="h-3.5 w-3.5 mix-blend-difference text-white" />
                  </span>
                </button>
              </div>
            </div>
            <p v-if="sourceIsNeutral" class="text-[11px] leading-relaxed text-amber-600">
              这是个中性色，面积通常很大，换色会覆盖大片区域，注意误伤。
            </p>
          </section>

          <section class="space-y-2">
            <div class="flex items-center justify-between">
              <Label class="text-xs font-medium">替换为</Label>
              <span class="font-mono text-[11px] text-muted-foreground">{{ toColor }}</span>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model="toColor"
                type="color"
                class="h-8 w-9 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
                aria-label="目标颜色"
              />
              <Input v-model="toColorText" class="h-8 font-mono text-xs" placeholder="#1D4ED8" />
            </div>
            <div class="flex flex-wrap gap-1.5 pt-0.5">
              <button
                v-for="c in presetTargets"
                :key="c"
                type="button"
                class="h-6 w-6 rounded-md border border-border/60 ring-1 ring-inset ring-black/10 transition-transform hover:scale-110"
                :style="{ backgroundColor: c }"
                :title="c"
                @click="toColor = c"
              />
            </div>
          </section>

          <section class="space-y-2">
            <div class="flex items-center justify-between">
              <Label class="text-xs font-medium">容差</Label>
              <span class="font-mono text-[11px] text-muted-foreground">{{ tolerance }}</span>
            </div>
            <Slider
              :min="0"
              :max="100"
              :step="1"
              :model-value="[tolerance]"
              @update:model-value="(v) => (tolerance = v[0])"
            />
            <p class="text-[11px] leading-relaxed text-muted-foreground">
              0 只换完全相同的颜色；越大越宽松，能带上深浅渐变的同色系。
            </p>
          </section>

          <section class="flex items-start justify-between gap-3">
            <div class="space-y-0.5">
              <Label class="text-xs font-medium">保留明暗</Label>
              <p class="text-[11px] leading-relaxed text-muted-foreground">
                只换色相，保留原有光影层次，适合照片类素材。
              </p>
            </div>
            <Switch v-model:checked="preserveLuminance" />
          </section>

          <div class="mt-auto rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
            <template v-if="stats">
              命中 <span class="font-mono text-foreground">{{ (stats.ratio * 100).toFixed(1) }}%</span>
              的不透明像素（预览采样）
            </template>
            <template v-else>调整参数后这里会显示命中比例</template>
          </div>
        </div>
      </div>

      <DialogFooter class="sticky bottom-0 z-10 border-t border-border bg-background px-5 py-3 sm:justify-between">
        <div class="text-[11px] text-muted-foreground">
          换色结果是一张新 PNG，原设计保持不变
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" @click="showReplaceColorModal = false">取消</Button>
          <Button size="sm" :disabled="loading || exporting || empty" @click="exportPng">
            <Loader2 v-if="exporting" class="mr-1.5 h-3.5 w-3.5 animate-spin" />
            <Download v-else class="mr-1.5 h-3.5 w-3.5" />
            {{ exporting ? "导出中" : "导出换色 PNG" }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { Check, Download, Loader2, PaintBucket } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { message } from "@/common/message";
import {
  currentCanvasControllerInstance,
  renderingLoading,
} from "@/components/design/layout/canvas";
import {
  extractPalette,
  parseColor,
  replaceColor,
  rgbToHex,
  type PaletteColor,
  type ReplaceColorStats,
} from "@/common/color-replace";
import { canvasToFile, downloadByFile } from "@/common/transform";
import Utils from "@/common/utils";
import { showReplaceColorModal } from "./store";

const PREVIEW_MAX = 760;
const presetTargets = [
  "#111111",
  "#FFFFFF",
  "#E11D2E",
  "#C9A227",
  "#1D4ED8",
  "#15803D",
  "#7C3AED",
  "#EC4899",
];

const previewRef = ref<HTMLCanvasElement | null>(null);
const loading = ref(false);
const exporting = ref(false);
const empty = ref(false);
const showOriginal = ref(false);
const palette = ref<PaletteColor[]>([]);
const fromColor = ref("#FF0000");
const toColor = ref("#1D4ED8");
const tolerance = ref(10);
const preserveLuminance = ref(false);
const stats = ref<ReplaceColorStats | null>(null);

let sourceData: ImageData | null = null;
let resultData: Uint8ClampedArray | null = null;
let manualFrom = false;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const fromColorText = computed({
  get: () => fromColor.value,
  set: (v: string) => {
    const rgb = parseColor(v);
    if (rgb) {
      fromColor.value = rgbToHex(rgb);
      manualFrom = true;
    }
  },
});

const toColorText = computed({
  get: () => toColor.value,
  set: (v: string) => {
    const rgb = parseColor(v);
    if (rgb) toColor.value = rgbToHex(rgb);
  },
});

const sourceIsNeutral = computed(() => {
  const hit = palette.value.find((c) => isSame(c.hex, fromColor.value));
  if (hit) return hit.neutral;
  const rgb = parseColor(fromColor.value);
  if (!rgb) return false;
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  return max - min < 18;
});

function isSame(a: string, b: string) {
  return a.toUpperCase() === b.toUpperCase();
}

function waitForRenderedCanvas(timeoutMs = 20_000) {
  const controller = currentCanvasControllerInstance.value;
  if (!controller) return Promise.reject(new Error("画布控制器未初始化"));
  return Promise.race([
    controller.activeUpdateRenderingCanvas(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("画布渲染启动超时")), 15_000),
    ),
  ]).then(
    () =>
      new Promise<HTMLCanvasElement>((resolve, reject) => {
        const started = Date.now();
        const check = () => {
          if (!controller.loading.value && !renderingLoading.value) {
            const el = controller.canvasEl as HTMLCanvasElement | null;
            if (el && el.width && el.height) resolve(el);
            else reject(new Error("画布元素未找到"));
            return;
          }
          if (Date.now() - started > timeoutMs) {
            reject(new Error("画布渲染超时"));
            return;
          }
          setTimeout(check, 50);
        };
        check();
      }),
  );
}

function drawToCanvas(canvas: HTMLCanvasElement, data: Uint8ClampedArray | null) {
  const ctx = canvas.getContext("2d");
  if (!ctx || !sourceData) return;
  if (!data) {
    ctx.putImageData(sourceData, 0, 0);
    return;
  }
  const copy = new Uint8ClampedArray(sourceData.data.length);
  copy.set(data);
  ctx.putImageData(new ImageData(copy, sourceData.width, sourceData.height), 0, 0);
}

async function loadCanvas() {
  loading.value = true;
  empty.value = false;
  stats.value = null;
  resultData = null;
  try {
    const full = await waitForRenderedCanvas();
    const scale = Math.min(1, PREVIEW_MAX / Math.max(full.width, full.height));
    const w = Math.max(1, Math.round(full.width * scale));
    const h = Math.max(1, Math.round(full.height * scale));
    const source = document.createElement("canvas");
    source.width = w;
    source.height = h;
    const ctx = source.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("无法创建预览画布");
    ctx.drawImage(full, 0, 0, w, h);
    sourceData = ctx.getImageData(0, 0, w, h);

    palette.value = extractPalette(sourceData, 8);
    empty.value = palette.value.length === 0;

    const canvasEl = previewRef.value;
    if (canvasEl) {
      canvasEl.width = w;
      canvasEl.height = h;
    }

    if (!empty.value && !manualFrom) {
      const first = palette.value.find((c) => !c.neutral) || palette.value[0];
      fromColor.value = first.hex;
    }
    await nextTick();
    recompute();
  } catch (err: any) {
    message.error(err?.message || "画布渲染失败");
  } finally {
    loading.value = false;
  }
}

function recompute() {
  if (!sourceData || !previewRef.value) return;
  try {
    const copy = new Uint8ClampedArray(sourceData.data.length);
    copy.set(sourceData.data);
    const s = replaceColor(
      { data: copy, width: sourceData.width, height: sourceData.height },
      {
        from: fromColor.value,
        to: toColor.value,
        tolerance: tolerance.value,
        preserveLuminance: preserveLuminance.value,
      },
    );
    stats.value = s;
    resultData = copy;
    drawToCanvas(previewRef.value, showOriginal.value ? null : copy);
  } catch {
    stats.value = null;
  }
}

function scheduleRecompute() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(recompute, 120);
}

function pickSource(hex: string) {
  manualFrom = true;
  fromColor.value = hex;
}

async function exportPng() {
  if (exporting.value) return;
  exporting.value = true;
  try {
    const full = await waitForRenderedCanvas();
    const out = document.createElement("canvas");
    out.width = full.width;
    out.height = full.height;
    const ctx = out.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("无法创建导出画布");
    ctx.drawImage(full, 0, 0);
    const data = ctx.getImageData(0, 0, out.width, out.height);
    const s = replaceColor(data, {
      from: fromColor.value,
      to: toColor.value,
      tolerance: tolerance.value,
      preserveLuminance: preserveLuminance.value,
    });
    if (!s.replacedPixels) {
      message.warning("没有匹配到该颜色的像素，可以调大容差再试");
      return;
    }
    ctx.putImageData(data, 0, 0);
    const trimmed = Utils.trimCanvas(out);
    const stamp = new Date().toISOString().slice(0, 10);
    const file = await canvasToFile(trimmed, `recolor-${stamp}.png`);
    downloadByFile(file);
    message.success(
      `已导出 ${trimmed.width}x${trimmed.height}，替换了 ${(s.ratio * 100).toFixed(1)}% 的像素`,
    );
  } catch (err: any) {
    message.error(err?.message || "导出失败");
  } finally {
    exporting.value = false;
  }
}

watch(showReplaceColorModal, (open) => {
  if (open) {
    manualFrom = false;
    showOriginal.value = false;
    toColor.value = "#1D4ED8";
    tolerance.value = 10;
    preserveLuminance.value = false;
    loadCanvas();
  } else if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
});

watch([fromColor, toColor, tolerance, preserveLuminance], scheduleRecompute);

watch(showOriginal, (v) => {
  if (!previewRef.value) return;
  drawToCanvas(previewRef.value, v ? null : resultData);
});

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>
