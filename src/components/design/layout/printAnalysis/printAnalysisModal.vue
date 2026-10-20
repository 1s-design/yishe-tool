<template>
  <Teleport to="body">
    <div v-if="showPrintAnalysisModal" class="pa-overlay" @click.self="close">
      <!-- 全屏面板 -->
      <div class="pa-panel">
        <!-- 头部 -->
        <header class="pa-header">
          <div class="pa-header__text">
            <h2 class="pa-header__title">印花解构分析</h2>
            <p class="pa-header__desc">选择图片文件或填写图片地址，先做结构化拆解（文字/字体/图形/色系/构图）</p>
          </div>
          <button type="button" class="pa-close" title="关闭 (Esc)" @click="close">
            <X class="h-4 w-4" />
          </button>
        </header>

        <!-- 主体：左输入/预览，右结果 -->
        <main class="pa-body">
          <aside class="pa-left">
            <div class="pa-input-row">
              <button type="button" class="pa-btn" @click="pickFile">
                <ImageIcon class="h-3.5 w-3.5" />
                选择图片文件
              </button>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileChange"
              />
              <button
                type="button"
                class="pa-btn pa-btn--primary"
                :disabled="!canAnalyze || analyzing"
                @click="startAnalysis"
              >
                <Loader2 v-if="analyzing" class="h-3.5 w-3.5 animate-spin" />
                <Sparkles v-else class="h-3.5 w-3.5" />
                {{ analyzing ? "分析中..." : "开始分析" }}
              </button>
            </div>

            <input
              v-model="urlText"
              class="pa-url-input"
              placeholder="或粘贴图片地址 (https://... / data:...)，回车分析"
              @keyup.enter="startAnalysis"
            />

            <div v-if="previewUrl" class="pa-preview">
              <img :src="previewUrl" alt="待分析印花图" />
              <span v-if="result?.sourceSize" class="pa-size-badge">
                原图 {{ result.sourceSize.width }}×{{ result.sourceSize.height }} px
              </span>
            </div>
            <div v-else class="pa-preview pa-preview--empty">
              <ImageIcon class="h-8 w-8 opacity-30" />
              <span>选择图片文件或填写地址</span>
            </div>
            <div v-if="errorMsg" class="pa-error">{{ errorMsg }}</div>
          </aside>

          <section class="pa-right">
            <div v-if="!result && !analyzing" class="pa-placeholder">
              分析结果将展示在这里：文字、字体气质、辅助图形、色系、构图、印花适配
            </div>
            <div v-else-if="analyzing" class="pa-placeholder">
              <Loader2 class="h-5 w-5 animate-spin" />
              <span>正在解构分析...</span>
            </div>

            <div v-if="result" class="pa-result">
              <div v-if="result.summary" class="pa-summary">{{ result.summary }}</div>

              <!-- 复刻资源清单 -->
              <section v-if="hasResourcePlan" class="pa-section">
                <h4 class="pa-section__title">复刻资源清单</h4>
                <div v-if="result.resourcePlan.fonts.length" class="pa-plan-row">
                  <span class="pa-chip pa-chip--font">字体</span>
                  <div class="pa-plan-items">
                    <div v-for="(f, i) in result.resourcePlan.fonts" :key="i" class="pa-plan-item">
                      <span class="pa-plan-keywords">{{ f.keywords.join(" / ") }}</span>
                      <span v-if="f.usedBy" class="pa-meta">→ {{ f.usedBy }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="result.resourcePlan.images.length" class="pa-plan-row">
                  <span class="pa-chip pa-chip--image">外部图片</span>
                  <div class="pa-plan-items">
                    <div v-for="(im, i) in result.resourcePlan.images" :key="i" class="pa-plan-item">
                      <span class="pa-item__name">{{ im.name }}</span>
                      <span class="pa-plan-keywords">{{ im.keywords.join(" / ") }}</span>
                      <span v-if="im.reason" class="pa-meta">{{ im.reason }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="result.resourcePlan.cssElements.length" class="pa-plan-row">
                  <span class="pa-chip pa-chip--css">CSS</span>
                  <div class="pa-plan-items">
                    <span class="pa-plan-keywords">{{ result.resourcePlan.cssElements.join("、") }}</span>
                  </div>
                </div>
              </section>

              <section v-if="result.texts.length" class="pa-section">
                <h4 class="pa-section__title">文字（{{ result.texts.length }}）</h4>
                <div v-for="(t, i) in result.texts" :key="i" class="pa-item">
                  <span class="pa-chip pa-chip--role">{{ roleLabel(t.role) }}</span>
                  <span class="pa-chip pa-chip--font">字体渲染</span>
                  <span class="pa-item__name">「{{ t.content }}」</span>
                  <span v-if="t.fontStyle" class="pa-meta">{{ t.fontStyle }}</span>
                  <span v-if="t.color" class="pa-meta">
                    <i class="pa-dot" :style="{ background: t.color }"></i>{{ t.color }}
                  </span>
                  <span v-if="t.position" class="pa-meta">{{ t.position }}</span>
                  <span v-if="t.effects?.length" class="pa-meta">{{ t.effects.join("·") }}</span>
                  <span v-if="t.fontSearchKeywords.length" class="pa-desc">
                    字体检索：{{ t.fontSearchKeywords.join(" / ") }}
                  </span>
                </div>
              </section>

              <section v-if="result.fontTraits.length" class="pa-section">
                <h4 class="pa-section__title">字体气质</h4>
                <div class="pa-tags">
                  <span v-for="(f, i) in result.fontTraits" :key="i" class="pa-chip">{{ f }}</span>
                </div>
              </section>

              <section v-if="result.graphics.length" class="pa-section">
                <h4 class="pa-section__title">辅助图形（{{ result.graphics.length }}）</h4>
                <div v-for="(g, i) in result.graphics" :key="i" class="pa-item">
                  <span class="pa-chip pa-chip--role">{{ graphicLabel(g.kind) }}</span>
                  <span class="pa-chip" :class="g.impl === 'image' ? 'pa-chip--image' : 'pa-chip--css'">
                    {{ g.impl === "image" ? "外部图片" : "CSS" }}
                  </span>
                  <span class="pa-item__name">{{ g.name }}</span>
                  <span v-if="g.count > 1" class="pa-meta">×{{ g.count }}</span>
                  <span v-if="g.position" class="pa-meta">{{ g.position }}</span>
                  <span v-if="g.description" class="pa-desc">{{ g.description }}</span>
                  <span v-if="g.impl === 'image' && g.imageSearchKeywords.length" class="pa-desc">
                    素材检索：{{ g.imageSearchKeywords.join(" / ") }}
                    <template v-if="g.implReason">（{{ g.implReason }}）</template>
                  </span>
                </div>
              </section>

              <section v-if="result.colors.length" class="pa-section">
                <h4 class="pa-section__title">色系</h4>
                <div class="pa-colors">
                  <div v-for="(c, i) in result.colors" :key="i" class="pa-color">
                    <i class="pa-swatch" :style="{ background: c.hex }"></i>
                    <span class="pa-color__hex">{{ c.hex }}</span>
                    <span class="pa-chip pa-chip--role">{{ colorLabel(c.role) }}</span>
                    <span v-if="c.usage" class="pa-meta">{{ c.usage }}</span>
                  </div>
                </div>
              </section>

              <section v-if="hasComposition" class="pa-section">
                <h4 class="pa-section__title">构图</h4>
                <div class="pa-kv">
                  <div v-if="result.composition.layout"><span>骨架</span>{{ result.composition.layout }}</div>
                  <div v-if="result.composition.whitespace"><span>留白</span>{{ result.composition.whitespace }}</div>
                  <div v-if="result.composition.hierarchy"><span>层级</span>{{ result.composition.hierarchy }}</div>
                </div>
              </section>

              <section v-if="hasAdaptability" class="pa-section">
                <h4 class="pa-section__title">印花适配</h4>
                <div class="pa-kv">
                  <div>
                    <span>独立成印</span>
                    <span class="pa-chip" :class="result.adaptability.standalone ? 'pa-chip--ok' : 'pa-chip--warn'">
                      {{ result.adaptability.standalone ? "可" : "受限" }}
                    </span>
                  </div>
                  <div v-if="result.adaptability.cropRisk"><span>裁切风险</span>{{ result.adaptability.cropRisk }}</div>
                  <div v-if="result.adaptability.notes"><span>备注</span>{{ result.adaptability.notes }}</div>
                </div>
              </section>
            </div>
          </section>
        </main>

        <!-- 底部 -->
        <footer class="pa-footer">
          <div class="pa-footer__left">
            <button
              v-if="result"
              type="button"
              class="pa-btn pa-btn--primary"
              :disabled="replicating"
              @click="makeReplica('same')"
            >
              <Sparkles class="h-3.5 w-3.5" />
              制作同款
            </button>
            <button
              v-if="result"
              type="button"
              class="pa-btn"
              :disabled="replicating"
              @click="makeReplica('similar')"
            >
              <Sparkles class="h-3.5 w-3.5" />
              制作相似款
            </button>
          </div>
          <button type="button" class="pa-btn" @click="close">关闭</button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { Image as ImageIcon, Loader2, Sparkles, X } from "lucide-vue-next";
import {
  analyzePrintImage,
  type PrintAnalysisResult,
  type PrintTextRole,
  type PrintGraphicKind,
  type PrintColorRole,
} from "@/ai/print-analysis";
import { buildReplicateBrief, type ReplicateMode } from "@/ai/print-replicate";
import { designAgent } from "@/ai/agent/simple";
import {
  showPrintAnalysisModal,
  printAnalysisSeedUrl,
} from "./printAnalysisModal";

const fileInputRef = ref<HTMLInputElement>();
const urlText = ref("");
const previewUrl = ref("");
const analyzing = ref(false);
const errorMsg = ref("");
const result = ref<PrintAnalysisResult | null>(null);

watch(
  printAnalysisSeedUrl,
  (url) => {
    if (url) {
      urlText.value = url;
      previewUrl.value = url;
      result.value = null;
      errorMsg.value = "";
    }
  },
  { immediate: true },
);

const canAnalyze = computed(() => Boolean(previewUrl.value || urlText.value.trim()));
const hasComposition = computed(() => {
  const c = result.value?.composition;
  return Boolean(c && (c.layout || c.whitespace || c.hierarchy));
});
const hasAdaptability = computed(() => {
  const a = result.value?.adaptability;
  return Boolean(a && (a.standalone || a.cropRisk || a.notes));
});
const hasResourcePlan = computed(() => {
  const p = result.value?.resourcePlan;
  return Boolean(p && (p.fonts.length || p.images.length || p.cssElements.length));
});

function close() {
  showPrintAnalysisModal.value = false;
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && showPrintAnalysisModal.value) close();
};
document.addEventListener("keydown", onKeydown);
onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));

