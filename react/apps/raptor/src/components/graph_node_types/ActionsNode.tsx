import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { NodeTypeHeader } from './NodeTypeHeader'

export type ActNodeType = Node<{ actions: { label: string; onClick: () => void }[] }, 'actionsNode'>

export function ActionsNode({ data }: NodeProps<ActNodeType>) {
  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px solid var(--node-border-color)',
        borderRadius: 8,
        minWidth: 140,
        overflow: 'hidden',
        padding: '8px 10px',
      }}
    >
      <Handle type="source" position={Position.Right} />
      <NodeTypeHeader label="Actions" />
      <div>
        {data.actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '5px 10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#d4d4d8',
              fontSize: 12,
              fontFamily: 'inherit',
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
