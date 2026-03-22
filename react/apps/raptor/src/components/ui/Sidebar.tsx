import { Link, useRouterState } from '@tanstack/react-router'
import { Maximize2, Minimize2, Settings2, type LucideIcon } from 'lucide-react'

// ─── Helper function to determine if a link is active ─────────────────────
function getIsActive(to: string, pathname: string): boolean {
  // For /collections, match either of the two collections routes
  if (to === '/collections') {
    return pathname === '/collections' || pathname === '/collections/registered'
  }

  // For /fields, /forms, /views, match either:
  // 1. The exact path (e.g., /fields)
  // 2. The nested path in builder (e.g., /collections/*/fields)
  if (to === '/fields') {
    return pathname === '/fields' || /^\/collections\/[^/]+\/fields/.test(pathname)
  }
  if (to === '/forms') {
    return pathname === '/forms' || /^\/collections\/[^/]+\/forms/.test(pathname)
  }
  if (to === '/views') {
    return pathname === '/views' || /^\/collections\/[^/]+\/views/.test(pathname)
  }

  // For /records, match the index and all nested record routes
  if (to === '/records') {
    return pathname === '/records' || pathname.startsWith('/records/')
  }

  // For other routes, use exact match
  return pathname === to
}

// ─── Nav link ──────────────────────────────────────────────────────────────
function NavLink({ to, label, icon: Icon }: { to: string; label: string; icon?: LucideIcon }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isActive = getIsActive(to, pathname)

  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      className={
        isActive
          ? 'gateway-sidebar-link flex items-center gap-2 px-3 py-2 rounded text-sm !text-zinc-100 bg-zinc-700/35 hover:!text-zinc-100 hover:bg-zinc-700/35 transition-colors'
          : 'gateway-sidebar-link flex items-center gap-2 px-3 py-2 rounded text-sm !text-zinc-400 hover:!text-zinc-100 hover:bg-zinc-700/25 transition-colors'
      }
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-current" />}
      {label}
    </Link>
  )
}

// ─── Section divider ───────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 select-none">
      {label}
    </p>
  )
}

// ─── Sidebar ───────────────────────────────────────────────────────────────
export default function Sidebar({
  isExpanded,
  onToggleExpand,
}: {
  isExpanded: boolean
  onToggleExpand: () => void
}) {
  return (
    <nav className="flex-1 flex flex-col justify-between min-h-0">
      {/* Top navigation items - scrollable */}
      <div className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        <SectionLabel label="Structure" />
        <NavLink to="/" label="Dashboard" />
        <NavLink to="/extensions" label="Extensions" />
        <NavLink to="/collections" label="Collections" />

        <SectionLabel label="Builders" />
        <NavLink to="/fields" label="Fields" />
        <NavLink to="/forms" label="Forms" />
        <NavLink to="/views" label="Views" />

        <SectionLabel label="Records" />
        <NavLink to="/records" label="All Records" />
      </div>

      {/* Bottom items - always visible at bottom */}
      <div className="p-2 space-y-0.5">
        <SectionLabel label="Help" />
        <NavLink to="/docs" label="Documentation" />
        <NavLink to="/docs" label="Support" />

        <NavLink to="/settings" label="Settings" icon={Settings2} />

        <button
          onClick={onToggleExpand}
          className="gateway-sidebar-link w-full flex items-center gap-2 px-3 py-2 rounded text-sm !text-zinc-400 hover:!text-zinc-100 hover:bg-zinc-700/25 transition-colors"
        >
          {isExpanded ? <Minimize2 className="h-3.5 w-3.5 shrink-0" /> : <Maximize2 className="h-3.5 w-3.5 shrink-0" />}
          {isExpanded ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>
    </nav>
  )
}
