import { forwardRef, type ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--color-ink)] text-[var(--color-surface)] hover:bg-[var(--color-ink-soft)] disabled:opacity-40',
  secondary:
    'bg-[var(--color-accent)] text-white hover:brightness-105 disabled:opacity-40',
  outline:
    'bg-transparent text-[var(--color-ink)] border border-[var(--color-line)] hover:bg-[var(--color-bg-soft)] disabled:opacity-40',
  ghost:
    'bg-transparent text-[var(--color-ink-soft)] hover:bg-[var(--color-bg-soft)] disabled:opacity-40',
  danger:
    'bg-[var(--color-danger)] text-white hover:brightness-105 disabled:opacity-40',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm rounded-full',
  md: 'h-11 px-5 text-[0.95rem] rounded-full',
  lg: 'h-14 px-6 text-base rounded-full',
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', block, loading, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={clsx(
        'press-scale inline-flex items-center justify-center gap-2 font-medium leading-none transition-colors',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  )
})
