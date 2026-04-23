import { CHAINS, type ChainKey } from './chains'

export interface TokenInfo {
  chain: ChainKey
  /** Lowercase ERC-20 contract address (kept lowercase for equality checks). */
  address: string
  /**
   * EIP-55 checksummed address — used for CDN URLs and display.
   * Optional because user-imported custom tokens may only have a lowercase address.
   */
  addressChecksum?: string
  symbol: string
  name: string
  decimals: number
  coingeckoId?: string
  /** PNG logo URL. */
  logo?: string
  /** Market-cap rank, used to group "Top-10" style lists. */
  rank?: number
}

const TW = 'https://assets-cdn.trustwallet.com/blockchains'
function tokenLogo(chain: ChainKey, checksum: string): string {
  return `${TW}/${CHAINS[chain].twSlug}/assets/${checksum}/logo.png`
}

/**
 * Shorthand: build a TokenInfo from a checksummed address.
 * Stores `address` lowercase (for existing lookup/eq logic)
 * and `addressChecksum` for CDN + display.
 */
function tk(
  chain: ChainKey,
  addressChecksum: string,
  symbol: string,
  name: string,
  decimals: number,
  coingeckoId: string,
  rank?: number,
  logoOverride?: string,
): TokenInfo {
  return {
    chain,
    address: addressChecksum.toLowerCase(),
    addressChecksum,
    symbol,
    name,
    decimals,
    coingeckoId,
    logo: logoOverride ?? tokenLogo(chain, addressChecksum),
    rank,
  }
}

/**
 * Curated token catalog covering the top-10 cryptocurrencies by market cap via
 * their real EVM deployments / canonical bridges:
 *
 *   1  BTC   — WBTC (ETH/Polygon/Arbitrum)
 *   2  ETH   — native on ETH/Arbitrum/Base/Optimism
 *   3  USDT  — on all 6 chains
 *   4  XRP   — Binance-Peg XRP (BSC)
 *   5  SOL   — Wormhole Wrapped SOL (ETH)
 *   6  BNB   — native on BSC + ERC-20 on ETH
 *   7  USDC  — on all 6 chains
 *   8  DOGE  — Binance-Peg DOGE (BSC)
 *   9  ADA   — Binance-Peg ADA (BSC)
 *  10  TRX   — Binance-Peg TRX (BSC)
 *
 * Plus common utility tokens: LINK, DAI, SHIB.
 *
 * All addresses below are EIP-55 checksummed so they match TrustWallet asset CDN paths.
 */
