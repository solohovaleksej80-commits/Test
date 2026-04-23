// AES-GCM encryption of the mnemonic using a password-derived key (PBKDF2).
// Uses only the WebCrypto API. Nothing leaves the browser.

const PBKDF2_ITERATIONS = 210_000
const SALT_BYTES = 16
const IV_BYTES = 12

function toBase64(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export interface EncryptedPayload {
  v: 1
  salt: string
  iv: string
  ct: string
}

export async function encryptString(plain: string, password: string): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await deriveKey(password, salt)
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    new TextEncoder().encode(plain),
  )
  return {
    v: 1,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ct: toBase64(new Uint8Array(ct)),
  }
}

export async function decryptString(payload: EncryptedPayload, password: string): Promise<string> {
  const salt = fromBase64(payload.salt)
  const iv = fromBase64(payload.iv)
  const ct = fromBase64(payload.ct)
  const key = await deriveKey(password, salt)
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as unknown as BufferSource },
      key,
      ct as unknown as BufferSource,
    )
    return new TextDecoder().decode(plain)
  } catch {
    throw new Error('Incorrect password or corrupted vault')
  }
}
