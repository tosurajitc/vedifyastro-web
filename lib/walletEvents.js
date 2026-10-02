// Lets any page tell the header that the wallet balance changed (chat deductions, recharges)
const EVENT = 'va:balance'

export function emitBalance(balance) {
  if (typeof window !== 'undefined' && Number.isFinite(Number(balance))) {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: Number(balance) }))
  }
}

// Re-reads the balance from the backend and announces it (after a purchase charged elsewhere)
export async function refreshBalance() {
  try {
    const res = await fetch('/api/wallet/balance')
    const data = await res.json()
    if (data?.success) emitBalance(data.data.balance)
  } catch {}
}

export function onBalance(handler) {
  const listener = (e) => handler(e.detail)
  window.addEventListener(EVENT, listener)
  return () => window.removeEventListener(EVENT, listener)
}
