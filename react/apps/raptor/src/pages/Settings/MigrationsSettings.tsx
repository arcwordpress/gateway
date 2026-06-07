import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../../lib/api'

type RegistryGroup = {
  key: string
  label: string
  version: string | null
  migration_count: number
}

const btn = (variant: 'primary' | 'ghost' = 'ghost') =>
  'inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ' +
  (variant === 'primary'
    ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
    : 'border border-zinc-700 hover:bg-zinc-800 text-zinc-400')

function RegistryGroupRow({ group }: { group: RegistryGroup }) {
  const [result, setResult] = useState<string | null>(null)

  const runMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/migrations/${group.key}`), {
        method: 'POST',
        headers: authHeaders(),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed')
      return json
    },
    onSuccess: (data) => setResult(`Done — ${data.ran} ran`),
    onError: (e: Error) => setResult(e.message),
  })

  return (
    <div className="flex items-center gap-4 py-3 border-b border-zinc-800/60 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200">{group.label}</p>
        <p className="text-xs font-mono text-zinc-500 mt-0.5">{group.key}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-zinc-400">
          <span className="text-zinc-500">version </span>
          <span className="font-mono">{group.version || '—'}</span>
        </p>
        <p className="text-xs text-zinc-500">
          {group.migration_count} migration{group.migration_count !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="shrink-0">
        <button
          onClick={() => runMutation.mutate()}
          disabled={runMutation.isPending}
          className={btn('ghost')}
        >
          {runMutation.isPending ? 'Running…' : 'Run'}
        </button>
      </div>
      {result && (
        <p className={`text-[10px] shrink-0 ${result.startsWith('Done') ? 'text-green-400' : 'text-red-400'}`}>
          {result}
        </p>
      )}
    </div>
  )
}

export default function MigrationsSettings() {
  const { data: regData, isLoading, isError } = useQuery<{ groups: RegistryGroup[] }>({
    queryKey: ['migration-registry'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/migrations'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    staleTime: 30_000,
  })

  const groups = regData?.groups ?? []

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-sm font-semibold text-zinc-300">Migrations</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Run database migrations for registered migration groups.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/80">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500">Registered</span>
        </div>
        <div className="px-4">
          {isLoading && <div className="py-6 text-center text-xs text-zinc-500">Loading…</div>}
          {isError && <div className="py-6 text-center text-xs text-red-400">Failed to load registry.</div>}
          {!isLoading && !isError && groups.length === 0 && (
            <div className="py-6 text-center text-xs text-zinc-600">No migration groups registered.</div>
          )}
          {groups.map(g => <RegistryGroupRow key={g.key} group={g} />)}
        </div>
      </div>
    </div>
  )
}
