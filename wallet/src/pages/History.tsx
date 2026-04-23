import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { Layout } from '../components/Layout'
import { Card } from '../components/ui/Card'
import { useWalletStore } from '../store/useWalletStore'
import { storage, type HistoryEntry } from '../lib/storage'
import { CHAINS } from '../lib/chains'
import { formatAmount, timeAgo } from '../lib/format'
import { shortAddr } from '../lib/wallet'
import { t } from '../lib/i18n'
import clsx from 'clsx'

export function History() {
  const locale = useWalletStore((s) => s.settings.language)
  const [entries] = useState<HistoryEntry[]>(() => storage.getHistory())

  return (
    <Layout>
      <h1 className="font-display text-4xl leading-[1.05]">{t('history.title', locale)}</h1>

      <div className="mt-6 flex flex-col gap-2">
        {entries.length === 0 ? (
          <Card className="text-center text-[var(--color-muted)]">{t('history.empty', locale)}</Card>
        ) : (
          entries.map((e) => {
            const chain = CHAINS[e.chain]
            const outgoing = e.kind === 'send'
            const decimals = e.tokenDecimals ?? chain.nativeDecimals
            const symbol = e.tokenSymbol ?? chain.nativeSymbol
            return (
              <a
                key={e.id}
                href={`${chain.explorer}/tx/${e.hash}`}
                target="_blank"
                rel="noreferrer"
                className="press-scale flex items-center gap-3 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3.5 soft-shadow"
              >
                <span
                  className={clsx(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    outgoing
                      ? 'bg-[color-mix(in_srgb,var(--color-accent)_22%,var(--color-surface))] text-[var(--color-accent-ink)]'
                      : 'bg-[color-mix(in_srgb,var(--color-success)_22%,var(--color-surface))] text-[var(--color-success)]',
                  )}
                >
                  {outgoing ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {outgoing
                        ? locale === 'ru'
                          ? 'Отправлено'
                          : 'Sent'
                        : locale === 'ru'
                          ? 'Получено'
                          : 'Received'}
                    </span>
                    <span className="text-xs text-[var(--color-muted)]">
                      {chain.short} · {timeAgo(e.ts, locale)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-[var(--color-muted)]">
                    {outgoing ? '→ ' : '← '}
                    <span className="font-mono">{shortAddr(outgoing ? e.to : e.from)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={clsx(
                      'tnum font-medium',
                      outgoing ? 'text-[var(--color-ink)]' : 'text-[var(--color-success)]',
                    )}
                  >
                    {outgoing ? '−' : '+'}
                    {formatAmount(e.valueWei, decimals)} {symbol}
                  </div>
                  <div className="text-[11px] capitalize text-[var(--color-muted)]">
                    {e.status}
                  </div>
                </div>
              </a>
            )
          })
        )}
      </div>
    </Layout>
  )
}
