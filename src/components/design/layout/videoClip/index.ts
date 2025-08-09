import { ref, computed } from "vue";
import { currentModelController, currentEditingModelId } from "../../store";
import { isEdit, currentEditingModelInfo } from '../../store';
import gsap from "gsap";
import { FrontSide } from "three";
import { message } from "ant-design-vue";
import { uploadToCOS, createDraft } from "@/api";

export const modelControllerViewSetterOptions = ref([
    {
        name:'正视图',
        handle(){
            currentModelController.value.cameraController.setFrontView() 
        }
    }
])

export const isRecordingEnabled = ref(false);

const isAnimating = ref(false);

// 检查是否正在执行动画
export const isAnimationRunning = computed(() => isAnimating.value);

// 开始动画
const startAnimation = () => {
    isAnimating.value = true;
};

// 结束动画
const endAnimation = () => {
    isAnimating.value = false;
};

// 停止所有动画
export const stopAllAnimations = () => {
    gsap.killTweensOf("*"); // 停止所有GSAP动画
    endAnimation();
};

// 处理录制结束后的视频保存
const handleRecordedVideo = async (blob: Blob, animationName?: string) => {
  try {
    // 创建文件对象，文件名包含动画名称
    const timestamp = new Date().getTime();
    const animationSuffix = animationName ? `_${animationName}` : '';
    const fileName = `录制视频${animationSuffix}_${timestamp}.webm`;
    const file = new File([blob], fileName, { type: 'video/webm' });
    
    // 上传到 COS
    const cos = await uploadToCOS({ file });
    
    // 保存到草稿箱，名称也包含动画信息
    const draftName = animationName ? `模型录制视频_${animationName}` : '模型录制视频';
    await createDraft({
      url: cos.url,
      name: draftName,
      type: 'video',
      suffix: 'webm',
      updateTime: new Date(),
      ...(isEdit.value && currentEditingModelId.value ? { customModelId: currentEditingModelId.value } : {})
    });
    
    message.success('视频已保存到草稿箱');
  } catch (err) {
    message.error('保存视频失败');
    console.error(err);
  }
};

function startRecord(animationName?: string) {
    if (!isRecordingEnabled.value) {
        return;
    }

    currentModelController.value.startMediaRecord({
        onStop: (blob) => handleRecordedVideo(blob, animationName)
    });
}

function stopRecord() {
    if (!isRecordingEnabled.value) {
        return;
    }
    currentModelController.value.stopMediaRecord();
}

