import Reveal from './Reveal'

// Standard page section with an eyebrow, heading and optional lead text
export default function Section({ id, eyebrow, title, lead, children, className = '' }) {
  return (
    <section id={id} className={`scroll-mt-20 py-24 sm:py-32 ${className}`}>
      <div className="wrap">
        {(eyebrow || title) && (
          <Reveal className="mx-auto mb-12 max-w-3xl text-center">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 className="mt-3 font-display text-4xl font-black tracking-tight md:text-5xl">{title}</h2>}
            {lead && <p className="mt-4 text-base leading-relaxed text-ink-2">{lead}</p>}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  )
}
