<template>
  <Badge
    v-for="(item, index) in tags"
    :key="index"
    variant="secondary"
    class="h-5 gap-1 rounded-full px-2 text-xs font-normal"
  >
    {{ item }}
    <X class="h-3 w-3 cursor-pointer" />
  </Badge>

  <Popover>
    <PopoverTrigger as-child>
      <Badge
        variant="secondary"
        class="h-5 cursor-pointer rounded-full px-2 text-xs font-normal"
        @click="add"
      >
        添加标签
      </Badge>
    </PopoverTrigger>
    <PopoverContent class="w-[200px]">
      <div class="mb-2 text-sm font-medium">添加标签</div>
      <div>
        tags
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { defineEmits,ref } from 'vue';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { X } from 'lucide-vue-next';

const emit = defineEmits(['update:modelValue'])

const tags = ref()

function add(){

}

</script>

<style></style>
