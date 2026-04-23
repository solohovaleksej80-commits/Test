import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowDownLeft, Repeat, Wallet as WalletIcon, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { Layout } from '../components/Layout'
import { Card, SectionHeader } from '../components/ui/Card'
import { useWalletStore } from '../store/useWalletStore'
import { t } from '../lib/i18n'
import { AccountHeader } from '../components/AccountHeader'
import { usePortfolio, type PricedAsset } from '../hooks/usePortfolio'
import { formatAmount, formatFiat, formatPercent } from '../lib/format'
import { TokenBadge } from '../components/ChainGlyph'
import clsx from 'clsx'

export function Home() {
  const locale = useWalletStore((s) => s.settings.language)
  const currency = useWalletStore((s) => s.settings.currency)
  const hide = useWalletStore((s) => s.settings.hideBalances)
  const toggleHide = useWalletStore((s) => s.toggleHideBalances)

  const { assets, totalUsd, changePct, loading, reload } = usePortfolio()

  const visibleAssets = assets.filter((a) => a.humanBalance > 0 || a.kind === 'native')

  return (
    <Layout>
      <AccountHeader />

      {/* Hero balance */}
      <section className="mt-10">
        <div className="flex items-center gap-2 px-1 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
          {t('home.total', locale)}
          <button
            onClick={toggleHide}
            aria-label={hide ? t('home.show', locale) : t('home.hide', locale)}
            className="press-scale rounded-full p-1 hover:bg-[var(--color-bg-soft)]"
          >
            {hide ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
          <button
            onClick={() => void reload()}
            aria-label="refresh"
            className={clsx(
              'press-scale rounded-full p-1 hover:bg-[var(--color-bg-soft)]',
              loading && 'animate-spin',
            )}
          >
            <RefreshCw size={12} />
          </button>
        </div>
        <div className="mt-1 flex items-baseline gap-3">
          <span className="font-display text-[52px] leading-none tracking-[-0.02em] tnum">
            {hide ? '••••••' : formatFiat(totalUsd, currency)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <span
            className={clsx(
              'tnum',
              changePct >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
            )}
          >
            {hide ? '••' : formatPercent(changePct)} · 24ч
          </span>
        </div>
      </section>

      {/* Action row */}
      <section className="mt-8 grid grid-cols-4 gap-2">
        <ActionTile to="/send" icon={<ArrowUpRight size={20} />} label={t('home.send', locale)} />
        <ActionTile
          to="/receive"
          icon={<ArrowDownLeft size={20} />}
          label={t('home.receive', locale)}
        />
        <ActionTile to="/swap" icon={<Repeat size={20} />} label={t('home.swap', locale)} />
        <ActionTile
          to="/discover"
          icon={<WalletIcon size={20} />}
          label={t('home.buy', locale)}
          dim
        />
      </section>

      {/* Allocation strip */}
      {totalUsd > 0 ? <AllocationStrip assets={visibleAssets} total={totalUsd} /> : null}

      {/* Assets list */}
      <section className="mt-8">
        <SectionHeader
          title={t('home.assets', locale)}
          action={
            <span className="tnum text-xs text-[var(--color-muted)]">
              {visibleAssets.length}
            </span>
          }
        />
        <div className="flex flex-col gap-2">
          {visibleAssets.length === 0 ? (
            <Card className="text-center text-[var(--color-muted)]">{t('home.empty', locale)}</Card>
          ) : (
            visibleAssets.map((a) => <AssetRow key={`${a.chain}-${a.kind}-${a.address ?? 'native'}`} a={a} hide={hide} />)
          )}
        </div>
      </section>
    </Layout>
  )
}

function ActionTile({
  to,
  icon,
  label,
  dim,
}: {
  to: string
  icon: React.ReactNode
  label: string
  dim?: boolean
}) {
  return (
    <Link
      to={to}
      className="press-scale flex flex-col items-center gap-1.5 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] py-3 soft-shadow"
    >
      <span
        className={clsx(
          'flex h-10 w-10 items-center justify-center rounded-full',
          dim ? 'bg-[var(--color-bg-soft)] text-[var(--color-muted)]' : 'bg-[var(--color-ink)] text-[var(--color-surface)]',
        )}
      >
        {icon}
      </span>
      <span className="text-[12.5px]">{label}</span>
    </Link>
  )
}

function AllocationStrip({ assets, total }: { assets: PricedAsset[]; total: number }) {
  const slices = assets
    .filter((a) => a.valueUsd > 0)
    .slice(0, 6)
    .map((a) => ({ a, pct: (a.valueUsd / total) * 100 }))
  if (!slices.length) return null
  return (
    <div className="mt-6">
      <div className="flex h-2 overflow-hidden rounded-full bg-[var(--color-bg-soft)]">
        {slices.map(({ a, pct }, i) => (
          <div
            key={`${a.chain}-${a.symbol}-${i}`}
            style={{ width: `${pct}%`, background: `var(--color-accent)` }}
            className="h-full"
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[var(--color-muted)]">
        {slices.map(({ a, pct }) => (
          <span key={`${a.chain}-${a.symbol}`} className="tnum">
            {a.symbol} {pct.toFixed(1)}%
          </span>
        ))}
      </div>
    </div>
  )
}

function AssetRow({ a, hide }: { a: PricedAsset; hide: boolean }) {
  return (
    <Link
      to={`/asset/${a.chain}/${a.kind === 'native' ? 'native' : a.address}`}
      className="press-scale flex items-center gap-3 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3.5 soft-shadow"
    >
      <TokenBadge symbol={a.symbol} chain={a.chain} size={44} />
      <div className="flex flex-1 items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-medium">{a.symbol}</span>
            <span className="truncate text-xs text-[var(--color-muted)]">· {a.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--color-muted)] tnum">
            {a.usd ? formatFiat(a.usd) : '—'}
            {a.change24h !== undefined ? (
              <span
                className={clsx(
                  'ml-1 tnum',
                  a.change24h >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
                )}
              >
                {formatPercent(a.change24h)}
              </span>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <div className="tnum font-medium">
            {hide ? '•••' : formatAmount(a.balance, a.decimals)}
          </div>
          <div className="tnum text-xs text-[var(--color-muted)]">
            {hide ? '•••' : a.valueUsd > 0 ? formatFiat(a.valueUsd) : '—'}
          </div>
        </div>
      </div>
    </Link>
  )
}
