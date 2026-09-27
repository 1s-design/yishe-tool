export { default as FileUpload } from './FileUpload.vue'

let seed = 0

/** 生成递增的文件 uid，替代 element-plus 的 genFileId */
export function genFileId(): number {
  return Date.now() + seed++
}
