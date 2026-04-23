import { create } from 'zustand'
import { decryptString, encryptString } from '../lib/crypto'
import {
  storage,
  type AccountMeta,
  type HistoryEntry,
  type UserSettings,
  type Vault,
} from '../lib/storage'
import { deriveAccount, deriveAddress, generateMnemonic, normalizePhrase } from '../lib/wallet'
import type { ChainKey } from '../lib/chains'
import type { Wallet } from 'ethers'

interface WalletState {
  // Persisted
  vault: Vault | null
  settings: UserSettings
  // Runtime
  mnemonic: string | null // decrypted, held only in memory while unlocked
  activeAccount: number

  // Initialization
  hydrate: () => void

  // Onboarding
  generateNewMnemonic: () => string
  createVault: (phrase: string, password: string, accountName?: string) => Promise<void>
  importVault: (phrase: string, password: string, accountName?: string) => Promise<void>

  // Unlock / lock
  unlock: (password: string) => Promise<boolean>
  lock: () => void
  isUnlocked: () => boolean
  isInitialized: () => boolean

  // Accounts
  addAccount: (name?: string) => Promise<AccountMeta | null>
  setActiveAccount: (index: number) => void
  renameAccount: (index: number, name: string) => void
  currentAccount: () => AccountMeta | null
  currentSigner: () => Wallet | null

  // Settings
  updateSettings: (patch: Partial<UserSettings>) => void
  toggleChain: (chain: ChainKey) => void
  toggleHideBalances: () => void

  // History
  pushHistory: (entry: HistoryEntry) => void

  // Danger zone
  reset: () => void

  // Reveal
  revealPhrase: () => string | null
}

function makeVault(encrypted: Vault['encrypted'], accounts: AccountMeta[]): Vault {
  return { v: 1, createdAt: Date.now(), encrypted, accounts }
}

export const useWalletStore = create<WalletState>((set, get) => ({
  vault: null,
  settings: storage.getSettings(),
  mnemonic: null,
  activeAccount: storage.getActiveAccount(),

  hydrate: () => {
    const vault = storage.getVault()
    const settings = storage.getSettings()
    const active = storage.getActiveAccount()
    set({ vault, settings, activeAccount: active })
  },

  generateNewMnemonic: () => generateMnemonic(12),

  createVault: async (phrase, password, accountName = 'Основной') => {
    const normalized = normalizePhrase(phrase)
    const encrypted = await encryptString(normalized, password)
    const addr = deriveAddress(normalized, 0)
    const accounts: AccountMeta[] = [{ index: 0, name: accountName, address: addr }]
    const vault = makeVault(encrypted, accounts)
    storage.setVault(vault)
    storage.setActiveAccount(0)
    set({ vault, mnemonic: normalized, activeAccount: 0 })
  },

  importVault: async (phrase, password, accountName = 'Импортированный') => {
    return get().createVault(phrase, password, accountName)
  },

  unlock: async (password) => {
    const vault = get().vault ?? storage.getVault()
    if (!vault) return false
    try {
      const phrase = await decryptString(vault.encrypted, password)
      set({ mnemonic: phrase, vault })
      return true
    } catch {
      return false
    }
  },

  lock: () => set({ mnemonic: null }),

  isUnlocked: () => !!get().mnemonic,
  isInitialized: () => !!get().vault,

  addAccount: async (name) => {
    const { vault, mnemonic } = get()
    if (!vault || !mnemonic) return null
    const nextIndex = Math.max(-1, ...vault.accounts.map((a) => a.index)) + 1
    const address = deriveAddress(mnemonic, nextIndex)
    const accountName = name || `Кошелёк ${nextIndex + 1}`
    const acc: AccountMeta = { index: nextIndex, name: accountName, address }
    const nextVault: Vault = { ...vault, accounts: [...vault.accounts, acc] }
    storage.setVault(nextVault)
    storage.setActiveAccount(acc.index)
    set({ vault: nextVault, activeAccount: acc.index })
    return acc
  },

  setActiveAccount: (index) => {
    const { vault } = get()
    if (!vault) return
    if (!vault.accounts.find((a) => a.index === index)) return
    storage.setActiveAccount(index)
    set({ activeAccount: index })
  },

  renameAccount: (index, name) => {
    const { vault } = get()
    if (!vault) return
    const nextVault: Vault = {
      ...vault,
      accounts: vault.accounts.map((a) => (a.index === index ? { ...a, name } : a)),
    }
    storage.setVault(nextVault)
    set({ vault: nextVault })
  },

  currentAccount: () => {
    const { vault, activeAccount } = get()
    return vault?.accounts.find((a) => a.index === activeAccount) ?? null
  },

  currentSigner: () => {
    const { mnemonic, activeAccount } = get()
    if (!mnemonic) return null
    return deriveAccount(mnemonic, activeAccount)
  },

  updateSettings: (patch) => {
    const next = { ...get().settings, ...patch }
    storage.setSettings(next)
    set({ settings: next })
  },

  toggleChain: (chain) => {
    const cur = get().settings.chains
    const next = cur.includes(chain) ? cur.filter((c) => c !== chain) : [...cur, chain]
    get().updateSettings({ chains: next })
  },

  toggleHideBalances: () => get().updateSettings({ hideBalances: !get().settings.hideBalances }),

  pushHistory: (entry) => {
    const hist = storage.getHistory()
    const next = [entry, ...hist].slice(0, 200)
    storage.setHistory(next)
  },

  reset: () => {
    storage.wipe()
    set({ vault: null, mnemonic: null, activeAccount: 0, settings: storage.getSettings() })
  },

  revealPhrase: () => get().mnemonic,
}))
