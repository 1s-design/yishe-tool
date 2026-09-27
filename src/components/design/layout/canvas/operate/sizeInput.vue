<template>
  <Popover>
    <PopoverTrigger as-child>
      <div class="size-input">
        <Input
          type="number"
          v-model.number="model"
          :placeholder="placeholder"
          class="h-5 w-full pr-8 text-[11px]"
          min="0"
          step="1"
        />
        <span class="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
          {{ unit }}
        </span>
      </div>
    </PopoverTrigger>
    <PopoverContent class="w-[180px]">
      <div class="flex items-center justify-end">
        <div class="w-full">
          <RadioGroup v-model="unit" class="grid gap-1">
            <label v-for="(u, index) in unitOptions" :key="u.value" class="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem :value="u.value" />
              <div class="text-xs">{{ u.label }}</div>
            </label>
          </RadioGroup>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

/*
 带有单位选择弹层的输入框
*/

const props = defineProps({
  unitOptions: {
    default: [],
  },
  placeholder: {
    default: "",
  },
  placement: {},
});

const model = defineModel({});
const unit = defineModel("unit", {});
</script>

<style scoped lang="less">
.size-input {
  position: relative;
  flex-shrink: 0;
  height: 20px;
  display: flex;
  width: 80px;
  align-items: center;
  justify-content: end;
}
</style>
