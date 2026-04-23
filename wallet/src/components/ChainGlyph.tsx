import clsx from 'clsx'
import { useState } from 'react'
import { CHAINS, type ChainKey } from '../lib/chains'

/**
 * Small circular chain icon. Renders the original chain logo PNG from
 * TrustWallet assets CDN, falling back to the tonal glyph if the image
 * fails to load (e.g. offline or CDN down).
 */
export function ChainGlyph({
  chain,
  size = 28,
  className,
  useChainLogo = false,
}: {
  chain: ChainKey
  size?: number
  className?: string
  /** When true, uses the chain's own logo (e.g. Base logo). Default = native coin logo. */
  useChainLogo?: boolean
}) {
  const info = CHAINS[chain]
  const [errored, setErrored] = useState(false)
  const src = useChainLogo ? info.chainLogo : info.logo

  if (errored || !src) {
    return (
      <span
        className={clsx(
          'inline-flex items-center justify-center rounded-full font-medium',
          className,
        )}
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

  return (
    <img
      src={src}
      alt={info.name}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      loading="lazy"
      decoding="async"
      className={clsx('inline-block rounded-full', className)}
      style={{
        width: size,
        height: size,
        background: 'var(--color-surface)',
        border: `1px solid color-mix(in srgb, ${info.tone} 30%, var(--color-line))`,
      }}
    />
  )
}

/**
 * Token avatar with a chain badge in the bottom-right corner.
 * Renders the original token logo PNG, falling back to a tonal letter circle.
 */
export function TokenBadge({
  symbol,
  chain,
  size = 44,
  logo,
  showChain = true,
}: {
  symbol: string
  chain: ChainKey
  size?: number
  logo?: string
  showChain?: boolean
}) {
  const info = CHAINS[chain]
  const [errored, setErrored] = useState(false)
  const letter = symbol.slice(0, 3).toUpperCase()
  const badgeSize = size * 0.42

  const showImage = Boolean(logo) && !errored

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {showImage ? (
        <img
          src={logo}
          alt={symbol}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setErrored(true)}
          className="h-full w-full rounded-full"
          style={{
            background: 'var(--color-surface)',
            border: `1px solid color-mix(in srgb, ${info.tone} 30%, var(--color-line))`,
          }}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full font-display"
          style={{
            background: `color-mix(in srgb, ${info.tone} 18%, var(--color-surface))`,
            color: info.tone,
            border: `1px solid color-mix(in srgb, ${info.tone} 40%, var(--color-line))`,
            fontSize: size * 0.34,
            letterSpacing: '-0.02em',
          }}
          aria-hidden
        >
          {letter}
        </div>
      )}
      {showChain ? (
        <ChainGlyph
          chain={chain}
          size={badgeSize}
          useChainLogo
          className="absolute -bottom-1 -right-1 shadow-[0_0_0_2px_var(--color-surface)]"
        />
      ) : null}
    </div>
  )
}