export const DEFAULT_TOKENS: TokenInfo[] = [
  // ---------- USDT across all 6 chains (rank 3) ----------
  tk('ethereum', '0xdAC17F958D2ee523a2206206994597C13D831ec7', 'USDT', 'Tether USD', 6, 'tether', 3),
  tk('polygon', '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', 'USDT', 'Tether USD', 6, 'tether', 3),
  tk('bsc', '0x55d398326f99059fF775485246999027B3197955', 'USDT', 'Tether USD', 18, 'tether', 3),
  tk('arbitrum', '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', 'USDT', 'Tether USD', 6, 'tether', 3),
  tk('optimism', '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', 'USDT', 'Tether USD', 6, 'tether', 3),
  tk('base', '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', 'USDT', 'Tether USD', 6, 'tether', 3),

  // ---------- USDC across all 6 chains (rank 7) ----------
  tk('ethereum', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 'USDC', 'USD Coin', 6, 'usd-coin', 7),
  tk('polygon', '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', 'USDC', 'USD Coin', 6, 'usd-coin', 7),
  tk('bsc', '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', 'USDC', 'USD Coin', 18, 'usd-coin', 7),
  tk('arbitrum', '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', 'USDC', 'USD Coin', 6, 'usd-coin', 7),
  tk('optimism', '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', 'USDC', 'USD Coin', 6, 'usd-coin', 7),
  tk('base', '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 'USDC', 'USD Coin', 6, 'usd-coin', 7),

  // ---------- BTC wrappers (rank 1) ----------
  tk('ethereum', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 'WBTC', 'Wrapped Bitcoin', 8, 'wrapped-bitcoin', 1),
  tk('polygon', '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', 'WBTC', 'Wrapped Bitcoin', 8, 'wrapped-bitcoin', 1),
  tk('arbitrum', '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', 'WBTC', 'Wrapped Bitcoin', 8, 'wrapped-bitcoin', 1),

  // ---------- BNB ERC-20 on Ethereum (rank 6 — native BNB on BSC is handled by CHAINS.bsc) ----------
  tk('ethereum', '0xB8c77482e45F1F44dE1745F52C74426C631bDD52', 'BNB', 'BNB', 18, 'binancecoin', 6),

  // ---------- SOL Wormhole Wrapped on Ethereum (rank 5) ----------
  tk(
    'ethereum',
    '0xD31a59c85aE9D8edEFeC411D448f90841571b89c',
    'SOL',
    'Wrapped SOL',
    9,
    'solana',
    5,
  ),

  // ---------- XRP Binance-Peg on BSC (rank 4) ----------
  tk('bsc', '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE', 'XRP', 'XRP', 18, 'ripple', 4),

  // ---------- DOGE Binance-Peg on BSC (rank 8) ----------
  tk('bsc', '0xbA2aE424d960c26247Dd6c32edC70B295c744C43', 'DOGE', 'Dogecoin', 8, 'dogecoin', 8),

  // ---------- ADA Binance-Peg on BSC (rank 9) ----------
  tk('bsc', '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47', 'ADA', 'Cardano', 18, 'cardano', 9),

  // ---------- TRX Binance-Peg on BSC (rank 10) ----------
  tk('bsc', '0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3', 'TRX', 'TRON', 6, 'tron', 10),

  // ---------- Utility tokens (not strictly top-10) ----------
  tk('ethereum', '0x6B175474E89094C44Da98b954EedeAC495271d0F', 'DAI', 'Dai', 18, 'dai'),
  tk('ethereum', '0x514910771AF9Ca656af840dff83E8264EcF986CA', 'LINK', 'Chainlink', 18, 'chainlink'),
  tk('ethereum', '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', 'SHIB', 'Shiba Inu', 18, 'shiba-inu'),
]

export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
]

/** List of stable/bridge asset symbols that live on multiple chains. */
export const MULTI_CHAIN_SYMBOLS = ['USDT', 'USDC', 'WBTC'] as const

/** Returns all TokenInfo entries that share a symbol across different chains. */
export function tokensBySymbol(symbol: string): TokenInfo[] {
  return DEFAULT_TOKENS.filter((t) => t.symbol === symbol)
}

/**
 * Unique logical assets (by symbol) with a preferred icon. Useful when we want
 * to show the top-10 list deduplicated across chains.
 */
export interface LogicalAsset {
  symbol: string
  name: string
  coingeckoId: string
  logo: string
  rank?: number
  /** Set of chains this asset is available on (native or ERC-20). */
  chains: ChainKey[]
}

export function getLogicalAssets(): LogicalAsset[] {
  const map = new Map<string, LogicalAsset>()

  // Native chain tokens first (ETH, BNB, POL)
  for (const c of Object.values(CHAINS)) {
    const sym = c.nativeSymbol
    const existing = map.get(sym)
    if (existing) {
      if (!existing.chains.includes(c.key)) existing.chains.push(c.key)
    } else {
      map.set(sym, {
        symbol: sym,
        name: c.nativeName,
        coingeckoId: c.coingeckoId,
        logo: c.logo,
        rank: sym === 'ETH' ? 2 : sym === 'BNB' ? 6 : sym === 'POL' ? 14 : undefined,
        chains: [c.key],
      })
    }
  }

  // ERC-20 tokens
  for (const t of DEFAULT_TOKENS) {
    const existing = map.get(t.symbol)
    if (existing) {
      if (!existing.chains.includes(t.chain)) existing.chains.push(t.chain)
    } else {
      map.set(t.symbol, {
        symbol: t.symbol,
        name: t.name,
        coingeckoId: t.coingeckoId || '',
        logo: t.logo || '',
        rank: t.rank,
        chains: [t.chain],
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const ra = a.rank ?? 999
    const rb = b.rank ?? 999
    if (ra !== rb) return ra - rb
    return a.symbol.localeCompare(b.symbol)
  })
}
