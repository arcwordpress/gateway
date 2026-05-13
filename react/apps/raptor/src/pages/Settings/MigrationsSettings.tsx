import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../../lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

type Extension = {
  id: number
  extension_key: string
  title: string
  version: string
  migration_version: string | null
  migrations_ran_at: string | null
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const btn = (variant: 'primary' | 'ghost' | 'danger' = 'primary') =>
  'inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ' +
  (variant === 'primary'
    ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
    : variant === 'danger'
    ? 'bg-red-900/60 hover:bg-red-800/70 text-red-300'
    : 'border border-zinc-700 hover:bg-zinc-800 text-zinc-400')

// ─── Extension row ────────────────────────────────────────────────────────────

function ExtensionMigrationRow({ ext }: { ext: Extension }) {
  const queryClient = useQueryClient()
  const [result, setResult] = useState<string | null>(null)

  const due = ext.version !== ext.migration_version

  const runMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        apiUrl(`gateway/v1/sync/extension/${ext.extension_key}/migrations`),
        { method: 'POST', headers: authHeaders() }
      )
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed')
      return json
    },
    onSuccess: () => {
      setResult('Done')
      queryClient.invalidateQueries({ queryKey: ['raptor-extensions'] })
    },
    onError: (e: Error) => setResult(e.message),
  })

  return (
    <div className="flex items-center gap-4 py-3 border-b border-zinc-800/60 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200">{ext.title || ext.extension_key}</p>
        <p className="text-xs font-mono text-zinc-500 mt-0.5">{ext.extension_key}</p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-xs text-zinc-400">
          <span className="text-zinc-500">current </span>
          <span className="font-mono">{ext.version || '—'}</span>
        </p>
        <p className="text-xs text-zinc-400">
          <span className="text-zinc-500">last ran </span>
          <span className="font-mono">{ext.migration_version || 'never'}</span>
        </p>
      </div>

      <div className="shrink-0 w-24 text-right">
        {due ? (
          <span className="text-[10px] font-medium text-amber-400 border border-amber-800/50 rounded px-1.5 py-0.5 bg-amber-950/40">
            due
          </span>
        ) : (
          <span className="text-[10px] text-zinc-600">up to date</span>
        )}
      </div>

      <div className="shrink-0">
        {due ? (
          <button
            onClick={() => runMutation.mutate()}
            disabled={runMutation.isPending}
            className={btn('primary')}
          >
            {runMutation.isPending ? 'Running…' : 'Run Migrations'}
          </button>
        ) : (
          <button
            onClick={() => runMutation.mutate()}
            disabled={runMutation.isPending}
            className={btn('ghost')}
            title="Force re-run even though up to date"
          >
            {runMutation.isPending ? 'Running…' : 'Re-run'}
          </button>
        )}
      </div>

      {result && (
        <p className={`text-[10px] shrink-0 ${result === 'Done' ? 'text-green-400' : 'text-red-400'}`}>
          {result}
        </p>
      )}
    </div>
  )
}

// ─── Core migrations row ──────────────────────────────────────────────────────

function CoreMigrationsRow() {
  const [result, setResult] = useState<string | null>(null)

  const runMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/sync/core-migrations'), {
        method: 'POST',
        headers: authHeaders(),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed')
      return json
    },
    onSuccess: () => setResult('Done'),
    onError: (e: Error) => setResult(e.message),
  })

  return (
    <div className="flex items-center gap-4 py-3 border-b border-zinc-800/60">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200">Gateway Core</p>
        <p className="text-xs text-zinc-500 mt-0.5">Internal Gateway tables (settings, raptor, collections)</p>
      </div>
      <div className="shrink-0">
        <button
          onClick={() => runMutation.mutate()}
          disabled={runMutation.isPending}
          className={btn('ghost')}
        >
          {runMutation.isPending ? 'Running…' : 'Run Core Migrations'}
        </button>
      </div>
      {result && (
        <p className={`text-[10px] shrink-0 ${result === 'Done' ? 'text-green-400' : 'text-red-400'}`}>
          {result}
        </p>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MigrationsSettings() {
  const { data, isLoading, isError } = useQuery<{ extensions: Extension[] }>({
    queryKey: ['raptor-extensions'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/extension'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    staleTime: 30_000,
  })

  const extensions = data?.extensions ?? []
  const dueCount = extensions.filter(e => e.version !== e.migration_version).length

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-sm font-semibold text-zinc-300">Migrations</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Run database migrations for each extension when its version changes.
          Migrations are never run automatically — trigger them here.
        </p>
      </div>

      {dueCount > 0 && (
        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs">
          {dueCount} extension{dueCount !== 1 ? 's have' : ' has'} migrations due.
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/80">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500">Extensions</span>
        </div>
        <div className="px-4">
          {isLoading && (
            <div className="py-6 text-center text-xs text-zinc-500">Loading…</div>
          )}
          {isError && (
            <div className="py-6 text-center text-xs text-red-400">Failed to load extensions.</div>
          )}
          {!isLoading && !isError && extensions.length === 0 && (
            <div className="py-6 text-center text-xs text-zinc-600">No extensions yet.</div>
          )}
          {extensions.map(ext => (
            <ExtensionMigrationRow key={ext.extension_key} ext={ext} />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/80">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500">Core</span>
        </div>
        <div className="px-4">
          <CoreMigrationsRow />
        </div>
      </div>
    </div>
  )
}
