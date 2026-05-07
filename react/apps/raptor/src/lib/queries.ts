import { apiUrl, authHeaders } from './api'
import type { Collection } from './object_types'

export const COLLECTIONS_NESTED_KEY = ['raptor-collections-nested'] as const

export async function fetchCollectionsWithNested(): Promise<Collection[]> {
  const res = await fetch(apiUrl('gateway/v1/raptor/registered-collections?with_nested=true'), { headers: authHeaders() })
  if (!res.ok) return []
  const json = await res.json() as { collections?: Collection[] }
  return json.collections ?? []
}
