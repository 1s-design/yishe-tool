<template>
  <operate-form-item>
    <template #icon>
      <icon></icon>
    </template>
    <template #name> 模板库 </template>
    <template #content>
      <div class="html-template-library__trigger">
        <el-button size="small" type="primary" plain @click="openDialog">打开模板库</el-button>
      </div>
    </template>
  </operate-form-item>

  <el-dialog
    v-model="dialogVisible"
    fullscreen
    append-to-body
    class="html-template-library"
    title="选择 HTML 模板"
    :close-on-click-modal="false"
  >
    <div class="html-template-library__layout">
      <div class="html-template-library__toolbar">
        <el-input
          v-model="searchKeyword"
          clearable
          size="large"
          placeholder="搜索模板名称、印花方式、适用商品、场景"
          class="html-template-library__search"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <div class="html-template-library__filters">
          <el-select
            v-model="filterCategory"
            clearable
            placeholder="分类"
            size="large"
            class="html-template-library__filter-select"
          >
            <el-option
              v-for="cat in categoryOptions"
              :key="cat"
              :label="cat"
              :value="cat"
            />
          </el-select>

          <el-select
            v-model="filterDifficulty"
            clearable
            placeholder="难度"
            size="large"
            class="html-template-library__filter-select"
          >
            <el-option label="简单" value="simple" />
            <el-option label="中等" value="intermediate" />
            <el-option label="复杂" value="advanced" />
          </el-select>

          <el-select
            v-model="filterPrintStyle"
            clearable
            placeholder="印花方式"
            size="large"
            class="html-template-library__filter-select"
          >
            <el-option
              v-for="style in printStyleOptions"
              :key="style"
              :label="getPrintStyleLabel(style)"
              :value="style"
            />
          </el-select>

          <el-tooltip content="我的收藏" placement="bottom">
            <el-button
              :type="showFavoritesOnly ? 'warning' : 'default'"
              size="large"
              :icon="Star"
              circle
              @click="showFavoritesOnly = !showFavoritesOnly"
            />
          </el-tooltip>
        </div>

        <div class="html-template-library__stats">
          {{ filteredTemplates.length }} / {{ templateList.length }} 个模板
        </div>

        <el-button size="large" @click="dialogVisible = false">关闭</el-button>
      </div>

      <div v-loading="loading" class="html-template-library__grid">
        <template v-if="filteredTemplates.length">
          <div
            v-for="(template, index) in filteredTemplates"
            :key="template.id"
            class="html-template-library__card"
            :class="{
              'is-active': model?.htmlTemplateMeta?.id === template.id,
              'is-favorite': isFavorite(template.id),
            }"
            @click="applyTemplate(template)"
          >
            <div class="html-template-library__preview">
              <div
                class="html-template-library__preview-inner"
                :class="previewPayloadMap[template.id]?.scopeClassName"
              >
                <div
                  class="html-template-library__preview-content"
                  v-html="previewPayloadMap[template.id]?.previewMarkup"
                ></div>
              </div>
              <el-button
                class="html-template-library__favorite-btn"
                :type="isFavorite(template.id) ? 'warning' : 'default'"
                :icon="isFavorite(template.id) ? StarFilled : Star"
                circle
                size="small"
                @click.stop="toggleFavorite(template.id)"
              />
            </div>
            <div class="html-template-library__card-body">
              <div class="html-template-library__card-topline">
                <div class="html-template-library__card-category">{{ template.category }}</div>
                <div class="html-template-library__card-badges">
                  <span v-if="template.printStyle">
                    {{ getPrintStyleLabel(template.printStyle) }}
                  </span>
                  <span v-if="template.difficulty">
                    {{ getDifficultyLabel(template.difficulty) }}
                  </span>
                </div>
              </div>
              <div class="html-template-library__card-title">{{ template.name }}</div>
              <div class="html-template-library__card-desc">{{ template.description }}</div>
              <div v-if="template.sceneDescription" class="html-template-library__card-scene">
                {{ template.sceneDescription }}
              </div>
              <div class="html-template-library__card-products">
                <span>适用商品</span>
                <strong>{{ formatSuitableProducts(template.suitableProducts) }}</strong>
              </div>
              <div class="html-template-library__card-tags">
                <span v-for="tag in template.tags || []" :key="tag">{{ tag }}</span>
                <span class="is-source">{{ getSourceLabel(template.source) }}</span>
              </div>
            </div>
          </div>
        </template>

        <div v-else class="html-template-library__empty">
          <div class="html-template-library__empty-title">没有找到匹配模板</div>
          <div class="html-template-library__empty-desc">
            试试搜索商品名、印花方式、风格关键词，或切换分类筛选。
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Search, Star, StarFilled } from "@element-plus/icons-vue";
import icon from "@/components/design/assets/icon/project.svg?component";
import operateFormItem from "@/components/design/layout/canvas/operate/operateFormItem.vue";
import {
  getHtmlTemplateLibrary,
} from "@/components/design/layout/canvas/htmlTemplate/service.ts";
import {
  applyHtmlTemplateToTarget,
  createHtmlRenderPayload,
  ensureHtmlTemplateOptions,
} from "@/components/design/layout/canvas/htmlTemplate/runtime.ts";
import {
  HTML_TEMPLATE_DIFFICULTY_LABEL_MAP,
  HTML_TEMPLATE_PRINT_STYLE_LABEL_MAP,
  type HtmlTemplateDefinition,
  type HtmlTemplateDifficulty,
  type HtmlTemplatePrintStyle,
  type HtmlTemplateSource,
} from "@/components/design/layout/canvas/htmlTemplate/types";

