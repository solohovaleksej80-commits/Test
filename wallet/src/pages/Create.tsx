import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Copy, Eye, EyeOff } from 'lucide-react'
import { Shell } from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useWalletStore } from '../store/useWalletStore'
import { t } from '../lib/i18n'
import { useToast } from '../store/useToast'
import { Card } from '../components/ui/Card'

type Step = 'phrase' | 'confirm' | 'password'

export function Create() {
  const locale = useWalletStore((s) => s.settings.language)
  const createVault = useWalletStore((s) => s.createVault)
  const nav = useNavigate()
  const toast = useToast((s) => s.show)

  // Generate once per mount.
  const phrase = useMemo(() => useWalletStore.getState().generateNewMnemonic(), [])
  const words = phrase.split(' ')

  const [step, setStep] = useState<Step>('phrase')
  const [revealed, setRevealed] = useState(false)
  const [pwd, setPwd] = useState('')
  const [pwd2, setPwd2] = useState('')
  const [pwdErr, setPwdErr] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(phrase)
    toast(t('create.copied', locale))
  }

  const finish = async () => {
    setPwdErr(undefined)
    if (pwd.length < 8) {
      setPwdErr(t('create.password.short', locale))
      return
    }
    if (pwd !== pwd2) {
      setPwdErr(t('create.password.mismatch', locale))
      return
    }
    setLoading(true)
    try {
      await createVault(phrase, pwd, locale === 'ru' ? 'Основной' : 'Primary')
      nav('/home', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Shell>
      <div className="mb-8 flex items-center justify-between">
        <Link
          to="/"
          className="press-scale inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-sm"
        >
          <ArrowLeft size={14} /> {t('back', locale)}
        </Link>
        <span className="text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
          {step === 'phrase' ? '1 / 2' : '2 / 2'}
        </span>
      </div>

      {step !== 'password' ? (
        <>
          <h1 className="font-display text-4xl leading-[1.05]">{t('create.title', locale)}</h1>
          <p className="mt-3 max-w-[28rem] text-[15px] text-[var(--color-ink-soft)]">
            {t('create.desc', locale)}
          </p>

          <Card className="mt-8 relative overflow-hidden p-4">
            <div
              className={`absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-surface)]/90 backdrop-blur transition-opacity ${
                revealed ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
              }`}
            >
              <button
                onClick={() => setRevealed(true)}
                className="press-scale pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm text-[var(--color-surface)]"
              >
                <Eye size={16} />
                {t('create.reveal', locale)}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {words.map((w, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-soft)] px-3 py-2.5"
                >
                  <span className="w-5 text-xs text-[var(--color-muted)] tnum">{i + 1}</span>
                  <span className="font-mono text-[13px]">{w}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setRevealed((v) => !v)}
                className="press-scale inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-[var(--color-ink-soft)] hover:bg-[var(--color-bg-soft)]"
              >
                {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
                {revealed ? t('create.hide', locale) : t('create.reveal', locale)}
              </button>
              <button
                onClick={copy}
                className="press-scale inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-bg-soft)] px-3 py-1.5 text-sm"
              >
                <Copy size={14} />
                {t('create.copy', locale)}
              </button>
            </div>
          </Card>

          <div className="sticky bottom-0 mt-8 pb-2">
            <Button size="lg" block disabled={!revealed} onClick={() => setStep('password')}>
              {t('create.confirm', locale)}
            </Button>
          </div>
        </>
      ) : (
        <>
          <h1 className="font-display text-4xl leading-[1.05]">
            {t('create.password.title', locale)}
          </h1>
          <p className="mt-3 max-w-[28rem] text-[15px] text-[var(--color-ink-soft)]">
            {t('create.password.desc', locale)}
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Input
              type="password"
              placeholder={t('create.password.placeholder', locale)}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              autoFocus
            />
            <Input
              type="password"
              placeholder={t('create.password.confirm', locale)}
              value={pwd2}
              onChange={(e) => setPwd2(e.target.value)}
              error={pwdErr}
            />
          </div>

          <div className="sticky bottom-0 mt-8 pb-2">
            <Button size="lg" block onClick={finish} loading={loading}>
              {t('create.finish', locale)}
            </Button>
          </div>
        </>
      )}
    </Shell>
  )
}
