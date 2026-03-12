import { Link, useRouterState, useNavigate } from '@tanstack/react-router'
import { Maximize2, Minimize2, Settings2, type LucideIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../../lib/api'

// ─── Helper function to determine if a link is active ─────────────────────
function getIsActive(to: string, pathname: string): boolean {
  // For /collections, match exactly (no nested paths)
  if (to === '/collections') {
    return pathname === '/collections'
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

  // For /records/$collectionKey links, match the link and any sub-routes
  if (to.startsWith('/records/')) {
    return pathname === to || pathname.startsWith(to + '/')
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
    <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600 select-none">
      {label}
    </p>
  )
}

// ─── Records section ────────────────────────────────────────────────────────

type AdminCollection = {
  key: string
  titlePlural: string
  record_count: number
}

function RecordsSidebarSection() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const { data, isLoading } = useQuery<{ collections: AdminCollection[] }>({
    queryKey: ['gateway-admin-data'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/admin-data'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    staleTime: 60_000,
  })

  const collections = data?.collections ?? []

  return (
    <>
      <SectionLabel label="Records" />

      {isLoading && (
        <div className="space-y-1 px-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 rounded bg-zinc-800/40 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && collections.length === 0 && (
        <p className="px-3 py-1.5 text-xs text-zinc-600">No collections registered</p>
      )}

      {collections.map((col) => {
        const to = `/records/${col.key}`
        const isActive = getIsActive(to, pathname)
        return (
          <button
            key={col.key}
            onClick={() => void navigate({ to: to as never })}
            className={
              isActive
                ? 'gateway-sidebar-link w-full flex items-center justify-between gap-2 px-3 py-2 rounded text-sm !text-zinc-100 bg-zinc-700/35 hover:!text-zinc-100 hover:bg-zinc-700/35 transition-colors'
                : 'gateway-sidebar-link w-full flex items-center justify-between gap-2 px-3 py-2 rounded text-sm !text-zinc-400 hover:!text-zinc-100 hover:bg-zinc-700/25 transition-colors'
            }
          >
            <span className="truncate text-left">{col.titlePlural}</span>
            <span className="shrink-0 text-[10px] tabular-nums text-zinc-600 bg-zinc-800/60 px-1.5 py-0.5 rounded-full">
              {col.record_count.toLocaleString()}
            </span>
          </button>
        )
      })}
    </>
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

        <RecordsSidebarSection />
      </div>

      {/* Bottom items - always visible at bottom */}
      <div className="p-2 space-y-0.5">
        <SectionLabel label="Help" />
        <a
          href="https://arcwp.ca/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="gateway-sidebar-link flex items-center px-3 py-2 rounded text-sm !text-zinc-400 hover:!text-zinc-100 hover:bg-zinc-700/25 transition-colors"
        >
          Documentation
        </a>
        <a
          href="https://arcwp.ca/support"
          target="_blank"
          rel="noopener noreferrer"
          className="gateway-sidebar-link flex items-center px-3 py-2 rounded text-sm !text-zinc-400 hover:!text-zinc-100 hover:bg-zinc-700/25 transition-colors"
        >
          Support
        </a>

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
