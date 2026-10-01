// Wallet: 1 VA Point = ₹1. Bonus tiers mirror backend walletController.calculateVAPoints,
// which is what actually credits the wallet — this copy is for display only.
export const MIN_RECHARGE = 20
export const MAX_RECHARGE = 100000

export const BONUS_TIERS = [
  { min: 5000, percent: 30 },
  { min: 1000, percent: 20 },
  { min: 500, percent: 15 },
  { min: 50, percent: 10 },
]

export function calculateVAPoints(rupees) {
  const amount = Number(rupees) || 0
  const tier = BONUS_TIERS.find((t) => amount >= t.min)
  const bonusPercent = tier ? tier.percent : 0
  const bonusPoints = Math.floor(amount * (bonusPercent / 100))
  return { vaPoints: amount + bonusPoints, bonusPoints, bonusPercent }
}

// Display prices (from pricing_config); the backend remains the source of truth
export const PRICES = {
  chatPerMinute: 9,
  report: 99,
  kundliMatching: 99,
  remedies: 199,
}

export const formatInr = (n) => '₹' + Number(n).toLocaleString('en-IN')
