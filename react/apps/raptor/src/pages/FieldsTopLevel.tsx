import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useWorkspace } from '../context/workspace'
import { GlobalFieldsGraph } from './Fields/GlobalFieldsGraph'
import { BuilderLayout } from './Builders/BuilderLayout'
import { apiUrl, authHeaders } from '../lib/api'
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
    queryKey: ['raptor-collections-with-nested', 'fields'],
    queryFn: async () => {
      const listRes = await fetch(apiUrl('gateway/v1/raptor/collection'), { headers: authHeaders() })
      if (!listRes.ok) return []
      const listJson = await listRes.json() as {
        collections?: Array<{ collection_key: string }>
      }
      const items = listJson.collections ?? []
      if (items.length === 0) return []

      const details = await Promise.all(
        items.map(async (item) => {
          const detailRes = await fetch(
            apiUrl(`gateway/v1/raptor/collection/${item.collection_key}`),
            { headers: authHeaders() },
          )
          if (!detailRes.ok) return null
          const detailJson = await detailRes.json() as { collection?: Collection }
          return detailJson.collection ?? null
        }),
      )

      return details.filter((c): c is Collection => c !== null)
    },
    enabled: !activeCollectionKey,
  })

  if (activeCollectionKey) {
    return <div className="p-8 text-gray-400">Opening active collection fields...</div>
  }

  if (isLoading) {
    return <div className="p-8 text-gray-400">Loading fields...</div>
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
      {/* Graph - edge to edge */}
      {viewMode === 'graph' ? (
        <GlobalFieldsGraph />
      ) : (
        <div className="w-full h-full overflow-auto bg-gray-950 px-12 py-8 text-white">
          <h1 className="text-2xl font-bold text-neutral-200 mb-2">Fields</h1>
          <p className="text-sm text-gray-400 mb-8">All Collections · {totalFields} fields</p>
          {groups.length === 0 ? (
            <div className="rounded border border-gray-800 bg-gray-900/40 p-4 text-sm text-gray-400">
              No fields found yet.
            </div>
          ) : (
            <div className="space-y-5">
              {groups.map(({ collection, fields }) => (
                <article key={collection.id} className="rounded border border-gray-800 bg-gray-900/40 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-200">{collection.title}</h2>
                    <Link
                      to="/collections/$collectionKey/fields"
                      params={{ collectionKey: collection.collection_key }}
                      className="text-xs font-semibold uppercase tracking-wider text-cyan-300 hover:text-cyan-200"
                    >
                      Open Builder
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {fields.map((field) => (
                      <span key={`${collection.id}-${field.name}`} className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-300">
                        {field.label || field.name}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating topbar with collection selector and view toggle */}
      <div
        className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between px-4 py-2 rounded border border-gray-700 bg-[#0f1216]/95 backdrop-blur-sm"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">Collection</span>
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
            className="h-8 min-w-[240px] rounded border border-gray-700 bg-[#0f1216] px-2 text-xs text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500"
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
        <div className="flex gap-1 border border-gray-700 rounded p-1 bg-gray-900/50">
          <button
            onClick={() => setViewMode('graph')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'graph'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Graph
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            List
          </button>
        </div>
      </div>
    </BuilderLayout>
  )
}
