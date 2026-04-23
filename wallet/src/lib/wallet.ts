import { HDNodeWallet, Mnemonic, Wallet, getAddress } from 'ethers'

/** Standard Ethereum BIP-44 path for a given account index. */
export function ethPath(index: number): string {
  return `m/44'/60'/0'/0/${index}`
}

/** Generate a fresh 12-word BIP-39 mnemonic. */
export function generateMnemonic(words: 12 | 24 = 12): string {
  // ethers v6 generates a 16-byte entropy => 12 words; 32-byte entropy => 24 words
  const entropyBytes = words === 24 ? 32 : 16
  const entropy = crypto.getRandomValues(new Uint8Array(entropyBytes))
  return Mnemonic.fromEntropy(entropy).phrase
}

export function isValidMnemonic(phrase: string): boolean {
  try {
    Mnemonic.fromPhrase(normalizePhrase(phrase))
    return true
  } catch {
    return false
  }
}

export function normalizePhrase(phrase: string): string {
  return phrase.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function deriveAccount(phrase: string, index: number): Wallet {
  const mnemonic = Mnemonic.fromPhrase(normalizePhrase(phrase))
  const node = HDNodeWallet.fromMnemonic(mnemonic, ethPath(index))
  // Return a plain Wallet so the private key path is linear (no HD secrets retained).
  return new Wallet(node.privateKey)
}

export function deriveAddress(phrase: string, index: number): string {
  return getAddress(deriveAccount(phrase, index).address)
}

/** Nicely shorten an address: 0xabcd…ef12 */
export function shortAddr(addr: string, chars = 4): string {
  if (!addr) return ''
  const a = getAddress(addr)
  return `${a.slice(0, 2 + chars)}…${a.slice(-chars)}`
}

export { getAddress }
