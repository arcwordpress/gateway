// ─── Field ───────────────────────────────────────────────────────────────────

export type Field = {
  id: number
  name: string
  type: string
  label: string
  sort_order: number
  searchable?: boolean
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

// ─── Facet ───────────────────────────────────────────────────────────────────

export type Facet = {
  id: number
  facet_list_id: number
  label: string
  field_name: string
  facet_type: string
  config?: Record<string, unknown>
  sort_order: number
  parent: number | 0   // 0 = root level; matches PHP Block.php convention
  depth: number        // 0 = top level … 5 = 6th level
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
  default_sort: Record<string, unknown>
  per_page: number
  facet_list?: { id: number; facets: Facet[] } | null
}

// ─── Collection ───────────────────────────────────────────────────────────────

export type CollectionFieldDef = {
  name: string
  type: string
  label?: string
  required?: boolean
  default?: string
  placeholder?: string
  options?: { value: string; label: string }[]
}

export type Collection = {
  id: number
  collection_key: string
  title: string
  description: string
  status: string
  field_list: { id: number; fields: Field[] } | null
  form_list: { id: number; forms: Form[] } | null
  view_list: { id: number; views: View[] } | null
  fields?: Record<string, CollectionFieldDef>
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
