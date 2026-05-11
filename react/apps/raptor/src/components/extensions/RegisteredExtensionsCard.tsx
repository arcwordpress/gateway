import { useQuery } from '@tanstack/react-query'
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

export default function RegisteredExtensionsCard() {
  const { data, isLoading, isError } = useQuery<RegisteredExtensionsResponse>({
    queryKey: ['registered-extensions'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/extension/registered'), {
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
              </tr>
            </thead>
            <tbody>
              {extensions.map((extension) => (
                <tr key={extension.key} className="border-t border-zinc-900 align-top">
                  <td className="px-4 py-2.5 font-mono text-zinc-300">{extension.key}</td>
                  <td className="px-4 py-2.5 text-zinc-400">
                    <div className="font-medium text-zinc-300">{extension.class_name}</div>
                    <div className="mt-0.5 break-all text-[11px] text-zinc-500">{extension.class}</div>
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
