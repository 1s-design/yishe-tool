<template>
    <div class="tags">
        <template v-for="item in stickerQueryTags" :key="item.label">
            <Badge
                class="tag cursor-pointer select-none"
                :variant="item.checked ? 'default' : 'outline'"
                @click="tagChange(!item.checked, item)"
            >
                {{ item.label }}
            </Badge>
        </template>
        <div style="flex:1;"></div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {stickerQueryTags,stickerQueryParams} from './index.tsx'
import { Badge } from '@/components/ui/badge'
const emits = defineEmits(['change'])

function tagChange(value, item) {
    item.checked = value
    emits('change', stickerQueryTags.value)
}

</script>

<style scoped lang="less">
.tags {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    gap: .8em .4em;
}

.tag {
    padding: 6px 10px;
    border-radius: 12px;
    font-weight: 700;
    font-size: .8rem;
}
</style>
