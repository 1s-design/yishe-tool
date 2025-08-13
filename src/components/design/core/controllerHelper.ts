import Api from '@/api'
import {
    Box3,
    BoxGeometry,
    DirectionalLight,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    AmbientLight,
    Vector3,
    Box3Helper,
    Vector2,
    Object3D,
    SphereGeometry,
    DoubleSide,
    Raycaster,
    Texture,
    Euler,
    MeshPhongMaterial,
    TextureLoader,
    CubeTextureLoader,
    BackSide,
    PointLight,
    MathUtils,
    PMREMGenerator,
    MeshStandardMaterial,
    RepeatWrapping,
    ACESFilmicToneMapping,
    SRGBColorSpace
} from "three";
import { message } from 'ant-design-vue'
import three from '../../../common/three';
import Utils from '@/common/utils'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';


export async function createMaterialFromOptions(options) {

    let {
        textureInfo,
        color,
        metalness,
        roughness,
        textureRepeat,
        colorBlend = false // 新增：是否让颜色与纹理混合
    } = options

    // 如果有纹理贴图且不需要颜色混合，则不设置color
    let finalColor = null
    if (colorBlend || !textureInfo) {
        finalColor = color || '#ffffff'
    }

    // message.loading({ content: `正在生成材质...`, key: 'loadingmaterial', duration: 0 });

    let map = null

    if (textureInfo) {


        let textrue = textureInfo

        const textureLoader = new TextureLoader();
        textureLoader.setWithCredentials(true)
        textureLoader.setCrossOrigin('*')

        let texture = await textureLoader.loadAsync(textrue.url)

        console.log('服装材质加载url',textrue.url)

        // 该段代码可以将纹理均匀的显示
        texture.wrapS = RepeatWrapping; // 设置水平重复
        texture.wrapT = RepeatWrapping; // 设置垂直重复


        // 设置纹理的密度
        texture.repeat.set(textureRepeat, textureRepeat); // 设置重复次数
        texture.offset.set(0, 0); // 设置偏移

        map = texture
    }



    const material = new MeshStandardMaterial({
        map: map,
        metalness: metalness,    // 金属
        roughness: roughness,   // 粗糙度
        side: DoubleSide,
        color: finalColor, // 根据设置决定是否使用颜色
        emissive: null, // 发光色
        opacity: 1,
        transparent: true, // 设置该属性 才可以设置 opacity
        envMapIntensity: 1.5  // 增强环境反射强度，让白色更纯
    });

    // message.destroy('loadingmaterial');
    return material
}


export function initBasicLight(scene) {

    // 创建场景、相机和渲染器等...
    // 添加环境光
    const ambientLight = new AmbientLight(0xffffff, 1.5); // 设置颜色和强度
    scene.add(ambientLight);

    // // 添加平行光
    const directionalLight1 = new DirectionalLight(0xffffff, 1.5); // 设置颜色和强度
    directionalLight1.position.set(1, 1, 1); // 设置光源位置
    scene.add(directionalLight1);

    // 添加平行光
    const directionalLight2 = new DirectionalLight(0xffffff, 1.5); // 设置颜色和强度
    directionalLight2.position.set(-1, -1, -1); // 设置光源位置
    scene.add(directionalLight2);

    // 添加点光源
    const pointLight = new PointLight(0xffffff, 5); // 设置颜色和强度
    pointLight.position.set(0, 0, 4); // 设置光源位置
    scene.add(pointLight);
}


import { getSvgTextContentByUrl, svgToBase64, svgToPngFile } from '@/common/transform';
import { url } from 'inspector';


export function createReflectiveSphere(scene) {
    // 创建一个球体几何体
    const geometry = new SphereGeometry(0.5, 64, 64);
    
    // 创建一个具有高反射度的材质
    const material = new MeshStandardMaterial({
        metalness: 1.0,    // 金属度设为最大
        roughness: 0.0,    // 粗糙度设为最小，使其完全光滑
        color: 0xffffff,   // 白色
    });

    // 创建网格
    const sphere = new Mesh(geometry, material);
    
    // 将球体放置在场景中
    sphere.position.set(0, 0, 0);
    scene.add(sphere);

    return sphere;
}

export function initHdr(renderer, scene) {
    const pmremGenerator = new PMREMGenerator(renderer);
    const hdriLoader = new RGBELoader()

    // 设置渲染器的色调映射
    renderer.toneMapping = ACESFilmicToneMapping;

    // 不使用曝光
    // renderer.toneMapping = NoToneMapping;

    renderer.toneMappingExposure = 1.1;
    
    // 设置渲染器的输出编码
    renderer.outputColorSpace = SRGBColorSpace;

    /**
     * @example 比较合适的 , 从上到下排名
     * cloud.hdr
     * room3.hdr
     * cloth5.hdr
    */

    hdriLoader.load('/3d/room3.hdr', (texture) => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        texture.dispose();
        scene.environment = envMap;
        
        // 创建反射球体 ,这个反射球体可以辅助 查看hdr
        // createReflectiveSphere(scene);
        
        pmremGenerator.dispose(); // 清理 PMREMGenerator
    });
}