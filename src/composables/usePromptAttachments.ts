/**
 * 创作资源 → 提示词 的共享选择托盘（跨 tab 保留）
 *
 * 8 类创作资源共用同一份状态：在任意 tab 里「加入提示词」，
 * 切到别的 tab 继续加，最后一起随消息发给 agent。
 * 发送时由 buildResourceContext() 编译成「设计思路 + 资源绑定」。
 */
import { ref, computed } from "vue";
import type { DesignResourceRef, ResourceType } from "@/ai/resource-refs";

const refs = ref<DesignResourceRef[]>([]);

export function usePromptAttachments() {
  const has = (type: ResourceType, id: string) =>
    refs.value.some((r) => r.type === type && r.id === id);

  const add = (ref: DesignResourceRef) => {
    if (!ref?.id && !ref?.payload) return;
    if (has(ref.type, ref.id)) return;
    refs.value = [...refs.value, ref];
  };

  const remove = (type: ResourceType, id: string) => {
    refs.value = refs.value.filter((r) => !(r.type === type && r.id === id));
  };

  const toggle = (ref: DesignResourceRef) => {
    if (has(ref.type, ref.id)) remove(ref.type, ref.id);
    else add(ref);
  };

  const move = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= refs.value.length || toIndex < 0 || toIndex >= refs.value.length) return;
    const list = [...refs.value];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    refs.value = list;
  };

  const setRefs = (newRefs: DesignResourceRef[]) => {
    refs.value = newRefs;
  };

  const clear = () => {
    refs.value = [];
  };

  return {
    refs,
    has,
    add,
    remove,
    toggle,
    move,
    setRefs,
    clear,
    count: computed(() => refs.value.length),
  };
}