// 收藏管理
const FAVORITES_STORAGE_KEY = "_1s_html_template_favorites";

function getFavorites(): Set<string> {
  try {
    const data = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!data) return new Set();
    return new Set(JSON.parse(data));
  } catch {
    return new Set();
  }
}

function saveFavorites(favorites: Set<string>) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites]));
  } catch (e) {
    console.warn("Failed to save favorites:", e);
  }
}

const favorites = ref<Set<string>>(getFavorites());

function isFavorite(templateId: string): boolean {
  return favorites.value.has(templateId);
}

function toggleFavorite(templateId: string) {
  if (favorites.value.has(templateId)) {
    favorites.value.delete(templateId);
  } else {
    favorites.value.add(templateId);
  }
  saveFavorites(favorites.value);
}

const model = defineModel({
  default: {} as any,
});

const dialogVisible = ref(false);
const loading = ref(false);
const searchKeyword = ref("");
const templateList = ref<HtmlTemplateDefinition[]>([]);

// 筛选条件
const filterCategory = ref("");
const filterDifficulty = ref<HtmlTemplateDifficulty | "">("");
const filterPrintStyle = ref<HtmlTemplatePrintStyle | "">("");
const showFavoritesOnly = ref(false);

// 分类选项
const categoryOptions = computed(() => {
  const categories = new Set(templateList.value.map(t => t.category));
  return Array.from(categories).sort();
});

// 印花方式 选项
const printStyleOptions = computed(() => {
  const styles = new Set(templateList.value.flatMap(t => t.printStyle ? [t.printStyle] : []));
  return Array.from(styles).sort();
});

// 筛选逻辑
const filteredTemplates = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();

  return templateList.value.filter((item) => {
    // 收藏筛选
    if (showFavoritesOnly.value && !favorites.value.has(item.id)) {
      return false;
    }

    // 分类筛选
    if (filterCategory.value && item.category !== filterCategory.value) {
      return false;
    }

    // 难度筛选
    if (filterDifficulty.value && item.difficulty !== filterDifficulty.value) {
      return false;
    }

    // 印花方式筛选
    if (filterPrintStyle.value && item.printStyle !== filterPrintStyle.value) {
      return false;
    }

    // 搜索
    if (!keyword) {
      return true;
    }

    const searchText = [
      item.name,
      item.category,
      item.description,
      item.sceneDescription,
      getPrintStyleLabel(item.printStyle),
      getDifficultyLabel(item.difficulty),
      ...(item.tags || []),
      ...(item.suitableProducts || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchText.includes(keyword);
  });
});

const previewPayloadMap = computed(() => {
  const payloadMap: Record<string, any> = {};

  filteredTemplates.value.forEach((template, index) => {
    const renderPayload = createHtmlRenderPayload({
      id: `template-preview-${template.id}-${index}`,
      htmlContent: template.htmlContent,
      htmlBindings: template.defaultBindings || {},
      htmlTemplateFields: template.bindingFields || [],
    });

    payloadMap[template.id] = {
      ...renderPayload,
      previewMarkup: [
        renderPayload.scopedCss ? `<style>${renderPayload.scopedCss}</style>` : "",
        renderPayload.sanitizedHtml || "",
      ]
        .filter(Boolean)
        .join(""),
    };
  });

  return payloadMap;
});

async function loadTemplateLibrary() {
  loading.value = true;
  try {
    templateList.value = await getHtmlTemplateLibrary();
  } finally {
    loading.value = false;
  }
}

async function openDialog() {
  ensureHtmlTemplateOptions(model.value);
  dialogVisible.value = true;
  await loadTemplateLibrary();
}

function applyTemplate(template: HtmlTemplateDefinition) {
  applyHtmlTemplateToTarget(model.value, template);
  dialogVisible.value = false;
}

