import { useNavigate, useRouterState } from '@tanstack/react-router'
import { List } from 'lucide-react'
import { useWorkspace } from '../../context/workspace'

interface BuilderTopBarProps {
  showPanel?: boolean
  onTogglePanel?: () => void
  viewMode?: 'graph' | 'list'
  onViewModeChange?: (mode: 'graph' | 'list') => void
}

export function BuilderTopBar({ showPanel, onTogglePanel, viewMode, onViewModeChange }: BuilderTopBarProps = {}) {
  const { activeCollectionKey, collections, isCollectionsLoading, setActiveCollectionKey } = useWorkspace()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const handleCollectionChange = (value: string) => {
    const nextKey = value || null
    setActiveCollectionKey(nextKey)

    const inFields = /^\/collections\/[^/]+\/fields/.test(pathname) || pathname === '/fields'
    const inViews  = /^\/collections\/[^/]+\/views/.test(pathname)  || pathname === '/views'
    const inForms  = /^\/collections\/[^/]+\/forms/.test(pathname)  || pathname === '/forms'

    if (!nextKey) {
      if (inFields) void navigate({ to: '/fields' })
      if (inViews)  void navigate({ to: '/views' })
      if (inForms)  void navigate({ to: '/forms' })
      return
    }

    if (inFields) void navigate({ to: '/collections/$collectionKey/fields', params: { collectionKey: nextKey } })
    if (inViews)  void navigate({ to: '/collections/$collectionKey/views',  params: { collectionKey: nextKey } })
    if (inForms)  void navigate({ to: '/collections/$collectionKey/forms',  params: { collectionKey: nextKey } })
  }

  return (
    <div
      className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded bg-dark backdrop-blur-sm"
      style={{ boxShadow: '0 4px 20px rgba(161,161,170,0.18)' }}
    >
      <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400">Active Collection</span>
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

      {onViewModeChange && viewMode != null && (
        <div className="ml-auto flex gap-1 border border-zinc-700 rounded p-1 bg-zinc-900/50">
          <button
            onClick={() => onViewModeChange('graph')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'graph' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Graph
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            List
          </button>
        </div>
      )}

      {onTogglePanel && (
        <button
          onClick={onTogglePanel}
          title={showPanel ? 'Hide panel' : 'Show panel'}
          className="ml-auto flex items-center justify-center w-8 h-8 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 transition-colors"
        >
          <List size={14} />
        </button>
      )}
    </div>
  )
}
