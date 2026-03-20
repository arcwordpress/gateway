import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { NodeTypeHeader } from './NodeTypeHeader'

export type CollectionsLabelNodeType = Node<{ onCreate?: () => void }, 'collectionsLabelNode'>

export function CollectionsLabelNode({ data }: NodeProps<CollectionsLabelNodeType>) {
  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px solid var(--node-border-color)',
        borderRadius: 10,
        padding: '8px 10px',
        color: '#e4e4e7',
        fontSize: 13,
        fontWeight: 600,
        minWidth: 130,
        textAlign: 'center',
      }}
    >
      <NodeTypeHeader label="Collections" />
      <Handle type="source" position={Position.Bottom} />

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
