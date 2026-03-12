// ─── Field ───────────────────────────────────────────────────────────────────

export type Field = {
  id: number
  name: string
  type: string
  label: string
  sort_order: number
  config?: Record<string, unknown>
}

// ─── Form ────────────────────────────────────────────────────────────────────

export type Form = {
  id: number
  form_key: string
  title: string
  description?: string
  status: string
  sort_order: number
  form_config?: Record<string, unknown>
  success_message?: string
  notification_email?: string
}

// ─── ViewRender ───────────────────────────────────────────────────────────────

export type ViewRender = {
  id: number
  view_id: number
  engine: string
  js_type: string
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
  form_list: { id: number; forms: Form[] } | null
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
