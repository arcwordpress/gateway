import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { FACET_TYPES, type FacetType } from '../lib/facet_types'

function DraggableFacetBlock({ type }: { type: FacetType }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `facet-type-${type}`,
    data: { facetType: type },
  })

  const label = type.replace(/_/g, ' ')

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
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
      {label}
    </div>
  )
}

export function FacetPalette() {
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

      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
        {FACET_TYPES.map((type) => (
          <DraggableFacetBlock key={type} type={type} />
        ))}
      </div>
    </div>
  )
}
