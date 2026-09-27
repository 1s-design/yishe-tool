<template>
  <Dialog
    :open="visible"
    @update:open="(val) => (visible = val)"
  >
    <DialogContent
      class="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 rounded-none knowledge-edit-dialog"
    >
    <DialogHeader class="px-6 pt-6 pb-2">
      <DialogTitle>{{ isEdit ? '编辑知识' : '新增知识' }}</DialogTitle>
    </DialogHeader>
    <div class="knowledge-edit-content">
      <div class="form">
        <div class="knowledge-edit-layout">
          <!-- 左侧：主要内容编辑 -->
          <div class="knowledge-edit-main">
            <div class="form-item">
              <Label>标题</Label>
              <div class="form-item-content">
                <Input
                  v-model="form.title"
                  placeholder="简短描述这条知识"
                  maxlength="255"
                  class="h-9"
                />
                <div class="word-limit">{{ (form.title || '').length }} / 255</div>
              </div>
            </div>

            <div class="form-item content-editor-item">
              <Label>知识内容</Label>
              <div class="form-item-content">
                <Textarea
                  v-model="form.content"
                  placeholder="知识内容（支持 Markdown）"
                  class="content-editor"
                />
              </div>
            </div>
          </div>

          <!-- 右侧：设置面板 -->
          <div class="knowledge-edit-sidebar">
            <div class="sidebar-section">
              <div class="sidebar-section-title">基本信息</div>
              <div class="form-item">
                <Label>分类</Label>
                <div class="form-item-content">
                  <Select v-model="form.category">
                    <SelectTrigger style="width: 100%">
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="css-trick">CSS技巧</SelectItem>
                      <SelectItem value="color-value">颜色值</SelectItem>
                      <SelectItem value="code-config">代码配置</SelectItem>
                      <SelectItem value="design-principle">设计原则</SelectItem>
                      <SelectItem value="template-tip">模板技巧</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div class="form-item">
                <Label>可见性</Label>
                <div class="form-item-content">
                  <div class="flex gap-2">
                    <Button
                      size="sm"
                      :variant="form.isPublic === false ? 'default' : 'outline'"
                      @click="form.isPublic = false"
                    >私有</Button>
                    <Button
                      size="sm"
                      :variant="form.isPublic === true ? 'default' : 'outline'"
                      @click="form.isPublic = true"
                    >公开</Button>
                  </div>
                </div>
              </div>
            </div>

            <div class="sidebar-section">
              <div class="sidebar-section-title">标签</div>
              <div class="tags-input-wrapper">
                <Badge
                  v-for="tag in form.tags"
                  :key="tag"
                  variant="secondary"
                  class="mr-1 mb-1 gap-1 pr-1"
                >
                  {{ tag }}
                  <button
                    type="button"
                    class="rounded-full p-0.5 hover:bg-background/60"
                    @click="removeTag(tag)"
                  >×</button>
                </Badge>
              </div>
              <Input
                v-model="newTag"
                size="small"
                placeholder="输入标签后回车添加"
                @keyup.enter="addTag"
                @blur="addTag"
                class="mt-2"
              />
            </div>

            <div class="sidebar-section">
              <div class="sidebar-section-title">扩展数据 (JSON)</div>
              <Textarea
                v-model="extrasJson"
                :rows="6"
                placeholder='{"key": "value"}'
              />
              <div v-if="extrasError" class="form-error">JSON 格式不正确</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dialog-footer">
      <Button variant="outline" class="h-9" @click="visible = false">取消</Button>
      <Button class="h-9" :disabled="submitting" @click="handleSubmit">
        <span v-if="submitting">保存中...</span>
        <span v-else>保存</span>
      </Button>
    </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { message } from '@/common/message';
import {
  createDesignKnowledge,
  updateDesignKnowledge,
} from "@/api";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const props = defineProps<{
  visible: boolean;
  editData?: any;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "success"): void;
}>();

const visible = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const isEdit = computed(() => !!props.editData?.id);

const submitting = ref(false);
const newTag = ref("");
const extrasJson = ref("");
const extrasError = ref(false);

const form = ref({
  title: "",
  content: "",
  category: "other",
  tags: [] as string[],
  extras: {} as Record<string, any>,
  isPublic: false,
});

const rules = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  content: [{ required: true, message: "请输入内容", trigger: "blur" }],
  category: [{ required: true, message: "请选择分类", trigger: "change" }],
};

watch(
  () => props.editData,
  (val) => {
    if (val) {
      form.value = {
        title: val.title || "",
        content: val.content || "",
        category: val.category || "other",
        tags: Array.isArray(val.tags) ? [...val.tags] : [],
        extras: val.extras || {},
        isPublic: val.isPublic ?? false,
      };
      extrasJson.value = val.extras ? JSON.stringify(val.extras, null, 2) : "";
    } else {
      form.value = {
        title: "",
        content: "",
        category: "other",
        tags: [],
        extras: {},
        isPublic: false,
      };
      extrasJson.value = "";
    }
    extrasError.value = false;
  },
  { immediate: true },
);

function addTag() {
  const tag = newTag.value.trim();
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag);
  }
  newTag.value = "";
}

function removeTag(tag: string) {
  form.value.tags = form.value.tags.filter((t) => t !== tag);
}

async function handleSubmit() {
  // 表单校验（原 el-form rules 的等价实现）
  const requiredFields: Array<[keyof typeof form.value, string]> = [
    ["title", "请输入标题"],
    ["content", "请输入内容"],
    ["category", "请选择分类"],
  ];
  for (const [key, msg] of requiredFields) {
    if (!form.value[key]) {
      message.error(msg);
      return;
    }
  }

  // 解析 extras JSON
  let extras = {};
  if (extrasJson.value.trim()) {
    try {
      extras = JSON.parse(extrasJson.value);
      extrasError.value = false;
    } catch {
      extrasError.value = true;
      message.error("扩展数据格式错误，请输入有效的 JSON");
      return;
    }
  }

  submitting.value = true;
  try {
    const payload = {
      ...form.value,
      extras,
    };

    if (isEdit.value) {
      await updateDesignKnowledge({
        id: props.editData.id,
        ...payload,
      });
      message.success("更新成功");
    } else {
      await createDesignKnowledge(payload);
      message.success("创建成功");
    }

    visible.value = false;
    emit("success");
  } catch (error) {
    console.error("保存知识失败:", error);
    message.error("保存失败，请重试");
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.knowledge-edit-content {
  height: 100%;
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.knowledge-edit-layout {
  display: flex;
  gap: 24px;
  height: 100%;
}

.knowledge-edit-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.knowledge-edit-sidebar {
  width: 320px;
  flex-shrink: 0;
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--1s-control-surface-muted);
  border-radius: 8px;
}

.sidebar-section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--1s-text-color);
}

.form-item {
  margin-bottom: 16px;
}

.form-item-content {
  margin-top: 6px;
}

.form-error {
  margin-top: 4px;
  font-size: 12px;
  color: #ef4444;
}

.word-limit {
  margin-top: 4px;
  font-size: 11px;
  color: var(--1s-text-color-tertiary);
  text-align: right;
}

.content-editor-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-editor-item .form-item-content {
  flex: 1;
  display: flex;
}

.content-editor {
  height: 100%;
  min-height: 400px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.tags-input-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.mr-1 {
  margin-right: 4px;
}

.mb-1 {
  margin-bottom: 4px;
}

.mt-2 {
  margin-top: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--1s-border-color);
}
</style>
