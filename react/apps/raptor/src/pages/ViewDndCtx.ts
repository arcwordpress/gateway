import { createContext, useContext } from 'react'
import { type DroppedFacet } from '../lib/facet_types'

export interface ViewDndState {
  overFacetId: string | null
  droppedFacets: DroppedFacet[]
  selectedFacetId: string | null
  onSelectFacet: (id: string | null) => void
  onUpdateFacet: (id: string, updates: Partial<Pick<DroppedFacet, 'fieldName' | 'label' | 'parent' | 'depth'>>) => void
}

export const ViewDndCtx = createContext<ViewDndState>({
  overFacetId: null,
  droppedFacets: [],
  selectedFacetId: null,
  onSelectFacet: () => {},
  onUpdateFacet: () => {},
})
export const useViewDnd = () => useContext(ViewDndCtx)
