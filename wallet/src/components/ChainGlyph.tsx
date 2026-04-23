import clsx from 'clsx'
import { CHAINS, type ChainKey } from '../lib/chains'

export function ChainGlyph({
  chain,
  size = 28,
  className,
}: {
  chain: ChainKey
  size?: number
  className?: string
}) {
  const info = CHAINS[chain]
  return (
    <span
      className={clsx('inline-flex items-center justify-center rounded-full font-medium', className)}
      style={{
        width: size,
        height: size,
        background: `color-mix(in srgb, ${info.tone} 22%, var(--color-surface))`,
        color: info.tone,
        fontSize: size * 0.46,
        lineHeight: 1,
        border: `1px solid color-mix(in srgb, ${info.tone} 40%, var(--color-line))`,
      }}
      aria-hidden
    >
      {info.glyph}
    </span>
  )
}

export function TokenBadge({
  symbol,
  chain,
  size = 44,
}: {
  symbol: string
  chain: ChainKey
  size?: number
}) {
  const info = CHAINS[chain]
  const letter = symbol.slice(0, 2).toUpperCase()
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="flex h-full w-full items-center justify-center rounded-full font-display text-[0.95em]"
        style={{
          background: `color-mix(in srgb, ${info.tone} 18%, var(--color-surface))`,
          color: info.tone,
          border: `1px solid color-mix(in srgb, ${info.tone} 40%, var(--color-line))`,
          fontSize: size * 0.38,
        }}
      >
        {letter}
      </div>
      <ChainGlyph
        chain={chain}
        size={size * 0.42}
        className="absolute -bottom-1 -right-1 border border-[var(--color-surface)]"
      />
    </div>
  )
}