function pickFile() {
  fileInputRef.value?.click();
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    errorMsg.value = "请选择图片文件";
    return;
  }
  errorMsg.value = "";
  result.value = null;
  const reader = new FileReader();
  reader.onload = () => {
    previewUrl.value = String(reader.result || "");
    urlText.value = "";
  };
  reader.onerror = () => {
    errorMsg.value = "读取图片失败";
  };
  reader.readAsDataURL(file);
  input.value = "";
}

async function startAnalysis() {
  if (!canAnalyze.value || analyzing.value) return;
  analyzing.value = true;
  errorMsg.value = "";
  result.value = null;
  try {
    const source =
      previewUrl.value && !urlText.value.trim() ? previewUrl.value : urlText.value.trim();
    result.value = await analyzePrintImage(source);
  } catch (err: any) {
    errorMsg.value = err?.message || "分析失败，请重试";
  } finally {
    analyzing.value = false;
  }
}

const replicating = ref(false);

/** 按解构结果制作同款/相似款：brief 作为硬约束交给设计 agent */
async function makeReplica(mode: ReplicateMode) {
  if (!result.value || replicating.value) return;
  replicating.value = true;
  try {
    const brief = buildReplicateBrief(result.value, mode);
    // 关闭弹窗让用户看 agent 制作；AI 面板会自动打开
    close();
    await designAgent.chat(brief);
  } catch (err: any) {
    errorMsg.value = err?.message || "制作失败，请重试";
  } finally {
    replicating.value = false;
  }
}

