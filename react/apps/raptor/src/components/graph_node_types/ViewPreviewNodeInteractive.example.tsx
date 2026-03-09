/**
 * Example: Enhanced ViewPreviewNode with Optional Interactivity
 * 
 * This shows how to extend the current ViewPreviewNode to optionally
 * use WordPress Interactivity API for live data rendering.
 */

import { type NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import { type ViewPreviewNodeType } from './types'
import { useQuery } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../../lib/api'
import { InteractiveHTML } from '../InteractiveHTML'

function cellValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function ViewPreviewNodeInteractive({ data }: NodeProps<ViewPreviewNodeType>) {
  const cols = data.columns
  const rows = data.rows
  const viewKey = data.viewKey // Assumes viewKey is added to ViewPreviewNodeType

  // Option to use interactive HTML instead of static preview
  const useInteractive = data.useInteractive ?? false

  const { data: previewHtml, isLoading } = useQuery({
    queryKey: ['view-preview-html', viewKey],
    queryFn: async () => {
      if (!viewKey) return null
      const res = await fetch(apiUrl(`gateway/v1/raptor/view/${viewKey}/preview`), {
        headers: authHeaders(),
      })
      const json = await res.json()
      return json.html as string
    },
    enabled: useInteractive && !!viewKey,
    staleTime: 30_000,
  })

  if (useInteractive && viewKey) {
    return (
      <div
        style={{
          background: '#0b1220',
          border: '1px solid #334155',
          borderRadius: 10,
          color: '#e2e8f0',
          minWidth: 420,
          maxWidth: 720,
          overflow: 'hidden',
        }}
      >
        <Handle type="target" position={Position.Top} />

        <div
          style={{
            background: '#111827',
            borderBottom: '1px solid #1f2937',
            padding: '8px 12px',
          }}
        >
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 2 }}>
            View Preview (Interactive)
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#f8fafc' }}>{data.title}</div>
        </div>

        {isLoading ? (
          <div style={{ padding: '20px', color: '#64748b', fontSize: 12, textAlign: 'center' }}>
            Loading preview...
          </div>
        ) : previewHtml ? (
          <div style={{ padding: 8 }}>
            <InteractiveHTML 
              html={previewHtml}
              style={{ 
                fontSize: '12px',
                '--table-scale': '0.9',
              } as React.CSSProperties}
            />
          </div>
        ) : (
          <div style={{ padding: '10px 12px', color: '#64748b', fontSize: 12, fontStyle: 'italic' }}>
            Failed to load preview
          </div>
        )}
      </div>
    )
  }

  // Default static preview (existing implementation)
  return (
    <div
      style={{
        background: '#0b1220',
        border: '1px solid #334155',
        borderRadius: 10,
        color: '#e2e8f0',
        minWidth: 420,
        maxWidth: 560,
        overflow: 'hidden',
      }}
    >
      <Handle type="target" position={Position.Top} />

      <div
        style={{
          background: '#111827',
          borderBottom: '1px solid #1f2937',
          padding: '8px 12px',
        }}
      >
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 2 }}>
          View Preview
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#f8fafc' }}>{data.title}</div>
      </div>

      {cols.length === 0 ? (
        <div style={{ padding: '10px 12px', color: '#64748b', fontSize: 12, fontStyle: 'italic' }}>
          No columns selected for this view.
        </div>
      ) : (
        <div style={{ padding: 8 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols.length}, minmax(100px, 1fr))`,
              gap: 0,
              border: '1px solid #1e293b',
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            {cols.map((col: string) => (
              <div
                key={`head-${col}`}
                style={{
                  padding: '6px 8px',
                  borderBottom: '1px solid #1e293b',
                  background: '#0f172a',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#93c5fd',
                  fontFamily: 'monospace',
                }}
              >
                {col}
              </div>
            ))}

            {(rows.length > 0 ? rows : [Object.fromEntries(cols.map((c: string) => [c, '—']))]).map((row: Record<string, unknown>, rowIndex: number) =>
              cols.map((col: string) => (
                <div
                  key={`cell-${rowIndex}-${col}`}
                  style={{
                    padding: '6px 8px',
                    borderBottom: rowIndex === rows.length - 1 ? 'none' : '1px solid #17202f',
                    background: rowIndex % 2 === 0 ? '#0b1220' : '#0d1526',
                    fontSize: 11,
                    color: '#cbd5e1',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {cellValue(row[col])}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
