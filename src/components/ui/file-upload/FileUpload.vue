<template>
  <div
    class="file-upload"
    :class="{ 'is-dragover': isDragover, 'is-disabled': disabled }"
    @dragover.prevent="onDragover"
    @dragleave.prevent="isDragover = false"
    @drop.prevent="onDrop"
  >
    <input
      ref="inputRef"
      type="file"
      class="hidden"
      :accept="accept"
      :disabled="disabled"
      :multiple="multiple"
      @change="onInputChange"
    />
    <div class="file-upload-trigger" @click="pickFiles">
      <slot />
    </div>
    <div class="file-upload-list">
      <div v-for="file in innerList" :key="file.uid" class="file-upload-item">
        <slot name="file" :file="file" :url="file.url" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { genFileId } from '.'

export interface UploadFile {
  uid: number
  name: string
  size: number
  raw: File
  url: string
  displaySize: string
  status: string
  percentage: number
  [key: string]: any
}

const props = withDefaults(
  defineProps<{
    fileList?: UploadFile[]
    accept?: string
    disabled?: boolean
    multiple?: boolean
    limit?: number
  }>(),
  {
    fileList: () => [],
    accept: '*',
    disabled: false,
    multiple: true,
    limit: Infinity,
  },
)

const emit = defineEmits<{
  (e: 'update:fileList', value: UploadFile[]): void
  (e: 'change', file: UploadFile): void
  (e: 'exceed', files: File[]): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isDragover = ref(false)

// 内部列表：保证 clearFiles() + handleStart() 在同一 tick 内的顺序调用可用
const innerList = ref<UploadFile[]>([...props.fileList])

watch(
  () => props.fileList,
  (v) => {
    innerList.value = [...(v || [])]
  },
  { deep: true },
)

function commit(next: UploadFile[]) {
  innerList.value = next
  emit('update:fileList', [...next])
}

function pickFiles() {
  if (props.disabled) return
  inputRef.value?.click()
}

function onDragover() {
  if (props.disabled) return
  isDragover.value = true
}

function onInputChange(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (files.length) acceptFiles(files)
  // 允许重复选择同一文件
  input.value = ''
}

function onDrop(e: DragEvent) {
  isDragover.value = false
  if (props.disabled) return
  const files = Array.from(e.dataTransfer?.files || [])
  if (files.length) acceptFiles(files)
}

function acceptFiles(files: File[]) {
  const rest = (props.limit ?? Infinity) - innerList.value.length
  if (rest <= 0 || files.length > rest) {
    emit('exceed', files)
    return
  }
  files.forEach((raw) => handleStart(raw))
}

/**
 * 兼容 element-plus el-upload 的 handleStart：手动塞入一个文件
 */
function handleStart(raw: File & { uid?: number }) {
  const file: UploadFile = {
    uid: raw.uid ?? genFileId(),
    name: raw.name,
    size: raw.size,
    raw,
    url: '',
    displaySize: '',
    status: 'ready',
    percentage: 0,
  }
  commit([...innerList.value, file])
  emit('change', file)
  return file
}

/**
 * 兼容 element-plus el-upload 的 clearFiles
 */
function clearFiles() {
  commit([])
}

defineExpose({
  handleStart,
  clearFiles,
  pickFiles,
})
</script>

<style scoped lang="less">
.file-upload {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.file-upload-trigger {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-upload.is-disabled .file-upload-trigger {
  cursor: not-allowed;
  opacity: 0.6;
}

.file-upload.is-dragover .file-upload-trigger {
  outline: 2px dashed var(--1s-control-border-color, #6900ff);
  outline-offset: -2px;
}

.file-upload-list {
  width: 100%;
}
</style>
