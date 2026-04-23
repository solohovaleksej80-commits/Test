# Verra — a warm, browser‑first multi‑chain wallet

Verra is a Trust Wallet‑inspired browser wallet with an editorial, tonal
aesthetic (no cyberpunk). It runs entirely client‑side — your seed phrase
is generated locally and encrypted in the browser with AES‑GCM +
PBKDF2 (210 000 iterations). No servers, no accounts.

## Features

- **HD wallet** (BIP‑39 + BIP‑44). Create a new 12‑word phrase or import
  an existing one. Multiple accounts derived from the same seed.
- **Six EVM chains** out of the box: Ethereum, Polygon, BNB Smart Chain,
  Arbitrum, Base, Optimism. Native + curated ERC‑20 balances.
- **Portfolio** with live prices and 24 h change from CoinGecko,
  allocation strip and auto‑refresh every 45 s.
- **Send** native coins and ERC‑20 tokens with address validation,
  fee estimate, review step, transaction history.
- **Receive** with network picker and QR code.
- **Swap** UI with same‑unit quote preview (execution intentionally
  disabled in this demo).
- **Per‑asset detail** page with 14‑day sparkline.
- **History**, **DApp** list, **NFT** placeholder.
- **Settings**: toggle networks, switch currency (USD / EUR / RUB),
  switch language (RU / EN), reveal seed phrase, wipe local data.

## Design

A warm, editorial palette — cream paper, graphite ink, terracotta,
olive, slate, plum — inspired by late‑modern print design.
Fraunces for display, Inter for UI, JetBrains Mono for addresses.
Soft tonal gradients replace the usual neon / matrix wallet clichés.

## Stack

React 19, Vite, TypeScript, Tailwind CSS v4, Zustand, ethers v6,
`qrcode.react`, Recharts, Lucide icons.

## Running locally

```bash
cd wallet
npm install
npm run dev
# open http://localhost:5173
```

Other scripts:

```bash
npm run build     # typecheck + production build
npm run lint      # eslint
npm run preview   # serve built assets
```

## Security note

This is a **demo** build. Local AES‑GCM + PBKDF2 encryption is real
but the wallet has not been audited. Do not store significant funds
in it. No hardware wallet support, no WalletConnect in this build.

## Screenshots

See the PR body for live captures of onboarding, portfolio, receive,
settings and DApp screens.
