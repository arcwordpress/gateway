import { useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useWorkspace } from '../context/workspace'
import { apiUrl, authHeaders } from '../lib/api'
import type { Collection } from '../lib/object_types'

export default function FieldsTopLevelPage() {
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
    <section className="px-12 py-8 text-white">
      <h1 className="text-2xl font-bold text-neutral-200">Fields</h1>
      <p className="mt-2 text-sm text-gray-400">All Collections · {totalFields} fields</p>

      {groups.length === 0 ? (
        <div className="mt-8 rounded border border-gray-800 bg-gray-900/40 p-4 text-sm text-gray-400">
          No fields found yet.
        </div>
      ) : (
        <div className="mt-8 space-y-5">
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
    </section>
  )
}
