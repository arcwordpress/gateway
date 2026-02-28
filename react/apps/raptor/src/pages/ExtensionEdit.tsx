import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link, useParams } from '@tanstack/react-router'
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

type ExtensionData = Record<string, string>

// ─── Helpers ───────────────────────────────────────────────────────────────

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

export default function ExtensionEdit() {
  const { key } = useParams({ strict: false }) as { key: string }
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [fields, setFields] = useState<Record<string, string>>({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Load field-group schema
  const { data: schema, isLoading: schemaLoading } = useQuery<FieldGroupSchema>({
    queryKey: ['schema', 'field-group'],
    queryFn: async () => {
      const res = await fetch(fieldGroupSchemaUrl)
      if (!res.ok) throw new Error(`Failed to load schema (HTTP ${res.status})`)
      return res.json() as Promise<FieldGroupSchema>
    },
    staleTime: Infinity,
    retry: 2,
  })

  // Load existing extension data
  const { data: existing, isLoading: extLoading, isError: extError } = useQuery<ExtensionData>({
    queryKey: ['extensions', key],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/extensions/${key}`), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.extension as ExtensionData
    },
    enabled: !!key,
  })

  // Seed form fields from existing extension data once both schema and data are ready
  useEffect(() => {
    if (!schema || !existing) return
    setFields(() => {
      const seeded: Record<string, string> = {}
      for (const name of Object.keys(schema.properties)) {
        seeded[name] = existing[name] ?? ''
      }
      return seeded
    })
  }, [schema, existing])

  const setField = (name: string, val: string) =>
    setFields((prev) => ({ ...prev, [name]: val }))

  // ── Update ────────────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const res = await fetch(apiUrl(`gateway/v1/extensions/${key}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to update extension')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] })
      void navigate({ to: '/extensions' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fields.title?.trim()) return
    updateMutation.mutate({ ...fields })
  }

  // ── Delete ────────────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/extensions/${key}`), {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to delete extension')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] })
      void navigate({ to: '/extensions' })
    },
  })

  const isBusy = updateMutation.isPending || deleteMutation.isPending
  const isLoading = schemaLoading || extLoading
  const required: string[] = schema?.required ?? []
  const schemaEntries = schema ? Object.entries(schema.properties) : []

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link to="/extensions" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Extensions
        </Link>
        <h1 className="text-2xl font-semibold text-gray-100 mt-3">
          {existing?.title || key}
        </h1>
        <p className="text-xs text-gray-600 font-mono mt-0.5">{key}</p>
      </div>

      {extError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          Could not load extension data.
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
                    onChange={(e) => setField(name, e.target.value)}
                    className={baseInput}
                  />
                </div>
              ))}

          {updateMutation.isError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {(updateMutation.error as Error).message}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isBusy || !fields.title?.trim() || isLoading}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
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

      {/* ── Delete ─────────────────────────────────────────────────────── */}
      <div className="mt-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
        <p className="text-sm font-medium text-red-400 mb-1">Danger zone</p>
        <p className="text-xs text-gray-500 mb-3">
          Deletes the extension, its plugin files, and all associated data. This cannot be undone.
        </p>

        {deleteMutation.isError && (
          <p className="text-xs text-red-400 mb-2">{(deleteMutation.error as Error).message}</p>
        )}

        {confirmDelete ? (
          <div className="flex gap-2">
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={isBusy}
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={isBusy}
              className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
          >
            Delete Extension
          </button>
        )}
      </div>
    </div>
  )
}
