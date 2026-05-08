import { useNavigate, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../../lib/api'
import { SingleView } from '@arcwp/gateway-grids'
import { REGISTERED_COLLECTIONS_KEY, fetchRegisteredCollections } from '../../lib/queries'
import '@arcwp/gateway-forms/style.css'

type RaptorField = { name: string; label?: string; type?: string }
type RaptorCollectionDetail = {
  collection_key: string
  title: string
  label_field: string | null
  field_list?: { fields: RaptorField[] }
}

export default function RecordView() {
  const { collectionKey, id } = useParams({ strict: false }) as {
    collectionKey: string
    id: string
  }
  const navigate = useNavigate()

  // Raptor collection metadata — field definitions + label_field
  const { data: raptorColl } = useQuery<RaptorCollectionDetail>({
    queryKey: ['raptor-collection', collectionKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection/${collectionKey}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.collection as RaptorCollectionDetail
    },
  })

  // Route info comes from the shared registered-collections cache (CollectionRegistry).
  // RecordsIndex already populates this — no extra network call needed when navigating normally.
  const { data: registeredCollections } = useQuery({
    queryKey: REGISTERED_COLLECTIONS_KEY,
    queryFn: () => fetchRegisteredCollections(false),
  })

  const gwRoutes = registeredCollections?.find((c) => c.key === collectionKey)?.routes ?? null

  // Specific record — fetched using the route registered by the collection class
  const { data: record, isLoading: recordLoading } = useQuery<Record<string, unknown>>({
    queryKey: ['record', collectionKey, id],
    queryFn: async () => {
      const res = await fetch(
        apiUrl(`${gwRoutes!.namespace}/${gwRoutes!.route}/${id}`),
        { headers: authHeaders() }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return (json?.data ?? json) as Record<string, unknown>
    },
    enabled: !!gwRoutes?.namespace && !!gwRoutes?.route,
  })

  const fields = raptorColl?.field_list?.fields ?? []
  const labelField = raptorColl?.label_field ?? null
  const collectionTitle = raptorColl?.title ?? collectionKey

  return (
    <div className="h-full overflow-auto bg-[var(--app-bg)]">
      <div className="border-b border-zinc-800 px-6 py-3 flex items-center gap-3">
        <button
          onClick={() =>
            void navigate({
              to: '/records/$collectionKey' as never,
              params: { collectionKey } as never,
            })
          }
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {collectionTitle}
        </button>
        <span className="text-zinc-700">/</span>
        <span className="text-sm font-medium text-zinc-300">Record #{id}</span>
      </div>

      <div className="px-6 py-4">
        <SingleView
          record={record ?? null}
          recordId={id}
          loading={recordLoading && !record}
          fields={fields}
          labelField={labelField}
          collectionTitle={collectionTitle}
        />
      </div>
    </div>
  )
}
