// Razorpay Checkout in the browser. The backend creates the order (amount and VA Points are computed
// server-side) and verifies the signature + payment with Razorpay before crediting the wallet.
import { api } from './api'

const SRC = 'https://checkout.razorpay.com/v1/checkout.js'
let loading = null

function loadCheckout() {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve()
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = SRC
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => { loading = null; reject(new Error('Could not load the payment window. Check your connection and try again.')) }
      document.body.appendChild(s)
    })
  }
  return loading
}

export class PaymentCancelled extends Error {}

// Runs the whole recharge: create order → Razorpay popup → verify. Resolves to the backend's
// verify-payment data ({ vaPointsCredited, bonusPoints, newBalance, ... }).
export async function recharge(rupees, { name, email, phone, description }) {
  await loadCheckout()
  const order = (await api('/wallet/create-order', { method: 'POST', body: { amount: rupees } })).data

  const result = await new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'VedifyAstro',
      description,
      image: `${window.location.origin}/brand/logo.webp`,
      prefill: { name: name || undefined, email: email || undefined, contact: phone || undefined },
      theme: { color: '#f59e0b' },
      handler: resolve,
      modal: { ondismiss: () => reject(new PaymentCancelled('Payment cancelled.')), confirm_close: true },
    })
    rzp.on('payment.failed', (resp) => reject(new Error(resp?.error?.description || 'The payment failed. No money was taken.')))
    rzp.open()
  })

  const verified = await api('/wallet/verify-payment', {
    method: 'POST',
    body: {
      razorpay_order_id: result.razorpay_order_id,
      razorpay_payment_id: result.razorpay_payment_id,
      razorpay_signature: result.razorpay_signature,
    },
  })
  return verified.data
}
