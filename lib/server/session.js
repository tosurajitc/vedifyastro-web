import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { jwtDecode } from 'jwt-decode'
import { backendJson } from './backend'

// The backend JWT lives in an httpOnly cookie so page scripts can never read it. The proxy turns it
// into an Authorization header. The refresh token (7 days) renews it; see middleware.js.
export const ACCESS_COOKIE = 'va_at'
export const REFRESH_COOKIE = 'va_rt'

const base = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' }

function secondsUntilExpiry(token, fallback) {
  try {
    const { exp } = jwtDecode(token)
    if (exp) return Math.max(60, exp - Math.floor(Date.now() / 1000))
  } catch {}
  return fallback
}

// va_in is a readable hint (no token in it) so the header knows to fetch the session
export const HINT_COOKIE = 'va_in'

// Works on any object with a Next cookies API: cookies() in route handlers, or response.cookies
export function writeSessionCookies(jar, { token, refreshToken }) {
  jar.set(HINT_COOKIE, '1', { ...base, httpOnly: false, maxAge: 7 * 24 * 3600 })
  if (token) jar.set(ACCESS_COOKIE, token, { ...base, maxAge: secondsUntilExpiry(token, 24 * 3600) })
  if (refreshToken) jar.set(REFRESH_COOKIE, refreshToken, { ...base, maxAge: secondsUntilExpiry(refreshToken, 7 * 24 * 3600) })
}

export function clearSessionCookies(jar) {
  jar.set(ACCESS_COOKIE, '', { ...base, maxAge: 0 })
  jar.set(REFRESH_COOKIE, '', { ...base, maxAge: 0 })
  jar.set(HINT_COOKIE, '', { ...base, httpOnly: false, maxAge: 0 })
}

export function getAccessToken() {
  return cookies().get(ACCESS_COOKIE)?.value || null
}

// The welcome guide is the opposite gender of the user, as in the app's ChatScreen.js:
// Savitri for men, Satyaban for everyone else
export function guideFor(gender) {
  return gender === 'male' ? 'savitri' : 'satyaban'
}

// Server memory cache of onboarded sessions, keyed by access token. Without it every page load and
// header refresh cost three backend calls and quickly hit the backend's rate limit. Fresh for 60 s;
// a stale entry (up to 30 min) is reused only when the backend is failing.
const SESSION_TTL = 60_000
const SESSION_STALE = 30 * 60_000
const sessionCache = new Map()

const tokenKey = (token) => token.slice(-32)

// Call after the user's profile or birth details change (the proxy does this on writes)
export function forgetSession(token) {
  if (token) sessionCache.delete(tokenKey(token))
}

const realName = (n) => (n && n !== 'User' ? n : null)

// What the app needs to know about the signed-in user. Returns null when logged out.
// `onboarded` is true/false, or null when the backend couldn't be reached (callers must not
// treat that as "not onboarded"). cache() shares one result between the layout and page of a request.
// `birth` is the decrypted birth record; keep it server-side (the /api/session route doesn't send it).
export const loadSession = cache(async function loadSession() {
  const token = getAccessToken()
  if (!token) return null

  const key = tokenKey(token)
  const hit = sessionCache.get(key)
  if (hit && Date.now() - hit.at < SESSION_TTL) return hit.value

  const [me, status] = await Promise.all([backendJson('/auth/me', { token }), backendJson('/birth-details/status', { token })])
  if (me.status === 401) {
    sessionCache.delete(key)
    return null
  }
  // Rate-limited, backend down, etc.: keep the last good session if we have one
  if (!me.ok || !status.ok) {
    if (hit && Date.now() - hit.at < SESSION_STALE) return hit.value
    return { name: 'there', email: null, phone: null, language: 'English', onboarded: null, gender: null, guide: guideFor(null), birth: null, degraded: true }
  }

  const onboarded = !!(status.data?.data?.exists && status.data?.data?.hasCompleteData)
  let birth = null
  if (onboarded) {
    const bd = await backendJson('/birth-details', { token })
    birth = bd.ok ? bd.data?.data || null : hit?.value?.birth || null
  }

  const user = me.data?.data || {}
  const gender = birth?.gender || null
  const value = {
    name: realName(birth?.name) || realName(status.data?.data?.name) || realName(user.name) || 'there',
    email: user.email && !user.email.endsWith('@vedifyastro.app') ? user.email : null,
    phone: user.phone || null,
    language: user.preferred_language || 'English',
    onboarded,
    gender,
    guide: guideFor(gender),
    birth,
  }
  // Only complete sessions are cached, so finishing onboarding is seen immediately
  if (onboarded && birth) sessionCache.set(key, { at: Date.now(), value })
  if (sessionCache.size > 5000) sessionCache.delete(sessionCache.keys().next().value)
  return value
})
