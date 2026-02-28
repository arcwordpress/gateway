import { useState, useEffect } from 'react'
import { Outlet, Link } from '@tanstack/react-router'
import { appConfig } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { AppContext } from '../context/app'

// ─── Nav link ──────────────────────────────────────────────────────────────
function NavLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      className="flex items-center px-3 py-2 rounded text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
      activeProps={{
        className:
          'flex items-center px-3 py-2 rounded text-sm text-blue-300 bg-blue-500/10 hover:text-blue-300 hover:bg-blue-500/10 transition-colors',
      }}
    >
      {label}
    </Link>
  )
}

// ─── Section divider ───────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600 select-none">
      {label}
    </p>
  )
}

// ─── Root layout ───────────────────────────────────────────────────────────
//
//  ┌──────┬──────────────────────────────────┐
//  │      │  HEADER            [EXPAND/EXIT]  │
//  │ LEFT ├──────────────────────────────────┤
//  │      │  MAIN                            │
//  │      ├──────────────────────────────────┤
//  │      │  FOOTER            credit →      │
//  └──────┴──────────────────────────────────┘
//
export default function RootLayout() {
  const [isExpanded, setIsExpanded] = useState(false)
  const toggleExpand = () => setIsExpanded((v) => !v)

  // In normal WP embed mode the host page provides a fixed 32 px admin bar.
  // When expanded we take over the full viewport with fixed positioning.
  const isWP = appConfig.isWordPress

  useEffect(() => {
    if (!isWP) return
    const root = document.getElementById('gateway-raptor-root')
    if (!root) return
    root.style.marginLeft = '-20px'
  }, [isWP])

  return (
    <AppContext.Provider value={{ isExpanded, toggleExpand }}>
      <div
        className="dark flex text-gray-100 bg-gray-950"
        style={
          isExpanded
            ? { position: 'fixed', inset: 0, zIndex: 99999 }
            : { height: isWP ? 'calc(100vh - 32px)' : '100vh' }
        }
      >
        {/* ── LEFT panel — full height ──────────────────────────────── */}
        <aside className="w-48 shrink-0 border-r border-gray-800 flex flex-col h-full">
          <div className="px-4 py-4 border-b border-gray-800">
            <Header.Logo />
          </div>

          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            <SectionLabel label="App" />
            <NavLink to="/graph" label="Site" />

            <SectionLabel label="Data" />
            <NavLink to="/extensions" label="Extensions" />
          </nav>
        </aside>

        {/* ── Right column: HEADER + MAIN + FOOTER stacked ─────────── */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          {/* HEADER */}
          <div className="h-12 shrink-0 border-b border-gray-800 flex items-center justify-end px-4">
            <button
              onClick={toggleExpand}
              className="text-[11px] font-semibold tracking-widest uppercase text-gray-500 hover:text-gray-200 transition-colors px-2 py-1"
            >
              {isExpanded ? 'Exit' : 'Expand'}
            </button>
          </div>

          {/* MAIN */}
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>

          {/* FOOTER */}
          <Footer className="px-6 py-2.5 border-t border-gray-800 justify-end shrink-0">
            <Footer.Credit>Raptor v0.1.0</Footer.Credit>
          </Footer>
        </div>
      </div>
    </AppContext.Provider>
  )
}
