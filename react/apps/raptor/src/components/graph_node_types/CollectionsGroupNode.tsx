import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'

export type CollGroupNodeType = Node<{ isExpanded: boolean; onToggle: () => void; onCreate?: () => void }, 'collectionsGroupNode'>

export function CollectionsGroupNode({ data }: NodeProps<CollGroupNodeType>) {
  return (
    <div
      onClick={data.onToggle}
      style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 8,
        padding: '6px 12px',
        color: '#64748b',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        minWidth: 110,
        textAlign: 'center',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        transition: 'all 0.2s ease',
        borderColor: data.isExpanded ? '#475569' : '#1e293b',
        backgroundColor: data.isExpanded ? '#1a202c' : '#0f172a',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <span
        style={{
          display: 'inline-block',
          transition: 'transform 0.2s ease',
          transform: data.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          fontSize: 9,
        }}
      >
        ▶
      </span>
      Collections

      {/* Create Collection button */}
      {data.onCreate && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            data.onCreate?.()
          }}
          style={{
            marginTop: 6,
            paddingTop: 6,
            borderTop: '1px solid #1e293b',
            width: 'calc(100% + 24px)',
            marginLeft: '-12px',
            marginRight: '-12px',
            padding: '6px 12px',
            fontSize: 9,
            fontWeight: 500,
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.color = '#94a3b8'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.color = '#64748b'
          }}
        >
          + Create Collection
        </button>
      )}
    </div>
  )
}
