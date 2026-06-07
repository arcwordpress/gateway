import { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../../lib/api'
import type { Collection } from '../../lib/object_types'
import PanelShell from '../../components/ui/PanelShell'

// ─── Collection context ───────────────────────────────────────────────────────

type CollectionContextValue = {
  collection: Collection | undefined
  isLoading: boolean
  isError: boolean
}

const CollectionContext = createContext<CollectionContextValue | null>(null)

export function useCollection() {
  const ctx = useContext(CollectionContext)
  if (!ctx) throw new Error('useCollection must be used within CollectionProvider')
  return ctx
}

export function CollectionProvider({ collectionKey, children }: { collectionKey: string; children: React.ReactNode }) {
  const { data: collection, isLoading, isError } = useQuery<Collection>({
    queryKey: ['raptor-collection', collectionKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection/${collectionKey}`), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.collection as Collection
    },
    staleTime: 30_000,
  })

  return (
    <CollectionContext.Provider value={{ collection, isLoading, isError }}>
      {children}
    </CollectionContext.Provider>
  )
}

// ─── EditPanel — floating slide-in panel ──────────────────────────────────────

export function EditPanel({
  title,
  sub,
  onClose,
  children,
}: {
  title: string
  sub?: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <PanelShell title={title} sub={sub} onClose={onClose}>
      {children}
    </PanelShell>
  )
}
