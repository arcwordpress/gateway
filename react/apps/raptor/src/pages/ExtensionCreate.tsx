import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from '@tanstack/react-router'
import { appConfig } from '../config'
import { apiUrl, authHeaders } from '../lib/api'

// ─── Schema types ──────────────────────────────────────────────────────────

type SchemaProperty = {
  type: string
  title: string
  description?: string
  default?: string
}

type FieldGroupSchema = {
  title: string
  description?: string
  required: string[]
  properties: Record<string, SchemaProperty>
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function toKey(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

const fieldGroupSchemaUrl = appConfig.schemaUrl.replace(/[^/]+$/, 'field-group.json')

const baseInput =
  'w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 ' +
  'placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 ' +
  'focus:ring-blue-500 transition-colors disabled:opacity-50'

function FieldSkeleton() {
  return (
    <div className="space-y-1.5">
      <div className="h-4 w-28 rounded bg-gray-800 animate-pulse" />
      <div className="h-9 rounded-lg bg-gray-800 animate-pulse" />
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ExtensionCreate() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [fields, setFields] = useState<Record<string, string>>({})
  const [key, setKey] = useState('')

  const { data: schema, isLoading, isError } = useQuery<FieldGroupSchema>({
    queryKey: ['schema', 'field-group'],
    queryFn: async () => {
      const res = await fetch(fieldGroupSchemaUrl)
      if (!res.ok) throw new Error(`Failed to load schema (HTTP ${res.status})`)
      return res.json() as Promise<FieldGroupSchema>
    },
    staleTime: Infinity,
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

  // Auto-generate key from title
  useEffect(() => {
    if (fields.title) setKey(toKey(fields.title))
  }, [fields.title])

  const setField = (name: string, val: string) =>
    setFields((prev) => ({ ...prev, [name]: val }))

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
    const title = fields.title?.trim()
    if (!title || !key.trim()) return
    mutation.mutate({ ...fields, title, key: key.trim() })
  }

  const isBusy = mutation.isPending
  const required: string[] = schema?.required ?? []
  const schemaEntries = schema ? Object.entries(schema.properties) : []

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link to="/extensions" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Extensions
        </Link>
        <h1 className="text-2xl font-semibold text-gray-100 mt-3">New Extension</h1>
      </div>

      {isError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          Could not load field schema — check that the plugin schema file is accessible.
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {isLoading
            ? Array.from({ length: 7 }).map((_, i) => <FieldSkeleton key={i} />)
            : schemaEntries.map(([name, prop]) => (
                <div key={name}>
                  <label htmlFor={`field-${name}`} className="block text-sm font-medium text-gray-300 mb-1.5">
                    {prop.title}
                    {required.includes(name) && <span className="ml-1 text-red-400">*</span>}
                    <span className="ml-2 text-xs text-gray-600 font-normal font-mono">{name}</span>
                  </label>
                  <input
                    id={`field-${name}`}
                    type="text"
                    value={fields[name] ?? ''}
                    disabled={isBusy}
                    autoFocus={name === 'title'}
                    onChange={(e) => setField(name, e.target.value)}
                    className={baseInput}
                  />
                  {/* Show auto-generated key below the title field */}
                  {name === 'title' && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Key
                        <span className="ml-2 text-xs text-gray-600 font-normal">auto-generated</span>
                      </label>
                      <input
                        type="text"
                        value={key}
                        readOnly
                        className="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-500 font-mono text-sm focus:outline-none cursor-default"
                      />
                    </div>
                  )}
                </div>
              ))}

          {mutation.isError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {(mutation.error as Error).message}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isBusy || !fields.title?.trim() || isLoading}
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
