import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useWorkspace } from '../context/workspace'
import { GlobalFormsGraph } from './Forms/GlobalFormsGraph'
import { BuilderLayout } from './Builders/BuilderLayout'
import { BuilderTopBar } from './Builders/BuilderTopBar'
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

  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: COLLECTIONS_NESTED_KEY,
    queryFn: fetchCollectionsWithNested,
    staleTime: 30_000,
    enabled: !activeCollectionKey,
  })

  if (activeCollectionKey) {
    return <div className="p-8 text-zinc-400">Opening active collection forms...</div>
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
        <GlobalFormsGraph collections={collections} />
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

      <BuilderTopBar viewMode={viewMode} onViewModeChange={setViewMode} />
    </BuilderLayout>
  )
}
