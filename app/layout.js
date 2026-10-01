import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Starfield from '@/components/cosmic/Starfield'
import siteConfig from '@/site.config'

// Same typeface as the Shukto/OPC sites: Inter for headings and body
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'], variable: '--font-inter', display: 'swap' })

export const metadata = {
  metadataBase: new URL(siteConfig.seo.siteUrl),
  title: { default: siteConfig.seo.title, template: `%s · ${siteConfig.brand.name}` },
  description: siteConfig.seo.description,
  keywords: siteConfig.seo.keywords,
  icons: { icon: '/brand/favicon.png' },
  openGraph: {
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    url: siteConfig.seo.siteUrl,
    siteName: siteConfig.brand.name,
    locale: 'en_IN',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export const viewport = { themeColor: '#0d0028' }

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="nebula min-h-screen">
        <Starfield />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
