import { formatUnits } from 'ethers'

export function formatAmount(raw: bigint | string | undefined, decimals: number, max = 6): string {
  if (raw === undefined || raw === null) return '—'
  const s = formatUnits(typeof raw === 'bigint' ? raw : BigInt(raw), decimals)
  const [whole, frac = ''] = s.split('.')
  if (!frac) return whole
  // Keep up to `max` significant fractional digits but drop trailing zeros.
  const trimmed = frac.slice(0, max).replace(/0+$/, '')
  return trimmed ? `${whole}.${trimmed}` : whole
}

export function formatFiat(value: number, currency: 'usd' | 'eur' | 'rub' = 'usd'): string {
  if (!Number.isFinite(value)) return '—'
  const symbol = currency === 'usd' ? '$' : currency === 'eur' ? '€' : '₽'
  const abs = Math.abs(value)
  const fractionDigits = abs >= 1000 ? 0 : abs >= 1 ? 2 : 4
  return `${symbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`
}

export function formatPercent(v: number): string {
  if (!Number.isFinite(v)) return '—'
  const sign = v >= 0 ? '+' : '−'
  return `${sign}${Math.abs(v).toFixed(2)}%`
}

export function timeAgo(ts: number, locale: 'ru' | 'en' = 'ru'): string {
  const d = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  if (d < 60) return locale === 'ru' ? 'только что' : 'just now'
  const m = Math.floor(d / 60)
  if (m < 60) return locale === 'ru' ? `${m} мин назад` : `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return locale === 'ru' ? `${h} ч назад` : `${h}h ago`
  const days = Math.floor(h / 24)
  if (days < 7) return locale === 'ru' ? `${days} дн назад` : `${days}d ago`
  return new Date(ts).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US')
}

export function parseDecimalInput(v: string): string {
  return v.replace(',', '.').replace(/[^\d.]/g, '')
}
