import {
    MeshPhongMaterial,
    Mesh,
    DoubleSide,
    MeshStandardMaterial,
    FrontSide,
    BackSide,
    WebGLRenderer
} from 'three'

import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import WebGL from 'three/examples/jsm/capabilities/WebGL.js';


/**
 * @function 返回gltf文件中的主网格
 */
function findMainMeshFromGltf(gltf) {
    let mesh = null;
    gltf.scene.traverse((child) => {
        if (child.isMesh && !mesh) {
            mesh = child;
        }
    });
    return mesh;
}


/**
 * @function 将gltf中的网格合并成一个并返回
*/

function findMainMeshFromGltfAndMergeGeometries(gltf) {
    let mesh = null;
    let geometries = [];
    let materials = [];
    let groups = [];
    let indexOffset = 0;

    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            const geometry = child.geometry.clone();
            geometry.applyMatrix4(child.matrixWorld);
            
            // 记录当前 geometry 的索引范围
            const count = geometry.index ? geometry.index.count : geometry.attributes.position.count;
            geometries.push(geometry);
            materials.push(child.material);
            groups.push({
                start: indexOffset,
                count: count,
                materialIndex: materials.length - 1
            });
            indexOffset += count;
        }
        if (child.isMesh && !mesh) {
            mesh = child;
        }
    });

    // 合并几何体，不自动合并 groups
    let merged = mergeGeometries(geometries, false);
    // 设置 groups 信息
    merged.groups = groups;

    // 创建合并后的网格，传入材质数组
    const mergedMesh = new Mesh(merged, materials);
    gltf.scene = mergedMesh;

    return { mergedMesh };
}


function createDefaultMaterial() {
    const material = new MeshStandardMaterial({
        color: 0x777777, // 布料颜色
        metalness: .5,    // 非金属
        roughness: .7,   // 粗糙度
        side: DoubleSide
    });

    return material
}


export default class three {

    constructor() {

        var webglSupport = false

        try {
            new WebGLRenderer({})
            webglSupport = true
        } catch (e) {
            webglSupport = false
        }

        this.isSupport = WebGL.isWebGL2Available() && webglSupport
    }

    isSupport = false

    findMainMeshFromGltf = findMainMeshFromGltf
    findMainMeshFromGltfAndMergeGeometries = findMainMeshFromGltfAndMergeGeometries
    createDefaultMaterial = createDefaultMaterial
}