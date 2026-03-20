import { Handle, Position, type NodeProps } from '@xyflow/react'
import { type Node } from '@xyflow/react'
import { type ViewRender } from '../../lib/object_types'
import { NodeTypeHeader } from './NodeTypeHeader'

export type RenderStrategyNodeType = Node<
  {
    strategies: { type: string }[]
    viewRenders: ViewRender[]
    activeEngine: string | null
    activeJsType: string
    onSelectEngine: (type: string) => void
    onSelectJsType: (type: string) => void
    onSaveRender: () => void
    onDeleteRender: (id: number) => void
    isSaving: boolean
  },
  'renderStrategyNode'
>

const ENGINE_META: Record<string, { label: string; activeBg: string }> = {
  shortcode: { label: 'Shortcode', activeBg: '#52525b' },
  block:     { label: 'Block',     activeBg: '#52525b' },
  template:  { label: 'Template',  activeBg: '#52525b' },
  page:      { label: 'Page',      activeBg: '#52525b' },
}

const JS_TYPE_META: Record<string, { label: string; activeBg: string }> = {
  react:  { label: 'React',            activeBg: '#52525b' },
  preact: { label: 'Preact',           activeBg: '#52525b' },
  wpia:   { label: 'WP Interactivity', activeBg: '#52525b' },
}

function engineLabel(engine: string): string {
  return ENGINE_META[engine]?.label ?? engine
}

function jsTypeLabel(jsType: string): string {
  return JS_TYPE_META[jsType]?.label ?? jsType
}

function StrategyButton({
  type, label, activeBg, isActive, onClick,
}: {
  type: string; label: string; activeBg: string; isActive: boolean; onClick: () => void
}) {
  return (
    <button
      key={type}
      onClick={onClick}
      style={{
        padding: '5px 14px',
        fontSize: 11,
        fontWeight: 600,
        background: isActive ? activeBg : '#27272a',
        border: `1px solid ${isActive ? activeBg : '#3f3f46'}`,
        borderRadius: 5,
        color: isActive ? '#fff' : '#a1a1aa',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        letterSpacing: '0.03em',
      }}
    >
      {label}
    </button>
  )
}

export function RenderStrategyNode({ data }: NodeProps<RenderStrategyNodeType>) {
  const hasSaves = data.viewRenders.length > 0

  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px solid var(--node-border-color)',
        borderRadius: 10,
        color: '#e4e4e7',
        minWidth: 320,
        overflow: 'hidden',
        padding: '8px 10px',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <NodeTypeHeader label="Render Options" />
      <div style={{ fontSize: 11, color: '#71717a', marginBottom: 8 }}>Choose how to embed this view</div>

      {/* Saved Renders */}
      <div style={{ padding: '10px 0', borderBottom: '1px solid #27272a' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#71717a', marginBottom: 6, fontWeight: 600 }}>
          Saved Renders
        </div>

        {!hasSaves && (
          <div style={{ fontSize: 11, color: '#71717a', fontStyle: 'italic' }}>No renders saved yet</div>
        )}

        {hasSaves && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {data.viewRenders.map((r) => {
              const isActive = r.engine === data.activeEngine
              return (
                <div
                  key={r.id}
                  onClick={() => data.onSelectEngine(r.engine)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 8px',
                    borderRadius: 5,
                    background: isActive ? '#27272a' : '#18181b',
                    border: `1px solid ${isActive ? '#3f3f46' : '#27272a'}`,
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <span style={{ fontSize: 11, color: '#d4d4d8' }}>
                    <span style={{ color: '#a1a1aa' }}>{engineLabel(r.engine)}</span>
                    <span style={{ color: '#71717a', margin: '0 5px' }}>·</span>
                    <span style={{ color: '#a1a1aa' }}>{jsTypeLabel(r.js_type)}</span>
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); data.onDeleteRender(r.id) }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#71717a',
                      cursor: 'pointer',
                      fontSize: 12,
                      padding: '0 2px',
                      lineHeight: 1,
                      transition: 'color 0.1s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#71717a' }}
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* New Render form */}
      <div style={{ padding: '10px 0' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#71717a', marginBottom: 8, fontWeight: 600 }}>
          + New Render
        </div>

        {/* Engine */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: '#71717a', marginBottom: 4 }}>Engine</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {data.strategies.length === 0 && (
              <span style={{ fontSize: 11, color: '#71717a', fontStyle: 'italic' }}>Loading…</span>
            )}
            {data.strategies.map((s) => {
              const meta = ENGINE_META[s.type] ?? { label: s.type, activeBg: '#3f3f46' }
              return (
                <StrategyButton
                  key={s.type}
                  type={s.type}
                  label={meta.label}
                  activeBg={meta.activeBg}
                  isActive={s.type === data.activeEngine}
                  onClick={() => data.onSelectEngine(s.type)}
                />
              )
            })}
          </div>
        </div>

        {/* JS Type */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: '#71717a', marginBottom: 4 }}>JS Type</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(JS_TYPE_META).map(([type, meta]) => (
              <StrategyButton
                key={type}
                type={type}
                label={meta.label}
                activeBg={meta.activeBg}
                isActive={type === data.activeJsType}
                onClick={() => data.onSelectJsType(type)}
              />
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={data.onSaveRender}
          disabled={!data.activeEngine || data.isSaving}
          style={{
            width: '100%',
            padding: '6px 0',
            fontSize: 11,
            fontWeight: 600,
            background: data.activeEngine && !data.isSaving ? '#52525b' : '#27272a',
            border: '1px solid transparent',
            borderRadius: 5,
            color: data.activeEngine && !data.isSaving ? '#fff' : '#71717a',
            cursor: data.activeEngine && !data.isSaving ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s ease',
          }}
        >
          {data.isSaving ? 'Saving…' : 'Save Render'}
        </button>
      </div>
    </div>
  )
}
