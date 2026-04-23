import { useMemo, useState } from 'react'
import { ArrowDown, Repeat, Info } from 'lucide-react'
import { Layout } from '../components/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useWalletStore } from '../store/useWalletStore'
import { usePortfolio, type PricedAsset } from '../hooks/usePortfolio'
import { TokenBadge } from '../components/ChainGlyph'
import { formatAmount, formatFiat, parseDecimalInput } from '../lib/format'
import { t } from '../lib/i18n'

export function Swap() {
  const locale = useWalletStore((s) => s.settings.language)
  const currency = useWalletStore((s) => s.settings.currency)
  const { assets } = usePortfolio()

  // Default from = largest non-stable holding, to = largest stablecoin of same chain (fallback any)
  const sortedByValue = useMemo(
    () => [...assets].sort((a, b) => b.valueUsd - a.valueUsd),
    [assets],
  )

  const keyOf = (a: PricedAsset) => `${a.chain}:${a.kind === 'native' ? 'native' : a.address}`
  const byKey = useMemo(() => {
    const m = new Map<string, PricedAsset>()
    for (const a of sortedByValue) m.set(keyOf(a), a)
    return m
  }, [sortedByValue])

  const defaultFromKey = sortedByValue[0] ? keyOf(sortedByValue[0]) : null
  const defaultToKey = useMemo(() => {
    if (!sortedByValue[0]) return null
    const first = sortedByValue[0]
    const stable = sortedByValue.find(
      (a) => a !== first && ['USDC', 'USDT', 'DAI'].includes(a.symbol),
    )
    const alt = stable ?? sortedByValue.find((a) => a !== first) ?? null
    return alt ? keyOf(alt) : null
  }, [sortedByValue])

  const [fromKey, setFromKey] = useState<string | null>(null)
  const [toKey, setToKey] = useState<string | null>(null)

  const from = (fromKey && byKey.get(fromKey)) || (defaultFromKey ? byKey.get(defaultFromKey) ?? null : null)
  const to = (toKey && byKey.get(toKey)) || (defaultToKey ? byKey.get(defaultToKey) ?? null : null)
  const setFrom = (a: PricedAsset | null) => setFromKey(a ? keyOf(a) : null)
  const setTo = (a: PricedAsset | null) => setToKey(a ? keyOf(a) : null)

  const [amount, setAmount] = useState('')

  const estOut = useMemo(() => {
    if (!from || !to || !amount) return null
    const n = Number(amount)
    if (!Number.isFinite(n) || !from.usd || !to.usd) return null
    // 0.25% fee synthetic
    return (n * from.usd * 0.9975) / to.usd
  }, [from, to, amount])

  const flip = () => {
    const a = from
    setFrom(to)
    setTo(a)
    setAmount('')
  }

  return (
    <Layout>
      <h1 className="font-display text-4xl leading-[1.05]">{t('swap.title', locale)}</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
        {t('swap.provider', locale)}
      </p>

      <div className="mt-6 flex flex-col gap-2">
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
            <span>{t('swap.from', locale)}</span>
            {from ? (
              <span className="tnum">
                {formatAmount(from.balance, from.decimals, 6)} {from.symbol}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <AssetPicker value={from} onChange={setFrom} assets={sortedByValue.filter((a) => a !== to)} />
            <input
              value={amount}
              onChange={(e) => setAmount(parseDecimalInput(e.target.value))}
              placeholder="0.0"
              inputMode="decimal"
              className="flex-1 bg-transparent text-right font-display text-3xl leading-none tnum outline-none placeholder:text-[color:var(--color-muted)]"
            />
          </div>
          <div className="mt-1 text-right text-xs text-[var(--color-muted)] tnum">
            ≈ {from?.usd && amount ? formatFiat(Number(amount) * from.usd, currency) : '—'}
          </div>
        </Card>

        <div className="flex justify-center">
          <button
            onClick={flip}
            className="press-scale inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] soft-shadow"
            aria-label="flip"
          >
            <ArrowDown size={16} />
          </button>
        </div>

        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
            <span>{t('swap.to', locale)}</span>
            {to ? (
              <span className="tnum">
                {formatAmount(to.balance, to.decimals, 6)} {to.symbol}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <AssetPicker value={to} onChange={setTo} assets={sortedByValue.filter((a) => a !== from)} />
            <span className="flex-1 text-right font-display text-3xl leading-none tnum text-[var(--color-ink-soft)]">
              {estOut !== null ? estOut.toFixed(estOut < 1 ? 6 : 4) : '—'}
            </span>
          </div>
          <div className="mt-1 text-right text-xs text-[var(--color-muted)] tnum">
            ≈ {estOut !== null && to?.usd ? formatFiat(estOut * to.usd, currency) : '—'}
          </div>
        </Card>
      </div>

      <Card className="mt-4 flex items-start gap-3 bg-[color-mix(in_srgb,var(--color-rose)_35%,var(--color-surface))] p-4">
        <Info size={16} className="mt-0.5 shrink-0 text-[var(--color-accent-ink)]" />
        <p className="text-sm text-[var(--color-ink-soft)]">{t('swap.notImplemented', locale)}</p>
      </Card>

      <div className="sticky bottom-0 mt-6 pb-2">
        <Button size="lg" block disabled>
          <Repeat size={16} /> {t('swap.comingSoon', locale)}
        </Button>
      </div>
    </Layout>
  )
}

function AssetPicker({
  value,
  onChange,
  assets,
}: {
  value: PricedAsset | null
  onChange: (a: PricedAsset) => void
  assets: PricedAsset[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="press-scale flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-bg-soft)] py-1 pl-1 pr-3"
      >
        {value ? (
          <>
            <TokenBadge symbol={value.symbol} chain={value.chain} size={28} logo={value.logo} />
            <span className="text-sm font-medium">{value.symbol}</span>
          </>
        ) : (
          <span className="px-2 text-sm text-[var(--color-muted)]">—</span>
        )}
      </button>
      {open ? (
        <div
          className="absolute left-0 top-[calc(100%+8px)] z-20 max-h-64 w-64 overflow-y-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-1 pop-shadow"
          onMouseLeave={() => setOpen(false)}
        >
          {assets.map((a) => (
            <button
              key={`${a.chain}-${a.kind}-${a.address ?? 'native'}`}
              className="press-scale flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-[var(--color-bg-soft)]"
              onClick={() => {
                onChange(a)
                setOpen(false)
              }}
            >
              <TokenBadge symbol={a.symbol} chain={a.chain} size={30} logo={a.logo} />
              <div className="flex-1">
                <div className="text-sm">{a.symbol}</div>
                <div className="tnum text-[11px] text-[var(--color-muted)]">
                  {formatAmount(a.balance, a.decimals, 4)}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
