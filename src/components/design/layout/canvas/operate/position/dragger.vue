<template>
  <div
    :style="{
      width: containerWidth * scale + 'px',
      height: containerHeight * scale + 'px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }"
  >
    <div
      class="target-container"
      ref="targetContainerRef"
      :style="{
        width: containerWidth + 'px',
        height: containerHeight + 'px',
        transform: `scale(${scale})`,
        flexShrink: 0,
        ...createPngBackgroundStyle(scale, 5),
      }"
    >
      <div
        class="target"
        ref="targetRef"
        :style="{
          width: targetWidth + 'px',
          height: targetHeight + 'px',
          left: position.x + 'px',
          top: position.y + 'px',
          cursor: isDragging ? 'grabbing' : 'grab',
          fontSize: Math.min(targetWidth, targetHeight) / 4 + 'px',
        }"
        @mousedown="startDrag"
      ></div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { ref, onMounted, onUnmounted } from "vue";
import { createPngBackgroundStyle } from "@/components/design/layout/canvas/children/canvas.tsx";

const model = defineModel({
  default: {
    x: 0,
    y: 0,
  },
});

/*
    拖拽相当于设置元素的 top 和 left
    组件中始终使用 px 像素 ，在外部在同步到画布像素
*/

const props = defineProps({
  scale: {
    default: 1,
  },
  containerWidth: {
    default: 0,
  },
  containerHeight: {
    default: 0,
  },
  targetWidth: {
    default: 0,
  },
  targetHeight: {
    default: 0,
  },
});

defineExpose({
  reset() {
    position.value = {
      x: 0,
      y: 0,
    };
    emits("drag", position.value);
  },
});

const emits = defineEmits(["drag", "init"]);

const targetContainerRef = ref(null);
const targetRef = ref(null);

const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const startPosition = ref({ x: 0, y: 0 });

const startDrag = (e) => {
  isDragging.value = true;
  const rect = targetContainerRef.value.getBoundingClientRect();
  startPosition.value = {
    x: (e.clientX - rect.left) / props.scale - position.value.x,
    y: (e.clientY - rect.top) / props.scale - position.value.y,
  };
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", stopDrag);
};

const drag = (e) => {
  if (!isDragging.value) return;

  const rect = targetContainerRef.value.getBoundingClientRect();
  let newX = (e.clientX - rect.left) / props.scale - startPosition.value.x;
  let newY = (e.clientY - rect.top) / props.scale - startPosition.value.y;

  // 确保小div不会超出大div的边界 , 暂时先不作限制 ，会出现 子元素大于父元素的情况
  // newX = Math.max(0, Math.min(newX, props.containerWidth - props.targetWidth));
  // newY = Math.max(0, Math.min(newY, props.containerHeight - props.targetHeight));

  position.value = { x: newX, y: newY };
  emits("drag", position.value);
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener("mousemove", drag);
  document.removeEventListener("mouseup", stopDrag);
};

onMounted(() => {
  // 可以在这里添加额外的初始化逻辑
  console.log("init dragger");
  emits("init");
});

onUnmounted(() => {
  document.removeEventListener("mousemove", drag);
  document.removeEventListener("mouseup", stopDrag);
});
</script>

<style scoped>
.target-container {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  transform-origin: center center;
}

.target {
  position: absolute;
  background-color: color-mix(in srgb, var(--1s-accent-color) 35%, transparent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}
</style>
