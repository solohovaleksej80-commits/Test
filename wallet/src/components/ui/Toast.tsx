import { useEffect } from 'react'
import { useToast } from '../../store/useToast'

export function Toast() {
  const message = useToast((s) => s.message)
  const clear = useToast((s) => s.clear)

  useEffect(() => {
    if (!message) return
    const id = setTimeout(() => clear(), 2400)
    return () => clearTimeout(id)
  }, [message, clear])

  if (!message) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div
        key={message}
        className="pointer-events-auto pop-shadow animate-toast-in rounded-full border border-[var(--color-line)] bg-[var(--color-ink)] px-5 py-3 text-sm text-[var(--color-surface)]"
      >
        {message}
      </div>
    </div>
  )
}
