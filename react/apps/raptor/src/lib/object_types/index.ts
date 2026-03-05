// ─── Field ───────────────────────────────────────────────────────────────────

export type Field = {
  id: number
  name: string
  type: string
  label: string
  sort_order: number
  config?: Record<string, unknown>
}

// ─── Collection ───────────────────────────────────────────────────────────────

export type Collection = {
  id: number
  collection_key: string
  title: string
  description: string
  status: string
  field_list: { id: number; fields: Field[] } | null
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
