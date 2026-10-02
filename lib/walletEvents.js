// Lets any page tell the header that the wallet balance changed (chat deductions, recharges)
const EVENT = 'va:balance'

export function emitBalance(balance) {
  if (typeof window !== 'undefined' && Number.isFinite(Number(balance))) {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: Number(balance) }))
  }
}

export function onBalance(handler) {
  const listener = (e) => handler(e.detail)
  window.addEventListener(EVENT, listener)
  return () => window.removeEventListener(EVENT, listener)
}
