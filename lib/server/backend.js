import 'server-only'

// Server-side calls to the Node backend. Only the Next server talks to the backend: the browser
// goes through app/api/[...path] (proxy) or app/api/session/* (login), never directly.
export const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '')

// Browser IP for the backend rate limiters. Railway's edge puts the client first in X-Forwarded-For.
export function clientIp(headers) {
  const xff = headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return headers.get('x-real-ip') || ''
}

// Headers that let the backend apply rate limits per browser instead of per Next server (see backend index.js)
export function proxyHeaders(ip) {
  const secret = process.env.WEB_PROXY_SECRET
  if (!secret || !ip) return {}
  return { 'X-Web-Proxy-Secret': secret, 'X-Web-Client-IP': ip }
}

// JSON call to the backend. Returns { ok, status, data }; never throws on HTTP errors.
export async function backendJson(path, { method = 'GET', token, body, ip, timeoutMs = 30_000 } = {}) {
  const headers = { Accept: 'application/json', ...proxyHeaders(ip) }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  try {
    const res = await fetch(`${BACKEND_URL}/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
    })
    const data = await res.json().catch(() => null)
    return { ok: res.ok, status: res.status, data }
  } catch {
    return { ok: false, status: 502, data: { success: false, message: 'Could not reach VedifyAstro servers. Please try again.' } }
  }
}
