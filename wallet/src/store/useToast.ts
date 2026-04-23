import { create } from 'zustand'

interface ToastState {
  message: string | null
  show: (m: string) => void
  clear: () => void
}

export const useToast = create<ToastState>((set) => ({
  message: null,
  show: (m) => set({ message: m }),
  clear: () => set({ message: null }),
}))
