
import COS from 'cos-js-sdk-v5';
import { useConfigStore } from '@/store/stores/config';
import { saveAs } from 'file-saver';
import { buildCOSKey, extractCOSFilename, extractCOSObjectKey } from '@/utils/cosPath';

var _cos
export const getCOS = () => {

    let configStore = useConfigStore()

    if (_cos) {
        return _cos
    }

    _cos = new COS({
        SecretId: configStore.cos.SecretId,
        SecretKey: configStore.cos.SecretKey,
        Bucket: configStore.cos.Bucket,
        Region: configStore.cos.Region,
    } as any)

    return _cos
}




/**
 * 上传文件到 COS
 * @param file 文件对象
 * @param key 文件在 COS 中的存储路径（可选，如果提供则直接使用）
 * @param category 文件分类（如 sticker, product, psd-template 等，应与实体名称一致）
 * @param account 用户账号（可选，默认从 localStorage 获取）
 * @param userId 用户 ID（可选）
 * @param entityId 实体ID（可选，如 PSD 模板 ID、字体模板 ID 等）
 * @param isThumbnail 是否为缩略图（可选）
 */
export async function uploadToCOS({
    file,
    key,
    category,
    account,
    userId,
    entityId,
    isThumbnail
}: {
    file: File
    key?: string
    category?: string
    account?: string
    userId?: string | number
    entityId?: string | number
    isThumbnail?: boolean
}) {
    const cos = getCOS();
    
    let finalKey = key
    if (!finalKey) {
        finalKey = buildCOSKey({
            filename: file.name || 'file',
            category: category || 'uncategorized',
            account,
            userId,
            entityId,
            isThumbnail,
        })
    }
    
    try {
        const res = await cos.uploadFile({
            Key: String(finalKey),
            Body: file,
            Bucket: cos.options.Bucket,
            Region: cos.options.Region
        })
        return {
            url: `https://${res.Location}`,
            key: finalKey
        }
    } catch (e: any) {
        console.error('文件上传失败:', e)
        const errorMessage = e?.message || e?.toString() || '未知错误'
        console.error('错误详情:', {
            message: errorMessage,
            stack: e?.stack,
            code: e?.code,
            statusCode: e?.statusCode,
            requestId: e?.requestId
        })
        throw new Error(`COS上传失败: ${errorMessage}`)
    }
}


export function deleteCOSFile(key) {

    return new Promise((resolve, reject) => {
        const cos = getCOS();

        key = extractCOSObjectKey(String(key))
        cos.deleteObject({
            Bucket: cos.options.Bucket,
            Region: cos.options.Region,
            Key: key
        }, function (err, data) {
            if (err) {
                console.error('删除文件失败:', err);
                reject(err);
            } else {
                console.log('删除文件成功:', data);
                resolve(data);
            }
        });
    });
}


function removeProtocol(url) {
    if (url.startsWith('http://')) {
        return url.replace('http://', '')
    }

    if (url.startsWith('https://')) {
        return url.replace('https://', '')
    }
}

export function downloadCOSFile(key) {
    const filename = extractCOSFilename(key)
    if (!filename) {
        return
    }
    return saveAs(key, filename)
}

