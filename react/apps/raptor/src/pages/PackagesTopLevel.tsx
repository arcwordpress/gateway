import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../lib/api'

type RegisteredPackage = {
  key: string
  label: string
  description: string
  icon: string | null
  position: number
  capability: string
  parent: string | null
  collection_keys: string[]
}

export default function PackagesTopLevel() {
  const [filter, setFilter] = useState('')

  const { data: packages = [], isLoading } = useQuery<RegisteredPackage[]>({
    queryKey: ['packages-registered'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/packages/registered'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json() as { packages?: RegisteredPackage[] }
      return json.packages ?? []
    },
    staleTime: 30_000,
  })

  const q = filter.toLowerCase()
  const filtered = q
    ? packages.filter((p) => p.key.includes(q) || (p.label ?? '').toLowerCase().includes(q))
    : packages

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-zinc-100">Packages</h1>
            <p className="text-xs text-zinc-500 mt-0.5">{packages.length} registered</p>
          </div>
          <input
            type="text"
            placeholder="Filter…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 rounded border border-zinc-700 bg-zinc-800 px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 w-48"
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-10 flex flex-col items-center gap-2 text-center">
            <p className="text-sm font-medium text-zinc-300">
              {packages.length === 0 ? 'No packages registered' : 'No packages match the filter'}
            </p>
            {packages.length === 0 && (
              <p className="text-xs text-zinc-500">
                Register a package in PHP by extending <code className="font-mono">\Gateway\Package</code> and calling <code className="font-mono">register()</code>.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((pkg) => (
              <div
                key={pkg.key}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800"
              >
                <span className={`dashicons ${pkg.icon ?? 'dashicons-admin-generic'} text-zinc-500`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-200">{pkg.label || pkg.key}</p>
                  <p className="text-xs text-zinc-600 mt-0.5 font-mono">{pkg.key}</p>
                  {pkg.collection_keys.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {pkg.collection_keys.map((ck) => (
                        <span key={ck} className="text-[10px] font-mono text-zinc-500 bg-zinc-800 rounded px-1.5 py-0.5">{ck}</span>
                      ))}
                    </div>
                  )}
                </div>
                {pkg.collection_keys.length === 0 && (
                  <span className="text-[10px] text-amber-400/80 border border-amber-800/50 rounded px-1.5 py-0.5 bg-amber-950/40">
                    no collections
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
