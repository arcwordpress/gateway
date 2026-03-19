import { createContext, useContext } from 'react'

// ─── App-level context ──────────────────────────────────────────────────────
// Shared state for features that span the root layout and deep child pages
// (e.g. the expand/exit mode that affects both the shell and overlay panels).

export interface AppContextValue {
  /** True when the app is covering the full viewport (fixed position over WP). */
  isExpanded: boolean
  toggleExpand: () => void
  /** Top offset in px for WP admin chrome (0 in fullscreen mode). */
  shellTopOffset: number
  /** Height available to the app shell. */
  shellHeightCss: string
  shellHeightPx: number
}

export const AppContext = createContext<AppContextValue>({
  isExpanded: false,
  toggleExpand: () => {},
  shellTopOffset: 0,
  shellHeightCss: '100vh',
  shellHeightPx: 0,
})

export const useApp = () => useContext(AppContext)
