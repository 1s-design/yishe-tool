<template>
  <Accordion
    type="multiple"
    :model-value="activeNames"
    @update:model-value="v => (activeNames = v as string[])"
  >
    <AccordionItem value="code">
      <AccordionTrigger>D3.js 代码</AccordionTrigger>
      <AccordionContent>
        <div class="d3-code-editor">
          <div class="d3-code-editor__toolbar">
            <Popover v-model:open="aiPopoverVisible">
              <PopoverTrigger as-child>
                <Button size="sm" variant="outline">AI 生成</Button>
              </PopoverTrigger>
              <PopoverContent side="right" align="start" class="w-[340px]">
                <div class="d3-ai-popover">
                  <Textarea
                    v-model="aiPrompt"
                    :rows="4"
                    class="resize-vertical"
                    spellcheck="false"
                    :disabled="aiLoading"
                    placeholder="描述图表，例如：生成一个柱状图、饼图、力导向图"
                    @keydown.enter.ctrl="generateCodeByAi"
                  />

                  <div class="d3-ai-popover__actions">
                    <Button size="sm" variant="outline" @click="aiPopoverVisible = false">取消</Button>
                    <Button
                      size="sm"
                      :disabled="!aiPrompt.trim() || aiLoading"
                      @click="generateCodeByAi"
                    >
                      确定
                    </Button>
                  </div>

                  <div v-if="aiError" class="d3-error">{{ aiError }}</div>
                </div>
              </PopoverContent>
            </Popover>

            <Select v-model="selectedTemplate" @update:model-value="applyTemplate">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue placeholder="选择模板" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">柱状图</SelectItem>
                <SelectItem value="pie">饼图</SelectItem>
                <SelectItem value="line">折线图</SelectItem>
                <SelectItem value="scatter">散点图</SelectItem>
                <SelectItem value="force">力导向图</SelectItem>
                <SelectItem value="tree">树状图</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            v-model="currentOperatingCanvasChild.code"
            :rows="16"
            class="d3-code-editor__input resize-vertical"
            spellcheck="false"
            placeholder="// D3.js 代码&#10;// 可用: d3, container, width, height"
          />
        </div>
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

        <operateItemBackgroundColor v-model="currentOperatingCanvasChild.backgroundColor" />
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
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemBackgroundColor from "@/components/design/layout/canvas/operate/backgroundColor.vue";
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { currentOperatingCanvasChild } from "../index.tsx";
import { generateD3Code } from "../children/aiD3Service.ts";

const activeNames = ref(["code", "basic", "common"]);
const aiPopoverVisible = ref(false);
const aiPrompt = ref("");
const aiLoading = ref(false);
const aiError = ref("");
const selectedTemplate = ref("");

