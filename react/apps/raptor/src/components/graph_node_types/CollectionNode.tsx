import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'

export type CollNodeType = Node<
  {
    title: string
    collKey: string
    isActive: boolean
    onEdit?: () => void
    onDelete?: () => void
  },
  'collectionNode'
>

export function CollectionNode({ data }: NodeProps<CollNodeType>) {
  return (
    <div
      style={{
        background: data.isActive ? '#164e63' : '#1e293b',
        border: `1px solid ${data.isActive ? '#06b6d4' : '#334155'}`,
        borderRadius: 8,
        padding: '8px 14px',
        width: 180,
        color: data.isActive ? '#cffafe' : '#e2e8f0',
        fontSize: 13,
        cursor: 'pointer',
        fontWeight: data.isActive ? 600 : 400,
        position: 'relative',
      }}
    >
      {/* Vertical hierarchy handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      {/* Action connection handle on left */}
      <Handle id="action-target" type="target" position={Position.Left} />

      {/* Relationship handles on sides */}
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        style={{ background: '#475569', width: 8, height: 8, top: '65%' }}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        style={{ background: '#475569', width: 8, height: 8 }}
      />

      <div
        style={{
          position: 'absolute',
          top: 2,
          right: 6,
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: data.isActive ? '#22d3ee' : '#64748b',
          opacity: 0.7,
        }}
      >
        Collection
      </div>

      <div style={{ fontWeight: data.isActive ? 600 : 500 }}>{data.title}</div>
      <div style={{ fontSize: 11, color: data.isActive ? '#67e8f9' : '#64748b', fontFamily: 'monospace', marginTop: 2 }}>
        {data.collKey}
      </div>

      {/* Action buttons */}
      {(data.onEdit || data.onDelete) && (
        <div
          style={{
            display: 'flex',
            gap: 4,
            marginTop: 6,
            paddingTop: 6,
            borderTop: `1px solid ${data.isActive ? '#164e63' : '#334155'}`,
          }}
        >
          {data.onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                data.onEdit?.()
              }}
              style={{
                flex: 1,
                padding: '3px 6px',
                fontSize: 10,
                fontWeight: 500,
                background: data.isActive ? '#0891b2' : '#334155',
                border: 'none',
                borderRadius: 4,
                color: '#fff',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = data.isActive ? '#06b6d4' : '#475569'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = data.isActive ? '#0891b2' : '#334155'
              }}
            >
              Edit
            </button>
          )}
          {data.onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                data.onDelete?.()
              }}
              style={{
                flex: 1,
                padding: '3px 6px',
                fontSize: 10,
                fontWeight: 500,
                background: '#7f1d1d',
                border: 'none',
                borderRadius: 4,
                color: '#fca5a5',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = '#991b1b'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = '#7f1d1d'
              }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
