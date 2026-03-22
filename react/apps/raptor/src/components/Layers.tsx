import { useViewDnd } from '../pages/ViewDndCtx'
import { type DroppedFacet } from '../lib/facet_types'

const INDENT = 14

interface LayerRowProps {
  label: string
  depth: number
  isGroup?: boolean
  isPlaceholder?: boolean
  isSelected?: boolean
  onClick?: () => void
}

function LayerRow({ label, depth, isGroup = false, isPlaceholder = false, isSelected = false, onClick }: LayerRowProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        paddingLeft: 8 + depth * INDENT,
        borderRadius: 3,
        cursor: onClick ? 'pointer' : 'default',
        background: isSelected ? 'rgba(59,130,246,0.12)' : 'transparent',
        borderLeft: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
        transition: 'background 0.1s',
      }}
    >
      {/* tree guide line */}
      {depth > 0 && (
        <div style={{ width: 1, height: 12, background: '#27272a', flexShrink: 0, marginLeft: -INDENT + 4, marginRight: INDENT - 5 }} />
      )}

      {/* expand chevron or spacer */}
      <div style={{ width: 10, flexShrink: 0, color: '#3f3f46', fontSize: 8, lineHeight: 1 }}>
        {isGroup ? '▾' : ''}
      </div>

      <span
        style={{
          fontSize: 10,
          fontWeight: isGroup ? 600 : 400,
          color: isPlaceholder ? '#3f3f46' : isSelected ? '#93c5fd' : isGroup ? '#71717a' : '#a1a1aa',
          fontStyle: isPlaceholder ? 'italic' : 'normal',
          textTransform: 'capitalize',
          letterSpacing: isGroup ? '0.04em' : 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </span>
    </div>
  )
}

export function Layers() {
  const { droppedFacets, selectedFacetId, onSelectFacet } = useViewDnd()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* section header */}
      <div
        style={{
          padding: '8px 12px 6px',
          borderTop: '1px solid #27272a',
          borderBottom: '1px solid #27272a',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: '#71717a',
          flexShrink: 0,
        }}
      >
        Layers
      </div>

      {/* tree */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        <LayerRow label="Facet Group" depth={0} isGroup />
        {droppedFacets.length === 0 ? (
          <LayerRow label="empty" depth={1} isPlaceholder />
        ) : (
          droppedFacets.map((facet: DroppedFacet) => (
            <LayerRow
              key={facet.id}
              label={facet.label || facet.type.replace(/_/g, ' ')}
              depth={facet.depth ?? 1}
              isSelected={selectedFacetId === facet.id}
              onClick={() => onSelectFacet(selectedFacetId === facet.id ? null : facet.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
