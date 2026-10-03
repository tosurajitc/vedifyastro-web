import { NextResponse } from 'next/server'

// Runs before pages and /api calls:
// 1. If the access cookie has expired but the refresh cookie is still valid, get a new access token
//    from the backend and hand it to this request and the browser.
// 2. Send logged-out visitors on app pages to /login?next=...
const ACCESS_COOKIE = 'va_at'
const REFRESH_COOKIE = 'va_rt'
const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '')

// Pages that need a signed-in user
const PROTECTED = ['/dashboard', '/onboarding', '/chat', '/wallet', '/profile', '/kundli', '/horoscope', '/reports', '/remedies', '/admin']

async function refreshAccess(refreshToken) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })
    const data = await res.json().catch(() => null)
    return res.ok ? data?.data?.token || null : null
  } catch {
    return null
  }
}

function maxAgeOf(token) {
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return Math.max(60, exp - Math.floor(Date.now() / 1000))
  } catch {
    return 24 * 3600
  }
}

export async function middleware(req) {
  const { pathname, search } = req.nextUrl
  let access = req.cookies.get(ACCESS_COOKIE)?.value
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value
  let renewed = null

  if (!access && refresh && !pathname.startsWith('/api/session')) {
    renewed = await refreshAccess(refresh)
    if (renewed) access = renewed
  }

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (isProtected && !access) {
    const login = new URL('/login', req.url)
    login.searchParams.set('next', pathname + search)
    return NextResponse.redirect(login)
  }

  // Server components read x-pathname to build ?next= links
  req.headers.set('x-pathname', pathname + search)
  if (!renewed) return NextResponse.next({ request: { headers: req.headers } })

  // Make the new token visible to this request's handlers, and store it for the next ones
  req.cookies.set(ACCESS_COOKIE, renewed)
  const res = NextResponse.next({ request: { headers: req.headers } })
  res.cookies.set(ACCESS_COOKIE, renewed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeOf(renewed),
  })
  return res
}

export const config = {
  // Everything except static files and Next internals
  matcher: ['/((?!_next/|brand/|agents/|favicon|.*\\.(?:png|jpg|jpeg|webp|svg|ico|txt|xml|mp4)$).*)'],
}
