<template>
  <div class="folder-tree-node">
    <div v-for="node in nodes" :key="node.id" class="folder-tree-row">
      <span
        class="folder-tree-item"
        :class="{ 'is-selected': selectedId === node.id }"
        @click.stop="onSelect(node.id)"
      >
        <span
          v-if="node.children && node.children.length"
          class="folder-tree-arrow"
          :class="{ 'is-expanded': isExpanded(node) }"
          @click.stop="toggleExpand(node.id)"
        >
          <ChevronRight class="w-3 h-3" />
        </span>
        <span v-else class="folder-tree-arrow-placeholder" />
        <span class="folder-tree-text">{{ node.name }}</span>
        <Check v-if="selectedId === node.id" class="folder-check-icon w-3.5 h-3.5" />
      </span>
      <FolderTreeNode
        v-if="node.children && node.children.length && isExpanded(node)"
        :nodes="node.children"
        :selected-id="selectedId"
        :on-select="onSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Check, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  nodes: any[]
  selectedId: string | null
  onSelect: (id: string) => void
}>()

const collapsedIds = ref<string[]>([])

function isExpanded(node: any) {
  return !collapsedIds.value.includes(node.id)
}

function toggleExpand(id: string) {
  const i = collapsedIds.value.indexOf(id)
  if (i >= 0) collapsedIds.value.splice(i, 1)
  else collapsedIds.value.push(id)
}
</script>
