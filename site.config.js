// Brand, SEO, navigation and contact. Prices come from the backend (/api/pricing) once wired up;
// the wallet bonus tiers below mirror walletController.calculateVAPoints and are display-only.
const siteConfig = {
  brand: {
    name: 'VedifyAstro',
    tagline: 'Vedic astrology, powered by AI — precise charts, honest guidance, 24×7.',
    logo: '/brand/logo.webp',
    email: 'shuktoai@gmail.com',
    playStore: 'https://play.google.com/store/apps/details?id=com.vedifyastro.app',
    appStore: null, // set when the iOS app is published
    // Flip to true when the Android app is public; until then the footer shows "Coming soon"
    appLive: false,
  },
  seo: {
    title: 'VedifyAstro — AI Vedic Astrology: Kundli, Horoscope & Expert AI Astrologers',
    description:
      'Get your Vedic birth chart (Lahiri, Swiss Ephemeris), daily horoscope, kundli matching and remedies, and chat with 17 AI astrology specialists in 11 Indian languages.',
    keywords: ['vedic astrology', 'kundli', 'AI astrologer', 'horoscope', 'kundli matching', 'panchang', 'jyotish'],
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
  nav: [
    { label: 'AI Astrologers', href: '/#agents' },
    { label: 'Features', href: '/#features' },
    { label: 'How it works', href: '/#how' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'FAQ', href: '/#faq' },
  ],
  footer: {
    product: [
      { label: 'Free Kundli', href: '/#features' },
      { label: 'AI Astrologers', href: '/#agents' },
      { label: 'Kundli Matching', href: '/#features' },
      { label: 'Pricing', href: '/#pricing' },
    ],
    company: [
      { label: 'Contact', href: 'mailto:shuktoai@gmail.com' },
      { label: 'Get the app', href: '#get-app' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Refund Policy', href: '/refund-policy' },
      { label: 'Delete Account', href: '/delete-account' },
    ],
  },
  languages: ['English', 'हिन्दी', 'বাংলা', 'தமிழ்', 'తెలుగు', 'मराठी', 'ગુજરાતી', 'ಕನ್ನಡ', 'മലയാളം', 'ଓଡ଼ିଆ', 'ਪੰਜਾਬੀ'],
}

module.exports = siteConfig
