import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useWorkspace } from '../context/workspace'
import { GlobalFieldsGraph } from './Fields/GlobalFieldsGraph'
import { BuilderLayout } from './Builders/BuilderLayout'
import { BuilderSkeleton } from './Builders/BuilderSkeleton'
import { COLLECTIONS_NESTED_KEY, fetchCollectionsWithNested } from '../lib/queries'
import type { Collection } from '../lib/object_types'

export default function FieldsTopLevelPage() {
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph')
  const navigate = useNavigate()
  const { activeCollectionKey, collections: workspaceCollections, isCollectionsLoading } = useWorkspace()

  useEffect(() => {
    if (!activeCollectionKey || isCollectionsLoading) return
    const exists = workspaceCollections.some((c) => c.collection_key === activeCollectionKey)
    if (!exists) return
    void navigate({
      to: '/collections/$collectionKey/fields',
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
    return <BuilderSkeleton />
  }

  const groups = collections
    .map((collection) => ({
      collection,
      fields: collection.field_list?.fields ?? [],
    }))
    .filter((g) => g.fields.length > 0)

  const totalFields = groups.reduce((sum, g) => sum + g.fields.length, 0)

  return (
    <BuilderLayout>
      <div
        className={`absolute inset-0 transition-all duration-300 ease-out ${
          viewMode === 'graph'
            ? 'opacity-100 blur-0 pointer-events-auto'
            : 'opacity-25 blur-[2px] pointer-events-none'
        }`}
      >
        <GlobalFieldsGraph />
      </div>

      <div
        className={`absolute top-20 left-4 right-4 bottom-4 z-[5] transition-all duration-300 ease-out ${
          viewMode === 'list'
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-1 pointer-events-none'
        }`}
      >
        <div className="w-full h-full overflow-auto rounded border border-zinc-800 bg-zinc-950/70 backdrop-blur-sm px-8 py-6 text-white">
          <h1 className="text-2xl font-bold text-zinc-200 mb-2">Fields</h1>
          <p className="text-sm text-zinc-400 mb-8">All Collections · {totalFields} fields</p>
          {groups.length === 0 ? (
            <div className="rounded border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-400">
              No fields found yet.
            </div>
          ) : (
            <div className="space-y-5">
              {groups.map(({ collection, fields }) => (
                <article key={collection.id} className="rounded border border-zinc-800 bg-zinc-900/40 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-zinc-200">{collection.title}</h2>
                    <Link
                      to="/collections/$collectionKey/fields"
                      params={{ collectionKey: collection.collection_key }}
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-zinc-200"
                    >
                      Open Builder
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {fields.map((field) => (
                      <span key={`${collection.id}-${field.name}`} className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                        {field.label || field.name}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

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
                  ? '/collections/$collectionKey/fields'
                  : '/fields',
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
