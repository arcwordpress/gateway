import { useNavigate } from '@tanstack/react-router'
import { useWorkspace } from '../../context/workspace'

interface TopLevelTopBarProps {
  section: 'fields' | 'views' | 'forms'
  viewMode: 'graph' | 'list'
  onViewModeChange: (mode: 'graph' | 'list') => void
}

/**
 * Floating top bar for the "all collections" overview pages (/fields, /views, /forms).
 * Contains a collection switcher (navigates into the collection-specific builder when
 * a collection is selected) and a Graph / List view mode toggle.
 */
export function TopLevelTopBar({ section, viewMode, onViewModeChange }: TopLevelTopBarProps) {
  const { activeCollectionKey, collections, isCollectionsLoading } = useWorkspace()
  const navigate = useNavigate()

  const handleCollectionChange = (value: string) => {
    const nextKey = value || null
    void navigate(
      nextKey
        ? { to: `/collections/$collectionKey/${section}`, params: { collectionKey: nextKey } }
        : { to: `/${section}` },
    )
  }

  return (
    <div
      className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between px-4 py-2 rounded border border-zinc-700 bg-dark backdrop-blur-sm"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400">Collection</span>
        <select
          value={activeCollectionKey ?? ''}
          onChange={(e) => handleCollectionChange(e.target.value)}
          className="h-8 min-w-[240px] rounded border border-zinc-700 bg-dark px-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
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

      <div className="flex gap-1 border border-zinc-700 rounded p-1 bg-zinc-900/50">
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
    </div>
  )
}
