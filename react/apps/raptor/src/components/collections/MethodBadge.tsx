export default function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET:    'bg-zinc-800/60 text-zinc-300 border-zinc-700/50',
    POST:   'bg-zinc-800/60 text-zinc-200 border-zinc-700/50',
    PUT:    'bg-zinc-900/60 text-zinc-200 border-zinc-800/50',
    PATCH:  'bg-zinc-900/60 text-zinc-400 border-zinc-700/50',
    DELETE: 'bg-red-900/60 text-red-300 border-red-700/50',
  }
  const cls = colors[method] ?? 'bg-zinc-900/60 text-zinc-300 border-zinc-700/50'
  return (
    <span className={`inline-flex items-center justify-center w-14 px-1.5 py-0.5 rounded text-[10px] font-bold border ${cls}`}>
      {method}
    </span>
  )
}