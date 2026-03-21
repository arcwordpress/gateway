import { useState } from 'react'
import { type NodeProps } from '@xyflow/react'
import { type Node } from '@xyflow/react'
import { type Facet, type Field } from '../../lib/object_types'
import { NodeTypeHeader } from './NodeTypeHeader'
import { FACET_TYPES } from '../../lib/facet_types'

export type FacetsNodeType = Node<
  {
    facets: Facet[]
    availableFields: Field[]
    onAddFacet: (data: { label: string; field_name: string; facet_type: string }) => void
    onDeleteFacet: (id: number) => void
    isSaving: boolean
  },
  'facetsNode'
>

function FacetTypeButton({
  type, isActive, onClick,
}: {
  type: string; isActive: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 10px',
        fontSize: 10,
        fontWeight: 600,
        background: isActive ? '#52525b' : '#27272a',
        border: `1px solid ${isActive ? '#52525b' : '#3f3f46'}`,
        borderRadius: 4,
        color: isActive ? '#fff' : '#a1a1aa',
        cursor: 'pointer',
        transition: 'all 0.12s ease',
        letterSpacing: '0.03em',
        textTransform: 'capitalize',
      }}
    >
      {type.replace('_', ' ')}
    </button>
  )
}

export function FacetsNode({ data }: NodeProps<FacetsNodeType>) {
  const [draftLabel, setDraftLabel] = useState('')
  const [draftField, setDraftField] = useState('')
  const [draftType, setDraftType] = useState<string>('text')

  const handleSave = () => {
    if (!draftField) return
    data.onAddFacet({ label: draftLabel, field_name: draftField, facet_type: draftType })
    setDraftLabel('')
    setDraftField('')
    setDraftType('text')
  }

  return (
    <div
      style={{
        background: 'var(--node-bg)',
        border: '1px solid var(--node-border-color)',
        borderRadius: 10,
        color: '#e4e4e7',
        minWidth: 300,
        overflow: 'hidden',
        padding: '8px 10px',
      }}
    >
      <NodeTypeHeader label="Facet Filters" />
      <div style={{ fontSize: 11, color: '#71717a', marginBottom: 8 }}>Configure search &amp; filter controls</div>

      {/* Saved facets */}
      <div style={{ padding: '10px 0', borderBottom: '1px solid #27272a' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#71717a', marginBottom: 6, fontWeight: 600 }}>
          Saved Facets
        </div>

        {data.facets.length === 0 && (
          <div style={{ fontSize: 11, color: '#71717a', fontStyle: 'italic' }}>No facets saved yet</div>
        )}

        {data.facets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {data.facets.map((facet) => (
              <div
                key={facet.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  borderRadius: 5,
                  background: '#18181b',
                  border: '1px solid #27272a',
                }}
              >
                <span style={{ fontSize: 11, color: '#d4d4d8' }}>
                  <span style={{ color: '#a1a1aa' }}>{facet.label || facet.field_name}</span>
                  <span style={{ color: '#71717a', margin: '0 5px' }}>·</span>
                  <span style={{ color: '#71717a' }}>{facet.field_name}</span>
                  <span style={{ color: '#71717a', margin: '0 5px' }}>·</span>
                  <span style={{ color: '#71717a', textTransform: 'capitalize' }}>{facet.facet_type.replace('_', ' ')}</span>
                </span>
                <button
                  onClick={() => data.onDeleteFacet(facet.id)}
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
            ))}
          </div>
        )}
      </div>

      {/* New facet form */}
      <div style={{ padding: '10px 0' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#71717a', marginBottom: 8, fontWeight: 600 }}>
          + New Facet
        </div>

        {/* Field */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: '#71717a', marginBottom: 4 }}>Field</div>
          <select
            value={draftField}
            onChange={(e) => setDraftField(e.target.value)}
            style={{
              width: '100%',
              padding: '5px 8px',
              fontSize: 11,
              background: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: 5,
              color: draftField ? '#e4e4e7' : '#71717a',
              cursor: 'pointer',
            }}
          >
            <option value="">Select a field…</option>
            {data.availableFields.map((f) => (
              <option key={f.name} value={f.name}>{f.label || f.name}</option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: '#71717a', marginBottom: 4 }}>Type</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {FACET_TYPES.map((type) => (
              <FacetTypeButton
                key={type}
                type={type}
                isActive={draftType === type}
                onClick={() => setDraftType(type)}
              />
            ))}
          </div>
        </div>

        {/* Label */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: '#71717a', marginBottom: 4 }}>Label <span style={{ color: '#3f3f46' }}>(optional)</span></div>
          <input
            type="text"
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            placeholder="Leave blank to use field name"
            style={{
              width: '100%',
              padding: '5px 8px',
              fontSize: 11,
              background: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: 5,
              color: '#e4e4e7',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!draftField || data.isSaving}
          style={{
            width: '100%',
            padding: '6px 0',
            fontSize: 11,
            fontWeight: 600,
            background: draftField && !data.isSaving ? '#52525b' : '#27272a',
            border: '1px solid transparent',
            borderRadius: 5,
            color: draftField && !data.isSaving ? '#fff' : '#71717a',
            cursor: draftField && !data.isSaving ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s ease',
          }}
        >
          {data.isSaving ? 'Saving…' : 'Save Facet'}
        </button>
      </div>
    </div>
  )
}
