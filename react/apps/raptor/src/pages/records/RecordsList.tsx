import { useEffect } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Grid } from '@arcwp/gateway-grids'
import { apiUrl, authHeaders } from '../../lib/api'
import '@arcwp/gateway-forms/style.css'

export default function RecordsList() {
  const { collectionKey } = useParams({ strict: false }) as { collectionKey: string }
  const navigate = useNavigate()

  const { data: collection, isLoading, isError } = useQuery({
    queryKey: ['collection', collectionKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/collections/${collectionKey}`), { headers: authHeaders() })
      if (res.status === 404) return null
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    enabled: !!collectionKey,
    retry: false,
  })

  useEffect(() => {
    if (!isLoading && (isError || collection === null)) {
      void navigate({ to: '/records' as never })
    }
  }, [isLoading, isError, collection, navigate])

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-zinc-600 border-t-zinc-300 animate-spin" />
      </div>
    )
  }

  if (!collection) return null

  return (
    <div className="h-full overflow-auto bg-[var(--app-bg)]">
      <Grid
        collectionKey={collectionKey}
        showFilters
        showActions
        onEdit={(id: number | string) =>
          void navigate({
            to: '/records/$collectionKey/edit/$id' as never,
            params: { collectionKey, id: String(id) } as never,
          })
        }
        onView={(record: { id: number | string }) =>
          void navigate({
            to: '/records/$collectionKey/view/$id' as never,
            params: { collectionKey, id: String(record.id) } as never,
          })
        }
        toolbarActions={
          <button
            onClick={() =>
              void navigate({
                to: '/records/$collectionKey/create' as never,
                params: { collectionKey } as never,
              })
            }
            className="gty-dashboard__create-button"
          >
            Create
          </button>
        }
      />
    </div>
  )
}
