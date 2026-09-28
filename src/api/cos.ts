
import COS from 'cos-js-sdk-v5';
import { useConfigStore } from '@/store/stores/config';
import { saveAs } from 'file-saver';
import { buildCOSKey, extractCOSFilename, extractCOSObjectKey } from '@/utils/cosPath';

var _cos: any = undefined
var _cosInitTime = 0
const COS_TTL_MS = 30 * 60 * 1000 // 30 分钟缓存有效期，支持后端凭据定时轮换

// STS 临时凭据（优先），失败回退 configStore 永久密钥
var _sts: any = null
const STS_REFRESH_AHEAD_MS = 5 * 60 * 1000

export const resetCOS = () => {
    _cos = undefined
    _cosInitTime = 0
    _sts = null
}

async function fetchStsCredential(): Promise<any | null> {
    try {
        const now = Date.now()
        if (_sts && (_sts.ExpiredTime || 0) * 1000 - now > STS_REFRESH_AHEAD_MS) {
            return _sts
        }
        const { apiInstance } = await import('./apiInstance')
        const res = await apiInstance.get('/api/cos/sts', { params: { expireSeconds: 7200 } })
        const d = res?.data?.data ?? res?.data
        if (d?.TmpSecretId && d?.TmpSecretKey && d?.SecurityToken && d?.ExpiredTime) {
            _sts = {
                TmpSecretId: d.TmpSecretId,
                TmpSecretKey: d.TmpSecretKey,
                SecurityToken: d.SecurityToken,
                ExpiredTime: Number(d.ExpiredTime),
                Bucket: d.Bucket || d.bucket || '',
                Region: d.Region || d.region || '',
            }
            return _sts
        }
        return null
    } catch (e: any) {
        console.warn('[COS] STS 凭据获取失败（回退永久密钥）:', e?.message || e)
        return null
    }
}

export const getCOS = async (force = false) => {
    let configStore = useConfigStore()
    const now = Date.now()

    if (_cos && !force && (now - _cosInitTime < COS_TTL_MS)) {
        return _cos
    }

    // 优先 STS 临时凭据
    const sts = await fetchStsCredential()
    if (sts) {
        _cos = new COS({
            getAuthorization: (_options: any, callback: (auth: any) => void) => {
                void fetchStsCredential().then((fresh: any) => {
                    if (!fresh) {
                        callback({})
                        return
                    }
                    callback({
                        TmpSecretId: fresh.TmpSecretId,
                        TmpSecretKey: fresh.TmpSecretKey,
                        SecurityToken: fresh.SecurityToken,
                        ExpiredTime: fresh.ExpiredTime,
                    })
                })
            },
            Bucket: sts.Bucket,
            Region: sts.Region,
            Timeout: 300000,
        } as any)
        _cosInitTime = now
        return _cos
    }

    if (force || !configStore.cos?.SecretId || (now - _cosInitTime >= COS_TTL_MS)) {
        const { initConfigStoreBasicConfig } = await import('@/store/stores/config')
        await initConfigStoreBasicConfig()
    }

    if (!configStore.cos?.SecretId) {
        throw new Error('COS 配置未加载，请检查网络或重新登录')
    }

    _cos = new COS({
        SecretId: configStore.cos.SecretId,
        SecretKey: configStore.cos.SecretKey,
        Bucket: configStore.cos.Bucket,
        Region: configStore.cos.Region,
        Timeout: 300000,
    } as any)
    _cosInitTime = now

    return _cos
}




// 上传成功后登记文件存储记录；登记失败不影响原有上传结果。
const registerFileAssetBestEffort = (payload: Record<string, any>) => {
    void import('./apiInstance').then(({ apiInstance }) => apiInstance.post('/api/file-asset/register', {
        provider: 'tencent-cos',
        sourceApp: '1s',
        ...payload,
    })).catch((error: any) => {
        console.warn('[file-asset] 登记失败，不影响 COS 上传', error?.message || error)
    })
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
    const cos = await getCOS();

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
        const url = `https://${res.Location}`
        registerFileAssetBestEffort({
            bucket: cos.options.Bucket || '',
            region: cos.options.Region || '',
            objectKey: String(finalKey),
            url,
            fileName: file.name || 'file',
            contentType: file.type || '',
            size: file.size,
            sourceModule: category || 'uncategorized',
            category: category || 'uncategorized',
            metadata: { uploadMode: 'browser-direct' },
        })
        return { url, key: finalKey }
    } catch (e: any) {
        if (
            e?.statusCode === 403 ||
            e?.code === 'SignatureDoesNotMatch' ||
            e?.code === 'AccessDenied' ||
            e?.code === 'RequestTimeTooSkewed'
        ) {
            console.warn('[COS] 凭据已失效或过期，自动清除本地缓存准备重新拉取')
            resetCOS()
        }
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


export async function deleteCOSFile(key) {

    const cos = await getCOS();

    key = extractCOSObjectKey(String(key))
    return new Promise((resolve, reject) => {
        cos.deleteObject({
            Bucket: cos.options.Bucket,
            Region: cos.options.Region,
            Key: key
        }, function (err, data) {
            if (err) {
                if (
                    err?.statusCode === 403 ||
                    err?.code === 'SignatureDoesNotMatch' ||
                    err?.code === 'AccessDenied' ||
                    err?.code === 'RequestTimeTooSkewed'
                ) {
                    console.warn('[COS] 删除凭据已失效，清除本地缓存')
                    resetCOS()
                }
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

