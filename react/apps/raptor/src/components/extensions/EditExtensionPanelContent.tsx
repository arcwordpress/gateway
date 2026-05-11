import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../../lib/api'
import FieldInput, { FieldSkeleton, type ExtensionField } from './ExtensionFieldInput'

type ExtensionRecord = Record<string, string>

type EditExtensionPanelContentProps = {
  extKey: string
  onClose: () => void
}

export default function EditExtensionPanelContent({ extKey, onClose }: EditExtensionPanelContentProps) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<Record<string, string>>({})

  const { data: fieldsData, isLoading: fieldsLoading } = useQuery<Record<string, ExtensionField>>({
    queryKey: ['extension-fields'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/raptor/extension/fields'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.fields as Record<string, ExtensionField>
    },
    staleTime: Infinity,
  })

  const { data: existing, isLoading: extLoading, isError } = useQuery<ExtensionRecord>({
    queryKey: ['gateway-extensions', extKey],
    queryFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/extension/${extKey}`), {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.extension as ExtensionRecord
    },
    enabled: !!extKey,
  })

  const isLoading = fieldsLoading || extLoading
  const fieldList: ExtensionField[] = fieldsData ? Object.values(fieldsData) : []

  useEffect(() => {
    if (!existing || fieldList.length === 0) return
    setValues(() => {
      const seeded: Record<string, string> = {}
      for (const field of fieldList) {
        seeded[field.name] = existing[field.name] ?? ''
      }
      return seeded
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing, fieldsData])

  const setValue = (name: string, val: string) =>
    setValues((prev) => ({ ...prev, [name]: val }))

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/extension/${extKey}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to update')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] })
      queryClient.invalidateQueries({ queryKey: ['gateway-extensions'] })
      onClose()
    },
  })

  return (
    <>
      {isError && (
        <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          Could not load extension data.
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!values.title?.trim()) return
          updateMutation.mutate({ ...values })
        }}
        className="space-y-4"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <FieldSkeleton key={i} />)
          : fieldList.map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  {field.label}
                  {field.required && <span className="ml-1 text-red-400">*</span>}
                  <span className="ml-1.5 text-zinc-600 font-mono font-normal">{field.name}</span>
                </label>
                <FieldInput
                  field={field}
                  value={values[field.name] ?? ''}
                  disabled={updateMutation.isPending}
                  onChange={(val) => setValue(field.name, val)}
                />
              </div>
            ))}

        {updateMutation.isError && (
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {(updateMutation.error as Error).message}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={updateMutation.isPending || !values.title?.trim() || isLoading}
            className="px-4 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
          >
            {updateMutation.isPending ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  )
}
