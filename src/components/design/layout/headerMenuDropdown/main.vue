<template>
  <menu-main>
    <menu-item>
      <template #icon>
        <icon-jump></icon-jump>
      </template>
      <template #title> 跳转 </template>
      <template #children>
        <menu-main>
          <menu-item>
            <template #title> 首页 </template>
          </menu-item>
          <menu-item>
            <template #title> 工作台 </template>
          </menu-item>
          <menu-item>
            <template #title> 商场 </template>
          </menu-item>
          <menu-item>
            <template #title> 素材中心 </template>
          </menu-item>
        </menu-main>
      </template>
    </menu-item>
    <menu-item>
      <template #icon>
        <icon-new></icon-new>
      </template>
      <template #title> 新建 </template>
      <template #children>
        <menu-main>
          <menu-item>
            <template #title>111</template>
          </menu-item>
          <menu-item>
            <template #title>2222</template>
            <template #children>
              <menu-main>
                <menu-item>
                  <template #title>111</template>
                </menu-item>
                <menu-item> <template #title>2222</template></menu-item>
              </menu-main>
            </template>
          </menu-item>
        </menu-main>
      </template>
    </menu-item>
    <menu-item>
      <template #icon>
        <icon-screenshot></icon-screenshot>
      </template>
      <template #title> 截屏当前画布 </template>
    </menu-item>
    <menu-item>
      <template #icon>
        <icon-view></icon-view>
      </template>
      <template #title> 视图 </template>
      <template #children>
        <menu-main>
          <menu-item>
            <template #title> 基础页面布局 </template>
            <template #children>
              <menu-main>
                <menu-item>
                  <template #title> 顶部主导航栏 </template>
                  <template #suffix>
                    <Switch v-model:checked="showHeader" />
                  </template>
                </menu-item>
                <menu-item>
                  <template #title> 顶部副导航栏 </template>
                  <template #suffix>
                    <Switch v-model:checked="showSubHeader" />
                  </template>
                </menu-item>
                <menu-item>
                  <template #title> 左侧菜单 </template>
                  <template #suffix>
                    <Switch v-model:checked="showLeftMenu" />
                  </template>
                </menu-item>
                <menu-item>
                  <template #title> 底部操作栏 </template>
                  <template #suffix>
                    <Switch v-model:checked="showBottomMenu" />
                  </template>
                </menu-item>
                <menu-item>
                  <template #title> 选择模型 </template>
                  <template #suffix>
                    <Switch v-model:checked="showBaseModelSelect" />
                  </template>
                </menu-item>
                <menu-item>
                  <template #title> 操作贴纸 </template>
                  <template #suffix>
                    <Switch v-model:checked="showDecalControl" />
                  </template>
                </menu-item>
                <menu-item>
                  <template #title> 显示工作台 </template>
                  <template #suffix>
                    <Switch v-model:checked="showWorkspace" />
                  </template>
                </menu-item>
                <menu-item>
                  <template #title> 字体列表 </template>
                  <template #suffix>
                    <Switch v-model:checked="showFontModal" />
                  </template>
                </menu-item>
              </menu-main>
            </template>
          </menu-item>
          <menu-item>
            <template #title> 功能布局 </template>
            <template #children>
              <menu-main>
                <menu-item>
                  <template #title> 工作台 </template>
                  <template #suffix>
                    <Switch v-model:checked="showWorkspace" />
                  </template>
                </menu-item>
                <menu-item>
                  <template #title> 当前操作的模型信息 </template>
                  <template #suffix>
                    <Switch v-model:checked="showModelInfo" />
                  </template>
                </menu-item>
                <menu-item>
                  <template #title> 已使用的贴纸 </template>
                  <template #suffix>
                    <Switch v-model:checked="showDecalList" />
                  </template>
                </menu-item>
              </menu-main>
            </template>
          </menu-item>
        </menu-main>
      </template>
    </menu-item>
    <menu-item>
      <template #icon>
        <icon-logout></icon-logout>
      </template>
      <template #title> 退出 </template>
    </menu-item>
  </menu-main>
</template>

<script setup>
import menuMain from "./menu.vue";
import menuItem from "./menuItem.vue";
import {
  showWorkspace,
  showBaseModelSelect,
  showDecalControl,
  showFontModal,
  showHeader,
  showSubHeader,
  showLeftMenu,
  showBottomMenu,
  showDecalList,
  showModelInfo,
} from "../../store";
import iconLogout from "@/icon/logout.svg?component";
import iconNew from "@/icon/new.svg?component";
import iconView from "@/icon/view.svg?component";
import iconUpload from "@/icon/upload-normal.svg?component";
import iconScreenshot from "@/icon/screenshot.svg?component";
import iconJump from "@/icon/jump.svg?component";
import { Switch } from "@/components/ui/switch";
</script>

<style></style>
