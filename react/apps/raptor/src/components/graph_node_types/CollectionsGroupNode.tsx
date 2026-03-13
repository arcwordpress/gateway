import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'

export type CollGroupNodeType = Node<{ isExpanded: boolean; onToggle: () => void; onCreate?: () => void }, 'collectionsGroupNode'>

export function CollectionsGroupNode({ data }: NodeProps<CollGroupNodeType>) {
  return (
    <div
      onClick={data.onToggle}
      style={{
        background: data.isExpanded ? '#27272a' : '#18181b',
        border: `1px solid ${data.isExpanded ? '#3f3f46' : '#27272a'}`,
        borderRadius: 8,
        color: '#71717a',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        minWidth: 110,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      {/* Toggle row: arrow + label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '6px 12px',
      }}>
        <span style={{
          display: 'inline-block',
          transition: 'transform 0.2s ease',
          transform: data.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          fontSize: 9,
          lineHeight: 1,
        }}>
          ▶
        </span>
        Collections
      </div>

      {/* Create button */}
      {data.onCreate && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            data.onCreate?.()
          }}
          style={{
            borderTop: '1px solid #1e293b',
            width: '100%',
            padding: '5px 12px',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            background: 'none',
            border: 'none',
            borderTop: '1px solid #27272a',
            color: '#52525b',
            cursor: 'pointer',
            transition: 'color 0.2s',
            textAlign: 'center',
          }}
          onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.color = '#71717a' }}
          onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.color = '#52525b' }}
        >
          + Create Collection
        </button>
      )}
    </div>
  )
}
