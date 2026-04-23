import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, Repeat, ArrowLeft } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { Layout } from '../components/Layout'
import { Card } from '../components/ui/Card'
import { usePortfolio } from '../hooks/usePortfolio'
import { TokenBadge, ChainGlyph } from '../components/ChainGlyph'
import { CHAINS, type ChainKey } from '../lib/chains'
import { formatAmount, formatFiat, formatPercent } from '../lib/format'
import { getSparkline } from '../lib/prices'
import { useWalletStore } from '../store/useWalletStore'
import { t } from '../lib/i18n'
import clsx from 'clsx'

export function AssetDetail() {
  const { chain, id } = useParams<{ chain: ChainKey; id: string }>()
  const { assets } = usePortfolio()
  const locale = useWalletStore((s) => s.settings.language)
  const currency = useWalletStore((s) => s.settings.currency)
  const nav = useNavigate()
  const [spark, setSpark] = useState<{ v: number }[]>([])

  const asset = useMemo(() => {
    return assets.find((a) => {
      if (a.chain !== chain) return false
      if (id === 'native') return a.kind === 'native'
      return a.address?.toLowerCase() === id?.toLowerCase()
    })
  }, [assets, chain, id])

  useEffect(() => {
    if (!asset?.priceId) return
    void getSparkline(asset.priceId, 14).then((arr) =>
      setSpark(arr.map((v) => ({ v }))),
    )
  }, [asset?.priceId])

  if (!asset || !chain) {
    return (
      <Layout>
        <Link
          to="/home"
          className="press-scale inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-sm"
        >
          <ArrowLeft size={14} /> {t('back', locale)}
        </Link>
        <Card className="mt-8 text-center text-[var(--color-muted)]">
          {locale === 'ru' ? 'Актив не найден' : 'Asset not found'}
        </Card>
      </Layout>
    )
  }

  const info = CHAINS[chain]
  const tone = asset.change24h && asset.change24h >= 0 ? 'var(--color-success)' : 'var(--color-danger)'

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/home"
          className="press-scale inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-sm"
        >
          <ArrowLeft size={14} /> {t('back', locale)}
        </Link>
        <span className="chip">
          <ChainGlyph chain={chain} size={14} /> {info.name}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <TokenBadge symbol={asset.symbol} chain={chain} size={58} />
        <div>
          <div className="font-display text-3xl leading-none">{asset.symbol}</div>
          <div className="text-sm text-[var(--color-muted)]">{asset.name}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="font-display text-[42px] leading-none tnum">
          {formatAmount(asset.balance, asset.decimals)} <span className="text-[var(--color-muted)]">{asset.symbol}</span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <span className="tnum">{asset.valueUsd > 0 ? formatFiat(asset.valueUsd, currency) : '—'}</span>
          {asset.change24h !== undefined ? (
            <span
              className={clsx(
                'tnum',
                asset.change24h >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
              )}
            >
              {formatPercent(asset.change24h)}
            </span>
          ) : null}
        </div>
      </div>

      {spark.length ? (
        <Card className="mt-5 h-40 p-0 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={tone} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={tone} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={tone}
                strokeWidth={2}
                fill="url(#spark)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      ) : null}

      <div className="mt-5 grid grid-cols-3 gap-2">
        <button
          onClick={() =>
            nav(
              `/send?chain=${chain}&token=${asset.kind === 'native' ? 'native' : asset.address}`,
            )
          }
          className="press-scale flex flex-col items-center gap-1.5 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] py-3 soft-shadow"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-surface)]">
            <ArrowUpRight size={18} />
          </span>
          <span className="text-[12.5px]">{t('asset.send', locale)}</span>
        </button>
        <button
          onClick={() => nav('/receive')}
          className="press-scale flex flex-col items-center gap-1.5 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] py-3 soft-shadow"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-surface)]">
            <ArrowDownLeft size={18} />
          </span>
          <span className="text-[12.5px]">{t('asset.receive', locale)}</span>
        </button>
        <button
          onClick={() => nav('/swap')}
          className="press-scale flex flex-col items-center gap-1.5 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] py-3 soft-shadow"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-surface)]">
            <Repeat size={18} />
          </span>
          <span className="text-[12.5px]">{t('asset.swap', locale)}</span>
        </button>
      </div>

      <Card className="mt-5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
            {t('network', locale)}
          </span>
          <span className="text-sm">{info.name}</span>
        </div>
        {asset.address ? (
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
              {locale === 'ru' ? 'Контракт' : 'Contract'}
            </span>
            <a
              href={`${info.explorer}/address/${asset.address}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[12px] underline underline-offset-4"
            >
              {asset.address.slice(0, 10)}…{asset.address.slice(-6)}
            </a>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
            {locale === 'ru' ? 'Точность' : 'Decimals'}
          </span>
          <span className="tnum text-sm">{asset.decimals}</span>
        </div>
      </Card>
    </Layout>
  )
}
