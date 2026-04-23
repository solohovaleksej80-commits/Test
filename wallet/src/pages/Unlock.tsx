import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shell } from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useWalletStore } from '../store/useWalletStore'
import { t } from '../lib/i18n'

export function Unlock() {
  const locale = useWalletStore((s) => s.settings.language)
  const unlock = useWalletStore((s) => s.unlock)
  const reset = useWalletStore((s) => s.reset)
  const nav = useNavigate()

  const [pwd, setPwd] = useState('')
  const [err, setErr] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setErr(undefined)
    setLoading(true)
    try {
      const ok = await unlock(pwd)
      if (ok) nav('/home', { replace: true })
      else setErr(t('unlock.wrong', locale))
    } finally {
      setLoading(false)
    }
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
    <Shell>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2 pt-2">
          <span className="inline-block h-6 w-6 rounded-full blob-gradient" />
          <span className="font-display text-lg">{t('app.name', locale)}</span>
        </div>

        <div className="relative mt-20 flex-1">
          <div
            aria-hidden
            className="blob-gradient pointer-events-none absolute -left-16 top-8 h-64 w-64 rounded-full opacity-50 blur-3xl"
          />
          <h1 className="relative font-display text-[44px] leading-[1.05]">
            {t('unlock.title', locale)}
          </h1>
          <p className="relative mt-3 max-w-[26rem] text-[15px] text-[var(--color-ink-soft)]">
            {t('unlock.desc', locale)}
          </p>

          <form
            className="relative mt-10 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <Input
              type="password"
              placeholder={t('unlock.placeholder', locale)}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              error={err}
              autoFocus
            />
            <Button type="submit" size="lg" block loading={loading}>
              {t('unlock.button', locale)}
            </Button>
          </form>
        </div>

        <button
          onClick={onReset}
          className="mt-6 self-center text-sm text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-danger)]"
        >
          {t('unlock.forgot', locale)}
        </button>
      </div>
    </Shell>
  )
}
