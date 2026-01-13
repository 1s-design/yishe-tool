
import COS from 'cos-js-sdk-v5';
import { useConfigStore } from '@/store/stores/config';
import { saveAs } from 'file-saver';

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
 * @param entityId 实体ID（可选，如 PSD 模板 ID、字体模板 ID 等）
 * @param isThumbnail 是否为缩略图（可选）
 */
export async function uploadToCOS({
    file,
    key,
    category,
    account,
    entityId,
    isThumbnail
}: {
    file: File
    key?: string
    category?: string
    account?: string
    entityId?: string | number
    isThumbnail?: boolean
}) {
    const cos = getCOS();
    
    // 如果没有提供 key，且提供了 category，则生成新格式的 key
    let finalKey = key
    if (!finalKey && category) {
        // 获取用户账号
        let userAccount = account
        if (!userAccount) {
            try {
                // 从 localStorage 获取用户信息
                const LOGIN_FLAG = "1s_login"
                const userInfoStr = localStorage.getItem(LOGIN_FLAG) || sessionStorage.getItem(LOGIN_FLAG)
                if (userInfoStr) {
                    const userInfo = JSON.parse(userInfoStr)
                    userAccount = userInfo?.account || userInfo?.name || 'anonymous'
                }
            } catch (e) {
                console.warn('无法从 localStorage 获取用户信息:', e)
            }
            if (!userAccount) {
                userAccount = 'anonymous'
            }
        }
        
        // 清理账号名称
        userAccount = userAccount.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase().substring(0, 50)
        // 确保 userAccount 不为空
        if (!userAccount || userAccount.trim() === '') {
            userAccount = 'anonymous'
        }
        
        // 生成日期字符串
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const dateStr = `${year}${month}${day}`
        
        // 生成时间戳
        const timestamp = now.getTime()
        
        // 清理文件名
        const sanitizeFilename = (filename: string) => {
            if (!filename) return 'file'
            return filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 200)
        }
        
        const sanitizedFilename = sanitizeFilename(file.name || 'file')
        
        // 处理 entityId
        const sanitizedEntityId = entityId 
            ? String(entityId).replace(/[^a-zA-Z0-9_-]/g, '_')
            : ''
        
        // 处理缩略图文件名
        const finalFilename = isThumbnail && sanitizedEntityId
            ? `thumbnail_${timestamp}_${sanitizedFilename}`
            : `${timestamp}_${sanitizedFilename}`
        
        // 生成路径
        if (sanitizedEntityId) {
            finalKey = `${category}/${dateStr}/${userAccount}/${sanitizedEntityId}/${finalFilename}`
        } else {
            finalKey = `${category}/${dateStr}/${userAccount}/${finalFilename}`
        }
    } else if (!finalKey) {
        // 旧格式（向后兼容）
        finalKey = new Date().getTime() + '_1s_' + file.name
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

    if(key.startsWith('http')){
        // 如果是链接则会
        key =  key.substring(key.lastIndexOf('/') + 1);
    }

    return new Promise((resolve, reject) => {
        const cos = getCOS();

        key = String(key)
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
    let filename = key.split('_1s_')[1]
    if (!filename) {
        return
    }
    return saveAs(key, filename)
}


