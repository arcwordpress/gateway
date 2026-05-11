import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Copy, Check } from 'lucide-react'
import { fetchRegisteredCollections, REGISTERED_COLLECTIONS_KEY } from '../lib/queries'
import { useSnackbar } from '../context/snackbar'

type ShortcodeEntry = {
  title: string
  key: string
  shortcode: string
  extension_key?: string
  extension_title?: string
}

export default function ShortcodesPage() {
  const { addMessage } = useSnackbar()
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const { data: collections = [], isLoading } = useQuery({
    queryKey: REGISTERED_COLLECTIONS_KEY,
    queryFn: () => fetchRegisteredCollections(false),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  })

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text)
      addMessage('Copied to clipboard', 'success')
      setTimeout(() => setCopiedText(null), 2000)
    })
  }

  const rows = useMemo<ShortcodeEntry[]>(() => {
    return collections.map((collection) => ({
      title: collection.titlePlural || collection.title || collection.key,
      key: collection.key,
      shortcode: `[gateway_grid schema="${collection.key}"]`,
      extension_key: collection.package || 'registered',
      extension_title: collection.package || 'Registered Collections',
    }))
  }, [collections])

  const grouped = useMemo(() => {
    const groups: Record<string, { title: string; rows: ShortcodeEntry[] }> = {}
    for (const row of rows) {
      const ek = row.extension_key ?? 'unassigned'
      if (!groups[ek]) groups[ek] = { title: row.extension_title ?? 'Unassigned', rows: [] }
      groups[ek].rows.push(row)
    }
    return groups
  }, [rows])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl! font-semibold text-zinc-100 mb-4!">Shortcodes</h1>
      <p className="text-sm text-zinc-500 mb-12">All shortcodes available from registered collections.</p>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-zinc-500">No shortcodes found. Register at least one collection first or activate a core collection from settings.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([ek, group]) => (
            <div key={ek}>
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-8! px-1">
                {group.title}
              </h2>
              <div className="border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 w-40">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">Shortcode</th>
                      <th className="px-3 py-3 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {group.rows.map((row) => {
                      const isCopied = copiedText === row.shortcode
                      return (
                        <tr key={row.shortcode} className="hover:bg-zinc-800/40 transition-colors group">
                          <td className="px-4 py-3 text-zinc-300 text-sm">{row.title}</td>
                          <td className="px-4 py-3">
                            <code className="text-xs font-mono text-zinc-300 bg-zinc-800 px-2.5 py-1.5 rounded select-all whitespace-nowrap">
                              {row.shortcode}
                            </code>
                          </td>
                          <td className="px-3 py-3">
                            <button
                              onClick={() => copy(row.shortcode)}
                              className="p-1.5 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700 transition-colors opacity-0 group-hover:opacity-100"
                              title="Copy"
                            >
                              {isCopied
                                ? <Check size={13} className="text-emerald-400" />
                                : <Copy size={13} />
                              }
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
