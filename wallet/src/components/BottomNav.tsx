import { NavLink } from 'react-router-dom'
import { Home, Repeat, Image as ImageIcon, Clock, Compass, Settings as SettingsIcon } from 'lucide-react'
import clsx from 'clsx'
import { useWalletStore } from '../store/useWalletStore'
import { t } from '../lib/i18n'

const items = [
  { to: '/home', icon: Home, key: 'nav.home' },
  { to: '/swap', icon: Repeat, key: 'nav.swap' },
  { to: '/nft', icon: ImageIcon, key: 'nav.nft' },
  { to: '/history', icon: Clock, key: 'nav.history' },
  { to: '/discover', icon: Compass, key: 'nav.discover' },
  { to: '/settings', icon: SettingsIcon, key: 'nav.settings' },
]

export function BottomNav() {
  const locale = useWalletStore((s) => s.settings.language)

  return (
    <nav className="sticky bottom-0 z-40 mx-auto flex max-w-[520px] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <div className="flex w-full items-center justify-between rounded-full border border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-surface)_92%,transparent)] px-2 py-2 backdrop-blur soft-shadow">
        {items.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'group relative flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1.5 transition-colors',
                isActive
                  ? 'text-[var(--color-ink)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink-soft)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={clsx(
                    'absolute inset-0 -z-10 rounded-full transition-opacity',
                    isActive ? 'bg-[var(--color-bg-soft)] opacity-100' : 'opacity-0',
                  )}
                />
                <Icon size={18} strokeWidth={isActive ? 2.1 : 1.7} />
                <span className="text-[10px] leading-none">{t(key, locale)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
