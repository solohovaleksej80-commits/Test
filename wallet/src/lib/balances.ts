import { Contract, type JsonRpcProvider } from 'ethers'
import { CHAINS, type ChainKey } from './chains'
import { getProvider } from './providers'
import { DEFAULT_TOKENS, ERC20_ABI, type TokenInfo } from './tokens'
import { storage, type CustomToken } from './storage'

export interface AssetBalance {
  chain: ChainKey
  kind: 'native' | 'erc20'
  token?: TokenInfo // undefined for native
  symbol: string
  name: string
  decimals: number
  balance: bigint
  address?: string // contract address for ERC-20
  priceId?: string // coingeckoId
  logo?: string // PNG logo URL for the asset itself
}

async function fetchNativeBalance(
  provider: JsonRpcProvider,
  address: string,
  chain: ChainKey,
): Promise<AssetBalance> {
  const info = CHAINS[chain]
  let bal: bigint
  try {
    bal = await provider.getBalance(address)
  } catch {
    // RPC failures: still return a zero-balance entry so the UI shows the
    // chain's native asset and the user can retry later.
    bal = 0n
  }
  return {
    chain,
    kind: 'native',
    symbol: info.nativeSymbol,
    name: info.nativeName,
    decimals: info.nativeDecimals,
    balance: bal,
    priceId: info.coingeckoId,
    logo: info.logo,
  }
}

async function fetchErc20Balance(
  provider: JsonRpcProvider,
  address: string,
  token: TokenInfo,
): Promise<AssetBalance> {
  let bal: bigint = 0n
  try {
    const contract = new Contract(token.address, ERC20_ABI, provider)
    bal = await contract.balanceOf(address)
  } catch {
    // Swallow per-token RPC errors: keep the asset visible with zero balance
    // so the top-10 / watchlist still displays on flaky public RPCs.
  }
  return {
    chain: token.chain,
    kind: 'erc20',
    token,
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    balance: bal,
    address: token.address,
    priceId: token.coingeckoId,
    logo: token.logo,
  }
}

export async function fetchPortfolio(
  address: string,
  enabledChains: ChainKey[],
): Promise<AssetBalance[]> {
  const custom = storage.getCustomTokens()
  const allTokens: TokenInfo[] = [...DEFAULT_TOKENS, ...custom].filter((tk) =>
    enabledChains.includes(tk.chain),
  )

  const tasks: Promise<AssetBalance>[] = []
  for (const chain of enabledChains) {
    const provider = getProvider(chain)
    tasks.push(fetchNativeBalance(provider, address, chain))
    const chainTokens = allTokens.filter((t) => t.chain === chain)
    for (const t of chainTokens) tasks.push(fetchErc20Balance(provider, address, t))
  }

  const results = await Promise.allSettled(tasks)
  const out: AssetBalance[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') out.push(r.value)
  }
  return out
}

export async function probeErc20(chain: ChainKey, addr: string): Promise<CustomToken | null> {
  try {
    const provider = getProvider(chain)
    const contract = new Contract(addr, ERC20_ABI, provider)
    const [symbol, name, decimals] = await Promise.all([
      contract.symbol() as Promise<string>,
      contract.name() as Promise<string>,
      contract.decimals() as Promise<bigint>,
    ])
    return {
      chain,
      address: addr.toLowerCase(),
      symbol,
      name,
      decimals: Number(decimals),
    }
  } catch {
    return null
  }
}
