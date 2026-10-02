// Browser-side JSON calls. Everything goes to our own /api (proxied to the backend with the session cookie).
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

export async function api(path, { method = 'GET', body, signal } = {}) {
  let res
  try {
    res = await fetch(path.startsWith('/api') ? path : `/api${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch {
    throw new ApiError('You seem to be offline. Please check your connection.', 0)
  }
  const data = await res.json().catch(() => null)
  if (!res.ok || data?.success === false) {
    const message = data?.message || data?.error?.message || (typeof data?.error === 'string' ? data.error : null) || 'Something went wrong. Please try again.'
    throw new ApiError(message, res.status, data)
  }
  return data
}
