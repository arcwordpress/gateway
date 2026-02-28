import { Outlet, Link } from '@tanstack/react-router'
import { appConfig } from '../config'

// ─── Nav link ──────────────────────────────────────────────────────────────
// `to` is string so it works for all routes; TanStack Router Link validates
// at runtime in dev mode.
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

// ─── Sidebar — rendered outside <Outlet>, stable across all route changes ──
function Sidebar() {
  return (
    <aside
      className="w-48 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col"
      // Full-height in standalone, body-height in WP (accounts for WP admin bar + page title)
      style={{ minHeight: appConfig.isWordPress ? 'inherit' : '100vh' }}
    >
      {/* Logo / wordmark */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-800">
        <span className="text-blue-400">⬡</span>
        <span className="font-semibold text-gray-100 text-sm tracking-wide">Raptor</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        <SectionLabel label="App" />
        <NavLink to="/" label="Dashboard" />
        <NavLink to="/graph" label="Graph Editor" />

        <SectionLabel label="Data" />
        <NavLink to="/extensions" label="Extensions" />
      </nav>
    </aside>
  )
}

// ─── Root layout ───────────────────────────────────────────────────────────
export default function RootLayout() {
  return (
    <div
      className="dark flex bg-gray-950 text-gray-100"
      style={{ minHeight: appConfig.isWordPress ? 'calc(100vh - 80px)' : '100vh' }}
    >
      {/*
       * Sidebar is a sibling to the router outlet — the same pattern as Exta's
       * LeftSidebar sitting alongside <Routes>. It never unmounts on navigation.
       */}
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
