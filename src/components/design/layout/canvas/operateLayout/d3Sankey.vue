<template>
  <div>
    <Card class="property-group">
      <CardHeader>
        <CardTitle>数据配置</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col gap-3">
        <div class="grid grid-cols-[80px_1fr] items-start gap-2">
          <Label class="pt-1.5">节点数据</Label>
          <div class="flex flex-col gap-1">
            <Textarea
              v-model="nodesJson"
              :rows="6"
              placeholder='[{"id":"A","name":"Node A"},{"id":"B","name":"Node B"}]'
              @blur="onNodesChange"
            />
            <div v-if="nodesError" class="text-red-500 text-xs mt-1">
              {{ nodesError }}
            </div>
          </div>
        </div>
        <div class="grid grid-cols-[80px_1fr] items-start gap-2">
          <Label class="pt-1.5">链接数据</Label>
          <div class="flex flex-col gap-1">
            <Textarea
              v-model="linksJson"
              :rows="6"
              placeholder='[{"source":"A","target":"B","value":10}]'
              @blur="onLinksChange"
            />
            <div v-if="linksError" class="text-red-500 text-xs mt-1">
              {{ linksError }}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="property-group">
      <CardHeader>
        <CardTitle>样式配置</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col gap-3">
        <div class="grid grid-cols-[80px_1fr] items-center gap-2">
          <Label>背景色</Label>
          <ColorInput v-model="formData.backgroundColor" />
        </div>
        <div class="grid grid-cols-[80px_1fr] items-center gap-2">
          <Label>节点宽度</Label>
          <Input
            type="number"
            :model-value="formData.nodeWidth"
            :min="5"
            :max="60"
            @update:model-value="v => (formData.nodeWidth = Number(v))"
          />
        </div>
        <div class="grid grid-cols-[80px_1fr] items-center gap-2">
          <Label>节点间距</Label>
          <Input
            type="number"
            :model-value="formData.nodePadding"
            :min="0"
            :max="50"
            @update:model-value="v => (formData.nodePadding = Number(v))"
          />
        </div>
      </CardContent>
    </Card>

    <Card class="property-group">
      <CardHeader>
        <CardTitle>尺寸配置</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col gap-3">
        <div class="grid grid-cols-[80px_1fr] items-center gap-2">
          <Label>宽度</Label>
          <Input
            type="number"
            :model-value="formData.width"
            :min="200"
            :max="2000"
            :step="10"
            @update:model-value="v => (formData.width = Number(v))"
          />
        </div>
        <div class="grid grid-cols-[80px_1fr] items-center gap-2">
          <Label>高度</Label>
          <Input
            type="number"
            :model-value="formData.height"
            :min="100"
            :max="1500"
            :step="10"
            @update:model-value="v => (formData.height = Number(v))"
          />
        </div>
      </CardContent>
    </Card>

    <Card class="property-group">
      <CardHeader>
        <CardTitle>通用属性</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col gap-3">
        <div class="grid grid-cols-[80px_1fr] items-center gap-2">
          <Label>X坐标</Label>
          <Input
            type="number"
            :model-value="formData.x"
            :min="0"
            :max="2000"
            :step="1"
            @update:model-value="v => (formData.x = Number(v))"
          />
        </div>
        <div class="grid grid-cols-[80px_1fr] items-center gap-2">
          <Label>Y坐标</Label>
          <Input
            type="number"
            :model-value="formData.y"
            :min="0"
            :max="2000"
            :step="1"
            @update:model-value="v => (formData.y = Number(v))"
          />
        </div>
        <div class="grid grid-cols-[80px_1fr] items-center gap-2">
          <Label>层级</Label>
          <Input
            type="number"
            :model-value="formData.zIndex"
            :min="0"
            :max="999"
            @update:model-value="v => (formData.zIndex = Number(v))"
          />
        </div>
        <div class="grid grid-cols-[80px_1fr] items-center gap-2">
          <Label>旋转角度</Label>
          <div class="flex items-center gap-2">
            <Slider
              :model-value="[formData.rotate]"
              :min="0"
              :max="360"
              class="flex-1"
              @update:model-value="v => (formData.rotate = v[0])"
            />
            <Input
              type="number"
              :model-value="formData.rotate"
              :min="0"
              :max="360"
              class="w-16"
              @update:model-value="v => (formData.rotate = Number(v))"
            />
          </div>
        </div>
        <div class="grid grid-cols-[80px_1fr] items-center gap-2">
          <Label>透明度</Label>
          <div class="flex items-center gap-2">
            <Slider
              :model-value="[formData.opacity]"
              :min="0"
              :max="1"
              :step="0.01"
              class="flex-1"
              @update:model-value="v => (formData.opacity = v[0])"
            />
            <Input
              type="number"
              :model-value="formData.opacity"
              :min="0"
              :max="1"
              :step="0.01"
              class="w-16"
              @update:model-value="v => (formData.opacity = Number(v))"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, PropType } from "vue";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

interface SankeyNode {
  id: string;
  name: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface D3SankeyProperty {
  nodes: SankeyNode[];
  links: SankeyLink[];
  backgroundColor: string;
  width: number;
  height: number;
  nodeWidth: number;
  nodePadding: number;
  x: number;
  y: number;
  zIndex: number;
  rotate: number;
  opacity: number;
}

const props = defineProps({
  modelValue: {
    type: Object as PropType<D3SankeyProperty>,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const formData = ref<D3SankeyProperty>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (val) => {
    formData.value = { ...val };
  },
  { deep: true },
);

watch(
  formData,
  (val) => {
    emit("update:modelValue", { ...val });
  },
  { deep: true },
);

const nodesJson = ref(JSON.stringify(formData.value.nodes, null, 2));
const linksJson = ref(JSON.stringify(formData.value.links, null, 2));
const nodesError = ref("");
const linksError = ref("");

watch(
  () => formData.value.nodes,
  (val) => {
    nodesJson.value = JSON.stringify(val, null, 2);
  },
  { deep: true },
);

watch(
  () => formData.value.links,
  (val) => {
    linksJson.value = JSON.stringify(val, null, 2);
  },
  { deep: true },
);

const onNodesChange = () => {
  try {
    const parsed = JSON.parse(nodesJson.value);
    if (!Array.isArray(parsed)) {
      nodesError.value = "请输入有效的JSON数组";
      return;
    }
    formData.value.nodes = parsed.map((item: any) => ({
      id: String(item.id || ""),
      name: String(item.name || item.id || ""),
    }));
    nodesError.value = "";
  } catch (e) {
    nodesError.value = "JSON格式错误，请检查输入";
  }
};

const onLinksChange = () => {
  try {
    const parsed = JSON.parse(linksJson.value);
    if (!Array.isArray(parsed)) {
      linksError.value = "请输入有效的JSON数组";
      return;
    }
    formData.value.links = parsed.map((item: any) => ({
      source: String(item.source || ""),
      target: String(item.target || ""),
      value: Number(item.value) || 0,
    }));
    linksError.value = "";
  } catch (e) {
    linksError.value = "JSON格式错误，请检查输入";
  }
};

defineOptions({ name: "D3SankeyProperty" });
</script>

<style scoped lang="scss">
.property-group {
  margin-bottom: 12px;
}
</style>
