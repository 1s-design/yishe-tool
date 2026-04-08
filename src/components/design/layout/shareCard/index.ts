import { ref } from 'vue'
import { createPreviewShareLink } from '@/config/public'



/**
 * pc 和移动端通用
*/

export const showShareCardModal = ref(false)

export const shareCardCustomModelInfo = ref()

export const openShareCardModal = (info) => {
    showShareCardModal.value = true
    shareCardCustomModelInfo.value = info
}



export function createCustomModelShareLink(id = '') {
    if (!id) {
        id = shareCardCustomModelInfo.value?.id
    }

    if(!id){
        return ''
    }

    return createPreviewShareLink(id)
}
