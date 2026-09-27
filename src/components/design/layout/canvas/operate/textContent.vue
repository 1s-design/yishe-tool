<template>
  <operate-form-item style="align-items: start;">
    <template #icon>
      <icon />
    </template>
    <template #name> {{ label }} </template>
    <template #content>
      <div class="w-full flex gap-2">
        <Textarea :placeholder="placeholder" :rows="3" v-model="model" class="resize-y"></Textarea>
        <Button variant="default" size="sm" @click="showSentenceSelector = true">
          句库
        </Button>
      </div>
    </template>
  </operate-form-item>

  <!-- 句子选择器 -->
  <sentence-selector
    v-model:visible="showSentenceSelector"
    @select="handleSentenceSelect"
  />
</template>

<script setup lang="ts">
import icon from "@/components/design/assets/icon/text-content.svg?component";
import { ref } from 'vue'
import SentenceSelector from './sentenceSelector.vue'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const model = defineModel({ default: '' })

const props = defineProps({
  label: {
    default: '文字内容',
  },
  placeholder: {
    default: '请输入'
  }
})

// 句子选择器状态
const showSentenceSelector = ref(false)

// 处理句子选择
function handleSentenceSelect(sentence: any) {
  model.value = sentence.content
}
</script>

<style></style>
