import { ref } from 'vue'
import { useLoginStatusStore } from "@/store/stores/login";

// 是否展示登录窗口
export const showLoginFormModal = ref(false)

export const openLoginDialog = async () => {
    const loginStore = useLoginStatusStore()
    if (loginStore.isLogin) {
        return
    }
    showLoginFormModal.value = true
}


