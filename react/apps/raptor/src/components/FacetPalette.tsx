import { useDraggable, useDroppable } from '@dnd-kit/core'
import { FACET_TYPES, type FacetType } from '../lib/facet_types'

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

function DropZone({ droppedFacets }: { droppedFacets: FacetType[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'facet-drop-zone' })

  return (
    <div
      ref={setNodeRef}
      style={{
        margin: '10px 12px 0',
        minHeight: 60,
        borderRadius: 6,
        border: `1px dashed ${isOver ? '#71717a' : '#3f3f46'}`,
        background: isOver ? '#27272a' : 'transparent',
        transition: 'border-color 0.15s, background 0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: 8,
      }}
    >
      {droppedFacets.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            color: '#3f3f46',
            fontStyle: 'italic',
          }}
        >
          Drop facets here
        </div>
      ) : (
        droppedFacets.map((type, i) => (
          <div
            key={`${type}-${i}`}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              background: '#27272a',
              border: '1px solid #3f3f46',
              fontSize: 10,
              fontWeight: 600,
              color: '#a1a1aa',
              letterSpacing: '0.03em',
              textTransform: 'capitalize',
            }}
          >
            {type.replace(/_/g, ' ')}
          </div>
        ))
      )}
    </div>
  )
}

interface FacetPaletteProps {
  activeFacetType: FacetType | null
  droppedFacets: FacetType[]
}

export function FacetPalette({ activeFacetType, droppedFacets }: FacetPaletteProps) {
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
          Drag onto the canvas
        </div>
      </div>

      <DropZone droppedFacets={droppedFacets} />

      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
        {FACET_TYPES.map((type) => (
          <DraggableFacetBlock key={type} type={type} isActive={activeFacetType === type} />
        ))}
      </div>
    </div>
  )
}