export const animations = [
    {
        title: "静止动画",
        handle() {
            if (isRecordingEnabled.value) {
                startRecord("静止动画");
            }
            startAnimation();
            
            // 1秒后结束动画和录制
            setTimeout(() => {
                if (isRecordingEnabled.value) {
                    stopRecord();
                }
                endAnimation();
            }, 1000);
        },
    },
    {
        title: "拉远再拉近",
        handle() {
            if (isRecordingEnabled.value) {
                startRecord("拉远再拉近");
            }
            startAnimation();
            let camera = currentModelController.value.camera;
            const originalPosition = camera.position.clone();
            
            gsap.to(camera.position, {
                x: 5 * Math.cos(Math.PI / 4), // 初始位置
                z: 5 * Math.sin(Math.PI / 4),
                duration: 1,
                ease: "none",
                repeat: 1,
                yoyo: true,
                onComplete: () => {
                    // 恢复相机原始位置
                    camera.position.copy(originalPosition);
                    if (isRecordingEnabled.value) {
                        stopRecord();
                    }
                    endAnimation();
                },
            });
        },
    },
    {
        title: "淡入",
        async handle() {
            if (isRecordingEnabled.value) {
                startRecord("淡入");
            }
            startAnimation();
            await fadeInScene(currentModelController.value.scene, 4);
            if (isRecordingEnabled.value) {
                stopRecord();
            }
            endAnimation();
        },
    },
    {
        title: "摇晃",
        async handle() {
            if (isRecordingEnabled.value) {
                startRecord("摇晃");
            }
            startAnimation();
            
            // 获取场景中所有需要摇晃的对象
            const allObjects = [];
            const originalRotations = [];
            currentModelController.value.scene.traverse((object) => {
                if (object && 'isMesh' in object && object.isMesh) {
                    allObjects.push(object);
                    originalRotations.push(object.rotation.clone());
                }
            });

            // 为所有对象创建同步的摇晃动画
            const shakePromises = allObjects.map((obj, index) => {
                return new Promise<void>((resolve) => {
                    gsap.to(obj.rotation, {
                        duration: 2,
                        y: `+=${1}`, // 向右摇晃
                        yoyo: true, // 动画反向播放
                        repeat: 3, // 重复3次
                        ease: "sine.inOut", // 缓动效果
                        onComplete: () => {
                            // 恢复原始旋转
                            obj.rotation.copy(originalRotations[index]);
                            resolve();
                        }
                    });
                });
            });

            // 等待所有摇晃动画完成
            await Promise.all(shakePromises);
            
            if (isRecordingEnabled.value) {
                stopRecord();
            }
            endAnimation();
        },
    },
    {
        title: "360度旋转展示",
        async handle() {
            if (isRecordingEnabled.value) {
                startRecord("360度旋转展示");
            }
            startAnimation();
            
            const camera = currentModelController.value.camera;
            const target = currentModelController.value.mesh.position;
            const originalPosition = camera.position.clone();
            
            // 相机围绕模型进行360度旋转
            gsap.to(camera.position, {
                duration: 6,
                x: target.x + 3 * Math.cos(Math.PI * 2),
                z: target.z + 3 * Math.sin(Math.PI * 2),
                ease: "power2.inOut",
                onComplete: () => {
                    // 恢复相机原始位置
                    camera.position.copy(originalPosition);
                    if (isRecordingEnabled.value) {
                        stopRecord();
                    }
                    endAnimation();
                }
            });
        },
    },
    {
        title: "缩放展示",
        async handle() {
            if (isRecordingEnabled.value) {
                startRecord("缩放展示");
            }
            startAnimation();
            
            const camera = currentModelController.value.camera;
            const target = currentModelController.value.mesh.position;
            const originalPosition = camera.position.clone();
            
            // 相机从远到近，再从近到远
            gsap.to(camera.position, {
                duration: 4,
                x: target.x + 0.5,
                y: target.y + 0.5,
                z: target.z + 0.5,
                ease: "power2.inOut",
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    // 恢复相机原始位置
                    camera.position.copy(originalPosition);
                    if (isRecordingEnabled.value) {
                        stopRecord();
                    }
                    endAnimation();
                }
            });
        },
    },
    {
        title: "上下浮动",
        async handle() {
            if (isRecordingEnabled.value) {
                startRecord("上下浮动");
            }
            startAnimation();
            
            const allObjects = [];
            const originalPositions = [];
            currentModelController.value.scene.traverse((object) => {
                if (object && 'isMesh' in object && object.isMesh) {
                    allObjects.push(object);
                    originalPositions.push(object.position.clone());
                }
            });

            // 所有对象一起上下浮动
            const floatPromises = allObjects.map((obj, index) => {
                return new Promise<void>((resolve) => {
                    const originalY = obj.position.y;
                    gsap.to(obj.position, {
                        duration: 2,
                        y: originalY + 0.3,
                        ease: "sine.inOut",
                        yoyo: true,
                        repeat: 2,
                        onComplete: () => {
                            // 恢复原始位置
                            obj.position.copy(originalPositions[index]);
                            resolve();
                        }
                    });
                });
            });

            await Promise.all(floatPromises);
            
            if (isRecordingEnabled.value) {
                stopRecord();
            }
            endAnimation();
        },
    },
    {
        title: "螺旋上升",
        async handle() {
            if (isRecordingEnabled.value) {
                startRecord("螺旋上升");
            }
            startAnimation();
            
            const camera = currentModelController.value.camera;
            const target = currentModelController.value.mesh.position;
            const originalPosition = camera.position.clone();
            
            // 相机螺旋上升展示
            gsap.to(camera.position, {
                duration: 5,
                x: target.x + 2 * Math.cos(Math.PI * 3),
                y: target.y + 2,
                z: target.z + 2 * Math.sin(Math.PI * 3),
                ease: "power2.inOut",
                onComplete: () => {
                    // 恢复相机原始位置
                    camera.position.copy(originalPosition);
                    if (isRecordingEnabled.value) {
                        stopRecord();
                    }
                    endAnimation();
                }
            });
        },
    },
    {
        title: "细节特写",
        async handle() {
            if (isRecordingEnabled.value) {
                startRecord("细节特写");
            }
            startAnimation();
            
            const camera = currentModelController.value.camera;
            const target = currentModelController.value.mesh.position;
            const originalPosition = camera.position.clone();
            
            // 相机移动到不同角度进行细节特写
            const positions = [
                { x: target.x + 1, y: target.y + 0.5, z: target.z },
                { x: target.x, y: target.y + 1, z: target.z + 1 },
                { x: target.x - 1, y: target.y + 0.5, z: target.z },
                { x: target.x, y: target.y - 0.5, z: target.z - 1 }
            ];
            
            let currentIndex = 0;
            
            const moveToNextPosition = () => {
                if (currentIndex < positions.length) {
                    gsap.to(camera.position, {
                        duration: 1.5,
                        ...positions[currentIndex],
                        ease: "power2.inOut",
                        onComplete: () => {
                            currentIndex++;
                            if (currentIndex < positions.length) {
                                moveToNextPosition();
                            } else {
                                // 恢复相机原始位置
                                camera.position.copy(originalPosition);
                                if (isRecordingEnabled.value) {
                                    stopRecord();
                                }
                                endAnimation();
                            }
                        }
                    });
                }
            };
            
            moveToNextPosition();
        },
    },
];

/**
 *  @method 模型淡入效果
 * */
async function fadeInScene(scene, duration) {
    const fadePromises = []; // 存储所有淡入动画的 Promise

    // 遍历场景中的所有对象
    scene.traverse((object) => {
        if (object.isMesh) {
            // 确保材质支持透明度并设置为只渲染正面
            object.material.transparent = true;
            object.material.opacity = 0; // 初始为完全透明

            // 创建一个 Promise 来处理淡入动画
            const fadePromise = new Promise((resolve) => {
                gsap.to(object.material, {
                    duration: duration,
                    opacity: 1, // 最终透明度为1（完全不透明）
                    onStart: () => {
                        object.material.transparent = true; // 开始时启用透明
                    },
                    onComplete: resolve // 动画完成时解析 Promise
                });
            });

            fadePromises.push(fadePromise); // 将 Promise 添加到数组中
        }

        // 处理 DecalGeometry（如果有的话）
        if (object.isMesh && object.geometry.type === 'DecalGeometry') {
            object.material.transparent = true;
            object.material.opacity = 0;

            const fadePromise = new Promise((resolve) => {
                gsap.to(object.material, {
                    duration: duration,
                    opacity: 1,
                    onStart: () => {
                        object.material.transparent = true;
                    },
                    onComplete: resolve // 动画完成时解析 Promise
                });
            });

            fadePromises.push(fadePromise); // 将 Promise 添加到数组中
        }
    });

    // 等待所有淡入动画完成
    await Promise.all(fadePromises);
}

// 重新导出从 store 导入的变量
export { isEdit, currentEditingModelInfo };






