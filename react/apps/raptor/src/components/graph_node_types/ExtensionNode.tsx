import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'

export type ExtNodeType = Node<{ title: string; extKey: string; isActive: boolean; onManage?: () => void; onCreate?: () => void }, 'extensionNode'>

export function ExtensionNode({ data }: NodeProps<ExtNodeType>) {
  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: `1px solid ${data.isActive ? '#52525b' : '#3f3f46'}`,
        borderRadius: 10,
        padding: '10px 16px',
        color: data.isActive ? '#e4e4e7' : '#d4d4d8',
        fontSize: 13,
        fontWeight: data.isActive ? 600 : 500,
        minWidth: 160,
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <Handle type="source" position={Position.Bottom} />
      <Handle id="action-target" type="target" position={Position.Left} />
      <div
        style={{
          position: 'absolute',
          top: 2,
          right: 6,
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: data.isActive ? '#71717a' : '#a1a1aa',
          opacity: 0.7,
        }}
      >
        Extension
      </div>
      <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#a1a1aa', marginBottom: 4 }}>
        {data.extKey}
      </div>
      <div>{data.title}</div>

      {(data.onCreate || data.onManage) && (
        <div style={{ marginTop: 8, borderTop: '1px solid #3f3f46' }}>
          {data.onCreate && (
            <button
              onClick={(e) => { e.stopPropagation(); data.onCreate?.() }}
              style={{
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
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.color = '#d4d4d8' }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.color = '#a1a1aa' }}
            >
              + Create Collection
            </button>
          )}
          {data.onManage && (
            <button
              onClick={(e) => { e.stopPropagation(); data.onManage?.() }}
              style={{
                width: '100%',
                padding: '6px 0',
                fontSize: 10,
                fontWeight: 500,
                background: 'none',
                border: 'none',
                borderTop: data.onCreate ? '1px solid #3f3f46' : 'none',
                color: data.isActive ? '#71717a' : '#a1a1aa',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.color = data.isActive ? '#a1a1aa' : '#d4d4d8'
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.color = data.isActive ? '#71717a' : '#a1a1aa'
              }}
            >
              Manage Extension
            </button>
          )}
        </div>
      )}
    </div>
  )
}
