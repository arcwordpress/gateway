import { useWorkspace } from '../context/workspace'

export function CollectionSwitcher() {
  const { activeCollectionKey, collections, isCollectionsLoading, setActiveCollectionKey } = useWorkspace()

  return (
    <div className="flex items-center gap-3 rounded border border-gray-700 bg-gray-900/50 p-3">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Collection</span>
      <select
        value={activeCollectionKey ?? ''}
        onChange={(e) => setActiveCollectionKey(e.target.value || null)}
        className="h-8 min-w-[240px] rounded border border-gray-700 bg-[#0f1216] px-2 text-xs text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500"
        disabled={isCollectionsLoading}
      >
        <option value="">All Collections</option>
        {collections.map((c) => (
          <option key={c.id} value={c.collection_key}>
            {c.title}
          </option>
        ))}
      </select>
      <span className="text-xs text-gray-300">
        {collections.find((c) => c.collection_key === activeCollectionKey)?.title ?? 'Global scope'}
      </span>
    </div>
  )
}
