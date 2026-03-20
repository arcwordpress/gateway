import { Link, useRouterState } from '@tanstack/react-router'
import CollectionsViewer from './CollectionsViewer'

// ─── Shared tab nav (used by both collections routes) ─────────────────────────

export function CollectionsTabs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const tabCls = (active: boolean) =>
    active
      ? 'px-4 py-2.5 text-xs font-semibold border-b-2 border-zinc-400 !text-zinc-200 transition-colors'
      : 'px-4 py-2.5 text-xs font-semibold border-b-2 border-transparent !text-zinc-400 hover:!text-zinc-200 transition-colors'

  return (
    <div className="shrink-0 flex border-b border-zinc-800" style={{ backgroundColor: 'var(--app-bg)' }}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Link to={'/collections' as any} className={tabCls(pathname === '/collections')}>
        Editable Collections
      </Link>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Link to={'/collections/registered' as any} className={tabCls(pathname === '/collections/registered')}>
        Registered Collections
      </Link>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Link to={'/collections/relationships' as any} className={tabCls(pathname === '/collections/relationships')}>
        Relationships
      </Link>
    </div>
  )
}

// ─── /collections ─────────────────────────────────────────────────────────────

export default function CollectionsPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <CollectionsTabs />
      <div className="flex-1 overflow-hidden">
        <CollectionsViewer />
      </div>
    </div>
  )
}
