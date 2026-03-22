export const FACET_TYPES = ['text', 'select', 'checkbox', 'range', 'date_range'] as const
export type FacetType = typeof FACET_TYPES[number]

export interface DroppedFacet {
  id: string
  type: FacetType
  parent: string | 0   // 0 = root level; string = id of parent block
  depth: number        // 0 = top level … 5 = 6th level
  dbId?: number
  fieldName?: string
  label?: string
}
