<template>
  <div class="img-container" ref="imageRef">
    <img
      ref="elImageRef"
      class="el-img"
      v-bind="$attrs"
      :style="{ objectFit: fit || 'contain', width: '100%', height: '100%', padding }"
      :loading="lazy ? 'lazy' : undefined"
      @load="load($event)"
      alt=""
    />

    <!-- 显示图片尺寸信息 -->
    <div v-if="showSize && imageSize.width && imageSize.height" class="size-info">
      {{ imageSize.width }} × {{ imageSize.height }}
    </div>

    <div class="slot" v-if="$slots.default">
      <slot></slot>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, computed, nextTick } from "vue";
import { Image as Picture, FolderOpen as FolderOpened, Search, SlidersHorizontal as Operation } from "lucide-vue-next";

const emits = defineEmits(["load"]);

const elImageRef = ref();

const imageRef = ref();

// 图片尺寸信息
const imageSize = ref({
  width: 0,
  height: 0,
});

const props = defineProps({
  // 是否可拖拽
  padding: {
    default: "0",
  },
  meta: {
    default: {},
  },
  fit: {
    default: "contain",
  },
  lazy: {
    default: false,
  },
  hideloading: {
    default: false,
  },
  // 是否显示图片尺寸信息
  showSize: {
    default: false,
  },
});

/*
 初始化可拖拽
*/

function load(e) {
  e.target.meta = props.meta;
  
  // 获取图片的 naturalWidth 和 naturalHeight
  if (props.showSize) {
    const img = e.target;
    if (img.complete) {
      imageSize.value = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
    }
  }
  
  emits("load", e.target, props.meta);
}

defineExpose({
  getNaturalSize() {
    // 获取（兼容原 el-image 组件实例与原生 img 元素）
    const refVal = elImageRef.value;
    let el = refVal?.$el?.querySelector?.("img") || refVal;

    if (!el || !el.complete) {
      return console.warn("img not loaded while get natural size");
    }

    return {
      width: el.naturalWidth,
      height: el.naturalHeight,
    };
  },
});
</script>
<style lang="less" scoped>
.img-container {
  width: 100%;
  height: 100%;
  position: relative;
  flex-shrink: 0;
}

.slot {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

// 图片尺寸信息样式
.size-info {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
  z-index: 10;
  pointer-events: none;
}

.el-img {
  overflow: hidden;
  width: 100%;
  height: 100%;
  transition: all 0.3s;
  display: block;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
}

@keyframes rolling {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
