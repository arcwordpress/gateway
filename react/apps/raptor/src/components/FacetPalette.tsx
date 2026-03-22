import { useDraggable } from '@dnd-kit/core'
import { FACET_TYPES, type FacetType } from '../lib/facet_types'
import { type Field } from '../lib/object_types'
import { Layers } from './Layers'
import { FacetSettings } from './FacetSettings'

// Pure presentational block — used both in the palette and as DragOverlay clone
export function FacetBlock({ type, faded }: { type: FacetType; faded?: boolean }) {
  return (
    <div
      style={{
        opacity: faded ? 0.4 : 1,
        cursor: 'grab',
        padding: '6px 10px',
        borderRadius: 6,
        background: '#27272a',
        border: '1px solid #3f3f46',
        fontSize: 11,
        fontWeight: 600,
        color: '#a1a1aa',
        letterSpacing: '0.03em',
        textTransform: 'capitalize',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      {type.replace(/_/g, ' ')}
    </div>
  )
}

function DraggableFacetBlock({ type, isActive }: { type: FacetType; isActive: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `facet-type-${type}`,
    data: { facetType: type },
  })

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <FacetBlock type={type} faded={isDragging || isActive} />
    </div>
  )
}

interface FacetPaletteProps {
  activeFacetType: FacetType | null
  availableFields: Field[]
  onSaveFacet: (facetId: string, data: { label: string; field_name: string; facet_type: string }) => void
  isSaving: boolean
}

export function FacetPalette({ activeFacetType, availableFields, onSaveFacet, isSaving }: FacetPaletteProps) {
  return (
    <div
      className="absolute left-4 z-10 flex flex-col rounded bg-dark backdrop-blur-sm overflow-hidden"
      style={{
        top: 52,
        bottom: 16,
        width: 260,
        boxShadow: '0 4px 20px rgba(161,161,170,0.18)',
      }}
    >
      <div
        style={{
          padding: '10px 12px 8px',
          borderBottom: '1px solid #27272a',
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#71717a' }}>
          Facet Types
        </div>
        <div style={{ fontSize: 10, color: '#52525b', marginTop: 2 }}>
          Drag into the Desktop node
        </div>
      </div>

      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', maxHeight: 220, flexShrink: 0 }}>
        {FACET_TYPES.map((type) => (
          <DraggableFacetBlock key={type} type={type} isActive={activeFacetType === type} />
        ))}
      </div>

      <Layers />
      <FacetSettings availableFields={availableFields} onSaveFacet={onSaveFacet} isSaving={isSaving} />
    </div>
  )
}
