import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { canvasStickerOptionsOnlyChild, updateRenderingCanvas } from '../../index.tsx'
import {
    createBasicDefaultOptions,
    createFilterDefaultOptions,
    createPositionDefaultOptions,
    createTransformDefaultOptions,
} from '../defaultOptions.tsx'
import {
    createFilterFromOptions,
    createTransformString,
    formatSizeOptionToPixelValue,
    formatToNativeSizeString,
    getPositionInfoFromOptions,
} from '../../helper.tsx'
import { onBeforeReturnRender, onCanvasChildSetup, useCanvasChildSlotSize } from '../commonHooks.ts'

type Vec3Array = [number, number, number]

type ThreeVector3Config = {
    x?: number
    y?: number
    z?: number
}

type ThreeCameraConfig = {
    id: string
    type: 'perspective'
    name?: string
    fov: number
    near: number
    far: number
    position: Vec3Array
    lookAt: Vec3Array
}

type ThreeMaterialConfig = {
    type?: 'meshStandard' | 'meshBasic' | 'meshPhysical'
    color?: string
    metalness?: number
    roughness?: number
    opacity?: number
    transparent?: boolean
    wireframe?: boolean
    side?: 'front' | 'back' | 'double'
}

type ThreeObjectConfig = {
    id: string
    kind: 'primitive' | 'model' | 'custom'
    visible?: boolean
    transform?: {
        position?: Vec3Array
        rotation?: Vec3Array
        scale?: Vec3Array
    }
    primitive?: {
        geometry?: 'box' | 'sphere' | 'plane' | 'torus' | 'cone' | 'cylinder'
        material?: ThreeMaterialConfig
    }
    model?: {
        resourceId?: string
        url?: string
        format?: 'glb' | 'gltf'
    }
    animation?: {
        autoRotate?: boolean
        speed?: Vec3Array
    }
}

type ThreejsEngineConfig = {
    schemaVersion: 1
    preset?: 'empty' | 'debugCube'
    renderer: {
        alpha: boolean
        antialias: boolean
        preserveDrawingBuffer: boolean
        pixelRatio: number
        toneMapping: 'none' | 'aces'
        toneMappingExposure: number
    }
    scene: {
        background: {
            type: 'transparent' | 'color'
            value: string
        }
        camera: {
            type: 'perspective'
            fov: number
            near: number
            far: number
            position: Vec3Array
            lookAt: Vec3Array
        }
        activeCameraId?: string
        cameras?: ThreeCameraConfig[]
        lights: Array<{
            id: string
            type: 'ambient' | 'directional' | 'point'
            name?: string
            color: string
            intensity: number
            position?: Vec3Array
        }>
        objects: ThreeObjectConfig[]
        animation: {
            enabled: boolean
        }
        interaction: {
            dragToRotate: {
                enabled: boolean
                sensitivity: number
            }
        }
    }
    resources: {
        models: Array<{
            id: string
            url: string
            format: 'glb' | 'gltf'
        }>
        textures: any[]
        hdris: any[]
        materials: any[]
    }
    export: {
        mode: 'snapshot'
        transparent: boolean
        frame: number
    }
}

const DEFAULT_DEBUG_OBJECT: ThreeObjectConfig = {
    id: 'debug-cube',
    kind: 'primitive',
    visible: true,
    transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
    },
    primitive: {
        geometry: 'box',
        material: {
            type: 'meshStandard',
            color: '#4f46e5',
            metalness: 0.25,
            roughness: 0.35,
            wireframe: false,
        },
    },
    animation: {
        autoRotate: true,
        speed: [0.01, 0.02, 0],
    },
}

export function createDefaultThreejsCamera(): ThreeCameraConfig {
    return {
        id: 'camera-main',
        type: 'perspective',
        name: '主相机',
        fov: 45,
        near: 0.1,
        far: 1000,
        position: [0, 0, 3.5],
        lookAt: [0, 0, 0],
    }
}

