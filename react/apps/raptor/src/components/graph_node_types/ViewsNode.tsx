import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'

export type ViewsNodeType = Node<
  {
    collectionSlug: string
    onNavigate?: (slug: string) => void
  },
  'viewsNode'
>

export function ViewsNode({ data }: NodeProps<ViewsNodeType>) {
  return (
    <div
      style={{
        background: '#1e293b',
        border: '1px solid #475569',
        borderRadius: 8,
        padding: '8px 12px',
        width: 110,
        color: '#cbd5e1',
        fontSize: 13,
        cursor: 'pointer',
        fontWeight: 500,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {/* Vertical hierarchy handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <div
        style={{
          position: 'absolute',
          top: 2,
          right: 6,
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#94a3b8',
          opacity: 0.7,
        }}
      >
        Views
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          data.onNavigate?.(data.collectionSlug)
        }}
        style={{
          padding: '4px 8px',
          fontSize: 11,
          fontWeight: 600,
          background: '#64748b',
          border: 'none',
          borderRadius: 4,
          color: '#fff',
          cursor: 'pointer',
          transition: 'background 0.2s',
          marginTop: 4,
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.background = '#475569'
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.background = '#64748b'
        }}
      >
        Manage
      </button>
    </div>
  )
}
