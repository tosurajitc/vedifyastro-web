// Fixed, twinkling starfield. Positions come from a seeded generator so server and client render the same markup.
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rand = seeded(42)
const STARS = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  top: rand() * 100,
  left: rand() * 100,
  size: rand() < 0.85 ? 1 + rand() : 2 + rand() * 1.5,
  delay: rand() * 6,
  duration: 3 + rand() * 5,
}))

export default function Starfield() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {STARS.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-cosmos-100 animate-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            boxShadow: s.size > 2 ? '0 0 6px rgba(224,200,255,.8)' : 'none',
          }}
        />
      ))}
    </div>
  )
}
