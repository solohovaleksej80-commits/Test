import type { ChainKey } from './chains'

export interface TokenInfo {
  chain: ChainKey
  address: string // lowercase ERC-20 contract address
  symbol: string
  name: string
  decimals: number
  coingeckoId?: string
  logo?: string
}

// A small curated default token list. Users can add custom tokens from Settings.
export const DEFAULT_TOKENS: TokenInfo[] = [
  // Ethereum
  {
    chain: 'ethereum',
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    coingeckoId: 'tether',
  },
  {
    chain: 'ethereum',
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    coingeckoId: 'usd-coin',
  },
  {
    chain: 'ethereum',
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    symbol: 'DAI',
    name: 'Dai',
    decimals: 18,
    coingeckoId: 'dai',
  },
  {
    chain: 'ethereum',
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    decimals: 8,
    coingeckoId: 'wrapped-bitcoin',
  },
  // Polygon
  {
    chain: 'polygon',
    address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    coingeckoId: 'tether',
  },
  {
    chain: 'polygon',
    address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    coingeckoId: 'usd-coin',
  },
  // BSC
  {
    chain: 'bsc',
    address: '0x55d398326f99059ff775485246999027b3197955',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 18,
    coingeckoId: 'tether',
  },
  {
    chain: 'bsc',
    address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 18,
    coingeckoId: 'usd-coin',
  },
  // Arbitrum
  {
    chain: 'arbitrum',
    address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    coingeckoId: 'tether',
  },
  {
    chain: 'arbitrum',
    address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    coingeckoId: 'usd-coin',
  },
  // Base
  {
    chain: 'base',
    address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    coingeckoId: 'usd-coin',
  },
  // Optimism
  {
    chain: 'optimism',
    address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    coingeckoId: 'tether',
  },
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
