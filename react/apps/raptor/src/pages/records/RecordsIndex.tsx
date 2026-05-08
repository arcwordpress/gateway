import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { REGISTERED_COLLECTIONS_KEY, fetchRegisteredCollections } from '../../lib/queries'

export default function RecordsIndex() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: [...REGISTERED_COLLECTIONS_KEY, 'with-counts'],
    queryFn: () => fetchRegisteredCollections(true),
  })

  const collections = data ?? []

  return (
    <div className="h-full overflow-auto bg-[var(--app-bg)]">
      <div className="border-b border-zinc-800 px-6 py-4">
        <h1 className="text-lg font-semibold text-zinc-200">Records</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Browse records across all registered collections</p>
      </div>

      <div className="px-6 py-4">
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-zinc-800 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && collections.length === 0 && (
          <p className="text-sm text-zinc-500 py-8 text-center">No collections registered.</p>
        )}

        {!isLoading && collections.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((col) => (
              <button
                key={col.key}
                onClick={() =>
                  void navigate({
                    to: '/records/$collectionKey' as never,
                    params: { collectionKey: col.key } as never,
                  })
                }
                className="text-left border border-zinc-800 rounded-lg px-5 py-4 hover:border-zinc-600 hover:bg-zinc-800/50 transition-colors group"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100 truncate">
                    {col.titlePlural}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums font-medium text-zinc-500 bg-zinc-800 group-hover:bg-zinc-700 group-hover:text-zinc-300 px-2 py-0.5 rounded-full transition-colors">
                    {typeof col.record_count === 'number' ? col.record_count.toLocaleString() : '—'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">{col.key}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
