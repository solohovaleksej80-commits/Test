import { Layout } from '../components/Layout'
import { Card } from '../components/ui/Card'
import { useWalletStore } from '../store/useWalletStore'
import { t } from '../lib/i18n'
import { ImageIcon } from '../components/icons/ImageIcon'

export function Nft() {
  const locale = useWalletStore((s) => s.settings.language)
  const account = useWalletStore((s) => s.currentAccount())
  return (
    <Layout>
      <h1 className="font-display text-4xl leading-[1.05]">{t('nft.title', locale)}</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{t('nft.empty', locale)}</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="p-0">
            <div
              className="aspect-square w-full rounded-[inherit]"
              style={{
                background: `conic-gradient(from ${i * 45}deg at 50% 50%, #E8A16E, #D86C4A, #C8D0A9, #7C8F58, #E8CFC1, #E8A16E)`,
                filter: 'saturate(0.85) contrast(0.9)',
              }}
            />
            <div className="flex items-center justify-between p-3">
              <div>
                <div className="text-xs text-[var(--color-muted)]">placeholder</div>
                <div className="font-display text-lg leading-none">#{i + 1}</div>
              </div>
              <span className="chip">
                <ImageIcon size={12} /> demo
              </span>
            </div>
          </Card>
        ))}
      </div>

      {account ? (
        <Card className="mt-6 flex flex-col items-start gap-2">
          <span className="text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
            {locale === 'ru' ? 'Адрес кошелька' : 'Wallet address'}
          </span>
          <span className="break-all font-mono text-[12px]">{account.address}</span>
          <span className="text-xs text-[var(--color-muted)]">
            {locale === 'ru'
              ? 'Можно проверить коллекцию на OpenSea / Blur, подставив адрес.'
              : 'You can look up collections on OpenSea / Blur with this address.'}
          </span>
        </Card>
      ) : null}
    </Layout>
  )
}
