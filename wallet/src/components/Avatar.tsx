import clsx from 'clsx'

/**
 * Generates a deterministic warm gradient avatar from an address or seed string.
 * Produces a soft blob with two hues based on a cheap string hash.
 */
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Warm, editorial palette; no neon.
const PALETTE = [
  ['#E8A16E', '#D86C4A'],
  ['#C8D0A9', '#7C8F58'],
  ['#E8CFC1', '#D86C4A'],
  ['#B8C8D6', '#6C8FA3'],
  ['#D9C3DB', '#6B4A6A'],
  ['#F1D9B8', '#C78A2A'],
  ['#C6D4C0', '#4F7A52'],
  ['#E6BFB3', '#B0443A'],
]

export function Avatar({
  seed,
  size = 48,
  className,
}: {
  seed: string
  size?: number
  className?: string
}) {
  const h = hash(seed || 'x')
  const [c1, c2] = PALETTE[h % PALETTE.length]
  const angle = h % 360
  const spot1 = 20 + (h % 30)
  const spot2 = 60 + ((h >> 5) % 25)

  return (
    <div
      className={clsx('relative overflow-hidden rounded-full', className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at ${spot1}% ${spot2}%, ${c1} 0%, ${c2} 60%, #1d1d1b 140%)`,
        transform: `rotate(${angle}deg)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-60 mix-blend-soft-light"
        style={{
          background: `conic-gradient(from ${angle}deg, ${c1}, ${c2}, ${c1})`,
        }}
      />
    </div>
  )
}
