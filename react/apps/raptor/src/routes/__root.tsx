import { useEffect } from 'react'
import { Outlet, Link } from '@tanstack/react-router'
import { appConfig } from '../config'
import Header from '../components/Header'
import Footer from '../components/Footer'

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
//  │      │  HEADER                          │
//  │ LEFT ├──────────────────────────────────┤
//  │      │  MAIN                            │
//  │      ├──────────────────────────────────┤
//  │      │  FOOTER            credit →      │
//  └──────┴──────────────────────────────────┘
//
export default function RootLayout() {
  useEffect(() => {
    if (!appConfig.isWordPress) return
    const root = document.getElementById('gateway-raptor-root')
    if (!root) return
    root.style.marginLeft = '-20px'
  }, [])

  return (
    <div
      className="dark flex text-gray-100 bg-gray-950"
      style={{ height: appConfig.isWordPress ? 'calc(100vh - 32px)' : '100vh' }}
    >
      {/* ── LEFT panel — full height ──────────────────────────────────── */}
      <aside className="w-48 shrink-0 border-r border-gray-800 flex flex-col h-full">
        {/* Logo at the top of the LEFT stack */}
        <div className="px-4 py-4 border-b border-gray-800">
          <Header.Logo />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          <SectionLabel label="App" />
          <NavLink to="/graph" label="Site" />
          <NavLink to="/fields" label="Fields" />

          <SectionLabel label="Data" />
          <NavLink to="/extensions" label="Extensions" />
        </nav>
      </aside>

      {/* ── Right column: HEADER + MAIN + FOOTER stacked ─────────────── */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        {/* HEADER — horizontal bar across the top */}
        <div className="h-12 shrink-0 border-b border-gray-800" />

        {/* MAIN — scrollable content area */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>

        {/* FOOTER — horizontal bar across the bottom */}
        <Footer className="px-6 py-2.5 border-t border-gray-800 justify-end shrink-0">
          <Footer.Credit>Raptor v0.1.0</Footer.Credit>
        </Footer>
      </div>
    </div>
  )
}
