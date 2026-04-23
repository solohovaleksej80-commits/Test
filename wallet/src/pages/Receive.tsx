import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Layout } from '../components/Layout'
import { Card } from '../components/ui/Card'
import { useWalletStore } from '../store/useWalletStore'
import { CHAIN_LIST, CHAINS, type ChainKey } from '../lib/chains'
import { ChainGlyph, TokenBadge } from '../components/ChainGlyph'
import { DEFAULT_TOKENS, type TokenInfo } from '../lib/tokens'
import { t } from '../lib/i18n'
import { useToast } from '../store/useToast'
import { shortAddr } from '../lib/wallet'

/** An asset option the user can pick on Receive. */
interface AssetOption {
  kind: 'native' | 'erc20'
  symbol: string
  name: string
  logo?: string
  /** Chains that support this asset. */
  chains: ChainKey[]
  /** For ERC-20s — map chain → token info. */
  tokensByChain?: Record<string, TokenInfo>
}

/** Build the option list: "Native" (all chains) + one entry per multi-chain symbol. */
function buildAssetOptions(enabled: ChainKey[]): AssetOption[] {
  const out: AssetOption[] = []

  out.push({
    kind: 'native',
    symbol: 'NATIVE',
    name: 'Native coin',
    logo: undefined,
    chains: enabled,
  })

  // Group ERC-20 tokens by symbol
  const bySymbol = new Map<string, TokenInfo[]>()
  for (const tk of DEFAULT_TOKENS) {
    if (!enabled.includes(tk.chain)) continue
    const list = bySymbol.get(tk.symbol) ?? []
    list.push(tk)
    bySymbol.set(tk.symbol, list)
  }

  // Prioritize stablecoins + BTC wrappers first, then others by count desc
  const priority = ['USDT', 'USDC', 'WBTC', 'DAI']
  const entries = Array.from(bySymbol.entries()).sort(([a, la], [b, lb]) => {
    const pa = priority.indexOf(a)
    const pb = priority.indexOf(b)
    if (pa !== -1 || pb !== -1) return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb)
    if (lb.length !== la.length) return lb.length - la.length
    return a.localeCompare(b)
  })

  for (const [symbol, list] of entries) {
    const tokensByChain: Record<string, TokenInfo> = {}
    for (const tk of list) tokensByChain[tk.chain] = tk
    out.push({
      kind: 'erc20',
      symbol,
      name: list[0].name,
      logo: list[0].logo,
      chains: list.map((tk) => tk.chain),
      tokensByChain,
    })
  }

  return out
}

