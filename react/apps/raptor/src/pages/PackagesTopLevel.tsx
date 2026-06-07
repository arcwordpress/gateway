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
  const { data: packages = [], isLoading, isError } = useQuery<RegisteredPackage[]>({
    queryKey: ['packages-registered'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/packages/registered'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json() as { packages?: RegisteredPackage[] }
      return json.packages ?? []
    },
    staleTime: 30_000,
  })

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/90 shadow-2xl backdrop-blur-sm">

          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-100">Registered Packages</h2>
            <div className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-300">
              {isLoading ? '...' : packages.length}
            </div>
          </div>

          {isError && (
            <div className="px-4 py-3 text-xs text-red-400">Could not load registered packages.</div>
          )}

          {!isError && isLoading && (
            <div className="space-y-2 px-4 py-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 rounded bg-zinc-900 animate-pulse" />
              ))}
            </div>
          )}

          {!isError && !isLoading && packages.length === 0 && (
            <div className="px-4 py-4 text-xs text-zinc-500">
              No registered packages are active yet.
            </div>
          )}

          {!isError && !isLoading && packages.length > 0 && (
            <div className="max-h-[32rem] overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-zinc-950/95 text-zinc-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Key</th>
                    <th className="px-4 py-2 font-medium">Label</th>
                    <th className="px-4 py-2 font-medium">Collections</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => (
                    <tr key={pkg.key} className="border-t border-zinc-900 align-middle">
                      <td className="px-4 py-2.5 font-mono text-zinc-300">{pkg.key}</td>
                      <td className="px-4 py-2.5 text-zinc-300">{pkg.label || '—'}</td>
                      <td className="px-4 py-2.5">
                        {pkg.collection_keys.length === 0 ? (
                          <span className="text-[10px] text-amber-400/80 border border-amber-800/50 rounded px-1.5 py-0.5 bg-amber-950/40">
                            no collections
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {pkg.collection_keys.map((ck) => (
                              <span key={ck} className="text-[10px] font-mono text-zinc-500 bg-zinc-800 rounded px-1.5 py-0.5">{ck}</span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
