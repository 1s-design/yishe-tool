/**
 * OAuth 2.0 简化流程 - 1s 设计工具客户端
 *
 * 流程：
 * 1. 客户端跳转 GET /oauth/authorize → 授权页面
 * 2. 用户确认 → 后端直接生成 token → 通过 URL 带回客户端
 * 3. 客户端从 URL 读取 token → 完成登录
 */

const OAUTH_CLIENT_ID = '1s-design-tool'
const OAUTH_SCOPE = 'user:read user:write'

/** 获取授权页面 URL */
function getAuthorizeBaseUrl(): string {
  const envAdminUrl = String(import.meta.env.VITE_ADMIN_BASE_URL || '').trim().replace(/\/+$/, '')
  if (envAdminUrl) {
    return envAdminUrl
  }

  const { protocol, hostname } = window.location
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:1521'
  }

  if (hostname.endsWith('1s.design')) {
    return 'https://admin.1s.design'
  }

  // 私有部署：默认自适应同主机的 1521 管理端口
  return `${protocol}//${hostname}:1521`
}

/** 获取回调地址 */
export function getRedirectUri(): string {
  return `${window.location.origin}${window.location.pathname}#/oauth/callback`
}

/** 生成授权 URL */
export function buildAuthorizeUrl(): string {
  const baseUrl = getAuthorizeBaseUrl()
  const redirectUri = getRedirectUri()
  const params = new URLSearchParams({
    client_id: OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: OAUTH_SCOPE,
  })
  return `${baseUrl}/#/oauth/authorize?${params.toString()}`
}

/** 打开授权页面（整页跳转） */
export function openAuthorizePage(): void {
  const url = buildAuthorizeUrl()
  console.log('[OAuth] 跳转授权页面:', url)
  window.location.href = url
}
