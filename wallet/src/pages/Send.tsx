import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, CircleAlert } from 'lucide-react'
import { Contract, formatUnits, isAddress, parseUnits, type TransactionResponse } from 'ethers'
import { Layout } from '../components/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useWalletStore } from '../store/useWalletStore'
import { usePortfolio, type PricedAsset } from '../hooks/usePortfolio'
import { TokenBadge, ChainGlyph } from '../components/ChainGlyph'
import { ERC20_ABI } from '../lib/tokens'
import { getProvider } from '../lib/providers'
import { CHAINS } from '../lib/chains'
import { formatAmount, formatFiat, parseDecimalInput } from '../lib/format'
import { t } from '../lib/i18n'
import { useToast } from '../store/useToast'
import { storage } from '../lib/storage'
import { shortAddr } from '../lib/wallet'

type Step = 'form' | 'review' | 'success'

export function Send() {
  const locale = useWalletStore((s) => s.settings.language)
  const currency = useWalletStore((s) => s.settings.currency)
  const account = useWalletStore((s) => s.currentAccount())
  const signerGetter = useWalletStore((s) => s.currentSigner)
  const pushHistory = useWalletStore((s) => s.pushHistory)
  const { assets } = usePortfolio()
  const [params] = useSearchParams()
  const nav = useNavigate()
  const toast = useToast((s) => s.show)

  const preselectChain = params.get('chain')
  const preselectAddr = (params.get('token') || '').toLowerCase()

  const candidates = useMemo(() => {
    if (!assets.length) return assets
    return [...assets].sort((a, b) => b.valueUsd - a.valueUsd)
  }, [assets])

  const preselected =
    candidates.find((a) => {
      if (!preselectChain) return false
      if (a.chain !== preselectChain) return false
      if (preselectAddr === 'native') return a.kind === 'native'
      return a.address?.toLowerCase() === preselectAddr
    }) || candidates[0]

  const [asset, setAsset] = useState<PricedAsset | null>(preselected ?? null)
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [errTo, setErrTo] = useState<string | undefined>()
  const [errAmount, setErrAmount] = useState<string | undefined>()
  const [feeEstimate, setFeeEstimate] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const onAmount = (v: string) => setAmount(parseDecimalInput(v))

  const setMax = () => {
    if (!asset) return
    // For native tokens reserve ~0.0005 for gas; otherwise use full balance.
    if (asset.kind === 'native') {
      const reserveWei = parseUnits('0.0005', asset.decimals)
      const usable = asset.balance > reserveWei ? asset.balance - reserveWei : 0n
      setAmount(formatUnits(usable, asset.decimals))
    } else {
      setAmount(formatUnits(asset.balance, asset.decimals))
    }
  }

  const validate = (): boolean => {
    setErrTo(undefined)
    setErrAmount(undefined)
    if (!asset) return false
    if (!isAddress(to)) {
      setErrTo(t('send.invalidAddr', locale))
      return false
    }
    try {
      const parsed = parseUnits(amount || '0', asset.decimals)
      if (parsed <= 0n) {
        setErrAmount(t('send.invalidAmount', locale))
        return false
      }
      if (parsed > asset.balance) {
        setErrAmount(t('send.insufficient', locale))
        return false
      }
    } catch {
      setErrAmount(t('send.invalidAmount', locale))
      return false
    }
    return true
  }

  const goReview = async () => {
    if (!validate() || !asset) return
    setLoading(true)
    try {
      const provider = getProvider(asset.chain)
      const fee = await provider.getFeeData()
      // Assume 21k for native, 65k for ERC-20 as a rough hint.
      const gasEstimate = asset.kind === 'native' ? 21_000n : 65_000n
      const gasPrice = fee.maxFeePerGas ?? fee.gasPrice ?? 0n
      const feeWei = gasEstimate * gasPrice
      setFeeEstimate(formatUnits(feeWei, CHAINS[asset.chain].nativeDecimals))
      setStep('review')
    } finally {
      setLoading(false)
    }
  }

  const confirm = async () => {
    if (!asset) return
    const signer = signerGetter()
    if (!signer) return
    setLoading(true)
    try {
      const provider = getProvider(asset.chain)
      const wallet = signer.connect(provider)
      let tx: TransactionResponse
      if (asset.kind === 'native') {
        tx = await wallet.sendTransaction({
          to,
          value: parseUnits(amount, asset.decimals),
        })
      } else {
        const erc20 = new Contract(asset.address!, ERC20_ABI, wallet)
        tx = await erc20.transfer(to, parseUnits(amount, asset.decimals))
      }
      setTxHash(tx.hash)
      pushHistory({
        id: `${asset.chain}-${tx.hash}`,
        chain: asset.chain,
        hash: tx.hash,
        from: account!.address,
        to,
        valueWei: parseUnits(amount, asset.decimals).toString(),
        tokenAddress: asset.address,
        tokenSymbol: asset.symbol,
        tokenDecimals: asset.decimals,
        ts: Date.now(),
        status: 'pending',
        kind: 'send',
        note,
      })
      setStep('success')
      toast(t('send.success', locale))

      // Async wait for 1 confirmation then patch history.
      void (async () => {
        try {
          await tx.wait(1)
          const hist = storage.getHistory().map((h) =>
            h.hash === tx.hash ? { ...h, status: 'success' as const } : h,
          )
          storage.setHistory(hist)
        } catch {
          const hist = storage.getHistory().map((h) =>
            h.hash === tx.hash ? { ...h, status: 'failed' as const } : h,
          )
          storage.setHistory(hist)
        }
      })()
    } catch (e: unknown) {
      console.error(e)
      toast((e as Error)?.message?.slice(0, 120) || 'Error')
    } finally {
      setLoading(false)
    }
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

      {step === 'form' ? (
        <>
          <h1 className="font-display text-4xl leading-[1.05]">{t('send.title', locale)}</h1>

          {/* Asset picker */}
          <div className="mt-6">
            <span className="mb-1.5 block px-1 text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
              {locale === 'ru' ? 'Актив' : 'Asset'}
            </span>
            <Card className="p-2">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {candidates.map((c) => (
                  <button
                    key={`${c.chain}-${c.kind}-${c.address ?? 'native'}`}
                    onClick={() => setAsset(c)}
                    className={`press-scale flex min-w-[150px] items-center gap-2.5 rounded-2xl border px-3 py-2 text-left ${
                      asset === c
                        ? 'border-[var(--color-ink)] bg-[var(--color-bg-soft)]'
                        : 'border-[var(--color-line)]'
                    }`}
                  >
                    <TokenBadge symbol={c.symbol} chain={c.chain} size={34} logo={c.logo} />
                    <div>
                      <div className="text-sm font-medium">{c.symbol}</div>
                      <div className="tnum text-[11px] text-[var(--color-muted)]">
                        {formatAmount(c.balance, c.decimals, 4)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <Input
              label={t('send.to', locale)}
              placeholder={t('send.to.placeholder', locale)}
              value={to}
              onChange={(e) => setTo(e.target.value.trim())}
              error={errTo}
              autoCapitalize="none"
              autoCorrect="off"
            />
            <Input
              label={t('send.amount', locale)}
              placeholder="0.0"
              value={amount}
              onChange={(e) => onAmount(e.target.value)}
              inputMode="decimal"
              error={errAmount}
              suffix={
                <button
                  onClick={setMax}
                  type="button"
                  className="rounded-full bg-[var(--color-ink)] px-2.5 py-1 text-[11px] text-[var(--color-surface)]"
                >
                  {t('send.max', locale)}
                </button>
              }
            />
            {asset ? (
              <div className="-mt-1 flex items-center justify-between px-1 text-xs text-[var(--color-muted)]">
                <span className="tnum">
                  {formatAmount(asset.balance, asset.decimals, 6)} {asset.symbol}
                </span>
                <span className="tnum">
                  ≈{' '}
                  {asset.usd && amount
                    ? formatFiat(Number(amount) * asset.usd, currency)
                    : '—'}
                </span>
              </div>
            ) : null}
          </div>

          <div className="sticky bottom-0 mt-8 pb-2">
            <Button size="lg" block onClick={goReview} loading={loading} disabled={!asset}>
              {t('send.review', locale)}
            </Button>
          </div>
        </>
      ) : step === 'review' && asset ? (
        <>
          <h1 className="font-display text-4xl leading-[1.05]">{t('send.review', locale)}</h1>

          <Card className="mt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
                {locale === 'ru' ? 'Отправляете' : 'Sending'}
              </span>
              <div className="flex items-center gap-2">
                <TokenBadge symbol={asset.symbol} chain={asset.chain} size={28} logo={asset.logo} />
                <span className="tnum font-display text-2xl">
                  {amount} {asset.symbol}
                </span>
              </div>
            </div>
            <div className="border-t border-dashed border-[var(--color-line)]" />
            <Row
              k={t('send.to', locale)}
              v={<span className="font-mono text-[13px]">{shortAddr(to, 6)}</span>}
            />
            <Row
              k={t('network', locale)}
              v={
                <span className="inline-flex items-center gap-1.5">
                  <ChainGlyph chain={asset.chain} size={18} />
                  {CHAINS[asset.chain].name}
                </span>
              }
            />
            <Row
              k={t('send.fee', locale)}
              v={
                <span className="tnum text-sm">
                  {feeEstimate
                    ? `${Number(feeEstimate).toFixed(6)} ${CHAINS[asset.chain].nativeSymbol}`
                    : '—'}
                </span>
              }
            />
            {note ? <Row k={locale === 'ru' ? 'Заметка' : 'Note'} v={note} /> : null}
          </Card>

          <div className="mt-4">
            <Input
              label={locale === 'ru' ? 'Заметка (необязательно)' : 'Note (optional)'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={locale === 'ru' ? 'Для истории' : 'For your history'}
              maxLength={40}
            />
          </div>

          <div className="sticky bottom-0 mt-6 flex gap-3 pb-2">
            <Button variant="outline" size="lg" block onClick={() => setStep('form')}>
              {t('cancel', locale)}
            </Button>
            <Button variant="secondary" size="lg" block onClick={confirm} loading={loading}>
              {t('send.confirm', locale)}
            </Button>
          </div>
        </>
      ) : step === 'success' && asset && txHash ? (
        <div className="flex min-h-[70dvh] flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-success)_20%,var(--color-surface))]">
            <Check size={28} className="text-[var(--color-success)]" />
          </div>
          <h2 className="mt-5 font-display text-3xl">{t('send.success', locale)}</h2>
          <p className="mt-2 max-w-[20rem] text-sm text-[var(--color-ink-soft)]">
            {locale === 'ru'
              ? 'Транзакция отправлена в сеть. Подтверждение появится в истории.'
              : 'Broadcast to the network. Confirmation will appear in your history.'}
          </p>
          <a
            href={`${CHAINS[asset.chain].explorer}/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 text-sm underline underline-offset-4"
          >
            {locale === 'ru' ? 'Посмотреть в проводнике' : 'View on explorer'}
          </a>
          <div className="mt-8 flex gap-3">
            <Button variant="outline" onClick={() => nav('/history')}>
              {locale === 'ru' ? 'К истории' : 'History'}
            </Button>
            <Button onClick={() => nav('/home')}>{locale === 'ru' ? 'На главную' : 'Home'}</Button>
          </div>
        </div>
      ) : (
        <Card className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <CircleAlert size={14} /> {locale === 'ru' ? 'Нет активов' : 'No assets'}
        </Card>
      )}
    </Layout>
  )
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">{k}</span>
      <span className="text-sm text-[var(--color-ink)]">{v}</span>
    </div>
  )
}
