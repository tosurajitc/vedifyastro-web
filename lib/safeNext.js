// Only allow same-site paths in ?next= so login can't be used as an open redirect
export function safeNext(next, fallback = '/chat/va') {
  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback
  if (next.startsWith('/login') || next.startsWith('/onboarding')) return fallback
  return next
}
