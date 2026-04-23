import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Shell } from '../components/Layout'
import { useWalletStore } from '../store/useWalletStore'
import { t } from '../lib/i18n'
import { Sparkles, ShieldCheck, Globe } from 'lucide-react'

export function Welcome() {
  const locale = useWalletStore((s) => s.settings.language)

  return (
    <Shell>
      <div className="flex flex-1 flex-col">
        {/* Brand line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-6 w-6 rounded-full blob-gradient" />
            <span className="font-display text-lg leading-none">{t('app.name', locale)}</span>
          </div>
          <button
            onClick={() => {
              const next = locale === 'ru' ? 'en' : 'ru'
              useWalletStore.getState().updateSettings({ language: next })
            }}
            className="press-scale rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]"
          >
            {locale === 'ru' ? 'ru · en' : 'en · ru'}
          </button>
        </div>

        {/* Hero */}
        <div className="relative mt-14 flex-1">
          <div
            aria-hidden
            className="blob-gradient pointer-events-none absolute -left-10 -top-10 h-80 w-80 rounded-full opacity-70 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-[-60px] top-28 h-64 w-64 rounded-full opacity-60 blur-3xl"
            style={{ background: 'radial-gradient(circle, #C8D0A9, transparent 60%)' }}
          />

          <h1 className="relative font-display text-[56px] leading-[0.95] tracking-[-0.02em] sm:text-[68px]">
            {t('welcome.hero.line1', locale)} <br />
            <span className="italic text-[var(--color-accent-ink)]">
              {t('welcome.hero.line2', locale)}
            </span>
          </h1>
          <p className="relative mt-6 max-w-[28rem] text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
            {t('welcome.sub', locale)}
          </p>

          <div className="relative mt-10 flex flex-wrap gap-2">
            <span className="chip">
              <ShieldCheck size={14} />
              {t('welcome.security.local', locale)}
            </span>
            <span className="chip">
              <Globe size={14} />
              {t('welcome.security.chains', locale)}
            </span>
            <span className="chip">
              <Sparkles size={14} />
              {t('welcome.security.open', locale)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 mt-8 flex flex-col gap-3 pb-2">
          <Link to="/create">
            <Button size="lg" block>
              {t('welcome.create', locale)}
            </Button>
          </Link>
          <Link to="/import">
            <Button size="lg" variant="outline" block>
              {t('welcome.import', locale)}
            </Button>
          </Link>
        </div>
      </div>
    </Shell>
  )
}
