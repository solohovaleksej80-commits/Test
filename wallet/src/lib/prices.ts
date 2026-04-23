// Very small CoinGecko client for USD prices + 24h change.
// No API key required for basic endpoints (rate-limited, good enough for a demo wallet).

const BASE = 'https://api.coingecko.com/api/v3'

export interface PriceEntry {
  usd: number
  usd_24h_change: number
  updatedAt: number
}

const cache = new Map<string, PriceEntry>()
const CACHE_MS = 60_000

export async function getPrices(ids: string[]): Promise<Record<string, PriceEntry>> {
  const now = Date.now()
  const needed = ids.filter((id) => {
    const c = cache.get(id)
    return !c || now - c.updatedAt > CACHE_MS
  })

  if (needed.length) {
    const url = `${BASE}/simple/price?ids=${encodeURIComponent(
      needed.join(','),
    )}&vs_currencies=usd&include_24hr_change=true`
    try {
      const res = await fetch(url)
      if (res.ok) {
        const data = (await res.json()) as Record<
          string,
          { usd?: number; usd_24h_change?: number }
        >
        for (const id of needed) {
          const e = data[id]
          if (e && typeof e.usd === 'number') {
            cache.set(id, {
              usd: e.usd,
              usd_24h_change: e.usd_24h_change ?? 0,
              updatedAt: now,
            })
          }
        }
      }
    } catch {
      // Silent: we'll just return what we have.
    }
  }

  const out: Record<string, PriceEntry> = {}
  for (const id of ids) {
    const c = cache.get(id)
    if (c) out[id] = c
  }
  return out
}

/** 14-day sparkline data (array of closing prices). */
export async function getSparkline(id: string, days = 7): Promise<number[]> {
  const url = `${BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=daily`
  try {
    const res = await fetch(url)
    if (!res.ok) return []
    const data = (await res.json()) as { prices?: [number, number][] }
    return (data.prices ?? []).map((p) => p[1])
  } catch {
    return []
  }
}
