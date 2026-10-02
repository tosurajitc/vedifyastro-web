/** @type {import('next').NextConfig} */

// /api/* is proxied to the Node backend by app/api/[...path]/route.js (BACKEND_URL, server-side),
// so the browser never calls the backend directly (no CORS).
const isProd = process.env.NODE_ENV === 'production'

// Razorpay Checkout loads a script and opens its own frame. Google sign-in loads its script and popup from
// accounts.google.com. Birthplace search calls OpenStreetMap Nominatim from the browser.
// Next's dev server needs 'unsafe-eval', so the policy is only sent in production.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://accounts.google.com/gsi/client https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: data:",
  "connect-src 'self' https://lumberjack.razorpay.com https://www.googleapis.com https://accounts.google.com https://nominatim.openstreetmap.org https://cloudflareinsights.com",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com https://accounts.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const nextConfig = {
  output: 'standalone', // minimal Docker image via .next/standalone
  poweredByHeader: false,
  httpAgentOptions: { keepAlive: true },
  async redirects() {
    return [
      // Old static site URLs (the Play Store listing links to the delete-account page)
      { source: '/vedify-web/html/delete-account.html', destination: '/delete-account', permanent: true },
      { source: '/vedify-web/html/delete-account', destination: '/delete-account', permanent: true },
      { source: '/vedify-web/html/Privacy.html', destination: '/privacy-policy', permanent: true },
      { source: '/vedify-web/html/Terms.html', destination: '/terms', permanent: true },
      { source: '/vedify-web/html/refund-policy.html', destination: '/refund-policy', permanent: true },
    ]
  },
  async headers() {
    const base = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=(self)' },
    ]
    if (isProd) base.push({ key: 'Content-Security-Policy', value: csp })
    return [{ source: '/(.*)', headers: base }]
  },
}

module.exports = nextConfig
