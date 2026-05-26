import { useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useWorkspace } from '../context/workspace'
import { BuilderLayout } from './Builders/BuilderLayout'
import { BuilderSkeleton } from './Builders/BuilderSkeleton'
import { BuilderTopBar } from './Builders/BuilderTopBar'
import { COLLECTIONS_NESTED_KEY, fetchCollectionsWithNested } from '../lib/queries'
import type { Collection } from '../lib/object_types'

export default function FieldsTopLevelPage() {
  const navigate = useNavigate()
  const { activeCollectionKey, collections: workspaceCollections, isCollectionsLoading } = useWorkspace()

  const activeExists = !isCollectionsLoading && workspaceCollections.some((c) => c.collection_key === activeCollectionKey)
  useEffect(() => {
    if (!activeCollectionKey || !activeExists) return
    void navigate({
      to: '/collections/$collectionKey/fields',
      params: { collectionKey: activeCollectionKey },
    })
  }, [activeCollectionKey, activeExists, navigate])

  const { data: collections = [], isLoading: isNestedLoading } = useQuery<Collection[]>({
    queryKey: COLLECTIONS_NESTED_KEY,
    queryFn: fetchCollectionsWithNested,
  })

  if (isCollectionsLoading || isNestedLoading || (activeCollectionKey && activeExists)) {
    return <BuilderSkeleton />
  }

  const groups = collections
    .map((collection) => ({
      collection,
      fields: collection?.field_list?.fields ?? [],
    }))
    .filter((g) => g.fields.length > 0)

  const totalFields = groups.reduce((sum, g) => sum + g.fields.length, 0)

  return (
    <BuilderLayout>
      <div className="absolute top-20 left-4 right-4 bottom-4 z-[5] overflow-auto rounded border border-zinc-800 bg-zinc-950/70 backdrop-blur-sm px-8 py-6 text-white">
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

      <BuilderTopBar />
    </BuilderLayout>
  )
}
