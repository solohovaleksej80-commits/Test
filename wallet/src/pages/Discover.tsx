import { Layout } from '../components/Layout'
import { Card, SectionHeader } from '../components/ui/Card'
import { useWalletStore } from '../store/useWalletStore'
import { t } from '../lib/i18n'

interface DApp {
  name: string
  description: string
  url: string
  category: string
  hue: string
}

const DAPPS: DApp[] = [
  {
    name: 'Uniswap',
    description: 'DEX для EVM-сетей',
    url: 'https://app.uniswap.org',
    category: 'DEX',
    hue: '#E8CFC1',
  },
  {
    name: 'Aave',
    description: 'Кредитование и стейкинг',
    url: 'https://app.aave.com',
    category: 'Lending',
    hue: '#C8D0A9',
  },
  {
    name: 'OpenSea',
    description: 'NFT‑маркетплейс',
    url: 'https://opensea.io',
    category: 'NFT',
    hue: '#B8C8D6',
  },
  {
    name: 'Lido',
    description: 'Ликвидный стейкинг ETH',
    url: 'https://stake.lido.fi',
    category: 'Staking',
    hue: '#F1D9B8',
  },
  {
    name: 'Curve',
    description: 'Стабильные пулы',
    url: 'https://curve.fi',
    category: 'DEX',
    hue: '#D9C3DB',
  },
  {
    name: 'ENS',
    description: 'Имена в сети Ethereum',
    url: 'https://app.ens.domains',
    category: 'Identity',
    hue: '#C6D4C0',
  },
]

export function Discover() {
  const locale = useWalletStore((s) => s.settings.language)
  return (
    <Layout>
      <h1 className="font-display text-4xl leading-[1.05]">{t('discover.title', locale)}</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{t('discover.sub', locale)}</p>

      <div className="mt-6">
        <SectionHeader title={locale === 'ru' ? 'Популярное' : 'Popular'} />
        <div className="grid grid-cols-2 gap-3">
          {DAPPS.map((d) => (
            <a
              key={d.url}
              href={d.url}
              target="_blank"
              rel="noreferrer"
              className="press-scale flex flex-col justify-between rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 soft-shadow"
            >
              <div
                className="mb-3 h-20 w-full rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${d.hue}, color-mix(in srgb, ${d.hue} 40%, #ffffff))`,
                }}
              />
              <div>
                <div className="chip mb-1 text-[10px] uppercase">{d.category}</div>
                <div className="font-display text-lg leading-none">{d.name}</div>
                <div className="mt-1 text-xs text-[var(--color-muted)]">{d.description}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <Card className="mt-5 text-sm text-[var(--color-ink-soft)]">
        {locale === 'ru'
          ? 'Совет: откройте dApp в новой вкладке — для подключения используйте injected провайдер (WalletConnect v2 в этой сборке отключён).'
          : 'Tip: open the dApp in a new tab — use injected provider to connect (WalletConnect v2 is disabled in this build).'}
      </Card>
    </Layout>
  )
}
