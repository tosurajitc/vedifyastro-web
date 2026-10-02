// Referral codes arrive as ?ref=CODE (the app's vedifyastro://refer?code=). Kept for this tab until signup.
const KEY = 'va_ref'

export function captureReferral(searchParams) {
  const code = searchParams.get('ref') || searchParams.get('code')
  if (!code || !/^[A-Za-z0-9]{4,16}$/.test(code)) return
  try { sessionStorage.setItem(KEY, code.toUpperCase()) } catch {}
}

export function getReferral() {
  try { return sessionStorage.getItem(KEY) } catch { return null }
}

export function clearReferral() {
  try { sessionStorage.removeItem(KEY) } catch {}
}