const templates: Record<string, string> = {
  bar: `// 柱状图
const data = [30, 86, 168, 281, 303, 365];
const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

const svg = d3.select(container)
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const barWidth = width / data.length - 4;

svg.selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr('x', (d, i) => i * (width / data.length) + 2)
  .attr('y', (d) => height - d * (height / Math.max(...data)))
  .attr('width', barWidth)
  .attr('height', (d) => d * (height / Math.max(...data)))
  .attr('fill', '#4A90D9');

svg.selectAll('text')
  .data(labels)
  .enter()
  .append('text')
  .text((d) => d)
  .attr('x', (d, i) => i * (width / data.length) + barWidth / 2 + 2)
  .attr('y', height - 5)
  .attr('text-anchor', 'middle')
  .attr('fill', '#333')
  .attr('font-size', '12px');`,

  pie: `// 饼图
const data = [30, 20, 15, 10, 25];
const colors = ['#4A90D9', '#E74C3C', '#2ECC71', '#F39C12', '#9B59B6'];

const svg = d3.select(container)
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const radius = Math.min(width, height) / 2 - 20;
const g = svg.append('g')
  .attr('transform', \`translate(\${width / 2}, \${height / 2})\`);

const pie = d3.pie();
const arc = d3.arc().innerRadius(0).outerRadius(radius);

const arcs = g.selectAll('path')
  .data(pie(data))
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', (d, i) => colors[i % colors.length]);`,

  line: `// 折线图
const data = [10, 40, 30, 20, 50, 40, 60];

const svg = d3.select(container)
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const x = d3.scaleLinear()
  .domain([0, data.length - 1])
  .range([40, width - 20]);

const y = d3.scaleLinear()
  .domain([0, Math.max(...data)])
  .range([height - 30, 10]);

const line = d3.line()
  .x((d, i) => x(i))
  .y((d) => y(d));

svg.append('path')
  .datum(data)
  .attr('d', line)
  .attr('fill', 'none')
  .attr('stroke', '#4A90D9')
  .attr('stroke-width', 2);

svg.selectAll('circle')
  .data(data)
  .enter()
  .append('circle')
  .attr('cx', (d, i) => x(i))
  .attr('cy', (d) => y(d))
  .attr('r', 4)
  .attr('fill', '#4A90D9');`,

  scatter: `// 散点图
const data = [
  [10, 20], [30, 50], [50, 30], [70, 80], [90, 40],
  [20, 60], [40, 10], [60, 70], [80, 20], [100, 90]
];

const svg = d3.select(container)
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const x = d3.scaleLinear()
  .domain([0, 100])
  .range([40, width - 20]);

const y = d3.scaleLinear()
  .domain([0, 100])
  .range([height - 30, 10]);

svg.selectAll('circle')
  .data(data)
  .enter()
  .append('circle')
  .attr('cx', (d) => x(d[0]))
  .attr('cy', (d) => y(d[1]))
  .attr('r', 6)
  .attr('fill', '#4A90D9')
  .attr('opacity', 0.7);`,

  force: `// 力导向图
const nodes = [
  { id: 'A' }, { id: 'B' }, { id: 'C' },
  { id: 'D' }, { id: 'E' }, { id: 'F' }
];
const links = [
  { source: 'A', target: 'B' },
  { source: 'A', target: 'C' },
  { source: 'B', target: 'D' },
  { source: 'C', target: 'E' },
  { source: 'D', target: 'F' },
  { source: 'E', target: 'F' }
];

const svg = d3.select(container)
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links).id(d => d.id).distance(80))
  .force('charge', d3.forceManyBody().strength(-200))
  .force('center', d3.forceCenter(width / 2, height / 2));

const link = svg.selectAll('line')
  .data(links)
  .enter()
  .append('line')
  .attr('stroke', '#999')
  .attr('stroke-width', 2);

const node = svg.selectAll('circle')
  .data(nodes)
  .enter()
  .append('circle')
  .attr('r', 15)
  .attr('fill', '#4A90D9');

const label = svg.selectAll('text')
  .data(nodes)
  .enter()
  .append('text')
  .text(d => d.id)
  .attr('text-anchor', 'middle')
  .attr('dy', 5)
  .attr('fill', '#fff')
  .attr('font-size', '12px');

simulation.on('tick', () => {
  link
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);
  node
    .attr('cx', d => d.x)
    .attr('cy', d => d.y);
  label
    .attr('x', d => d.x)
    .attr('y', d => d.y);
});`,

  tree: `// 树状图
const data = {
  name: 'root',
  children: [
    { name: 'A', children: [{ name: 'A1' }, { name: 'A2' }] },
    { name: 'B', children: [{ name: 'B1' }, { name: 'B2' }, { name: 'B3' }] },
    { name: 'C' }
  ]
};

const svg = d3.select(container)
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const g = svg.append('g')
  .attr('transform', 'translate(40, 20)');

const treeLayout = d3.tree().size([height - 40, width - 100]);
const root = d3.hierarchy(data);
treeLayout(root);

g.selectAll('path')
  .data(root.links())
  .enter()
  .append('path')
  .attr('d', d3.linkHorizontal()
    .x(d => d.y)
    .y(d => d.x))
  .attr('fill', 'none')
  .attr('stroke', '#999');

g.selectAll('circle')
  .data(root.descendants())
  .enter()
  .append('circle')
  .attr('cx', d => d.y)
  .attr('cy', d => d.x)
  .attr('r', 8)
  .attr('fill', '#4A90D9');

g.selectAll('text')
  .data(root.descendants())
  .enter()
  .append('text')
  .text(d => d.data.name)
  .attr('x', d => d.y + 15)
  .attr('y', d => d.x + 5)
  .attr('fill', '#333')
  .attr('font-size', '12px');`,
};

function applyTemplate(templateName: string) {
  if (templateName && templates[templateName]) {
    currentOperatingCanvasChild.value.code = templates[templateName];
  }
}

async function generateCodeByAi() {
  const prompt = aiPrompt.value.trim();
  if (!prompt || aiLoading.value) return;

  aiLoading.value = true;
  aiError.value = "";

  try {
    const result = await generateD3Code(
      prompt,
      currentOperatingCanvasChild.value?.code || "",
    );

    currentOperatingCanvasChild.value.code = result.code;
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
.d3-code-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.d3-code-editor__toolbar {
  display: flex;
  gap: 8px;
}

.d3-code-editor__input {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.55;
}

.d3-ai-popover {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.d3-ai-popover__actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.d3-error {
  color: var(--el-color-danger);
  font-size: 12px;
  line-height: 1.4;
}
</style>