export const createDefaultThreejsEngineOptions = (): ThreejsEngineConfig => {
    const mainCamera = createDefaultThreejsCamera()
    return {
        schemaVersion: 1,
        preset: 'empty',
        renderer: {
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: true,
            pixelRatio: 1,
            toneMapping: 'aces',
            toneMappingExposure: 1,
        },
        scene: {
            background: {
                type: 'transparent',
                value: '#ffffff',
            },
            camera: {
                ...mainCamera,
            },
            activeCameraId: mainCamera.id,
            cameras: [mainCamera],
            lights: [
                {
                    id: 'ambient-main',
                    type: 'ambient',
                    name: '环境光',
                    color: '#ffffff',
                    intensity: 0.9,
                },
                {
                    id: 'directional-main',
                    type: 'directional',
                    name: '方向光',
                    color: '#ffffff',
                    intensity: 1.1,
                    position: [2, 2, 3],
                },
            ],
            objects: [],
            animation: {
                enabled: true,
            },
            interaction: {
                dragToRotate: {
                    enabled: true,
                    sensitivity: 0.008,
                },
            },
        },
        resources: {
            models: [],
            textures: [],
            hdris: [],
            materials: [],
        },
        export: {
            mode: 'snapshot',
            transparent: true,
            frame: 0,
        },
    }
}

export function createDebugCubeObject(): ThreeObjectConfig {
    return JSON.parse(JSON.stringify(DEFAULT_DEBUG_OBJECT))
}

export function normalizeThreejsEngineOptions(rawOptions: any): ThreejsEngineConfig {
    const defaults = createDefaultThreejsEngineOptions()
    const raw = rawOptions || {}

    if (raw.schemaVersion === 1) {
        const camera = { ...defaults.scene.camera, ...(raw.scene?.camera || {}) }
        const cameras = Array.isArray(raw.scene?.cameras) && raw.scene.cameras.length
            ? raw.scene.cameras
            : [{ ...camera, id: camera.id || 'camera-main', name: camera.name || '主相机' }]
        return {
            ...defaults,
            ...raw,
            renderer: { ...defaults.renderer, ...(raw.renderer || {}) },
            scene: {
                ...defaults.scene,
                ...(raw.scene || {}),
                background: { ...defaults.scene.background, ...(raw.scene?.background || {}) },
                camera,
                activeCameraId: raw.scene?.activeCameraId || cameras[0]?.id || 'camera-main',
                cameras,
                lights: Array.isArray(raw.scene?.lights) ? raw.scene.lights : defaults.scene.lights,
                objects: Array.isArray(raw.scene?.objects) ? raw.scene.objects : [],
                animation: { ...defaults.scene.animation, ...(raw.scene?.animation || {}) },
                interaction: {
                    ...defaults.scene.interaction,
                    ...(raw.scene?.interaction || {}),
                    dragToRotate: {
                        ...defaults.scene.interaction.dragToRotate,
                        ...(raw.scene?.interaction?.dragToRotate || {}),
                    },
                },
            },
            resources: {
                ...defaults.resources,
                ...(raw.resources || {}),
                models: Array.isArray(raw.resources?.models) ? raw.resources.models : [],
            },
            export: { ...defaults.export, ...(raw.export || {}) },
        }
    }

    const migrated = normalizeLegacyThreejsOptions(raw, defaults)
    return migrated
}

function normalizeLegacyThreejsOptions(raw: any, defaults: ThreejsEngineConfig): ThreejsEngineConfig {
    const object = raw?.object || {}
    const legacyObject = createDebugCubeObject()
    legacyObject.primitive = {
        geometry: object.shape || 'box',
        material: {
            type: 'meshStandard',
            color: object.color || '#4f46e5',
            metalness: Number(object.metalness ?? 0.25),
            roughness: Number(object.roughness ?? 0.35),
            wireframe: !!object.wireframe,
        },
    }
    legacyObject.transform = {
        position: [0, 0, 0],
        rotation: toVec3Array(object.rotation, [0, 0, 0]),
        scale: toVec3Array(object.scale, [1, 1, 1]),
    }
    legacyObject.animation = {
        autoRotate: !!raw?.animation?.autoRotate,
        speed: [
            Number(raw?.animation?.speedX || 0),
            Number(raw?.animation?.speedY || 0),
            Number(raw?.animation?.speedZ || 0),
        ],
    }

    return {
        ...defaults,
        preset: 'debugCube',
        scene: {
            ...defaults.scene,
            background: {
                type: raw?.background === 'transparent' ? 'transparent' : 'color',
                value: raw?.background === 'transparent' ? '#ffffff' : raw?.background || '#ffffff',
            },
            camera: {
                ...defaults.scene.camera,
                fov: Number(raw?.camera?.fov || defaults.scene.camera.fov),
                near: Number(raw?.camera?.near || defaults.scene.camera.near),
                far: Number(raw?.camera?.far || defaults.scene.camera.far),
                position: toVec3Array(raw?.camera?.position, defaults.scene.camera.position),
            },
            activeCameraId: 'camera-main',
            cameras: [
                {
                    ...createDefaultThreejsCamera(),
                    fov: Number(raw?.camera?.fov || defaults.scene.camera.fov),
                    near: Number(raw?.camera?.near || defaults.scene.camera.near),
                    far: Number(raw?.camera?.far || defaults.scene.camera.far),
                    position: toVec3Array(raw?.camera?.position, defaults.scene.camera.position),
                },
            ],
            lights: [
                {
                    id: 'ambient-main',
                    type: 'ambient',
                    name: '环境光',
                    color: raw?.lights?.ambient?.color || '#ffffff',
                    intensity: Number(raw?.lights?.ambient?.intensity ?? 0.9),
                },
                {
                    id: 'directional-main',
                    type: 'directional',
                    name: '方向光',
                    color: raw?.lights?.directional?.color || '#ffffff',
                    intensity: Number(raw?.lights?.directional?.intensity ?? 1.1),
                    position: toVec3Array(raw?.lights?.directional?.position, [2, 2, 3]),
                },
            ],
            objects: [legacyObject],
            animation: {
                enabled: true,
            },
            interaction: defaults.scene.interaction,
        },
    }
}

