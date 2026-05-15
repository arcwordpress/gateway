import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../../lib/api'

type RegisteredExtension = {
  key: string
  class: string
  class_name: string
  plugin_slug?: string | null
}

type RegisteredExtensionsResponse = {
  success: boolean
  total: number
  extensions: RegisteredExtension[]
}

type LastRun = {
  version: string
  success: boolean
  message: string
  ran_at: string
}

type MigrationGroup = {
  key: string
  version: string | null
  migration_count: number
  last_run: LastRun | null
}

function MigrationCell({ extensionKey }: { extensionKey: string }) {
  const queryClient = useQueryClient()
  const [result, setResult] = useState<string | null>(null)

  const url = apiUrl(`gateway/v1/migrations?extension=${extensionKey}`)
  console.log('[Gateway Migrations] fetching:', url)

  const { data, isLoading } = useQuery<{ success: boolean; groups: MigrationGroup[] }>({
    queryKey: ['migrations', extensionKey],
    queryFn: async () => {
      console.log('[Gateway Migrations] GET', url)
      const res = await fetch(url, { headers: authHeaders() })
      const json = await res.json()
      console.log('[Gateway Migrations] response for', extensionKey, json)
      return json
    },
    staleTime: 60_000,
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
      if (json.last_run) {
        queryClient.setQueryData(['migrations', extensionKey], (old: { success: boolean; groups: MigrationGroup[] } | undefined) => {
          if (!old) return old
          return {
            ...old,
            groups: old.groups?.map((g) =>
              g.key === extensionKey ? { ...g, last_run: json.last_run } : g
            ),
          }
        })
      }
      queryClient.invalidateQueries({ queryKey: ['migrations', extensionKey] })
    },
    onError: (e: Error) => setResult(e.message),
  })

  if (isLoading) return <span className="text-[10px] text-zinc-600">…</span>
  if (!group) return <span className="text-[10px] text-zinc-600">—</span>

  const lastRun = group.last_run
  const ranAt = lastRun ? new Date(lastRun.ran_at).toLocaleString() : null

  return (
    <div className="flex items-center gap-3">
      {lastRun ? (
        <div className="text-right">
          <div className={`text-[10px] font-mono ${lastRun.success ? 'text-green-400' : 'text-red-400'}`}>
            v{lastRun.version}
          </div>
          <div className="text-[10px] text-zinc-600">{ranAt}</div>
        </div>
      ) : (
        <span className="text-[10px] text-zinc-600">never run</span>
      )}
      {result && (
        <span className="text-[10px] text-red-400">{result}</span>
      )}
      <button
        onClick={() => runMutation.mutate()}
        disabled={runMutation.isPending}
        className="inline-flex items-center h-6 px-2 rounded text-[11px] font-medium border border-zinc-700 hover:bg-zinc-800 text-zinc-400 transition-colors disabled:opacity-40"
      >
        {runMutation.isPending ? 'Running…' : 'Run'}
      </button>
    </div>
  )
}

export default function RegisteredExtensionsCard() {
  const { data, isLoading, isError } = useQuery<RegisteredExtensionsResponse>({
    queryKey: ['registered-extensions'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/extensions/registered'), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json() as Promise<RegisteredExtensionsResponse>
    },
    staleTime: 30_000,
  })

  const extensions = data?.extensions ?? []
  const total = data?.total ?? extensions.length

  return (
    <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/90 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Registered Extensions</h2>
          <p className="text-xs text-zinc-500">Built and active in the runtime registry</p>
        </div>
        <div className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-300">
          {isLoading ? '...' : total}
        </div>
      </div>

      {isError && (
        <div className="px-4 py-3 text-xs text-red-400">
          Could not load registered extensions.
        </div>
      )}

      {!isError && isLoading && (
        <div className="space-y-2 px-4 py-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-8 rounded bg-zinc-900 animate-pulse" />
          ))}
        </div>
      )}

      {!isError && !isLoading && extensions.length === 0 && (
        <div className="px-4 py-4 text-xs text-zinc-500">
          No registered extensions are active yet.
        </div>
      )}

      {!isError && !isLoading && extensions.length > 0 && (
        <div className="max-h-80 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-zinc-950/95 text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">Key</th>
                <th className="px-4 py-2 font-medium">Class</th>
                <th className="px-4 py-2 font-medium">Migrations</th>
              </tr>
            </thead>
            <tbody>
              {extensions.map((extension) => (
                <tr key={extension.key} className="border-t border-zinc-900 align-middle">
                  <td className="px-4 py-2.5 font-mono text-zinc-300">{extension.key}</td>
                  <td className="px-4 py-2.5 text-zinc-400">
                    <div className="font-medium text-zinc-300">{extension.class_name}</div>
                    <div className="mt-0.5 break-all text-[11px] text-zinc-500">{extension.class}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <MigrationCell extensionKey={extension.key} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