function getDifficultyLabel(difficulty?: HtmlTemplateDifficulty) {
  if (!difficulty) {
    return "";
  }
  return HTML_TEMPLATE_DIFFICULTY_LABEL_MAP[difficulty] || difficulty;
}

function getPrintStyleLabel(printStyle?: HtmlTemplatePrintStyle) {
  if (!printStyle) {
    return "";
  }
  return HTML_TEMPLATE_PRINT_STYLE_LABEL_MAP[printStyle] || printStyle;
}

function getSourceLabel(source?: HtmlTemplateSource) {
  if (source === "local") {
    return "本地";
  }
  if (source === "remote") {
    return "远程";
  }
  return "内置";
}

function formatSuitableProducts(products?: string[]) {
  if (!products?.length) {
    return "通用 POD 场景";
  }
  return products.join(" / ");
}

</script>

<style scoped lang="less">
.html-template-library__trigger {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}

.html-template-library__layout {
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.html-template-library__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding-bottom: 16px;
}

.html-template-library__search {
  flex: 1;
  min-width: 280px;
}

.html-template-library__filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.html-template-library__filter-select {
  width: 120px;
}

.html-template-library__stats {
  font-size: 12px;
  color: #6b7280;
  flex-shrink: 0;
}

.html-template-library__grid {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  grid-auto-rows: 590px;
  gap: 18px;
  padding-right: 6px;
  padding-bottom: 8px;
  scrollbar-gutter: stable;
}

.html-template-library__card {
  height: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  background: #fff;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 0;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  position: relative;
}

.html-template-library__card:hover,
.html-template-library__card.is-active {
  transform: translateY(-2px);
  border-color: #c7d2fe;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.12);
}

.html-template-library__preview {
  flex: 0 0 auto;
  background: linear-gradient(180deg, #f8fafc, #eef2ff);
  padding: 14px;
  position: relative;
}

.html-template-library__preview-inner {
  height: 220px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
  background: #fff;
}

.html-template-library__preview-content {
  width: 100%;
  height: 100%;
}

.html-template-library__favorite-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  &:hover {
    transform: scale(1.1);
  }
}

.html-template-library__card-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 16px 18px;
  scrollbar-gutter: stable;
}

.html-template-library__card-topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.html-template-library__card-category {
  flex-shrink: 0;
  font-size: 11px;
  color: #4338ca;
  background: #eef2ff;
  padding: 5px 9px;
  border-radius: 999px;
}

.html-template-library__card-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.html-template-library__card-badges span {
  font-size: 11px;
  color: #475569;
  background: #f8fafc;
  padding: 5px 8px;
  border-radius: 999px;
}

.html-template-library__card-title {
  margin-top: 12px;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.html-template-library__card-desc {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.6;
  color: #6b7280;
}

.html-template-library__card-scene {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.6;
  color: #475569;
  min-height: 38px;
}

.html-template-library__card-products {
  margin-top: 12px;
  display: grid;
  gap: 4px;
}

.html-template-library__card-products span {
  font-size: 11px;
  color: #94a3b8;
  letter-spacing: 0.04em;
}

.html-template-library__card-products strong {
  font-size: 12px;
  line-height: 1.6;
  color: #0f172a;
  font-weight: 600;
}

.html-template-library__card-tags {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.html-template-library__card-tags span {
  font-size: 11px;
  color: #475569;
  background: #f8fafc;
  border-radius: 999px;
  padding: 5px 9px;
}

.html-template-library__card-tags .is-source {
  color: #0f766e;
  background: #ecfeff;
}

.html-template-library__empty {
  display: grid;
  place-items: center;
  align-content: center;
  gap: 6px;
  min-height: 280px;
  border: 1px dashed #cbd5e1;
  border-radius: 24px;
  background: linear-gradient(180deg, #f8fafc, #ffffff);
}

.html-template-library__empty-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.html-template-library__empty-desc {
  font-size: 12px;
  color: #6b7280;
}

.html-template-library__grid::-webkit-scrollbar,
.html-template-library__card-body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.html-template-library__grid::-webkit-scrollbar-thumb,
.html-template-library__card-body::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.68);
  border-radius: 999px;
}

.html-template-library__grid::-webkit-scrollbar-track,
.html-template-library__card-body::-webkit-scrollbar-track {
  background: rgba(241, 245, 249, 0.9);
  border-radius: 999px;
}

@media (max-width: 900px) {
  .html-template-library__trigger,
  .html-template-library__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .html-template-library__meta {
    align-items: flex-start;
    text-align: left;
  }

  .html-template-library__search {
    max-width: none;
  }

  .html-template-library__filters {
    width: 100%;
    justify-content: flex-start;
  }

  .html-template-library__grid {
    grid-auto-rows: 560px;
  }
}
</style>
