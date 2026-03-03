import { createContext, useContext } from 'react'

// ─── App-level context ──────────────────────────────────────────────────────
// Shared state for features that span the root layout and deep child pages
// (e.g. the expand/exit mode that affects both the shell and overlay panels).

export interface AppContextValue {
  /** True when the app is covering the full viewport (fixed position over WP). */
  isExpanded: boolean
  toggleExpand: () => void
}

export const AppContext = createContext<AppContextValue>({
  isExpanded: false,
  toggleExpand: () => {},
})

export const useApp = () => useContext(AppContext)
