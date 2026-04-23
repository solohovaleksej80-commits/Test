import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Copy } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Layout } from '../components/Layout'
import { Card } from '../components/ui/Card'
import { useWalletStore } from '../store/useWalletStore'
import { CHAIN_LIST, CHAINS, type ChainKey } from '../lib/chains'
import { ChainGlyph } from '../components/ChainGlyph'
import { t } from '../lib/i18n'
import { useToast } from '../store/useToast'

export function Receive() {
  const locale = useWalletStore((s) => s.settings.language)
  const account = useWalletStore((s) => s.currentAccount())
  const enabledChains = useWalletStore((s) => s.settings.chains)
  const [chain, setChain] = useState<ChainKey>(enabledChains[0] || 'ethereum')
  const toast = useToast((s) => s.show)

  if (!account) return null
  const chainInfo = CHAINS[chain]

  const copy = async () => {
    await navigator.clipboard.writeText(account.address)
    toast(t('receive.copied', locale))
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/home"
          className="press-scale inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-sm"
        >
          <ArrowLeft size={14} /> {t('back', locale)}
        </Link>
      </div>

      <h1 className="font-display text-4xl leading-[1.05]">{t('receive.title', locale)}</h1>
      <p className="mt-2 max-w-[26rem] text-sm text-[var(--color-ink-soft)]">
        {t('receive.sub', locale)}
      </p>

      {/* Chain selector */}
      <div className="mt-5 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {CHAIN_LIST.filter((c) => enabledChains.includes(c.key)).map((c) => (
          <button
            key={c.key}
            onClick={() => setChain(c.key)}
            className={`press-scale flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${
              chain === c.key
                ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-surface)]'
                : 'border-[var(--color-line)] bg-[var(--color-surface)]'
            }`}
          >
            <ChainGlyph chain={c.key} size={18} />
            {c.short}
          </button>
        ))}
      </div>

      <Card className="mt-6 flex flex-col items-center gap-5 p-6">
        <div className="rounded-[28px] bg-white p-4 soft-shadow">
          <QRCodeSVG
            value={account.address}
            size={200}
            bgColor="#ffffff"
            fgColor="#1d1d1b"
            level="M"
            marginSize={0}
          />
        </div>
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
            {chainInfo.name}
          </div>
          <div className="mt-1.5 break-all text-center font-mono text-[13px]">{account.address}</div>
        </div>
        <button
          onClick={copy}
          className="press-scale inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm text-[var(--color-surface)]"
        >
          <Copy size={14} /> {t('receive.copy', locale)}
        </button>
      </Card>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-[var(--color-muted)]">
        {locale === 'ru'
          ? `Отправляйте только активы сети ${chainInfo.name}. Токены другой сети могут быть потеряны.`
          : `Send only assets on ${chainInfo.name}. Tokens from other networks may be lost.`}
      </p>
    </Layout>
  )
}
