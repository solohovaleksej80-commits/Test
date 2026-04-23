import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  suffix?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, suffix, className, ...rest },
  ref,
) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
          {label}
        </span>
      ) : null}
      <span
        className={clsx(
          'flex h-12 items-center gap-2 rounded-2xl border bg-[var(--color-bg-soft)] px-4 transition-colors',
          error
            ? 'border-[var(--color-danger)]/60'
            : 'border-[var(--color-line)] focus-within:border-[var(--color-ink)]/40',
        )}
      >
        <input
          ref={ref}
          className={clsx(
            'flex-1 bg-transparent outline-none placeholder:text-[color:var(--color-muted)]',
            className,
          )}
          {...rest}
        />
        {suffix ? <span className="text-sm text-[var(--color-muted)]">{suffix}</span> : null}
      </span>
      {error ? (
        <span className="mt-1 block text-xs text-[var(--color-danger)]">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-[var(--color-muted)]">{hint}</span>
      ) : null}
    </label>
  )
})

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string; error?: string }
>(function Textarea({ label, hint, error, className, ...rest }, ref) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
          {label}
        </span>
      ) : null}
      <textarea
        ref={ref}
        className={clsx(
          'min-h-[120px] w-full rounded-2xl border bg-[var(--color-bg-soft)] px-4 py-3 outline-none placeholder:text-[color:var(--color-muted)]',
          error
            ? 'border-[var(--color-danger)]/60'
            : 'border-[var(--color-line)] focus:border-[var(--color-ink)]/40',
          className,
        )}
        {...rest}
      />
      {error ? (
        <span className="mt-1 block text-xs text-[var(--color-danger)]">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-[var(--color-muted)]">{hint}</span>
      ) : null}
    </label>
  )
})
