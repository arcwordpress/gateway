import { ArrowUpRight } from 'lucide-react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { NodeTypeHeader } from './NodeTypeHeader'

export type ExtNodeType = Node<{ title: string; extKey: string; isActive: boolean; onManage?: () => void; onCreate?: () => void }, 'extensionNode'>

export function ExtensionNode({ data }: NodeProps<ExtNodeType>) {
  const manageBtn = data.onManage ? (
    <button
      onClick={(e) => { e.stopPropagation(); data.onManage?.() }}
      title="Manage Extension"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '1px 4px',
        fontSize: 9,
        fontWeight: 500,
        background: 'none',
        border: 'none',
        color: '#52525b',
        cursor: 'pointer',
        transition: 'color 0.15s',
        lineHeight: 1,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#52525b' }}
    >
      Manage <ArrowUpRight size={9} strokeWidth={2} />
    </button>
  ) : undefined

  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: `1px solid ${data.isActive ? '#52525b' : '#3f3f46'}`,
        borderRadius: 10,
        padding: '8px 10px',
        color: data.isActive ? '#e4e4e7' : '#d4d4d8',
        fontSize: 13,
        fontWeight: data.isActive ? 600 : 500,
        minWidth: 160,
        textAlign: 'center',
      }}
    >
      <Handle type="source" position={Position.Right} />
      <NodeTypeHeader label="Extension" menu={manageBtn} />
      <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#a1a1aa', marginBottom: 4 }}>
        {data.extKey}
      </div>
      <div>{data.title}</div>

      {data.onCreate && (
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={(e) => { e.stopPropagation(); data.onCreate?.() }}
            style={{
              padding: '3px 8px',
              fontSize: 10,
              fontWeight: 500,
              background: 'none',
              border: 'none',
              color: '#a1a1aa',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#d4d4d8' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa' }}
          >
            + Create Collection
          </button>
        </div>
      )}
    </div>
  )
}
