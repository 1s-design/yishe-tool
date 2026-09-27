import { ref,nextTick } from 'vue'
import { genFileId } from '@/components/ui/file-upload'
import { showUpload } from '@/components/design/store'

//  上传组件的实例子
export const uploadRef = ref()


export async function openFileModal(file) {
    showUpload.value = true
    await nextTick()
    uploadRef.value.handleStart(file)
}