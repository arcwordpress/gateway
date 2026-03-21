import { type NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { type ViewPreviewNodeType } from './types'
import { type DroppedFacet } from '../../lib/facet_types'
import { NodeTypeHeader } from './NodeTypeHeader'

function cellValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function SortableFacetChip({ facet }: { facet: DroppedFacet }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: facet.id,
    data: { droppedFacet: facet },
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        cursor: 'grab',
        padding: '4px 8px',
        borderRadius: 4,
        background: '#18181b',
        border: '1px solid #3f3f46',
        fontSize: 10,
        fontWeight: 600,
        color: '#a1a1aa',
        letterSpacing: '0.03em',
        textTransform: 'capitalize',
        userSelect: 'none',
        touchAction: 'none',
        flexShrink: 0,
      }}
    >
      {facet.type.replace(/_/g, ' ')}
    </div>
  )
}

function FacetDropZone({ droppedFacets }: { droppedFacets: DroppedFacet[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'facet-drop-zone' })

  return (
    <div
      ref={setNodeRef}
      style={{
        marginBottom: 10,
        minHeight: 38,
        borderRadius: 6,
        border: `1px dashed ${isOver ? '#71717a' : '#3f3f46'}`,
        background: isOver ? '#1c1c1f' : 'transparent',
        transition: 'border-color 0.15s, background 0.15s',
        padding: '6px 8px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
        alignItems: 'center',
      }}
    >
      <SortableContext items={droppedFacets.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        {droppedFacets.length === 0 ? (
          <div style={{ fontSize: 10, color: '#3f3f46', fontStyle: 'italic' }}>
            Drop filter types here
          </div>
        ) : (
          droppedFacets.map((facet) => (
            <SortableFacetChip key={facet.id} facet={facet} />
          ))
        )}
      </SortableContext>
    </div>
  )
}

export function ViewPreviewNode({ data }: NodeProps<ViewPreviewNodeType>) {
  const cols = data.columns
  const rows = data.rows

  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px solid var(--node-border-color)',
        borderRadius: 10,
        color: '#e4e4e7',
        minWidth: 420,
        maxWidth: 560,
        overflow: 'hidden',
        padding: '8px 10px',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <NodeTypeHeader label="Desktop" />
      <div style={{ fontSize: 12, fontWeight: 600, color: '#f4f4f5', marginBottom: 8 }}>{data.title}</div>

      <FacetDropZone droppedFacets={data.droppedFacets} />

      {cols.length === 0 ? (
        <div style={{ color: '#71717a', fontSize: 12, fontStyle: 'italic' }}>
          No columns selected for this view.
        </div>
      ) : (
        <div style={{ padding: '8px 0' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols.length}, minmax(100px, 1fr))`,
              gap: 0,
              border: '1px solid #1e293b',
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            {cols.map((col: string) => (
              <div
                key={`head-${col}`}
                style={{
                  padding: '6px 8px',
                  borderBottom: '1px solid #1e293b',
                  background: '#18181b',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#a1a1aa',
                  fontFamily: 'monospace',
                }}
              >
                {col}
              </div>
            ))}

            {(rows.length > 0 ? rows : [Object.fromEntries(cols.map((c: string) => [c, '—']))]).map((row: Record<string, unknown>, rowIndex: number) =>
              cols.map((col: string) => (
                <div
                  key={`cell-${rowIndex}-${col}`}
                  style={{
                    padding: '6px 8px',
                    borderBottom: rowIndex === rows.length - 1 ? 'none' : '1px solid #17202f',
                    background: rowIndex % 2 === 0 ? '#18181b' : '#27272a',
                    fontSize: 11,
                    color: '#d4d4d8',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {cellValue(row[col])}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
