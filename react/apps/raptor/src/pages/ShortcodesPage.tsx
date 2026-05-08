import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Copy, Check } from 'lucide-react'
import { apiUrl, authHeaders } from '../lib/api'
import { useSnackbar } from '../context/snackbar'

type ShortcodeEntry = {
  type: 'grid' | 'form'
  title: string
  key: string
  shortcode: string
  extension_key?: string
  extension_title?: string
}

export default function ShortcodesPage() {
  const { addMessage } = useSnackbar()
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const { data, isLoading } = useQuery<{ success: boolean; shortcodes: ShortcodeEntry[] }>({
    queryKey: ['raptor-shortcodes-all'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/shortcodes'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
  })

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text)
      addMessage('Copied to clipboard', 'success')
      setTimeout(() => setCopiedText(null), 2000)
    })
  }

  const rows = data?.shortcodes ?? []

  const grouped: Record<string, { title: string; rows: ShortcodeEntry[] }> = {}
  for (const row of rows) {
    const ek = row.extension_key ?? 'unknown'
    if (!grouped[ek]) grouped[ek] = { title: row.extension_title ?? ek, rows: [] }
    grouped[ek].rows.push(row)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-zinc-100 mb-1">Shortcodes</h1>
      <p className="text-sm text-zinc-500 mb-6">All shortcodes available from active extensions.</p>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-zinc-500">No shortcodes found. Build and activate an extension first.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([ek, group]) => (
            <div key={ek}>
              <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 px-1">
                {group.title}
              </h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 w-16">Type</th>
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
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                              row.type === 'grid'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-900/50'
                                : 'bg-purple-950/60 text-purple-300 border-purple-900/50'
                            }`}>
                              {row.type === 'grid' ? 'Grid' : 'Form'}
                            </span>
                          </td>
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
