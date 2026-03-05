import { type NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import { type SchemaNodeData } from './types'

const TYPE_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  string:  { bg: '#1e3a5f', text: '#93c5fd' },
  number:  { bg: '#1a2e1a', text: '#4ade80' },
  integer: { bg: '#1a2e1a', text: '#4ade80' },
  boolean: { bg: '#2d1b4e', text: '#c084fc' },
  array:   { bg: '#1c1917', text: '#fb923c' },
  object:  { bg: '#1c1917', text: '#fbbf24' },
}

function TypeBadge({ type }: { type: string }) {
  const colors = TYPE_BADGE_COLORS[type] ?? { bg: '#1e293b', text: '#94a3b8' }
  return (
    <span style={{
      background: colors.bg, color: colors.text,
      fontSize: 9, fontFamily: 'monospace', fontWeight: 600,
      padding: '1px 5px', borderRadius: 4, letterSpacing: '0.03em',
    }}>
      {type}
    </span>
  )
}

export function JsonSchemaNode({ data }: NodeProps<SchemaNodeData>) {
  return (
    <div style={{
      background: '#111827',
      border: '1px solid #4b5563',
      borderRadius: 10,
      minWidth: 220,
      maxWidth: 280,
      fontSize: 11,
      color: '#d1d5db',
      overflow: 'hidden',
    }}>
      <Handle type="target" position={Position.Top} />

      {/* Header */}
      <div style={{
        background: '#1f2937', borderBottom: '1px solid #374151',
        padding: '8px 12px',
      }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', marginBottom: 2 }}>
          JSON Schema
        </div>
        <div style={{ fontWeight: 600, color: '#f9fafb', fontSize: 12 }}>{data.title}</div>
        <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2, fontFamily: 'monospace' }}>
          type: <span style={{ color: '#fbbf24' }}>object</span>
        </div>
      </div>

      {/* Properties */}
      <div style={{ padding: '6px 0' }}>
        {data.properties.length === 0 ? (
          <div style={{ padding: '6px 12px', color: '#4b5563', fontStyle: 'italic' }}>no fields defined</div>
        ) : (
          data.properties.map(prop => (
            <div key={prop.name} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '3px 12px', gap: 8,
            }}>
              <span style={{ fontFamily: 'monospace', color: prop.required ? '#e5e7eb' : '#9ca3af', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {prop.required && <span style={{ color: '#ef4444', marginRight: 3 }}>*</span>}
                {prop.name}
              </span>
              <span style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                <TypeBadge type={prop.type} />
                {prop.format && <TypeBadge type={prop.format} />}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer: built-in id field */}
      <div style={{ borderTop: '1px solid #1f2937', padding: '4px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'monospace', color: '#4b5563' }}>id</span>
        <TypeBadge type="integer" />
      </div>
    </div>
  )
}
