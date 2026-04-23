# Testing the Verra wallet

Verra is a fully-client-side browser wallet under `wallet/` in this repo. No backend, no auth — all state lives in `localStorage` + in-memory.

## How to run it

```bash
cd wallet
npm install         # one-time
npm run dev -- --host 0.0.0.0 --port 5173
```

App listens on `http://localhost:5173`.

There are **no credentials** to request. The password is chosen by the user at wallet creation; the tester picks their own (e.g. `testpass123`). If you inherit a session where a vault already exists in `localStorage`, either unlock with the password you remember or clear site data and start over:

```js
localStorage.clear(); location.href = 'http://localhost:5173/'
```

## Routes and route guards

- `/` welcome, `/create` (2-step wizard), `/import`, `/unlock` — public.
- `/home`, `/send`, `/receive`, `/swap`, `/nft`, `/history`, `/discover`, `/settings`, `/asset/:chain/:id` — require an unlocked vault.
- Reloading the page drops the in-memory mnemonic → guard redirects to `/unlock`.
- Direct `browser(action="navigate")` is a full page load — it will also drop the mnemonic and send you to `/unlock`. Use router `<a>` links (via `click`) to navigate without reloading.

## Primary adversarial flow (proves HD + AES-GCM are real)

One flow covers almost everything:

1. `/create` → reveal seed → record the 12 words (SEED_A).
2. Set password, land on `/home`, copy the full address from `/receive` (ADDRESS_A — must be 42 chars, EIP-55 checksummed mixed case).
3. `/settings` → "Показать seed-фразу" → the 12 words must match SEED_A exactly.
4. Reset wallet → back to `/`.
5. `/import` → paste SEED_A → enter a **different** password → land on `/home`. Go to `/receive` — the full address must equal ADDRESS_A byte-for-byte.
6. Hard reload → `/unlock`. Wrong password must show "Неверный пароль" and stay on `/unlock`. Correct password must return to `/home`.

Step 5 is the critical adversarial check: if derivation were faked (e.g. hashed from the password), a different password would produce a different address. Identical address proves real BIP-44 at `m/44'/60'/0'/0/0`.

## Decoding the on-screen QR code

QR is rendered as inline SVG via `qrcode.react`. To decode in the browser console:

```js
const s = document.createElement('script');
s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
document.head.appendChild(s);
s.onload = async () => {
  const qr = document.querySelectorAll('svg')[1];       // [0] is decorative; [1] is the QR on /receive
  const xml = new XMLSerializer().serializeToString(qr);
  const img = new Image();
  const blob = new Blob([xml], {type: 'image/svg+xml;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  await new Promise(res => { img.onload = res; img.src = url; });
  const c = document.createElement('canvas');
  c.width = 290; c.height = 290;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 290, 290);
  ctx.drawImage(img, 0, 0, 290, 290);
  const id = ctx.getImageData(0, 0, 290, 290);
  window.__DECODED = window.jsQR(id.data, id.width, id.height)?.data || 'NULL';
  console.log('DECODED=' + window.__DECODED);
};
```

Then wait ~3 s and `console.log('DECODED=' + window.__DECODED)` again (the promise is async and returns before the first log fires).

## Live price sanity check (CoinGecko, no API key)

Portfolio prices come from `https://api.coingecko.com/api/v3/simple/price`. Plausible ranges as of early 2026:

- ETH: $1,500 – $5,000
- BNB: $400 – $1,200

If every asset row shows `$0.0000` or `—` after 10 s of dwell time on `/home`, the live-price integration is broken. Prices should also **change** between reloads (tens of cents / percent fluctuations) — if they are pixel-identical across reloads it is likely a mock.

CoinGecko public endpoints rate-limit aggressively; if tests are flaky, add 30 s between reloads or switch to a different source.

## localStorage layout

- `verra.vault.v1` — JSON with `{v, createdAt, encrypted: {salt, iv, ct}, accounts}`. Only ciphertext; no plaintext seed here.
- `verra.active.v1` — integer index of the active account.
- Mnemonic is NEVER persisted; it lives in a Zustand in-memory store while unlocked. Any full page load (including `browser(action="navigate")`) wipes it and forces re-unlock.

## Known quirks

- The "Сбросить кошелёк" button uses `window.confirm()`. CDP auto-dismisses it but the reset code still runs afterwards, so automated tests will appear to reset without an explicit confirmation. Human users see and must accept the native dialog.
- The Receive page always renders two `<svg>` elements in `main` — the decorative one (first) and the QR (second). Don't grab the first one.
- `browser(action="press_key", content="Control+a")` does NOT clear password inputs in this app. To clear a controlled input programmatically, set the value via the native setter and dispatch `input`:
  ```js
  const i = document.querySelector('input[type=password]');
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(i, ''); i.dispatchEvent(new Event('input', {bubbles: true}));
  ```

## Devin secrets needed

None. Fully client-side, CoinGecko public API, no auth.
