import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../lib/api'

type FieldDef = {
  name: string
  type: string
  label?: string
  required?: boolean
}

type CollectionWithFields = {
  key: string
  title: string
  fields: FieldDef[]
}

const TYPE_COLORS: Record<string, string> = {
  string:   'text-sky-400',
  text:     'text-sky-400',
  integer:  'text-amber-400',
  int:      'text-amber-400',
  bigint:   'text-amber-400',
  float:    'text-amber-400',
  double:   'text-amber-400',
  decimal:  'text-amber-400',
  boolean:  'text-purple-400',
  bool:     'text-purple-400',
  date:     'text-emerald-400',
  datetime: 'text-emerald-400',
  timestamp:'text-emerald-400',
  json:     'text-rose-400',
  array:    'text-rose-400',
  enum:     'text-orange-400',
}

function typeColor(type: string) {
  return TYPE_COLORS[type.toLowerCase()] ?? 'text-zinc-400'
}

export default function FieldsTopLevelPage() {
  const [filterKey, setFilterKey] = useState<string>('__all__')

  const { data: allCollections = [], isLoading, isError } = useQuery<CollectionWithFields[]>({
    queryKey: ['registered-collections-fields'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/collections?include_private=true'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const cols: CollectionWithFields[] = (Array.isArray(json) ? json : []).filter(
        (c: CollectionWithFields) => Array.isArray(c.fields) && c.fields.length > 0
      )
      return cols
    },
    staleTime: 30_000,
  })

  const displayed = filterKey === '__all__'
    ? allCollections
    : allCollections.filter((c) => c.key === filterKey)

  const totalFields = displayed.reduce((s, c) => s + c.fields.length, 0)

  return (
    <div className="p-6 overflow-auto h-full">
      <div className="max-w-4xl mx-auto">
        {/* Header + filter */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div>
            <h1 className="text-sm font-semibold text-zinc-300">Fields</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {isLoading ? 'Loading…' : `${displayed.length} collection${displayed.length !== 1 ? 's' : ''} · ${totalFields} field${totalFields !== 1 ? 's' : ''}`}
            </p>
          </div>
          <select
            value={filterKey}
            onChange={(e) => setFilterKey(e.target.value)}
            className="h-7 rounded border border-zinc-700 bg-zinc-900 text-xs text-zinc-300 px-2 focus:outline-none"
          >
            <option value="__all__">All collections</option>
            {allCollections.map((c) => (
              <option key={c.key} value={c.key}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* States */}
        {isLoading && (
          <div className="text-xs text-zinc-500 py-8 text-center">Loading…</div>
        )}
        {isError && (
          <div className="text-xs text-red-400 py-8 text-center">Failed to load collections.</div>
        )}
        {!isLoading && !isError && displayed.length === 0 && (
          <div className="text-xs text-zinc-600 py-8 text-center">No fields found on registered collections.</div>
        )}

        {/* Collection groups */}
        {!isLoading && !isError && displayed.length > 0 && (
          <div className="space-y-3">
            {displayed.map((col) => (
              <div key={col.key} className="rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden">
                {/* Collection header */}
                <div className="px-3 py-2 border-b border-zinc-800/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">{col.title}</span>
                  <code className="text-[10px] text-zinc-600 font-mono">{col.key}</code>
                </div>

                {/* Fields table */}
                <div className="divide-y divide-zinc-800/40">
                  {col.fields.map((field) => (
                    <div key={field.name} className="px-3 py-1.5 flex items-center gap-3 text-[11px]">
                      <code className="font-mono text-zinc-300 min-w-[140px]">{field.name}</code>
                      <span className={`font-mono ${typeColor(field.type)} min-w-[80px]`}>{field.type}</span>
                      {field.label && field.label !== field.name && (
                        <span className="text-zinc-500 truncate">{field.label}</span>
                      )}
                      {field.required && (
                        <span className="ml-auto text-[10px] text-amber-500/70">required</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
