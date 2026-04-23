import { type ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { Toast } from './ui/Toast'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[520px] flex-col">
      <main className="relative z-10 flex-1 px-4 pb-4 pt-6 sm:px-5">{children}</main>
      <BottomNav />
      <Toast />
    </div>
  )
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[520px] flex-col px-4 pb-6 pt-8 sm:px-6">
      <Toast />
      {children}
    </div>
  )
}
