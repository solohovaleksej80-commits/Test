export type ChainKey = 'ethereum' | 'polygon' | 'bsc' | 'arbitrum' | 'base' | 'optimism'

export interface ChainInfo {
  key: ChainKey
  name: string
  short: string
  chainId: number
  rpc: string
  explorer: string
  nativeSymbol: string
  nativeDecimals: number
  nativeName: string
  coingeckoId: string
  // A color used in UI accents for this chain
  tone: string
  // Emoji / short glyph for minimal illustration
  glyph: string
}

// Public, free RPC endpoints. No keys required.
// These can be overridden later via VITE_* env vars.
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {}

export const CHAINS: Record<ChainKey, ChainInfo> = {
  ethereum: {
    key: 'ethereum',
    name: 'Ethereum',
    short: 'ETH',
    chainId: 1,
    rpc: env.VITE_RPC_ETHEREUM || 'https://eth.llamarpc.com',
    explorer: 'https://etherscan.io',
    nativeSymbol: 'ETH',
    nativeDecimals: 18,
    nativeName: 'Ether',
    coingeckoId: 'ethereum',
    tone: '#6C8FA3',
    glyph: '◆',
  },
  polygon: {
    key: 'polygon',
    name: 'Polygon',
    short: 'POL',
    chainId: 137,
    rpc: env.VITE_RPC_POLYGON || 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    nativeSymbol: 'POL',
    nativeDecimals: 18,
    nativeName: 'Polygon',
    coingeckoId: 'matic-network',
    tone: '#6B4A6A',
    glyph: '✦',
  },
  bsc: {
    key: 'bsc',
    name: 'BNB Smart Chain',
    short: 'BNB',
    chainId: 56,
    rpc: env.VITE_RPC_BSC || 'https://bsc-dataseed.binance.org',
    explorer: 'https://bscscan.com',
    nativeSymbol: 'BNB',
    nativeDecimals: 18,
    nativeName: 'BNB',
    coingeckoId: 'binancecoin',
    tone: '#C78A2A',
    glyph: '●',
  },
  arbitrum: {
    key: 'arbitrum',
    name: 'Arbitrum One',
    short: 'ARB',
    chainId: 42161,
    rpc: env.VITE_RPC_ARBITRUM || 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    nativeSymbol: 'ETH',
    nativeDecimals: 18,
    nativeName: 'Ether',
    coingeckoId: 'ethereum',
    tone: '#4F7A8E',
    glyph: '◇',
  },
  base: {
    key: 'base',
    name: 'Base',
    short: 'BASE',
    chainId: 8453,
    rpc: env.VITE_RPC_BASE || 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    nativeSymbol: 'ETH',
    nativeDecimals: 18,
    nativeName: 'Ether',
    coingeckoId: 'ethereum',
    tone: '#3C5A7D',
    glyph: '▲',
  },
  optimism: {
    key: 'optimism',
    name: 'Optimism',
    short: 'OP',
    chainId: 10,
    rpc: env.VITE_RPC_OPTIMISM || 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io',
    nativeSymbol: 'ETH',
    nativeDecimals: 18,
    nativeName: 'Ether',
    coingeckoId: 'ethereum',
    tone: '#B0443A',
    glyph: '◉',
  },
}

export const CHAIN_LIST: ChainInfo[] = Object.values(CHAINS)

export function chainById(chainId: number): ChainInfo | undefined {
  return CHAIN_LIST.find((c) => c.chainId === chainId)
}
