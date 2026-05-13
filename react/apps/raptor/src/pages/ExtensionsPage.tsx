import { Link, useRouterState } from '@tanstack/react-router'
import RegisteredExtensionsCard from '../components/extensions/RegisteredExtensionsCard'

// ─── Shared tab nav ───────────────────────────────────────────────────────────

export function ExtensionsTabs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const tabCls = (active: boolean) =>
    active
      ? 'px-4 py-2.5 text-xs font-semibold border-b-2 border-zinc-400 !text-zinc-200 transition-colors'
      : 'px-4 py-2.5 text-xs font-semibold border-b-2 border-transparent !text-zinc-400 hover:!text-zinc-200 transition-colors'

  return (
    <div className="shrink-0 flex border-b border-zinc-800" style={{ backgroundColor: 'var(--gty-admin-dark)' }}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Link to={'/extensions' as any} className={tabCls(pathname === '/extensions')}>
        Registered Extensions
      </Link>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Link to={'/extensions/editor' as any} className={tabCls(pathname === '/extensions/editor')}>
        Extension Editor
      </Link>
    </div>
  )
}

// ─── /extensions ─────────────────────────────────────────────────────────────

export default function ExtensionsPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ExtensionsTabs />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          <RegisteredExtensionsCard />
        </div>
      </div>
    </div>
  )
}
