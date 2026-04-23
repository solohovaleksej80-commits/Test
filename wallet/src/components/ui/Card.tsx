import type { HTMLAttributes } from 'react'
import clsx from 'clsx'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('card p-5', className)} {...rest} />
}

export function SectionHeader({
  title,
  action,
}: {
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-3 flex items-end justify-between px-1">
      <h2 className="font-display text-[1.35rem] leading-none">{title}</h2>
      {action}
    </div>
  )
}