const ROLE_LABELS: Record<PrintTextRole, string> = {
  primary: "主文案",
  secondary: "副文案",
  badge: "角标",
  decoration: "装饰字",
};
const GRAPHIC_LABELS: Record<PrintGraphicKind, string> = {
  illustration: "插画",
  pattern: "纹样",
  ornament: "角饰",
  border: "边框",
  icon: "图标",
  texture: "肌理",
  other: "其他",
};
const COLOR_LABELS: Record<PrintColorRole, string> = {
  background: "底色",
  primary: "主色",
  secondary: "辅色",
  accent: "点缀",
  text: "文字色",
};

function roleLabel(r: PrintTextRole) {
  return ROLE_LABELS[r] || r;
}
function graphicLabel(k: PrintGraphicKind) {
  return GRAPHIC_LABELS[k] || k;
}
function colorLabel(r: PrintColorRole) {
  return COLOR_LABELS[r] || r;
}
</script>

<style scoped>
/* 全屏覆盖层 */
.pa-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: color-mix(in srgb, var(--1s-panel-background, #111) 72%, transparent);
  backdrop-filter: blur(2px);
}

.pa-panel {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--1s-dialog-bg, #fff);
  color: var(--1s-dialog-fg, #222);
}

/* 头部 */
.pa-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px 12px;
  border-bottom: 1px solid var(--1s-border-color, #e5e5e5);
  flex-shrink: 0;
}

.pa-header__title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

.pa-header__desc {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--1s-text-color-tertiary, #999);
}

.pa-close {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--1s-text-color-secondary, #666);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.12s ease;
}
.pa-close:hover {
  background: var(--1s-hover-background, rgba(0, 0, 0, 0.06));
  color: var(--1s-text-color, #222);
}

/* 主体两栏 */
.pa-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.pa-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 380px;
  min-width: 300px;
  padding: 16px 20px;
  border-right: 1px solid var(--1s-border-color, #e5e5e5);
  overflow-y: auto;
  flex-shrink: 0;
}

.pa-right {
  flex: 1;
  min-width: 0;
  padding: 16px 24px;
  overflow-y: auto;
}

@media (max-width: 860px) {
  .pa-body {
    flex-direction: column;
  }
  .pa-left {
    width: 100%;
    min-width: 0;
    border-right: none;
    border-bottom: 1px solid var(--1s-border-color, #e5e5e5);
    max-height: 42vh;
    flex-shrink: 0;
  }
}

/* 输入区 */
.pa-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pa-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--1s-border-color, #e5e5e5);
  border-radius: 6px;
  background: transparent;
  color: var(--1s-text-color, #222);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.12s ease, opacity 0.12s ease;
}
.pa-btn:hover:not(:disabled) {
  background: var(--1s-hover-background, rgba(0, 0, 0, 0.06));
}
.pa-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.pa-btn--primary {
  background: var(--1s-accent-color, #6900ff);
  border-color: transparent;
  color: #fff;
}
.pa-btn--primary:hover:not(:disabled) {
  opacity: 0.88;
  background: var(--1s-accent-color, #6900ff);
}

.pa-url-input {
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--1s-border-color, #e5e5e5);
  border-radius: 6px;
  background: transparent;
  color: var(--1s-text-color, #222);
  font-size: 12px;
  outline: none;
  width: 100%;
}
.pa-url-input:focus {
  border-color: var(--1s-accent-color, #6900ff);
}

.pa-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 220px;
  padding: 10px;
  border-radius: 8px;
  background: var(--1s-hover-background, rgba(0, 0, 0, 0.05));
}

.pa-preview img {
  max-width: 100%;
  max-height: 46vh;
  object-fit: contain;
}

.pa-preview--empty {
  color: var(--1s-text-color-tertiary, #999);
  font-size: 12px;
}

.pa-size-badge {
  font-size: 11px;
  color: var(--1s-text-color-secondary, #666);
  font-family: ui-monospace, monospace;
}

.pa-error {
  font-size: 12px;
  color: #dc2626;
}

/* 结果区 */
.pa-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  color: var(--1s-text-color-tertiary, #999);
  font-size: 12px;
  padding: 40px;
}

.pa-result {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pa-summary {
  padding: 10px 12px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--1s-accent-color, #6900ff) 8%, transparent);
  color: var(--1s-text-color, #222);
  font-size: 12px;
  line-height: 1.6;
}

.pa-section__title {
  font-size: 12px;
  font-weight: 600;
  color: var(--1s-text-color-secondary, #666);
  margin: 0 0 6px;
}

.pa-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 5px 0;
  font-size: 12px;
  border-bottom: 1px solid var(--1s-border-color, #e5e5e5);
}

.pa-item__name {
  font-weight: 500;
  color: var(--1s-text-color, #222);
}

.pa-desc {
  flex-basis: 100%;
  font-size: 11px;
  color: var(--1s-text-color-tertiary, #999);
  line-height: 1.5;
}

.pa-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--1s-text-color-tertiary, #999);
}

.pa-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid var(--1s-border-color, #e5e5e5);
}

.pa-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pa-chip {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  border-radius: 4px;
  background: var(--1s-control-surface-muted, rgba(0, 0, 0, 0.06));
  color: var(--1s-text-color-secondary, #666);
  font-size: 10px;
  font-weight: 500;
}

.pa-chip--role {
  background: var(--1s-active-background, rgba(105, 0, 255, 0.1));
  color: var(--1s-accent-color, #6900ff);
}

.pa-chip--ok {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
}

.pa-chip--warn {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

.pa-chip--font {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.pa-chip--image {
  background: rgba(168, 85, 247, 0.12);
  color: #9333ea;
}

.pa-chip--css {
  background: rgba(20, 184, 166, 0.12);
  color: #0d9488;
}

/* 复刻资源清单 */
.pa-plan-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid var(--1s-border-color, #e5e5e5);
}

.pa-plan-items {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pa-plan-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
}

.pa-plan-keywords {
  font-size: 11px;
  color: var(--1s-accent-color, #6900ff);
  font-weight: 500;
}

.pa-colors {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pa-color {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.pa-swatch {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 1px solid var(--1s-border-color, #e5e5e5);
  flex-shrink: 0;
}

.pa-color__hex {
  font-family: ui-monospace, monospace;
  font-size: 11px;
  color: var(--1s-text-color-secondary, #666);
  min-width: 64px;
}

.pa-kv {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  color: var(--1s-text-color, #222);
}

.pa-kv > div {
  display: flex;
  align-items: center;
  gap: 10px;
  line-height: 1.5;
}

.pa-kv > div > span:first-child {
  flex-shrink: 0;
  width: 64px;
  color: var(--1s-text-color-tertiary, #999);
  font-size: 11px;
}

/* 底部 */
.pa-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 20px;
  border-top: 1px solid var(--1s-border-color, #e5e5e5);
  flex-shrink: 0;
}

.pa-footer__left {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
