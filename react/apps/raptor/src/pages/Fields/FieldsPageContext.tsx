import { createContext, useContext, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Field, Collection } from '../../lib/object_types'
import { apiUrl, authHeaders } from '../../lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SurfaceState =
  | { mode: 'deleteConfirm'; field: Field }
  | { mode: 'editField'; field: Field }
  | null

type CollectionContextValue = {
  collection: Collection | undefined
  isLoading: boolean
  isError: boolean
}

// ─── Collection context ───────────────────────────────────────────────────────

const CollectionContext = createContext<CollectionContextValue | null>(null)

export const useCollection = () => {
  const ctx = useContext(CollectionContext)
  if (!ctx) throw new Error('useCollection must be used inside CollectionProvider')
  return ctx
}

export function CollectionProvider({ collectionKey, children }: { collectionKey: string; children: React.ReactNode }) {
  const { data: collection, isLoading, isError } = useQuery<Collection>({
    queryKey: ['raptor-collections', collectionKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/collection/${collectionKey}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.collection as Collection
    },
    enabled: !!collectionKey,
  })

  return (
    <CollectionContext.Provider value={{ collection, isLoading, isError }}>
      {children}
    </CollectionContext.Provider>
  )
}

// ─── Fields context ───────────────────────────────────────────────────────────

const FieldsContext = createContext<{
  fields: Field[]
  addField: (field: Field) => void
  moveField: (name: string, dir: 'up' | 'down') => void
  reorderFields: (newFields: Field[]) => void
  deleteField: (name: string) => void
  updateField: (oldName: string, updates: Partial<Field>) => void
} | null>(null)

export const useFields = () => {
  const ctx = useContext(FieldsContext)
  if (!ctx) throw new Error('useFields must be used within FieldsProvider')
  return ctx
}

export function FieldsProvider({ children }: { children: React.ReactNode }) {
  const { collection } = useCollection()
  const [fields, setFields] = useState<Field[]>([])

  // Initialise (and re-sync) from server whenever the collection query settles.
  useEffect(() => {
    setFields(collection?.field_list?.fields ?? [])
  }, [collection])

  const addField = (field: Field) =>
    setFields((prev) => [...prev, field])

  const moveField = (name: string, dir: 'up' | 'down') =>
    setFields((prev) => {
      const i = prev.findIndex((f) => f.name === name)
      if (dir === 'up' && i === 0) return prev
      if (dir === 'down' && i === prev.length - 1) return prev
      const next = [...prev]
      const swap = dir === 'up' ? i - 1 : i + 1
      ;[next[i], next[swap]] = [next[swap], next[i]]
      return next
    })

  const reorderFields = (newFields: Field[]) =>
    setFields(newFields.map((f, i) => ({ ...f, sort_order: i })))

  const deleteField = (name: string) =>
    setFields((prev) => prev.filter((f) => f.name !== name))

  const updateField = (oldName: string, updates: Partial<Field>) =>
    setFields((prev) => prev.map((f) => f.name === oldName ? { ...f, ...updates } : f))

  return (
    <FieldsContext.Provider value={{ fields, addField, moveField, reorderFields, deleteField, updateField }}>
      {children}
    </FieldsContext.Provider>
  )
}
