import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'

export type CollectionsLabelNodeType = Node<{ onCreate?: () => void }, 'collectionsLabelNode'>

export function CollectionsLabelNode({ data }: NodeProps<CollectionsLabelNodeType>) {
  return (
    <div
      style={{
        background: '#3f3f46',
        border: '1px solid #16a34a',
        borderRadius: 10,
        padding: '10px 20px',
        color: '#e4e4e7',
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
            color: '#a1a1aa',
            cursor: 'pointer',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.color = '#d4d4d8'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.color = '#a1a1aa'
          }}
        >
          + Create
        </button>
      )}
    </div>
  )
}
