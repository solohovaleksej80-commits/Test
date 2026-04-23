import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { formatUnits } from 'ethers'
import { fetchPortfolio, type AssetBalance } from '../lib/balances'
import { getPrices, type PriceEntry } from '../lib/prices'
import { useWalletStore } from '../store/useWalletStore'

export interface PricedAsset extends AssetBalance {
  usd?: number
  change24h?: number
  valueUsd: number // 0 if unknown
  humanBalance: number // Number(formatUnits(balance, decimals))
}

export function usePortfolio() {
  const account = useWalletStore((s) => s.currentAccount())
  const enabled = useWalletStore((s) => s.settings.chains)

  const [assets, setAssets] = useState<PricedAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const inflight = useRef(false)

  const load = useCallback(async () => {
    if (!account) return
    if (inflight.current) return
    inflight.current = true
    setLoading(true)
    try {
      const bals = await fetchPortfolio(account.address, enabled)
      const ids = Array.from(
        new Set(bals.map((b) => b.priceId).filter(Boolean) as string[]),
      )
      const prices: Record<string, PriceEntry> = ids.length ? await getPrices(ids) : {}
      const priced: PricedAsset[] = bals.map((b) => {
        const p = b.priceId ? prices[b.priceId] : undefined
        const human = Number(formatUnits(b.balance, b.decimals))
        const usd = p?.usd
        return {
          ...b,
          usd,
          change24h: p?.usd_24h_change,
          valueUsd: usd ? human * usd : 0,
          humanBalance: human,
        }
      })
      // Sort: highest USD value first, then non-zero balances, then rest
      priced.sort((a, b) => {
        if (b.valueUsd !== a.valueUsd) return b.valueUsd - a.valueUsd
        if (b.humanBalance !== a.humanBalance) return b.humanBalance - a.humanBalance
        return a.symbol.localeCompare(b.symbol)
      })
      setAssets(priced)
      setUpdatedAt(Date.now())
    } finally {
      setLoading(false)
      inflight.current = false
    }
  }, [account, enabled])

  useEffect(() => {
    void load()
    // Refetch every 45s
    const id = setInterval(() => void load(), 45_000)
    return () => clearInterval(id)
  }, [load])

  const totalUsd = useMemo(() => assets.reduce((s, a) => s + a.valueUsd, 0), [assets])
  const changeUsd = useMemo(
    () =>
      assets.reduce((s, a) => {
        if (!a.change24h || !a.valueUsd) return s
        const base = a.valueUsd / (1 + a.change24h / 100)
        return s + (a.valueUsd - base)
      }, 0),
    [assets],
  )
  const changePct = totalUsd ? (changeUsd / totalUsd) * 100 : 0

  return { assets, loading, updatedAt, totalUsd, changeUsd, changePct, reload: load }
}
