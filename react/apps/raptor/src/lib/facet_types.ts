export const FACET_TYPES = ['text', 'select', 'checkbox', 'range', 'date_range'] as const
export type FacetType = typeof FACET_TYPES[number]

export interface DroppedFacet {
  id: string
  type: FacetType
}
