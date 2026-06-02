import { create } from 'zustand'

/**
 * UI state for the global ChatPopup, lifted into a store so other components
 * (e.g. the contract detail page) can open the popup on a specific contract's
 * conversation.
 */
interface ChatUiState {
  open: boolean
  /** Set when something requests a specific conversation; consumed by ChatPopup. */
  pendingContratId: string | null
  openChat: (contratId: string) => void
  toggle: () => void
  close: () => void
  consumePending: () => void
}

export const useChatUiStore = create<ChatUiState>((set) => ({
  open: false,
  pendingContratId: null,
  openChat: (contratId) => set({ open: true, pendingContratId: contratId }),
  toggle: () => set((s) => ({ open: !s.open })),
  close: () => set({ open: false }),
  consumePending: () => set({ pendingContratId: null }),
}))
