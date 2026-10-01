import Link from 'next/link'
import Image from 'next/image'
import siteConfig from '@/site.config'

function Column({ title, links }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-ink-3">{title}</h3>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-sm text-ink-2 transition hover:text-gold">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative border-t border-line bg-cosmos-950/60">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Image src={siteConfig.brand.logo} alt="" width={32} height={32} />
            <span className="font-display text-lg font-bold">{siteConfig.brand.name}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-2">{siteConfig.brand.tagline}</p>
          <p className="mt-4 text-xs text-ink-3">
            AI-generated guidance for reflection and planning. It is not medical, legal or financial advice.
          </p>
        </div>
        <Column title="Product" links={siteConfig.footer.product} />
        <Column title="Company" links={siteConfig.footer.company} />
        <Column title="Legal" links={siteConfig.footer.legal} />
      </div>
      <div className="border-t border-line">
        <div className="wrap flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-3 sm:flex-row">
          <span>© {year} {siteConfig.brand.name}. All rights reserved.</span>
          <span>Calculations: Swiss Ephemeris · Lahiri ayanamsa · Birth data encrypted with AES-256</span>
        </div>
      </div>
    </footer>
  )
}
