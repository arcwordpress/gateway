import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'

export type FieldsNodeType = Node<
  {
    collectionSlug: string
    onNavigate?: (slug: string) => void
  },
  'fieldsNode'
>

export function FieldsNode({ data }: NodeProps<FieldsNodeType>) {
  return (
    <div
      style={{
        background: '#1e3a4a',
        border: '1px solid #164e63',
        borderRadius: 8,
        padding: '8px 12px',
        width: 110,
        color: '#a8d8ea',
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
          color: '#22d3ee',
          opacity: 0.7,
        }}
      >
        Fields
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
          background: '#0891b2',
          border: 'none',
          borderRadius: 4,
          color: '#fff',
          cursor: 'pointer',
          transition: 'background 0.2s',
          marginTop: 4,
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.background = '#06b6d4'
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.background = '#0891b2'
        }}
      >
        Manage
      </button>
    </div>
  )
}
