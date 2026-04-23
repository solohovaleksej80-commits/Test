import { useState } from 'react'
import { ChevronDown, Copy, Plus, Check } from 'lucide-react'
import { useWalletStore } from '../store/useWalletStore'
import { Avatar } from './Avatar'
import { shortAddr } from '../lib/wallet'
import { useToast } from '../store/useToast'
import { t } from '../lib/i18n'

export function AccountHeader() {
  const vault = useWalletStore((s) => s.vault)
  const activeIndex = useWalletStore((s) => s.activeAccount)
  const setActive = useWalletStore((s) => s.setActiveAccount)
  const addAccount = useWalletStore((s) => s.addAccount)
  const locale = useWalletStore((s) => s.settings.language)
  const [open, setOpen] = useState(false)
  const toast = useToast((s) => s.show)

  const current = vault?.accounts.find((a) => a.index === activeIndex)
  if (!vault || !current) return null

  const copy = async () => {
    await navigator.clipboard.writeText(current.address)
    toast(t('copied', locale))
  }

  return (
    <div className="relative flex items-center justify-between">
      <button
        onClick={() => setOpen((v) => !v)}
        className="press-scale flex items-center gap-3 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] py-1.5 pl-1.5 pr-4 text-left soft-shadow"
      >
        <Avatar seed={current.address} size={36} />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium">{current.name}</span>
          <span className="tnum font-mono text-xs text-[var(--color-muted)]">
            {shortAddr(current.address)}
          </span>
        </div>
        <ChevronDown size={16} className="text-[var(--color-muted)]" />
      </button>

      <button
        onClick={copy}
        aria-label="Copy address"
        className="press-scale rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] p-2.5 soft-shadow"
      >
        <Copy size={16} />
      </button>

      {open ? (
        <div
          className="absolute left-0 top-[calc(100%+10px)] z-30 w-72 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-2 pop-shadow"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="px-3 py-2 text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
            {locale === 'ru' ? 'Аккаунты' : 'Accounts'}
          </div>
          <div className="flex flex-col">
            {vault.accounts.map((a) => (
              <button
                key={a.index}
                className="press-scale flex items-center gap-3 rounded-2xl px-3 py-2 text-left hover:bg-[var(--color-bg-soft)]"
                onClick={() => {
                  setActive(a.index)
                  setOpen(false)
                }}
              >
                <Avatar seed={a.address} size={32} />
                <div className="flex-1">
                  <div className="text-sm">{a.name}</div>
                  <div className="tnum font-mono text-[11px] text-[var(--color-muted)]">
                    {shortAddr(a.address)}
                  </div>
                </div>
                {a.index === activeIndex ? <Check size={16} /> : null}
              </button>
            ))}
          </div>
          <button
            onClick={async () => {
              await addAccount()
              setOpen(false)
            }}
            className="press-scale mt-1 flex w-full items-center gap-3 rounded-2xl border border-dashed border-[var(--color-line)] px-3 py-2.5 text-sm text-[var(--color-ink-soft)] hover:bg-[var(--color-bg-soft)]"
          >
            <Plus size={16} /> {locale === 'ru' ? 'Новый кошелёк' : 'New wallet'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
