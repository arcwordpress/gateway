import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'

export type ActNodeType = Node<{ actions: { label: string; onClick: () => void }[] }, 'actionsNode'>

export function ActionsNode({ data }: NodeProps<ActNodeType>) {
  return (
    <div
      style={{
        background: '#111',
        border: '1px solid #1e1e1e',
        borderRadius: 8,
        minWidth: 140,
        overflow: 'hidden',
      }}
    >
      <Handle type="source" position={Position.Right} />
      <div
        style={{
          padding: '5px 10px',
          borderBottom: '1px solid #1e1e1e',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#f0f0f0',
          userSelect: 'none',
        }}
      >
        Actions
      </div>
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
              color: '#e8e8e8',
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
