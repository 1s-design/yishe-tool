export type CosUserIdentity = {
  userId: string
  account: string
  directory: string
}

export type BuildCOSKeyOptions = {
  filename: string
  category?: string
  account?: string
  userId?: string | number
  entityId?: string | number
  isThumbnail?: boolean
  timestamp?: number
  date?: Date
}

const DEFAULT_COS_ACCOUNT = 'anonymous'
const DEFAULT_COS_USER_ID = '0'
const DEFAULT_COS_CATEGORY = 'uncategorized'

export const sanitizeCosFilename = (filename: string) => {
  if (!filename) return 'file'
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 200) || 'file'
}

export const sanitizeCosAccount = (account?: string) => {
  if (!account || typeof account !== 'string') {
    return DEFAULT_COS_ACCOUNT
  }

  const sanitized = account
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase()
    .substring(0, 50)

  return sanitized || DEFAULT_COS_ACCOUNT
}

export const sanitizeCosUserId = (userId?: string | number | null) => {
  if (userId == null) {
    return DEFAULT_COS_USER_ID
  }

  const sanitized = String(userId)
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .substring(0, 50)

  return sanitized || DEFAULT_COS_USER_ID
}

export const sanitizeCosPathSegment = (value?: string | number | null, fallback = '') => {
  if (value == null) {
    return fallback
  }

  const sanitized = String(value)
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 100)

  return sanitized || fallback
}

export const sanitizeCosCategoryPath = (category?: string) => {
  if (!category || typeof category !== 'string') {
    return DEFAULT_COS_CATEGORY
  }

  const segments = category
    .split(/[\\/]+/)
    .map((segment) => sanitizeCosPathSegment(segment))
    .filter(Boolean)

  return segments.length ? segments.join('/') : DEFAULT_COS_CATEGORY
}

export const formatCOSDate = (date?: Date) => {
  const targetDate = date || new Date()
  const year = targetDate.getFullYear()
  const month = String(targetDate.getMonth() + 1).padStart(2, '0')
  const day = String(targetDate.getDate()).padStart(2, '0')

  return `${year}${month}${day}`
}

export const readStoredUserInfo = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const candidates = ['1s_login', 'USER', 'userInfo']

  for (const key of candidates) {
    try {
      const raw = localStorage.getItem(key) || sessionStorage.getItem(key)
      if (raw) {
        return JSON.parse(raw)
      }
    } catch {
    }
  }

  return null
}

export const resolveCosUserIdentity = (
  account?: string,
  userId?: string | number
): CosUserIdentity => {
  const stored = readStoredUserInfo()
  const storedUser =
    stored?.userInfo ||
    stored?.user ||
    stored ||
    {}

  const finalUserId = sanitizeCosUserId(
    userId ??
      storedUser?.id ??
      stored?.id ??
      null
  )

  const finalAccount = sanitizeCosAccount(
    account ??
      storedUser?.account ??
      storedUser?.shortName ??
      storedUser?.name ??
      stored?.account ??
      stored?.shortName ??
      stored?.name ??
      DEFAULT_COS_ACCOUNT
  )

  return {
    userId: finalUserId,
    account: finalAccount,
    directory: `${finalUserId}_${finalAccount}`,
  }
}

export function buildCOSKey(options: BuildCOSKeyOptions) {
  const identity = resolveCosUserIdentity(options.account, options.userId)
  const now = options.date || new Date()
  const dateStr = formatCOSDate(now)
  const finalTimestamp = options.timestamp || now.getTime()
  const category = sanitizeCosCategoryPath(options.category)
  const sanitizedFilename = sanitizeCosFilename(options.filename)
  const entityId = sanitizeCosPathSegment(options.entityId)
  const finalFilename = options.isThumbnail && entityId
    ? `thumbnail_${finalTimestamp}_${sanitizedFilename}`
    : `${finalTimestamp}_${sanitizedFilename}`

  if (entityId) {
    return `users/${identity.directory}/${category}/${dateStr}/${entityId}/${finalFilename}`
  }

  return `users/${identity.directory}/${category}/${dateStr}/${finalFilename}`
}

export function extractCOSObjectKey(value: string) {
  const rawValue = String(value || '').trim()
  if (!rawValue) {
    return ''
  }

  if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) {
    const url = new URL(rawValue)
    return decodeURIComponent(url.pathname.replace(/^\/+/, ''))
  }

  return rawValue.replace(/^\/+/, '')
}

export function extractCOSFilename(value: string) {
  const objectKey = extractCOSObjectKey(value)
  if (!objectKey) {
    return ''
  }

  const basename = objectKey.split('/').filter(Boolean).pop() || ''
  if (!basename) {
    return ''
  }

  const normalized = basename
    .replace(/^thumbnail_/, '')
    .replace(/^\d+_/, '')
    .replace(/^1s_/, '')

  return normalized || basename
}
