/** @type {import('next').NextConfig} */

// The Next server proxies /api/* to the Node backend, so the browser never calls the backend
// directly (no CORS). On Railway set BACKEND_URL to the backend's private or public URL.
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'
const isProd = process.env.NODE_ENV === 'production'

// Razorpay Checkout loads a script and opens its own frame. Google sign-in redirects to accounts.google.com.
// Next's dev server needs 'unsafe-eval', so the policy is only sent in production.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: data:",
  "connect-src 'self' https://lumberjack.razorpay.com https://www.googleapis.com https://cloudflareinsights.com",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const nextConfig = {
  output: 'standalone', // minimal Docker image via .next/standalone
  poweredByHeader: false,
  // AI agent replies can take a while; don't let the proxy drop the upstream connection early
  experimental: { proxyTimeout: 180_000 },
  httpAgentOptions: { keepAlive: true },
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` }]
  },
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
