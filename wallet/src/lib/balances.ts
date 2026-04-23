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
}

async function fetchNativeBalance(
  provider: JsonRpcProvider,
  address: string,
  chain: ChainKey,
): Promise<AssetBalance> {
  const info = CHAINS[chain]
  const bal = await provider.getBalance(address)
  return {
    chain,
    kind: 'native',
    symbol: info.nativeSymbol,
    name: info.nativeName,
    decimals: info.nativeDecimals,
    balance: bal,
    priceId: info.coingeckoId,
  }
}

async function fetchErc20Balance(
  provider: JsonRpcProvider,
  address: string,
  token: TokenInfo,
): Promise<AssetBalance | null> {
  try {
    const contract = new Contract(token.address, ERC20_ABI, provider)
    const bal: bigint = await contract.balanceOf(address)
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
    }
  } catch {
    return null
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

  const tasks: Promise<AssetBalance | null>[] = []
  for (const chain of enabledChains) {
    const provider = getProvider(chain)
    tasks.push(fetchNativeBalance(provider, address, chain))
    const chainTokens = allTokens.filter((t) => t.chain === chain)
    for (const t of chainTokens) tasks.push(fetchErc20Balance(provider, address, t))
  }

  const results = await Promise.allSettled(tasks)
  const out: AssetBalance[] = []
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) out.push(r.value)
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
