import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Copy } from 'lucide-react'
import { Layout } from '../components/Layout'
import { Card, SectionHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useWalletStore } from '../store/useWalletStore'
import { CHAIN_LIST, type ChainKey } from '../lib/chains'
import { ChainGlyph } from '../components/ChainGlyph'
import { t, type Locale } from '../lib/i18n'
import { useToast } from '../store/useToast'

export function Settings() {
  const locale = useWalletStore((s) => s.settings.language)
  const currency = useWalletStore((s) => s.settings.currency)
  const enabled = useWalletStore((s) => s.settings.chains)
  const updateSettings = useWalletStore((s) => s.updateSettings)
  const toggleChain = useWalletStore((s) => s.toggleChain)
  const reset = useWalletStore((s) => s.reset)
  const revealPhrase = useWalletStore((s) => s.revealPhrase)
  const nav = useNavigate()
  const toast = useToast((s) => s.show)

  const [showPhrase, setShowPhrase] = useState(false)
  const phrase = revealPhrase() ?? ''

  const copyPhrase = async () => {
    if (!phrase) return
    await navigator.clipboard.writeText(phrase)
    toast(t('copied', locale))
  }

  const onReset = () => {
    const msg =
      locale === 'ru'
        ? 'Локальный кошелёк будет удалён. Продолжить?'
        : 'This will wipe the local wallet. Continue?'
    if (confirm(msg)) {
      reset()
      nav('/', { replace: true })
    }
  }

  return (
    <Layout>
      <h1 className="font-display text-4xl leading-[1.05]">{t('settings.title', locale)}</h1>

      {/* Networks */}
      <section className="mt-6">
        <SectionHeader title={t('settings.networks', locale)} />
        <Card className="p-2">
          {CHAIN_LIST.map((c) => (
            <label
              key={c.key}
              className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-[var(--color-bg-soft)]"
            >
              <ChainGlyph chain={c.key} size={28} />
              <div className="flex-1">
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-[11px] text-[var(--color-muted)]">{c.rpc}</div>
              </div>
              <input
                type="checkbox"
                checked={enabled.includes(c.key as ChainKey)}
                onChange={() => toggleChain(c.key as ChainKey)}
                className="h-4 w-4 accent-[var(--color-ink)]"
              />
            </label>
          ))}
        </Card>
      </section>

      {/* Preferences */}
      <section className="mt-6">
        <SectionHeader title={locale === 'ru' ? 'Предпочтения' : 'Preferences'} />
        <Card className="flex flex-col gap-4">
          <Row label={t('settings.currency', locale)}>
            <Segmented
              value={currency}
              onChange={(v) => updateSettings({ currency: v as 'usd' | 'eur' | 'rub' })}
              options={[
                { value: 'usd', label: 'USD' },
                { value: 'eur', label: 'EUR' },
                { value: 'rub', label: 'RUB' },
              ]}
            />
          </Row>
          <Row label={t('settings.language', locale)}>
            <Segmented
              value={locale}
              onChange={(v) => updateSettings({ language: v as Locale })}
              options={[
                { value: 'ru', label: 'Русский' },
                { value: 'en', label: 'English' },
              ]}
            />
          </Row>
        </Card>
      </section>

      {/* Security */}
      <section className="mt-6">
        <SectionHeader title={t('settings.security', locale)} />
        <Card className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={() => setShowPhrase((v) => !v)}
            className="justify-start"
          >
            {showPhrase ? <EyeOff size={16} /> : <Eye size={16} />}
            {t('settings.reveal', locale)}
          </Button>
          {showPhrase ? (
            <div className="rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-bg-soft)] p-3">
              <div className="grid grid-cols-3 gap-2">
                {phrase.split(' ').map((w, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-1.5"
                  >
                    <span className="w-5 text-[11px] text-[var(--color-muted)] tnum">{i + 1}</span>
                    <span className="font-mono text-[12px]">{w}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={copyPhrase}
                  className="press-scale inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs"
                >
                  <Copy size={12} /> {t('create.copy', locale)}
                </button>
              </div>
            </div>
          ) : null}
        </Card>
      </section>

      {/* About */}
      <section className="mt-6">
        <SectionHeader title={t('settings.about', locale)} />
        <Card className="text-sm text-[var(--color-ink-soft)]">
          <p>{t('settings.aboutText', locale)}</p>
          <div className="mt-4 text-xs text-[var(--color-muted)]">v0.1.0 · Verra</div>
        </Card>
      </section>

      {/* Danger */}
      <section className="mt-6">
        <Card className="border-[color-mix(in_srgb,var(--color-danger)_30%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-danger)_6%,var(--color-surface))]">
          <div className="font-display text-xl">{t('settings.reset', locale)}</div>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            {t('settings.resetDesc', locale)}
          </p>
          <div className="mt-4">
            <Button variant="danger" onClick={onReset}>
              {t('settings.reset', locale)}
            </Button>
          </div>
        </Card>
      </section>
    </Layout>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-[var(--color-ink-soft)]">{label}</span>
      {children}
    </div>
  )
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex rounded-full border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`press-scale rounded-full px-3 py-1 text-[12.5px] ${
            value === o.value
              ? 'bg-[var(--color-surface)] text-[var(--color-ink)] soft-shadow'
              : 'text-[var(--color-muted)]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
