// Google sign-in with Google Identity Services' token popup. The access token goes to the backend's
// /auth/google (via /api/session/google), which checks it was issued to this client ID.
const GSI_SRC = 'https://accounts.google.com/gsi/client'
let gsiPromise = null

function loadGsi() {
  if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) return Promise.resolve()
  if (!gsiPromise) {
    gsiPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = GSI_SRC
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => { gsiPromise = null; reject(new Error('Could not load Google sign-in. Check your connection.')) }
      document.head.appendChild(s)
    })
  }
  return gsiPromise
}

// Resolves to { accessToken, name, picture }. Rejects if the user closes the popup.
export async function googleAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID
  if (!clientId) throw new Error('Google sign-in is not configured yet.')
  await loadGsi()

  const accessToken = await new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: (resp) => (resp.error ? reject(new Error('Google sign-in failed. Please try again.')) : resolve(resp.access_token)),
      error_callback: (err) => reject(new Error(err?.type === 'popup_closed' ? 'Google sign-in was cancelled.' : 'Google sign-in failed. Please try again.')),
    })
    client.requestAccessToken({ prompt: 'select_account' })
  })

  // Name and photo for new accounts; the backend takes the email from Google itself
  let profile = {}
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } })
    if (res.ok) profile = await res.json()
  } catch {}
  return { accessToken, name: profile.name, picture: profile.picture }
}
