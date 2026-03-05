import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'

export type CollectionsLabelNodeType = Node<{ onCreate?: () => void }, 'collectionsLabelNode'>

export function CollectionsLabelNode({ data }: NodeProps<CollectionsLabelNodeType>) {
  return (
    <div
      style={{
        background: '#14532d',
        border: '1px solid #16a34a',
        borderRadius: 10,
        padding: '10px 20px',
        color: '#f0fdf4',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        minWidth: 130,
        textAlign: 'center',
      }}
    >
      Collections
      <Handle type="source" position={Position.Bottom} />

      {/* Create Collection button */}
      {data.onCreate && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            data.onCreate?.()
          }}
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: '1px solid #16a34a',
            width: '100%',
            padding: '6px 0',
            fontSize: 10,
            fontWeight: 500,
            background: 'none',
            border: 'none',
            color: '#86efac',
            cursor: 'pointer',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.color = '#bbf7d0'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.color = '#86efac'
          }}
        >
          + Create
        </button>
      )}
    </div>
  )
}
