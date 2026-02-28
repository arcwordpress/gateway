import { Outlet, Link } from '@tanstack/react-router'
import { appConfig } from '../config'

function Sidebar() {
  return (
    <nav className="w-52 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col p-3 gap-1">
      <div className="flex items-center gap-2 px-2 py-3 mb-2 border-b border-gray-800">
        <span className="text-blue-400 text-lg">⬡</span>
        <span className="font-semibold text-gray-100 tracking-wide text-sm">Raptor</span>
      </div>

      <NavLink to="/" label="Dashboard" icon="▦" />
      <NavLink to="/graph" label="Graph Editor" icon="⬡" />
    </nav>
  )
}

function TopBar() {
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-gray-900 border-b border-gray-800">
      <span className="text-blue-400 mr-2 text-sm font-semibold">⬡ Raptor</span>
      <NavLink to="/" label="Dashboard" icon="" compact />
      <NavLink to="/graph" label="Graph Editor" icon="" compact />
    </div>
  )
}

function NavLink({
  to,
  label,
  icon,
  compact = false,
}: {
  to: '/' | '/graph'
  label: string
  icon: string
  compact?: boolean
}) {
  const base = compact
    ? 'px-3 py-1 text-sm rounded transition-colors'
    : 'flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors'

  return (
    <Link
      to={to}
      className={`${base} text-gray-400 hover:text-gray-100 hover:bg-gray-800`}
      activeProps={{ className: `${base} text-blue-300 bg-blue-500/10 hover:text-blue-300 hover:bg-blue-500/10` }}
    >
      {!compact && icon && <span className="text-xs opacity-60">{icon}</span>}
      {label}
    </Link>
  )
}

export default function RootLayout() {
  const { isWordPress } = appConfig

  return (
    <div
      className="dark flex bg-gray-950 text-gray-100"
      style={{ minHeight: isWordPress ? 'calc(100vh - 80px)' : '100vh' }}
    >
      {!isWordPress && <Sidebar />}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {isWordPress && <TopBar />}

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
