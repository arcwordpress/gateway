import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useWorkspace } from '../context/workspace'
import { GlobalFormsGraph } from './Forms/GlobalFormsGraph'
import { BuilderLayout } from './Builders/BuilderLayout'
import { COLLECTIONS_NESTED_KEY, fetchCollectionsWithNested } from '../lib/queries'
import type { Collection } from '../lib/object_types'

export default function FormsTopLevelPage() {
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph')
  const navigate = useNavigate()
  const { activeCollectionKey, collections: workspaceCollections, isCollectionsLoading } = useWorkspace()

  useEffect(() => {
    if (!activeCollectionKey || isCollectionsLoading) return
    const exists = workspaceCollections.some((c) => c.collection_key === activeCollectionKey)
    if (!exists) return
    void navigate({
      to: '/collections/$collectionKey/forms',
      params: { collectionKey: activeCollectionKey },
    })
  }, [activeCollectionKey, isCollectionsLoading, navigate, workspaceCollections])

  const { data: collections = [], isLoading } = useQuery<Collection[]>({
    queryKey: COLLECTIONS_NESTED_KEY,
    queryFn: fetchCollectionsWithNested,
    staleTime: 30_000,
    enabled: !activeCollectionKey,
  })

  if (activeCollectionKey) {
    return <div className="p-8 text-zinc-400">Opening active collection forms...</div>
  }

  if (isLoading) {
    return <div className="p-8 text-zinc-400">Loading forms...</div>
  }

  const groups = collections
    .map((collection) => ({
      collection,
      forms: collection.form_list?.forms ?? [],
    }))
    .filter((g) => g.forms.length > 0)

  const totalForms = groups.reduce((sum, g) => sum + g.forms.length, 0)

  return (
    <BuilderLayout>
      {/* Graph - edge to edge */}
      {viewMode === 'graph' ? (
        <GlobalFormsGraph />
      ) : (
        <div className="w-full h-full overflow-auto bg-zinc-950 px-12 py-8 text-white">
          <h1 className="text-2xl font-bold text-zinc-200 mb-2">Forms</h1>
          <p className="text-sm text-zinc-400 mb-8">All Collections · {totalForms} forms</p>
          {groups.length === 0 ? (
            <div className="rounded border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-400">
              No forms found yet.
            </div>
          ) : (
            <div className="space-y-5">
              {groups.map(({ collection, forms }) => (
                <article key={collection.id} className="rounded border border-zinc-800 bg-zinc-900/40 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-zinc-200">{collection.title}</h2>
                    <Link
                      to="/collections/$collectionKey/forms"
                      params={{ collectionKey: collection.collection_key }}
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-zinc-200"
                    >
                      Open Builder
                    </Link>
                  </div>
                  <ul className="space-y-2">
                    {forms.map((form) => (
                      <li key={`${collection.id}-${form.form_key}`} className="text-sm text-zinc-300">
                        {form.title || form.form_key}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating topbar with collection selector and view toggle */}
      <div
        className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between px-4 py-2 rounded border border-zinc-700 bg-dark backdrop-blur-sm"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400">Collection</span>
          <select
            value={activeCollectionKey ?? ''}
            onChange={(e) => {
              const nextKey = e.target.value || null
              navigate({
                to: nextKey
                  ? '/collections/$collectionKey/forms'
                  : '/forms',
                params: nextKey ? { collectionKey: nextKey } : undefined,
              })
            }}
            className="h-8 min-w-[240px] rounded border border-zinc-700 bg-dark px-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            disabled={isCollectionsLoading}
          >
            <option value="">All Collections</option>
            {workspaceCollections.map((c) => (
              <option key={c.id} value={c.collection_key}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* View mode toggle on the right */}
        <div className="flex gap-1 border border-zinc-700 rounded p-1 bg-zinc-900/50">
          <button
            onClick={() => setViewMode('graph')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'graph'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Graph
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            List
          </button>
        </div>
      </div>
    </BuilderLayout>
  )
}
