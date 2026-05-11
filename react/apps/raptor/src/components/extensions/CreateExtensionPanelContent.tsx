import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiUrl, authHeaders } from '../../lib/api'
import FieldInput, { FieldSkeleton, type ExtensionField } from './ExtensionFieldInput'

type CreateExtensionPanelContentProps = {
  onClose: () => void
}

function toKey(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

export default function CreateExtensionPanelContent({ onClose }: CreateExtensionPanelContentProps) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<Record<string, string>>({})
  const [key, setKey] = useState('')

  const { data: fieldsData, isLoading, isError } = useQuery<Record<string, ExtensionField>>({
    queryKey: ['extension-fields'],
    queryFn: async () => {
      const res = await fetch(apiUrl('gateway/v1/extensions/fields'), { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.fields as Record<string, ExtensionField>
    },
    staleTime: Infinity,
    retry: 2,
  })

  useEffect(() => {
    if (!fieldsData) return
    setValues((prev) => {
      const seeded: Record<string, string> = {}
      for (const [name, field] of Object.entries(fieldsData)) {
        seeded[name] = prev[name] ?? (field.default !== undefined ? String(field.default) : '')
      }
      return seeded
    })
  }, [fieldsData])

  useEffect(() => {
    setKey(values.title ? toKey(values.title) : '')
  }, [values.title])

  const setValue = (name: string, val: string) =>
    setValues((prev) => ({ ...prev, [name]: val }))

  const mutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const res = await fetch(apiUrl('gateway/v1/extensions'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to create extension')
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

  const fieldList = fieldsData ? Object.values(fieldsData) : []

  return (
    <>
      {isError && (
        <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          Could not load field definitions.
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const title = values.title?.trim()
          if (!title || !key.trim()) return
          mutation.mutate({ ...values, title, key: key.trim() })
        }}
        className="space-y-4"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <FieldSkeleton key={i} />)
          : fieldList.map((field, idx) => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  {field.label}
                  {field.required && <span className="ml-1 text-red-400">*</span>}
                  <span className="ml-1.5 text-zinc-600 font-mono font-normal">{field.name}</span>
                </label>
                <FieldInput
                  field={field}
                  value={values[field.name] ?? ''}
                  disabled={mutation.isPending}
                  autoFocus={idx === 0}
                  onChange={(val) => setValue(field.name, val)}
                />
                {field.name === 'title' && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Key
                      <span className="ml-1.5 text-zinc-600 font-normal">auto-generated</span>
                    </label>
                    <input
                      type="text"
                      value={key}
                      readOnly
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-zinc-500 font-mono text-xs focus:outline-none cursor-default"
                    />
                  </div>
                )}
              </div>
            ))}

        {mutation.isError && (
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {(mutation.error as Error).message}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={mutation.isPending || !values.title?.trim() || isLoading}
            className="px-4 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
          >
            {mutation.isPending ? 'Creating…' : 'Create'}
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
