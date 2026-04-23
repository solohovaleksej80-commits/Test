import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Shell } from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { useWalletStore } from '../store/useWalletStore'
import { t } from '../lib/i18n'
import { isValidMnemonic } from '../lib/wallet'

export function Import() {
  const locale = useWalletStore((s) => s.settings.language)
  const importVault = useWalletStore((s) => s.importVault)
  const nav = useNavigate()

  const [phrase, setPhrase] = useState('')
  const [pwd, setPwd] = useState('')
  const [pwd2, setPwd2] = useState('')
  const [err, setErr] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setErr(undefined)
    if (!isValidMnemonic(phrase)) {
      setErr(t('import.invalid', locale))
      return
    }
    if (pwd.length < 8) {
      setErr(t('create.password.short', locale))
      return
    }
    if (pwd !== pwd2) {
      setErr(t('create.password.mismatch', locale))
      return
    }
    setLoading(true)
    try {
      await importVault(phrase, pwd)
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
      </div>

      <h1 className="font-display text-4xl leading-[1.05]">{t('import.title', locale)}</h1>
      <p className="mt-3 max-w-[28rem] text-[15px] text-[var(--color-ink-soft)]">
        {t('import.desc', locale)}
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <Textarea
          label="Seed"
          placeholder={t('import.placeholder', locale)}
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          error={err && err === t('import.invalid', locale) ? err : undefined}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
        />
        <Input
          type="password"
          placeholder={t('create.password.placeholder', locale)}
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <Input
          type="password"
          placeholder={t('create.password.confirm', locale)}
          value={pwd2}
          onChange={(e) => setPwd2(e.target.value)}
          error={err && err !== t('import.invalid', locale) ? err : undefined}
        />
      </div>

      <div className="sticky bottom-0 mt-8 pb-2">
        <Button size="lg" block onClick={submit} loading={loading}>
          {t('import.continue', locale)}
        </Button>
      </div>
    </Shell>
  )
}
