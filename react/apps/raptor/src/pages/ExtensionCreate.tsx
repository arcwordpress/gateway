import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from '@tanstack/react-router'
import { appConfig } from '../config'
import { apiUrl, authHeaders } from '../lib/api'

// ─── Schema types ──────────────────────────────────────────────────────────

type SchemaPropertyUi = {
  widget?: 'textarea' | 'url' | 'select'
  placeholder?: string
  rows?: number
}

type SchemaProperty = {
  type: string
  title: string
  description: string
  default?: string
  pattern?: string
  format?: string
  enum?: string[]
  ui?: SchemaPropertyUi
}

type ExtensionSchema = {
  title: string
  description: string
  required: string[]
  properties: Record<string, SchemaProperty>
}

// ─── Single dynamic field ──────────────────────────────────────────────────

function SchemaField({
  name,
  prop,
  value,
  required,
  disabled,
  onChange,
}: {
  name: string
  prop: SchemaProperty
  value: string
  required: boolean
  disabled: boolean
  onChange: (val: string) => void
}) {
  const widget = prop.ui?.widget
  const placeholder = prop.ui?.placeholder ?? ''

  const baseInput =
    'w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 ' +
    'placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 ' +
    'focus:ring-blue-500 transition-colors disabled:opacity-50'

  return (
    <div>
      <label htmlFor={`field-${name}`} className="block text-sm font-medium text-gray-300 mb-1.5">
        {prop.title}
        {required && <span className="ml-1 text-red-400">*</span>}
        <span className="ml-2 text-xs text-gray-600 font-normal font-mono">{name}</span>
      </label>

      {widget === 'textarea' ? (
        <textarea
          id={`field-${name}`}
          value={value}
          placeholder={placeholder}
          rows={prop.ui?.rows ?? 3}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} resize-y`}
        />
      ) : widget === 'select' ? (
        <select
          id={`field-${name}`}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} cursor-pointer`}
        >
          {!value && <option value="">— select —</option>}
          {(prop.enum ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={`field-${name}`}
          type={widget === 'url' ? 'url' : 'text'}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
        />
      )}

      <p className="mt-1 text-xs text-gray-600">{prop.description}</p>
    </div>
  )
}

// ─── Skeleton while schema loads ───────────────────────────────────────────

function FieldSkeleton() {
  return (
    <div className="space-y-1.5">
      <div className="h-4 w-28 rounded bg-gray-800 animate-pulse" />
      <div className="h-9 rounded-lg bg-gray-800 animate-pulse" />
      <div className="h-3 w-48 rounded bg-gray-800/60 animate-pulse" />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────

function toKey(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export default function ExtensionCreate() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // ── Fixed identity fields ─────────────────────────────────────────────
  const [title, setTitle] = useState('')
  const [key, setKey] = useState('')

  useEffect(() => {
    if (title) setKey(toKey(title))
  }, [title])

  // ── Dynamic schema fields ─────────────────────────────────────────────
  const [fields, setFields] = useState<Record<string, string>>({})

  const { data: schema, isLoading: schemaLoading, isError: schemaError } = useQuery<ExtensionSchema>({
    queryKey: ['schema', 'extension'],
    queryFn: async () => {
      const res = await fetch(appConfig.schemaUrl)
      if (!res.ok) throw new Error(`Failed to load schema (HTTP ${res.status})`)
      return res.json() as Promise<ExtensionSchema>
    },
    staleTime: Infinity, // Schema is static — no need to refetch
    retry: 2,
  })

  // Seed defaults from schema once it arrives
  useEffect(() => {
    if (!schema) return
    setFields((prev) => {
      const seeded: Record<string, string> = {}
      for (const [name, prop] of Object.entries(schema.properties)) {
        seeded[name] = prev[name] ?? (prop.default !== undefined ? String(prop.default) : '')
      }
      return seeded
    })
  }, [schema])

  const setField = (name: string, val: string) =>
    setFields((prev) => ({ ...prev, [name]: val }))

  // ── Submit ────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const res = await fetch(apiUrl('gateway/v1/extensions'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to create extension')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] })
      void navigate({ to: '/extensions' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !key.trim()) return
    mutation.mutate({ title: title.trim(), key: key.trim(), ...fields })
  }

  const isBusy = mutation.isPending
  const schemaProps = schema ? Object.entries(schema.properties) : []

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/extensions" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Extensions
        </Link>
        <h1 className="text-2xl font-semibold text-gray-100 mt-3">New Extension</h1>
        <p className="text-sm text-gray-500 mt-1">
          Creates a new Gateway plugin extension. Fields are driven by{' '}
          <code className="text-xs bg-gray-800 px-1 py-0.5 rounded text-gray-400">
            schemas/raptor/extension.json
          </code>
          .
        </p>
      </div>

      {schemaError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          Could not load field schema — check that the plugin schema file is accessible.
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Identity — always present ─────────────────────────────── */}
          <div className="pb-4 border-b border-gray-800 space-y-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">Identity</p>

            <div>
              <label htmlFor="ext-title" className="block text-sm font-medium text-gray-300 mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                id="ext-title"
                type="text"
                value={title}
                placeholder="My Extension"
                autoFocus
                disabled={isBusy}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="ext-key" className="block text-sm font-medium text-gray-300 mb-1.5">
                Key
                <span className="ml-2 text-xs text-gray-600 font-normal">auto-generated</span>
              </label>
              <input
                id="ext-key"
                type="text"
                value={key}
                readOnly
                className="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-500 font-mono text-sm focus:outline-none cursor-default"
              />
            </div>
          </div>

          {/* ── Schema-driven fields ──────────────────────────────────── */}
          <div className="space-y-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
              Plugin metadata
            </p>

            {schemaLoading
              ? Array.from({ length: 7 }).map((_, i) => <FieldSkeleton key={i} />)
              : schemaProps.map(([name, prop]) => (
                  <SchemaField
                    key={name}
                    name={name}
                    prop={prop}
                    value={fields[name] ?? ''}
                    required={schema?.required?.includes(name) ?? false}
                    disabled={isBusy}
                    onChange={(val) => setField(name, val)}
                  />
                ))}
          </div>

          {/* ── Error / submit ───────────────────────────────────────── */}
          {mutation.isError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {(mutation.error as Error).message}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isBusy || !title.trim() || schemaLoading}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {isBusy ? 'Creating…' : 'Create Extension'}
            </button>

            <Link
              to="/extensions"
              className="px-5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