export const createDefaultCanvasChildThreeSceneOptions = () => {
    const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit

    return {
        type: 'threeScene',
        width: {
            value: 100,
            unit: 'vw',
        },
        height: {
            value: 100,
            unit: 'vh',
        },
        position: createPositionDefaultOptions(canvasUnit),
        filter: createFilterDefaultOptions(canvasUnit),
        zIndex: 0,
        ...createBasicDefaultOptions(),
        transform: createTransformDefaultOptions(canvasUnit),
        threeScene: {
            version: 1,
            engine: 'threejs',
            engines: {
                threejs: createDefaultThreejsEngineOptions(),
            },
        },
    }
}

export function createCanvasChildThreeScene(options) {
    return <ThreeSceneChild options={options} onVnodeUpdated={updateRenderingCanvas} onVnodeMounted={updateRenderingCanvas}></ThreeSceneChild>
}

export const ThreeSceneChild = defineComponent({
    props: {
        options: null,
    },
    setup(props) {
        const canvasRef = ref<HTMLCanvasElement>()
        const isModelLoading = ref(false)
        const modelLoadingText = ref('模型加载中...')
        const modelLoadError = ref('')
        const gltfLoader = new GLTFLoader()
        const raycaster = new THREE.Raycaster()
        const pointerNdc = new THREE.Vector2()

        let renderer: THREE.WebGLRenderer | null = null
        let scene: THREE.Scene | null = null
        let camera: THREE.PerspectiveCamera | null = null
        let animationFrameId: number | null = null
        let sceneObjectGroup: THREE.Group | null = null
        let lightGroup: THREE.Group | null = null
        let objectBuildToken = 0
        let skipNextOptionsRefresh = false
        let dragState: {
            active: boolean
            pointerId: number
            lastX: number
            lastY: number
            object: THREE.Object3D | null
            objectConfig: ThreeObjectConfig | null
        } = {
            active: false,
            pointerId: -1,
            lastX: 0,
            lastY: 0,
            object: null,
            objectConfig: null,
        }

        onCanvasChildSetup({
            targetEl: canvasRef,
            options: props.options,
            props,
        })

        const { slotSize: canvasPixelSize } = useCanvasChildSlotSize(canvasRef, props.options, () => {
            refresh()
        })

        function getEngineOptions() {
            return normalizeThreejsEngineOptions(props.options?.threeScene?.engines?.threejs)
        }

        function ensureRenderer(config: ThreejsEngineConfig) {
            const canvas = canvasRef.value
            if (!canvas) {
                return
            }

            if (!renderer) {
                renderer = new THREE.WebGLRenderer({
                    canvas,
                    antialias: config.renderer.antialias !== false,
                    alpha: config.renderer.alpha !== false,
                    preserveDrawingBuffer: config.renderer.preserveDrawingBuffer !== false,
                })
            }

            if (!scene) {
                scene = new THREE.Scene()
            }

            if (!camera) {
                camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
            }

            if (!sceneObjectGroup) {
                sceneObjectGroup = new THREE.Group()
                scene.add(sceneObjectGroup)
            }

            if (!lightGroup) {
                lightGroup = new THREE.Group()
                scene.add(lightGroup)
            }
        }

        function getCappedWebGLSize() {
            const rawW = Math.max(1, canvasPixelSize.value.width)
            const rawH = Math.max(1, canvasPixelSize.value.height)
            const maxDim = Math.max(rawW, rawH)
            const scale = maxDim > 1024 ? 1024 / maxDim : 1
            return {
                width: Math.max(1, Math.round(rawW * scale)),
                height: Math.max(1, Math.round(rawH * scale)),
            }
        }

        function applyRendererOptions(config: ThreejsEngineConfig) {
            if (!renderer) {
                return
            }

            const { width, height } = getCappedWebGLSize()
            const pixelRatio = Math.max(0.5, Math.min(2, Number(config.renderer.pixelRatio || 1)))
            renderer.setPixelRatio(pixelRatio)
            renderer.setSize(width, height, false)
            renderer.toneMapping = config.renderer.toneMapping === 'aces' ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping
            renderer.toneMappingExposure = Number(config.renderer.toneMappingExposure || 1)
        }

        function applyCamera(config: ThreejsEngineConfig) {
            if (!camera) {
                return
            }

            const { width, height } = canvasPixelSize.value
            const cameraConfig = resolveActiveCamera(config)
            camera.aspect = width / height
            camera.fov = Number(cameraConfig.fov) || 45
            camera.near = Number(cameraConfig.near) || 0.1
            camera.far = Number(cameraConfig.far) || 1000
            const position = toVec3Array(cameraConfig.position, [0, 0, 3.5])
            const lookAt = toVec3Array(cameraConfig.lookAt, [0, 0, 0])
            camera.position.set(...position)
            camera.lookAt(new THREE.Vector3(...lookAt))
            camera.updateProjectionMatrix()
        }

        function resolveActiveCamera(config: ThreejsEngineConfig): ThreeCameraConfig {
            const cameras = Array.isArray(config.scene.cameras) ? config.scene.cameras : []
            return cameras.find((item) => item.id === config.scene.activeCameraId) || cameras[0] || {
                ...createDefaultThreejsCamera(),
                ...config.scene.camera,
            }
        }

        function applyBackground(config: ThreejsEngineConfig) {
            if (!renderer || !scene) {
                return
            }

            const background = config.scene.background
            if (background.type === 'transparent') {
                renderer.setClearColor(0x000000, 0)
                scene.background = null
                return
            }

            const color = background.value || '#ffffff'
            renderer.setClearColor(color, 1)
            scene.background = new THREE.Color(color)
        }

        function applyLights(config: ThreejsEngineConfig) {
            if (!lightGroup) {
                return
            }
            clearObject3D(lightGroup)

            for (const lightConfig of config.scene.lights || []) {
                let light: THREE.Light | null = null
                if (lightConfig.type === 'ambient') {
                    light = new THREE.AmbientLight(lightConfig.color || '#ffffff', Number(lightConfig.intensity ?? 1))
                } else if (lightConfig.type === 'directional') {
                    light = new THREE.DirectionalLight(lightConfig.color || '#ffffff', Number(lightConfig.intensity ?? 1))
                } else if (lightConfig.type === 'point') {
                    light = new THREE.PointLight(lightConfig.color || '#ffffff', Number(lightConfig.intensity ?? 1))
                }

                if (!light) {
                    continue
                }

                if (lightConfig.position) {
                    light.position.set(...toVec3Array(lightConfig.position, [0, 0, 0]))
                }
                light.name = lightConfig.id || lightConfig.type
                lightGroup.add(light)
            }
        }

        async function rebuildObjects(config: ThreejsEngineConfig) {
            if (!sceneObjectGroup) {
                return
            }

            const token = ++objectBuildToken
            clearObject3D(sceneObjectGroup)

            const objects = resolveRenderableObjects(config)
            const hasModel = objects.some((item) => item.visible !== false && item.kind === 'model' && resolveModelUrl(item, config))
            isModelLoading.value = hasModel
            modelLoadingText.value = hasModel ? '正在准备模型文件...' : ''
            modelLoadError.value = ''

            try {
                for (const objectConfig of objects) {
                    if (token !== objectBuildToken) {
                        return
                    }
                    if (objectConfig.visible === false) {
                        continue
                    }

                    const object3d = await createObject3DFromConfig(objectConfig, config)
                    if (!object3d || token !== objectBuildToken) {
                        disposeObject3D(object3d)
                        return
                    }
                    object3d.name = objectConfig.id
                    applyTransform(object3d, objectConfig.transform)
                    object3d.userData.threeSceneObjectConfig = objectConfig
                    sceneObjectGroup.add(object3d)
                }
            } finally {
                if (token === objectBuildToken) {
                    isModelLoading.value = false
                }
            }

            renderSnapshot()
        }

        function resolveRenderableObjects(config: ThreejsEngineConfig) {
            if (Array.isArray(config.scene.objects) && config.scene.objects.length) {
                return config.scene.objects
            }
            return []
        }

        async function createObject3DFromConfig(objectConfig: ThreeObjectConfig, config: ThreejsEngineConfig) {
            if (objectConfig.kind === 'model') {
                return loadModelObject(objectConfig, config)
            }

            if (objectConfig.kind === 'primitive') {
                const geometry = createGeometryByType(objectConfig.primitive?.geometry || 'box')
                const material = createMaterial(objectConfig.primitive?.material || {})
                return new THREE.Mesh(geometry, material)
            }

            // 兼容 componentConfigSchema 简洁几何体配置：{ type: 'boxGeometry' | 'box' | 'sphere' | ..., color, scale, position, rotation }
            const raw: any = objectConfig
            const rawType = String(raw?.type || raw?.geometry || '').toLowerCase()
            if (rawType) {
                const geoMap: Record<string, string> = {
                    boxgeometry: 'box',
                    box: 'box',
                    spheregeometry: 'sphere',
                    sphere: 'sphere',
                    torusgeometry: 'torus',
                    torus: 'torus',
                    planegeometry: 'plane',
                    plane: 'plane',
                    conegeometry: 'cone',
                    cone: 'cone',
                    cylindergeometry: 'cylinder',
                    cylinder: 'cylinder',
                }
                const geometry = createGeometryByType(geoMap[rawType] || 'box')
                const material = createMaterial({
                    type: 'meshStandard',
                    color: raw.color || '#4f46e5',
                    metalness: raw.metalness ?? 0.25,
                    roughness: raw.roughness ?? 0.35,
                    wireframe: Boolean(raw.wireframe),
                })
                const mesh = new THREE.Mesh(geometry, material)
                if (!objectConfig.transform) {
                    applyTransform(mesh, {
                        position: raw.position,
                        rotation: raw.rotation,
                        scale: raw.scale,
                    })
                }
                return mesh
            }

            return null
        }

        function loadModelObject(objectConfig: ThreeObjectConfig, config: ThreejsEngineConfig): Promise<THREE.Object3D | null> {
            const url = resolveModelUrl(objectConfig, config)
            if (!url) {
                return Promise.resolve(null)
            }

            modelLoadingText.value = `正在加载模型文件 0%`
            return new Promise((resolve) => {
                gltfLoader.load(
                    url,
                    (gltf) => {
                        modelLoadingText.value = '模型文件加载完成，正在渲染...'
                        resolve(gltf.scene)
                    },
                    (event) => {
                        if (event.total > 0) {
                            const percent = Math.min(100, Math.round((event.loaded / event.total) * 100))
                            modelLoadingText.value = `正在加载模型文件 ${percent}%`
                        } else if (event.loaded > 0) {
                            modelLoadingText.value = '正在加载模型文件...'
                        }
                    },
                    (error) => {
                        console.warn('Three.js model loading failed:', error)
                        modelLoadError.value = '模型文件加载失败'
                        resolve(null)
                    },
                )
            })
        }

        function createGeometryByType(type: string) {
            switch (type) {
                case 'sphere':
                    return new THREE.SphereGeometry(0.85, 48, 48)
                case 'torus':
                    return new THREE.TorusGeometry(0.62, 0.24, 24, 80)
                case 'plane':
                    return new THREE.PlaneGeometry(1.8, 1.8)
                case 'cone':
                    return new THREE.ConeGeometry(0.8, 1.4, 48)
                case 'cylinder':
                    return new THREE.CylinderGeometry(0.72, 0.72, 1.35, 48)
                case 'box':
                default:
                    return new THREE.BoxGeometry(1.35, 1.35, 1.35, 2, 2, 2)
            }
        }

        function createMaterial(config: ThreeMaterialConfig) {
            const materialConfig: any = {
                color: config.color || '#4f46e5',
                opacity: Number(config.opacity ?? 1),
                transparent: !!config.transparent || Number(config.opacity ?? 1) < 1,
                wireframe: !!config.wireframe,
                side: getMaterialSide(config.side),
            }

            if (config.type === 'meshBasic') {
                return new THREE.MeshBasicMaterial(materialConfig)
            }

            return new THREE.MeshStandardMaterial({
                ...materialConfig,
                metalness: Math.max(0, Math.min(1, Number(config.metalness ?? 0))),
                roughness: Math.max(0, Math.min(1, Number(config.roughness ?? 0.5))),
            })
        }

        const renderSnapshot = useDebounceFn(() => {
            if (!renderer || !scene || !camera) {
                return
            }
            renderer.render(scene, camera)
            updateRenderingCanvas()
        }, 50)

        async function applySceneOptions() {
            const config = getEngineOptions()
            ensureRenderer(config)
            if (!renderer || !scene || !camera) {
                return
            }

            applyRendererOptions(config)
            applyCamera(config)
            applyBackground(config)
            applyLights(config)
            await rebuildObjects(config)
            renderSnapshot()
        }

        function stopAnimationLoop() {
            if (animationFrameId != null) {
                cancelAnimationFrame(animationFrameId)
                animationFrameId = null
            }
        }

        function hasActiveAutoRotate(config: ThreejsEngineConfig) {
            if (config.scene.animation.enabled === false || !sceneObjectGroup) {
                return false
            }
            return sceneObjectGroup.children.some((child) => {
                const objectConfig = child.userData.threeSceneObjectConfig as ThreeObjectConfig
                return Boolean(objectConfig?.animation?.autoRotate)
            })
        }

        function startAnimationLoop() {
            stopAnimationLoop()
            const initialConfig = getEngineOptions()
            // 无自动旋转对象或页面处于后台时，仅渲染单帧静态画面，避免 WebGL 空转占用 GPU 并阻塞截图
            if (renderer && scene && camera) {
                renderer.render(scene, camera)
            }
            if (typeof document !== 'undefined' && document.hidden) {
                return
            }
            if (!hasActiveAutoRotate(initialConfig)) {
                return
            }

            let lastFrameTs = 0
            const tick = (ts: number) => {
                if (typeof document !== 'undefined' && document.hidden) {
                    animationFrameId = null
                    return
                }
                if (ts - lastFrameTs >= 33) {
                    lastFrameTs = ts
                    const config = getEngineOptions()
                    if (config.scene.animation.enabled !== false && sceneObjectGroup) {
                        for (const child of sceneObjectGroup.children) {
                            const objectConfig = child.userData.threeSceneObjectConfig as ThreeObjectConfig
                            const animation = objectConfig?.animation
                            if (animation?.autoRotate) {
                                const speed = toVec3Array(animation.speed, [0, 0.01, 0])
                                child.rotation.x += speed[0]
                                child.rotation.y += speed[1]
                                child.rotation.z += speed[2]
                            }
                        }
                    }
                    if (renderer && scene && camera) {
                        renderer.render(scene, camera)
                    }
                }
                animationFrameId = requestAnimationFrame(tick)
            }
            animationFrameId = requestAnimationFrame(tick)
        }

        const handleVisibilityChange = () => {
            if (typeof document === 'undefined') return
            if (document.hidden) {
                stopAnimationLoop()
            } else {
                startAnimationLoop()
            }
        }

        function bindPointerEvents() {
            const canvas = canvasRef.value
            if (!canvas) {
                return
            }
            canvas.addEventListener('pointerdown', handlePointerDown)
            canvas.addEventListener('pointermove', handlePointerMove)
            canvas.addEventListener('pointerup', handlePointerUp)
            canvas.addEventListener('pointercancel', handlePointerUp)
            canvas.addEventListener('lostpointercapture', handlePointerUp)
        }

        function unbindPointerEvents() {
            const canvas = canvasRef.value
            if (!canvas) {
                return
            }
            canvas.removeEventListener('pointerdown', handlePointerDown)
            canvas.removeEventListener('pointermove', handlePointerMove)
            canvas.removeEventListener('pointerup', handlePointerUp)
            canvas.removeEventListener('pointercancel', handlePointerUp)
            canvas.removeEventListener('lostpointercapture', handlePointerUp)
        }

        function handlePointerDown(event: PointerEvent) {
            if (!isDragToRotateEnabled()) {
                return
            }

            const target = findPointerSceneObject(event)
            if (!target) {
                return
            }

            event.preventDefault()
            event.stopPropagation()
            
            canvasRef.value?.setPointerCapture?.(event.pointerId)
            dragState = {
                active: true,
                pointerId: event.pointerId,
                lastX: event.clientX,
                lastY: event.clientY,
                object: target.object,
                objectConfig: target.objectConfig,
            }
            if (canvasRef.value) {
                canvasRef.value.style.cursor = 'grabbing'
            }
        }

        function handlePointerMove(event: PointerEvent) {
            if (!dragState.active || dragState.pointerId !== event.pointerId || !dragState.object) {
                return
            }

            event.preventDefault()
            event.stopPropagation()
            const sensitivity = getDragRotateSensitivity()
            const deltaX = event.clientX - dragState.lastX
            const deltaY = event.clientY - dragState.lastY
            dragState.lastX = event.clientX
            dragState.lastY = event.clientY
            dragState.object.rotation.y += deltaX * sensitivity
            dragState.object.rotation.x += deltaY * sensitivity
            renderSnapshot()
        }

        function handlePointerUp(event: PointerEvent) {
            if (!dragState.active || dragState.pointerId !== event.pointerId) {
                return
            }

            event.preventDefault()
            event.stopPropagation()
            
            canvasRef.value?.releasePointerCapture?.(event.pointerId)
            if (dragState.object && dragState.objectConfig) {
                if (!dragState.objectConfig.transform) {
                    dragState.objectConfig.transform = {}
                }
                skipNextOptionsRefresh = true
                dragState.objectConfig.transform.rotation = [
                    normalizeAngle(dragState.object.rotation.x),
                    normalizeAngle(dragState.object.rotation.y),
                    normalizeAngle(dragState.object.rotation.z),
                ]
            }
            dragState = {
                active: false,
                pointerId: -1,
                lastX: 0,
                lastY: 0,
                object: null,
                objectConfig: null,
            }
            if (canvasRef.value) {
                canvasRef.value.style.cursor = isDragToRotateEnabled() ? 'grab' : ''
            }
        }

        function findPointerSceneObject(event: PointerEvent) {
            if (!sceneObjectGroup || !camera || !canvasRef.value) {
                return null
            }

            const rect = canvasRef.value.getBoundingClientRect()
            if (!rect.width || !rect.height) {
                return null
            }
            pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
            pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
            raycaster.setFromCamera(pointerNdc, camera)
            const hits = raycaster.intersectObjects(sceneObjectGroup.children, true)

            for (const hit of hits) {
                const root = findSceneObjectRoot(hit.object)
                const objectConfig = root?.userData.threeSceneObjectConfig as ThreeObjectConfig | undefined
                if (root && objectConfig) {
                    return { object: root, objectConfig }
                }
            }

            return null
        }

        function findSceneObjectRoot(object: THREE.Object3D) {
            let current: THREE.Object3D | null = object
            while (current && current.parent !== sceneObjectGroup) {
                current = current.parent
            }
            return current
        }

        function isDragToRotateEnabled() {
            const config = getEngineOptions()
            return config.scene.interaction?.dragToRotate?.enabled !== false
        }

        function getDragRotateSensitivity() {
            const config = getEngineOptions()
            return Number(config.scene.interaction?.dragToRotate?.sensitivity ?? 0.008) || 0.008
        }

        function normalizeAngle(value: number) {
            const circle = Math.PI * 2
            return ((value + Math.PI) % circle + circle) % circle - Math.PI
        }

        const refresh = useDebounceFn(async () => {
            await applySceneOptions()
            startAnimationLoop()
            if (canvasRef.value) {
                canvasRef.value.style.cursor = isDragToRotateEnabled() ? 'grab' : ''
            }
        }, 80)

        onMounted(() => {
            bindPointerEvents()
            if (typeof document !== 'undefined') {
                document.addEventListener('visibilitychange', handleVisibilityChange)
            }
            refresh()
        })
        watch(() => props.options, () => {
            if (skipNextOptionsRefresh) {
                skipNextOptionsRefresh = false
                return
            }
            refresh()
        }, { deep: true })

        onBeforeUnmount(() => {
            if (typeof document !== 'undefined') {
                document.removeEventListener('visibilitychange', handleVisibilityChange)
            }
            unbindPointerEvents()
            stopAnimationLoop()
            objectBuildToken += 1
            if (sceneObjectGroup) {
                clearObject3D(sceneObjectGroup)
                scene?.remove(sceneObjectGroup)
                sceneObjectGroup = null
            }
            if (lightGroup) {
                clearObject3D(lightGroup)
                scene?.remove(lightGroup)
                lightGroup = null
            }
            renderer?.dispose?.()
            renderer = null
            scene = null
            camera = null
        })

        return () => {
            const {
                containerStyle: _containerStyle,
                style: _style,
            } = getPositionInfoFromOptions(props.options.position)

            const containerStyle: any = {
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                ..._containerStyle,
            }

            const style: any = {
                flexShrink: 0,
                width: formatToNativeSizeString(props.options.width),
                height: formatToNativeSizeString(props.options.height),
                transform: createTransformString(props.options.transform),
                filter: createFilterFromOptions(props.options.filter),
                zIndex: props.options.zIndex,
                ..._style,
            }

            onBeforeReturnRender({
                style,
                options: props.options,
            })

            const glSize = getCappedWebGLSize()

            return <div style={containerStyle}>
                <canvas
                    ref={canvasRef}
                    style={style}
                    width={glSize.width}
                    height={glSize.height}
                    data-three-scene-engine={props.options?.threeScene?.engine || 'threejs'}
                    title={getEngineOptions().scene.interaction.dragToRotate.enabled ? '拖动对象旋转角度' : undefined}
                ></canvas>
                {(isModelLoading.value || modelLoadError.value) ? <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: modelLoadError.value ? 'rgba(255, 245, 245, 0.86)' : 'rgba(255, 255, 255, 0.76)',
                    color: modelLoadError.value ? '#c45656' : '#303133',
                    fontSize: '12px',
                    pointerEvents: 'none',
                    zIndex: Number(props.options.zIndex || 0) + 1,
                }}>{modelLoadError.value || modelLoadingText.value || '模型加载中...'}</div> : null}
            </div>
        }
    },
})

