<template>
  <div class="login-form">
    <div
      style="
        padding: 20px 0px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      "
    >
      <img src="/favicon.png" style="width: 20px; height: 20px; margin-right: 8px" />
      <div style="font-size: 14px; font-weight: bold; color: #666; text-align: left">
        登录 {{ productName }}
      </div>
      <div style="flex: 1"></div>
    </div>
    <el-form :model="loginForm" ref="form" :rules="rules" label-position="top">
      <el-form-item prop="account">
        <el-input placeholder="请输入账号或邮箱" v-model="loginForm.account">
          <template #prefix>
            <el-icon>
              <User />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          placeholder="请输入密码"
          v-model="loginForm.password"
          :type="showPassword ? 'text' : 'password'"
        >
          <template #prefix>
            <el-icon>
              <Lock />
            </el-icon>
          </template>
          <template #suffix>
            <span class="showPassword" @click="showPassword = !showPassword">
              <el-icon v-if="showPassword">
                <View />
              </el-icon>
              <el-icon v-else>
                <Hide />
              </el-icon>
            </span>
          </template>
        </el-input>
      </el-form-item>

      <div class="login-error">{{ errMsg }}</div>

      <el-form-item>
        <el-button
          style="width: 100%"
          type="primary"
          @click="submit(form)"
          :loading="loading"
        >
          {{ loading ? "登录中..." : "登 录" }}
        </el-button>
      </el-form-item>
    </el-form>
    <div style="display: flex; justify-content: space-between">
      <div class="login-link login-link--muted">账号由管理员统一分配</div>
      <div></div>
      <div class="login-link login-link--muted">如需开通请联系管理员</div>
    </div>
  </div>
</template>

<script setup>
import { publicAppConfig } from "@/config/public";
import { reactive, ref, nextTick } from "vue";
import { login } from "@/api/index";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";

import { View, Hide, User, Lock } from "@element-plus/icons-vue";
import { doLoginAction } from "@/store/stores/loginAction";
import { showLoginFormModal } from "@/modules/main/view/user/login/index.tsx";
const router = useRouter();
const productName = publicAppConfig.shortName;

const loading = ref(false);

const showPassword = ref(false);

const form = ref();

const errMsg = ref();

const isOnce = ref(false);

const loginForm = reactive({
  account: "",
  password: "",
});

const rules = reactive({
  account: [
    {
      message: "",
      trigger: ["blur"],
      validator(rule, val) {
        return val.length >= 5 && val.length <= 16;
      },
    },
  ],
  password: [
    {
      message: "",
      trigger: ["blur"],
      validator(rule, val) {
        return val.length >= 5 && val.length <= 16;
      },
    },
  ],
});

async function submit(form) {
  const validateRes = await form.validate(() => {});

  if (!validateRes) {
    return;
  }

  // loading.value = true;

  try {
    loading.value = true;
    // 修改字段名以匹配后端期望的username字段
    const loginData = {
      username: loginForm.account,
      password: loginForm.password
    };
    let res = await login(loginData);
    await doLoginAction(res.data, isOnce.value);
    message.success("登录成功!");
    if (showLoginFormModal.value) {
      showLoginFormModal.value = false;
    } else {
      router.replace({ name: "Design" });
    }
    await nextTick();
    loading.value = false;
  } catch (e) {
    loading.value = false;
    console.error('登录失败:', e);
    // 显示错误信息
    if (e?.response?.data?.message) {
      errMsg.value = e.response.data.message;
    } else if (e?.message) {
      errMsg.value = e.message;
    } else {
      errMsg.value = '登录失败，请检查账号密码';
    }
  }
}
</script>

<style lang="less">
.login-form {
  width: 360px;

  .el-input__inner {
    font-size: 12px;
    font-weight: 300;
  }

  .el-input__prefix {
    color: #000;
  }
}

.showPassword {
  cursor: pointer;
  line-height: 30px;
  display: flex;
  font-size: 12px;
  justify-content: center;
  align-items: center;
  color: var(--el-color-primary);
}

.login-link {
  color: #999;
  font-size: 12px;
  font-weight: 400;

  &:hover {
    color: #999;
  }
}

.login-link--muted {
  cursor: default;
}

.login-type {
  color: #999;
  font-size: 12px;
  font-weight: 400;
  display: flex;
  justify-content: space-between;
  gap: 5px;
}

.login-error {
  height: 12px;
  line-height: 0px;
  font-size: 12px;
  width: 100%;
  text-align: right;
  color: var(--el-color-error);
}
</style>