export function Receive() {
  const locale = useWalletStore((s) => s.settings.language)
  const account = useWalletStore((s) => s.currentAccount())
  const enabledChains = useWalletStore((s) => s.settings.chains)
  const toast = useToast((s) => s.show)

  const options = useMemo(() => buildAssetOptions(enabledChains), [enabledChains])
  const [assetKey, setAssetKey] = useState<string>('NATIVE')
  const selected = options.find((o) => o.symbol === assetKey) ?? options[0]

  const availableChains = selected.chains.filter((c) => enabledChains.includes(c))
  const [chain, setChain] = useState<ChainKey>(availableChains[0] || 'ethereum')

  // If user picks an asset that doesn't exist on the current chain, auto-switch.
  const effectiveChain = availableChains.includes(chain)
    ? chain
    : availableChains[0] || 'ethereum'

  const [copiedAddr, setCopiedAddr] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)

  if (!account) return null
  const chainInfo = CHAINS[effectiveChain]
  const token = selected.kind === 'erc20' ? selected.tokensByChain?.[effectiveChain] : undefined

  const copy = async (text: string, setter: (v: boolean) => void, label: string) => {
    await navigator.clipboard.writeText(text)
    toast(label)
    setter(true)
    setTimeout(() => setter(false), 1400)
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

      {/* Asset selector */}
      <div className="mt-5">
        <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
          {locale === 'ru' ? 'Актив' : 'Asset'}
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {options.map((o) => {
            const active = selected === o
            return (
              <button
                key={o.symbol}
                onClick={() => setAssetKey(o.symbol)}
                className={`press-scale flex items-center gap-2 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-sm ${
                  active
                    ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-surface)]'
                    : 'border-[var(--color-line)] bg-[var(--color-surface)]'
                }`}
              >
                {o.kind === 'native' ? (
                  <span className="text-xs">
                    {locale === 'ru' ? 'Монета сети' : 'Native'}
                  </span>
                ) : (
                  <>
                    <TokenBadge
                      symbol={o.symbol}
                      chain={o.chains[0]}
                      size={20}
                      logo={o.logo}
                      showChain={false}
                    />
                    <span>{o.symbol}</span>
                    <span
                      className={`tnum text-[10px] ${
                        active ? 'text-[var(--color-surface)]/70' : 'text-[var(--color-muted)]'
                      }`}
                    >
                      · {o.chains.length}
                    </span>
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chain selector */}
      <div className="mt-4">
        <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
          {locale === 'ru' ? 'Сеть' : 'Network'}
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {CHAIN_LIST.filter((c) => availableChains.includes(c.key)).map((c) => (
            <button
              key={c.key}
              onClick={() => setChain(c.key)}
              className={`press-scale flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${
                effectiveChain === c.key
                  ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-surface)]'
                  : 'border-[var(--color-line)] bg-[var(--color-surface)]'
              }`}
            >
              <ChainGlyph chain={c.key} size={18} useChainLogo />
              {c.short}
            </button>
          ))}
        </div>
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

        <div className="w-full text-center">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
            {selected.kind === 'erc20' ? (
              <>
                <TokenBadge
                  symbol={selected.symbol}
                  chain={effectiveChain}
                  size={16}
                  logo={selected.logo}
                  showChain={false}
                />
                {selected.symbol} · {chainInfo.name}
              </>
            ) : (
              <>
                <ChainGlyph chain={effectiveChain} size={16} useChainLogo />
                {chainInfo.name}
              </>
            )}
          </div>
          <div className="mt-2 break-all text-center font-mono text-[13px]">
            {account.address}
          </div>
        </div>

        <button
          onClick={() =>
            copy(account.address, setCopiedAddr, t('receive.copied', locale))
          }
          className="press-scale inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm text-[var(--color-surface)]"
        >
          {copiedAddr ? <Check size={14} /> : <Copy size={14} />}{' '}
          {t('receive.copy', locale)}
        </button>
      </Card>

      {/* Token contract info for ERC-20 assets */}
      {token ? (
        (() => {
          const display = token.addressChecksum ?? token.address
          return (
            <Card className="mt-3 flex items-center justify-between gap-3 p-3.5">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  {locale === 'ru' ? 'Контракт токена' : 'Token contract'}
                </div>
                <div className="mt-1 font-mono text-[12px]" title={display}>
                  {shortAddr(display, 8)}
                </div>
                <div className="mt-0.5 text-[11px] text-[var(--color-muted)]">
                  {token.name} · {token.decimals} dec
                </div>
              </div>
              <button
                onClick={() =>
                  copy(
                    display,
                    setCopiedToken,
                    locale === 'ru' ? 'Контракт скопирован' : 'Contract copied',
                  )
                }
                className="press-scale inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs"
              >
                {copiedToken ? <Check size={12} /> : <Copy size={12} />}
                {locale === 'ru' ? 'Копировать' : 'Copy'}
              </button>
            </Card>
          )
        })()
      ) : null}

      <p className="mt-4 text-center text-[11px] leading-relaxed text-[var(--color-muted)]">
        {locale === 'ru'
          ? `Отправляйте только ${
              selected.kind === 'erc20' ? `${selected.symbol} ` : ''
            }в сети ${chainInfo.name}. Токены другой сети могут быть потеряны.`
          : `Send only ${
              selected.kind === 'erc20' ? `${selected.symbol} ` : ''
            }on ${chainInfo.name}. Assets from other networks may be lost.`}
      </p>
    </Layout>
  )
}