function resolveModelUrl(objectConfig: ThreeObjectConfig, config: ThreejsEngineConfig) {
    const modelRef = objectConfig.model || {}
    const resource = config.resources.models.find((item) => item.id === modelRef.resourceId)
    return modelRef.url || resource?.url || ''
}

function toVec3Array(value: any, fallback: Vec3Array): Vec3Array {
    if (Array.isArray(value)) {
        return [
            Number(value[0] ?? fallback[0]),
            Number(value[1] ?? fallback[1]),
            Number(value[2] ?? fallback[2]),
        ]
    }

    if (value && typeof value === 'object') {
        return [
            Number(value.x ?? fallback[0]),
            Number(value.y ?? fallback[1]),
            Number(value.z ?? fallback[2]),
        ]
    }

    return fallback
}

function applyTransform(object: THREE.Object3D, transform?: ThreeObjectConfig['transform']) {
    object.position.set(...toVec3Array(transform?.position, [0, 0, 0]))
    object.rotation.set(...toVec3Array(transform?.rotation, [0, 0, 0]))
    object.scale.set(...toVec3Array(transform?.scale, [1, 1, 1]))
}

function getMaterialSide(side?: string) {
    if (side === 'back') {
        return THREE.BackSide
    }
    if (side === 'double') {
        return THREE.DoubleSide
    }
    return THREE.FrontSide
}

function clearObject3D(object: THREE.Object3D) {
    for (const child of [...object.children]) {
        object.remove(child)
        disposeObject3D(child)
    }
}

function disposeObject3D(object?: THREE.Object3D | null) {
    if (!object) {
        return
    }

    object.traverse((child: any) => {
        child.geometry?.dispose?.()
        const material = child.material
        if (Array.isArray(material)) {
            material.forEach(disposeMaterial)
        } else {
            disposeMaterial(material)
        }
    })
}

function disposeMaterial(material?: any) {
    if (!material) {
        return
    }

    for (const key of Object.keys(material)) {
        const value = material[key]
        if (value && value.isTexture) {
            value.dispose?.()
        }
    }
    material.dispose?.()
}
