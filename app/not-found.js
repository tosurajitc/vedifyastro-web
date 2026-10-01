import Link from 'next/link'

export const metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <section className="wrap grid min-h-[60vh] place-items-center py-24 text-center">
      <div>
        <p className="eyebrow">Lost in the cosmos</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold">This page isn&apos;t in our chart yet</h1>
        <p className="mx-auto mt-4 max-w-md text-ink-2">It may be on its way — the new VedifyAstro site is being built section by section.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-gold-grad px-6 py-3 font-bold text-cosmos-950">Back to home</Link>
      </div>
    </section>
  )
}
