<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <slot></slot>
    </PopoverTrigger>
    <PopoverContent align="start" class="w-[340px] p-0 add-popover-content">
      <div class="add-popover-search">
        <Search class="add-popover-search__icon" />
        <input
          v-model="keyword"
          type="text"
          class="add-popover-search__input"
          placeholder="搜索组件（词云、图表、公式、乐谱…）"
        />
        <button
          v-if="keyword"
          type="button"
          class="add-popover-search__clear"
          aria-label="清空搜索"
          @click="keyword = ''"
        >
          <X class="w-3 h-3" />
        </button>
      </div>

      <div class="add-popover-body">
        <template v-if="filteredGroups.length">
          <div v-for="group in filteredGroups" :key="group.title" class="add-popover-group">
            <div class="add-popover-group__title">{{ group.title }}</div>
            <div class="add-popover-grid">
              <button
                v-for="item in group.items"
                :key="item.key"
                type="button"
                class="add-popover-item"
                @click="add(item.key)"
              >
                <span class="add-popover-item__label">{{ item.label }}</span>
              </button>
            </div>
          </div>
        </template>
        <div v-else class="add-popover-empty">未找到匹配的组件</div>
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Search, X } from "lucide-vue-next";
import { addCanvasChild, canvasChildLabelMap } from "./index.tsx";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const open = ref(false);
const keyword = ref("");

// 固定图层及已废弃的旧元素类型不在「添加组件」中暴露
const HIDDEN_TYPES = new Set([
  "canvas",
  "html",
  "text",
  "image",
  "background",
  "rect",
  "ellipse",
]);

const CATEGORY_DEFS: Array<{ title: string; keys: string[] }> = [
  {
    title: "文字与编码",
    keys: ["wordCloud", "d3Cloud", "qrcode", "barcode", "figlet", "opentypeText", "codeBlock"],
  },
  {
    title: "数据图表",
    keys: ["echart", "chartjs", "plotlyChart", "frappeChart", "chartXkcd", "vueDataUi", "vegaLite"],
  },
  {
    title: "3D 与图形",
    keys: ["threeScene", "cytoscape", "cytoscapeGraph", "dagreGraph", "d3", "roughShape", "rawCanvas"],
  },
  {
    title: "科学与文档",
    keys: ["math", "mermaid", "graphviz", "molecule", "threeMol", "markmapChart"],
  },
  {
    title: "乐谱",
    keys: ["abcNotation", "vexFlow"],
  },
  {
    title: "特效与背景",
    keys: ["particlesEffect", "confetti", "trianglify", "starChart", "waveform", "simplexNoise"],
  },
];

const groupedItems = computed(() => {
  const allEntries = Object.entries(canvasChildLabelMap).filter(
    ([key, label]) => Boolean(label) && !HIDDEN_TYPES.has(key),
  );
  const labelMap = new Map(allEntries);
  const usedKeys = new Set<string>();

  const groups: Array<{ title: string; items: Array<{ key: string; label: string }> }> = [];

  for (const def of CATEGORY_DEFS) {
    const items: Array<{ key: string; label: string }> = [];
    for (const key of def.keys) {
      const label = labelMap.get(key);
      if (label) {
        items.push({ key, label });
        usedKeys.add(key);
      }
    }
    if (items.length) {
      groups.push({ title: def.title, items });
    }
  }

  const extraItems = allEntries
    .filter(([key]) => !usedKeys.has(key))
    .map(([key, label]) => ({ key, label: String(label) }));
  if (extraItems.length) {
    groups.push({ title: "其他组件", items: extraItems });
  }

  return groups;
});

const filteredGroups = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return groupedItems.value;
  return groupedItems.value
    .map((group) => ({
      title: group.title,
      items: group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) || item.key.toLowerCase().includes(q),
      ),
    }))
    .filter((group) => group.items.length > 0);
});

function add(type: string) {
  addCanvasChild({ type });
  keyword.value = "";
  open.value = false;
}
</script>

<style lang="less" scoped>
.add-popover-search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--1s-divider-color);
}

.add-popover-search__icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  color: var(--1s-text-color-tertiary);
}

.add-popover-search__input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 12px;
  color: var(--1s-text-color);

  &::placeholder {
    color: var(--1s-text-color-tertiary);
  }
}

.add-popover-search__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: var(--1s-text-color-tertiary);
  cursor: pointer;
  padding: 2px;

  &:hover {
    color: var(--1s-text-color);
  }
}

.add-popover-body {
  max-height: 360px;
  overflow-y: auto;
  padding: 8px 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.add-popover-group__title {
  font-size: 11px;
  font-weight: 600;
  color: var(--1s-text-color-secondary);
  margin-bottom: 5px;
  user-select: none;
}

.add-popover-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px;
}

.add-popover-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--1s-dialog-border);
  background: var(--1s-control-surface-muted);
  color: var(--1s-text-color);
  font-size: 11.5px;
  cursor: pointer;
  transition: var(--1s-control-transition);
  text-align: left;
  min-width: 0;

  &:hover {
    background: var(--1s-state-hover);
    border-color: var(--1s-accent-color);
    color: var(--1s-text-color);
  }
}

.add-popover-item__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-popover-empty {
  padding: 20px 0;
  text-align: center;
  font-size: 12px;
  color: var(--1s-text-color-tertiary);
}
</style>
