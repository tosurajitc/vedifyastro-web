import 'server-only'
import { cache } from 'react'
import { backendJson } from './backend'
import { getAccessToken } from './session'

// The backend's admin_users table decides who is an admin (/admin/check-role). Cached per token for
// 60 s so moving between admin pages doesn't spend the rate limit; the backend still checks every call.
const ROLE_TTL = 60_000
const roleCache = new Map()

// Returns 'admin' / 'super_admin' etc., false for non-admins, or null when the backend couldn't be reached
export const adminRole = cache(async function adminRole() {
  const token = getAccessToken()
  if (!token) return false
  const key = token.slice(-32)
  const hit = roleCache.get(key)
  if (hit && Date.now() - hit.at < ROLE_TTL) return hit.value

  const res = await backendJson('/admin/check-role', { token })
  if (!res.ok && res.status !== 403 && res.status !== 401) return hit?.value ?? null
  const value = res.data?.isAdmin ? res.data.role || 'admin' : false
  roleCache.set(key, { at: Date.now(), value })
  if (roleCache.size > 1000) roleCache.delete(roleCache.keys().next().value)
  return value
})
