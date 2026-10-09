<template>
  <div class="tags-input" ref="popperRef">
    <Popover v-if="autocompleteTags" :open="undefined">
      <PopoverTrigger as-child>
        <vue3-tags-input
          :tags="tags"
          :validate="customValidate"
          placeholder="自定义标签"
          @on-tags-changed="handleInput"
        />
      </PopoverTrigger>
      <PopoverContent
        :side="autocompletePlacement"
        :style="{ width: autocompleteWidth + 'px' }"
        class="tags-input-tags"
      >
        <div
          v-if="showAlert"
          class=" border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground"
          style="width: 100%"
        >
          点击变标签可以自动添加到输入框中
          <span
            class="ml-2 cursor-pointer text-primary underline"
            @click="showAlert = false"
          >不再提示</span>
        </div>
        <Badge
          variant="secondary"
          class="cursor-pointer"
          v-for="(tag, index) in autocompleteTags"
          @click="handleSelect(tag)"
        >
          {{ tag.text }}
        </Badge>
      </PopoverContent>
    </Popover>
    <vue3-tags-input
      v-else
      :tags="tags"
      :validate="customValidate"
      placeholder="自定义标签"
      @on-tags-changed="handleInput"
    />
  </div>
</template>

<script setup>
import { defineComponent, ref } from "vue";
import Vue3TagsInput from "./src/vue3-tags-input.vue";
import { useLocalStorage } from "@vueuse/core";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const props = defineProps({
  // 内置的提示框
  autocompleteTags: {
    default: null,
  },
  autocompleteWidth: {
    default: 560,
  },
  autocompletePlacement: {
    default: "bottom",
  },
  string: {
    default: false, // 已字符串的形式返回 绑定的值
  },
});

const model = defineModel({});

// 所有的 tags
const tags = ref([]);

watch(
  model,
  (v) => {
    if (Array.isArray(v)) {
      tags.value = v;
    } else {
      if (!v) {
        tags.value = [];
      } else {
        tags.value = v.split(",");
      }
    }
  },
  {
    immediate: true,
  }
);

const showAlert = useLocalStorage("_1s_showAutoCompleteTip", true);

const popperRef = ref();

const handleSelect = (tag) => {
  if (!tags.value.includes(tag.text)) {
    tags.value.push(tag.text);
  }
  emitModel();
};

const emits = defineEmits(["update:modelValue"]);

function handleInput(val) {
  tags.value = val;
  emitModel();
}

function emitModel() {
  popperRef.value.popperRef?.popperInstanceRef?.update();

  if (props.string) {
    emits("update:modelValue", tags.value.join(","));
  } else {
    emits("update:modelValue", tags.value);
  }
}

// 限制长度
function customValidate(value) {
  const legal = value.length >= 1 && value.length <= 100;
  return legal;
}
</script>

<style lang="less">
.v3ti {
  min-height: 0 !important;
  background-color: #fff !important;
  border: none !important;
}

.v3ti {
  input::placeholder {
    color: #a8abb2;
  }
}

.v3ti-new-tag {
  font-size: 1rem;
  height: 24px !important;
  min-width: 160px !important;
}

.v3ti-tag {
  font-size: 1rem;
  background: var(--1s-accent-color) !important;
  height: 20px !important;
  margin: 5px 3px;
}

.v3ti--focus {
  border: 1px solid var(--1s-accent-color) !important;
  box-: none;
}

.tags-input {
  font-size: 1rem;
  width: 100%;
}

.tags-input-tags {
  .ant-tag:not(.ant-tag-checkable-checked) {
    cursor: pointer;
    background: rgba(0, 0, 0, 0.04) !important;
    color: rgba(0, 0, 0, 0.88);
  }
}

.tags-input-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  row-gap: 8px;
}
</style>
