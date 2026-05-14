import { apiUrl, authHeaders } from './api'
import type { Collection } from './object_types'

export const COLLECTIONS_NESTED_KEY = ['raptor-collections-nested'] as const

export async function fetchCollectionsWithNested(): Promise<Collection[]> {
  const res = await fetch(apiUrl('gateway/v1/raptor/registered-collections?with_nested=true'), { headers: authHeaders() })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json() as { collections?: Collection[] }
  return json.collections ?? []
}

// ─── Registered collections from the CollectionRegistry (with route info) ────

export type RegisteredCollection = {
  key: string
  title: string
  titlePlural: string
  is_code_defined: boolean
  package?: string
  routes: { namespace: string; route: string; endpoint: string }
  record_count?: number | null
}

export const REGISTERED_COLLECTIONS_KEY = ['registered-collections'] as const

export async function fetchRegisteredCollections(withCounts = false): Promise<RegisteredCollection[]> {
  const url = withCounts ? 'gateway/v1/collections?with_counts=1' : 'gateway/v1/collections'
  const res = await fetch(apiUrl(url), { headers: authHeaders() })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

