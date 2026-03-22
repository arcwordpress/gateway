import { useState } from 'react'
import { useFacet } from '../lib/useFacet'
import { type DroppedFacet } from '../lib/facet_types'

interface FacetRenderProps {
  facet: DroppedFacet
}

/**
 * Renders the real interactive facet component for a DroppedFacet.
 * Calls useFacet unconditionally (one call per mounted instance — safe in lists).
 * Holds its own local value state for the design-time preview.
 */
export function FacetRender({ facet }: FacetRenderProps) {
  const { Facet } = useFacet({
    type: facet.type,
    label: facet.label,
    fieldName: facet.fieldName,
  })
  const [value, setValue] = useState<unknown>(null)

  return (
    <div
      // Prevent dnd-kit / ReactFlow from treating interactions with the
      // facet control as the start of a drag.
      onPointerDown={(e) => e.stopPropagation()}
      style={{ minWidth: 140 }}
    >
      <Facet value={value} onChange={setValue} />
    </div>
  )
}
