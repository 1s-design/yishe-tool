import { ref, h } from 'vue'
import { Modal } from 'ant-design-vue'
import { useLoginStatusStore } from "@/store/stores/login";

export enum LoginType {
    PASSWORD,
    QRCODE
}

export const loginType = ref(LoginType.PASSWORD)



// 是否展示登录窗口
export const showLoginFormModal = ref(false)

export const openLoginDialog = async () => {

    let loginStore = useLoginStatusStore()

    if (loginStore.isLogin) {
        return
    }

    import("@/modules/main/router").then((module) => {
        module.default.push({ name: 'Login' });
    });
}


