import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../../lib/api'

type CoreCollection = {
  key: string
  title: string
  active: boolean
}

export default function CollectionSettings() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery<{ collections: CoreCollection[] }>({
    queryKey: ['core-collections'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/core-collections'), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ key, active }: { key: string; active: boolean }) => {
      const res = await fetch(apiUrl(`gateway/v1/core-collections/${key}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ active }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core-collections'] })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-zinc-900 animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-3 rounded-lg bg-red-900/20 border border-red-700/30">
        <p className="text-red-400 text-sm">Failed to load core collections.</p>
      </div>
    )
  }

  const collections = data?.collections ?? []

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-zinc-100 font-semibold text-sm">Core Adaptor Collections</h2>
        <p className="text-zinc-500 text-xs mt-1">
          Enable or disable the built-in WordPress data collections. Disabling a collection
          removes its REST API routes. Changes take effect on the next page load.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        {collections.map((col, idx) => {
          const isPending =
            toggleMutation.isPending &&
            (toggleMutation.variables as { key: string } | undefined)?.key === col.key

          return (
            <div
              key={col.key}
              className={`flex items-center justify-between px-4 py-3 ${
                idx !== collections.length - 1 ? 'border-b border-zinc-800' : ''
              }`}
            >
              <div>
                <div className="text-zinc-200 text-sm font-medium">{col.title}</div>
                <code className="text-[11px] text-zinc-600 font-mono">{col.key}</code>
              </div>

              {/* Toggle */}
              <button
                role="switch"
                aria-checked={col.active}
                disabled={isPending}
                onClick={() => toggleMutation.mutate({ key: col.key, active: !col.active })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                  col.active ? 'bg-zinc-400' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                    col.active ? 'translate-x-[18px]' : 'translate-x-[3px]'
                  }`}
                />
              </button>
            </div>
          )
        })}
      </div>

      {toggleMutation.isError && (
        <div className="p-3 rounded-lg bg-red-900/20 border border-red-700/30">
          <p className="text-red-400 text-xs">
            Failed to update: {(toggleMutation.error as Error).message}
          </p>
        </div>
      )}
    </div>
  )
}
