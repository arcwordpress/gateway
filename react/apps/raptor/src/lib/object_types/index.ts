// ─── Field ───────────────────────────────────────────────────────────────────

export type Field = {
  id: number
  name: string
  type: string
  label: string
  sort_order: number
  config?: Record<string, unknown>
}

// ─── View ────────────────────────────────────────────────────────────────────

export type View = {
  id: number
  view_key: string
  title: string
  sort_order: number
  description: string
  status: string
  source: string
  columns: string[]
  facet_filters: unknown[]
  default_sort: Record<string, unknown>
  per_page: number
}

// ─── Collection ───────────────────────────────────────────────────────────────

export type Collection = {
  id: number
  collection_key: string
  title: string
  description: string
  status: string
  field_list: { id: number; fields: Field[] } | null
  view_list: { id: number; views: View[] } | null
}

// ─── Field Type Definition ────────────────────────────────────────────────────

export type FieldTypeDef = {
  type: string
  fields: {
    name: string
    label: string
    type: string
    required?: boolean
    default?: unknown
    description?: string
    placeholder?: string
    group?: string
  }[]
}
