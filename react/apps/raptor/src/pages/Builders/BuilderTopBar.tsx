import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useWorkspace } from '../../context/workspace'

/**
 * Floating top bar for builder pages.
 * Contains collection switcher and floats above graph with margin from edges.
 */
export function BuilderTopBar() {
  const { activeCollectionKey, collections, isCollectionsLoading, setActiveCollectionKey } = useWorkspace()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const handleCollectionChange = (value: string) => {
    const nextKey = value || null
    setActiveCollectionKey(nextKey)

    const inFields = /^\/collections\/[^/]+\/fields/.test(pathname)
    const inViews = /^\/collections\/[^/]+\/views/.test(pathname)
    const inForms = /^\/collections\/[^/]+\/forms/.test(pathname)

    if (!nextKey) {
      if (inFields) void navigate({ to: '/fields' })
      if (inViews) void navigate({ to: '/views' })
      if (inForms) void navigate({ to: '/forms' })
      return
    }

    if (inFields) {
      void navigate({ to: '/collections/$collectionKey/fields', params: { collectionKey: nextKey } })
    }
    if (inViews) {
      void navigate({ to: '/collections/$collectionKey/views', params: { collectionKey: nextKey } })
    }
    if (inForms) {
      void navigate({ to: '/collections/$collectionKey/forms', params: { collectionKey: nextKey } })
    }
  }

  return (
    <div
      className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded border border-gray-700 bg-dark backdrop-blur-sm"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
    >
      <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">Active Collection</span>
      <select
        value={activeCollectionKey ?? ''}
        onChange={(e) => handleCollectionChange(e.target.value)}
        className="h-8 min-w-[240px] rounded border border-zinc-400 bg-zinc-700 px-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        disabled={isCollectionsLoading}
      >
        <option value="">All Collections</option>
        {collections.map((c) => (
          <option key={c.id} value={c.collection_key}>
            {c.title}
          </option>
        ))}
      </select>
    </div>
  )
}
