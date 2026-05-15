import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { apiUrl, authHeaders } from '../lib/api'

type Extension = {
  extension_key: string
  title: string
  version: string
  migration_version: string | null
}

type MigrationGroup = {
  key: string
  version: string | null
  migration_count: number
  migrations: string[]
}

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-zinc-600 group-hover:text-zinc-300 transition-colors">
      <path d="M0.5 7.5H14.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 0.5L14.5 7.5L7.5 14.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MigrationButton({ extensionKey }: { extensionKey: string }) {
  const queryClient = useQueryClient()
  const [result, setResult] = useState<string | null>(null)

  const migrationsUrl = apiUrl(`gateway/v1/migrations?extension=${extensionKey}`)
  console.log('[Gateway Migrations] fetching:', migrationsUrl)

  const { data, isLoading } = useQuery<{ success: boolean; groups: MigrationGroup[] }>({
    queryKey: ['migrations', extensionKey],
    queryFn: async () => {
      console.log('[Gateway Migrations] GET', migrationsUrl)
      const res = await fetch(migrationsUrl, { headers: authHeaders() })
      const json = await res.json()
      console.log('[Gateway Migrations] response for', extensionKey, json)
      return json
    },
    staleTime: 30_000,
  })

  const group = data?.groups?.[0]

  const runUrl = apiUrl(`gateway/v1/migrations/${extensionKey}`)

  const runMutation = useMutation({
    mutationFn: async () => {
      console.log('[Gateway Migrations] POST', runUrl)
      const res = await fetch(runUrl, { method: 'POST', headers: authHeaders() })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed')
      return json
    },
    onSuccess: (json) => {
      setResult(`Done — ${json.ran} ran`)
      queryClient.invalidateQueries({ queryKey: ['migrations', extensionKey] })
    },
    onError: (e: Error) => setResult(e.message),
  })

  if (isLoading) return <span className="text-[10px] text-zinc-600">checking…</span>

  if (!group) {
    return <span className="text-[10px] text-zinc-600">no migrations registered</span>
  }

  return (
    <div className="flex items-center gap-2 shrink-0" onClick={e => e.preventDefault()}>
      {result && (
        <span className={`text-[10px] ${result.startsWith('Done') ? 'text-green-400' : 'text-red-400'}`}>
          {result}
        </span>
      )}
      <span className="text-[10px] text-zinc-500">{group.migration_count} migration{group.migration_count !== 1 ? 's' : ''}</span>
      <button
        onClick={() => runMutation.mutate()}
        disabled={runMutation.isPending}
        className="inline-flex items-center h-7 px-2.5 rounded text-[11px] font-medium border border-zinc-700 hover:bg-zinc-800 text-zinc-400 transition-colors disabled:opacity-40"
      >
        {runMutation.isPending ? 'Running…' : 'Run'}
      </button>
    </div>
  )
}

export default function Extensions() {
  const { data: extensions = [], isLoading, isError } = useQuery<Extension[]>({
    queryKey: ['extensions'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/extension'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.extensions ?? []
    },
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Extensions</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage your Gateway plugin extensions</p>
        </div>
        <Link
          to={"/extensions/create" as never}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm text-white font-medium transition-colors"
        >
          <span className="text-base leading-none">+</span>
          New Extension
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          Failed to load extensions.
        </div>
      )}

      {!isLoading && !isError && extensions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-4 opacity-30">⬡</div>
          <p className="text-zinc-500 text-sm mb-4">No extensions yet</p>
          <Link
            to={"/extensions/create" as never}
            className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm text-white transition-colors"
          >
            Create your first extension
          </Link>
        </div>
      )}

      {!isLoading && !isError && extensions.length > 0 && (
        <div className="space-y-2">
          {extensions.map((ext) => (
            <div key={ext.extension_key} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <Link
                to={`/extensions/${ext.extension_key}/edit` as never}
                className="group flex items-center gap-4 flex-1 min-w-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-200 group-hover:text-zinc-100">
                    {ext.title || ext.extension_key}
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5 font-mono">{ext.extension_key}</p>
                </div>
                <ArrowIcon />
              </Link>
              <MigrationButton extensionKey={ext.extension_key} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
