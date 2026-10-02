import { NextResponse } from 'next/server'
import { BACKEND_URL, clientIp, proxyHeaders } from '@/lib/server/backend'
import { ACCESS_COOKIE, forgetSession } from '@/lib/server/session'

// Proxies every /api/* call from the browser to the Node backend, adding the session token from
// the httpOnly cookie. Bodies stream through untouched, so PDFs and audio work too.
export const dynamic = 'force-dynamic'
export const maxDuration = 180

// These return tokens in the body. The browser must use /api/session/* instead, which stores them in cookies.
const BLOCKED = new Set(['auth/login', 'auth/register', 'auth/google', 'auth/facebook', 'auth/phone/verify-otp', 'auth/refresh'])

// Headers worth passing back to the browser (X-PDF-URL comes with the advanced kundli PDF)
const PASS_BACK = ['content-type', 'content-disposition', 'content-length', 'cache-control', 'x-pdf-url', 'retry-after', 'ratelimit-remaining', 'ratelimit-reset']

async function proxy(req, { params }) {
  const path = params.path.join('/')
  if (BLOCKED.has(path)) {
    return NextResponse.json({ success: false, message: 'Not available' }, { status: 404 })
  }

  const url = `${BACKEND_URL}/api/${path}${req.nextUrl.search}`
  const headers = { ...proxyHeaders(clientIp(req.headers)) }
  for (const h of ['content-type', 'accept', 'accept-language']) {
    const v = req.headers.get(h)
    if (v) headers[h] = v
  }
  const token = req.cookies.get(ACCESS_COOKIE)?.value
  if (token) headers.Authorization = `Bearer ${token}`

  const hasBody = !['GET', 'HEAD'].includes(req.method)
  let upstream
  try {
    upstream = await fetch(url, {
      method: req.method,
      headers,
      body: hasBody ? req.body : undefined,
      duplex: hasBody ? 'half' : undefined,
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(180_000),
    })
  } catch (err) {
    const timedOut = err?.name === 'TimeoutError'
    return NextResponse.json(
      { success: false, message: timedOut ? 'The request took too long. Please try again.' : 'Could not reach VedifyAstro servers. Please try again.' },
      { status: timedOut ? 504 : 502 }
    )
  }

  // Profile / birth-detail changes must show up straight away, not after the session cache expires
  if (hasBody && upstream.ok && (path.startsWith('birth-details') || path.startsWith('auth/profile'))) forgetSession(token)

  const out = new Headers()
  for (const h of PASS_BACK) {
    const v = upstream.headers.get(h)
    if (v) out.set(h, v)
  }
  return new NextResponse(upstream.body, { status: upstream.status, headers: out })
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE }
