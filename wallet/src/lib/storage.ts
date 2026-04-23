import type { EncryptedPayload } from './crypto'
import type { ChainKey } from './chains'

const KEYS = {
  vault: 'verra.vault.v1',
  settings: 'verra.settings.v1',
  tokens: 'verra.tokens.v1',
  history: 'verra.history.v1',
  activeAccount: 'verra.active.v1',
  contacts: 'verra.contacts.v1',
}

export interface AccountMeta {
  index: number // HD derivation index
  name: string
  address: string
}

export interface Vault {
  v: 1
  createdAt: number
  encrypted: EncryptedPayload // encrypts the mnemonic phrase
  accounts: AccountMeta[]
}

export interface UserSettings {
  currency: 'usd' | 'eur' | 'rub'
  language: 'ru' | 'en'
  chains: ChainKey[] // enabled chains
  hideBalances: boolean
}

export interface CustomToken {
  chain: ChainKey
  address: string
  symbol: string
  name: string
  decimals: number
}

export interface HistoryEntry {
  id: string
  chain: ChainKey
  hash: string
  from: string
  to: string
  valueWei: string
  tokenAddress?: string
  tokenSymbol?: string
  tokenDecimals?: number
  ts: number
  status: 'pending' | 'success' | 'failed'
  kind: 'send' | 'receive' | 'swap' | 'contract'
  note?: string
}

export interface Contact {
  id: string
  name: string
  address: string
  note?: string
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const storage = {
  getVault: (): Vault | null => load<Vault | null>(KEYS.vault, null),
  setVault: (v: Vault) => save(KEYS.vault, v),
  clearVault: () => localStorage.removeItem(KEYS.vault),

  getSettings: (): UserSettings =>
    load<UserSettings>(KEYS.settings, {
      currency: 'usd',
      language: 'ru',
      chains: ['ethereum', 'polygon', 'bsc', 'arbitrum', 'base', 'optimism'],
      hideBalances: false,
    }),
  setSettings: (s: UserSettings) => save(KEYS.settings, s),

  getCustomTokens: (): CustomToken[] => load<CustomToken[]>(KEYS.tokens, []),
  setCustomTokens: (t: CustomToken[]) => save(KEYS.tokens, t),

  getHistory: (): HistoryEntry[] => load<HistoryEntry[]>(KEYS.history, []),
  setHistory: (h: HistoryEntry[]) => save(KEYS.history, h),

  getActiveAccount: (): number => load<number>(KEYS.activeAccount, 0),
  setActiveAccount: (i: number) => save(KEYS.activeAccount, i),

  getContacts: (): Contact[] => load<Contact[]>(KEYS.contacts, []),
  setContacts: (c: Contact[]) => save(KEYS.contacts, c),

  /** Wipe everything — for "Reset wallet" in settings. */
  wipe: () => {
    for (const k of Object.values(KEYS)) localStorage.removeItem(k)
  },
}
