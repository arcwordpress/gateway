import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../../lib/api'

type DeleteExtensionPanelProps = {
  extKey: string
  onClose: () => void
}

export default function DeleteExtensionPanelContent({ extKey, onClose }: DeleteExtensionPanelProps) {
  const queryClient = useQueryClient()

  const { data: existing } = useQuery<Record<string, string>>({
    queryKey: ['gateway-extensions', extKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/extensions/${extKey}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.extension as Record<string, string>
    },
    enabled: !!extKey,
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/extensions/${extKey}`), {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to delete')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] })
      queryClient.invalidateQueries({ queryKey: ['gateway-extensions'] })
      queryClient.invalidateQueries({ queryKey: ['registered-extensions'] })
      queryClient.invalidateQueries({ queryKey: ['raptor-admin-stats'] })
      onClose()
    },
  })

  return (
    <>
      <p className="text-sm text-zinc-300 mb-1">
        You are about to delete{' '}
        <span className="font-semibold text-zinc-100">{existing?.title || extKey}</span>.
      </p>
      <p className="text-xs text-zinc-500 mb-6">
        This removes the extension, its plugin files, and all associated data. This cannot be
        undone.
      </p>

      {deleteMutation.isError && (
        <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {(deleteMutation.error as Error).message}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
        </button>
        <button
          onClick={onClose}
          disabled={deleteMutation.isPending}
          className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </>
  )
}
