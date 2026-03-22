import { createContext, useContext } from 'react'
import { type DroppedFacet } from '../lib/facet_types'

export interface ViewDndState {
  overFacetId: string | null
  droppedFacets: DroppedFacet[]
}

export const ViewDndCtx = createContext<ViewDndState>({ overFacetId: null, droppedFacets: [] })
export const useViewDnd = () => useContext(ViewDndCtx)
