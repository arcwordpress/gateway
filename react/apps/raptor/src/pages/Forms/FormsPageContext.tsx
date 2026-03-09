import { createContext, useContext, useEffect, useState } from 'react'
import { Form } from '../../lib/object_types'
import { useCollection } from '../Fields/FieldsPageContext'

export type SurfaceState =
  | { mode: 'deleteConfirm'; form: Form }
  | { mode: 'editForm'; form: Form }
  | null

export { useCollection, CollectionProvider } from '../Fields/FieldsPageContext'

const FormsContext = createContext<{
  forms: Form[]
  addForm: (form: Form) => void
  moveForm: (formKey: string, dir: 'up' | 'down') => void
  deleteForm: (formKey: string) => void
  updateForm: (oldKey: string, updates: Partial<Form>) => void
} | null>(null)

export const useForms = () => {
  const ctx = useContext(FormsContext)
  if (!ctx) throw new Error('useForms must be used within FormsProvider')
  return ctx
}

export function FormsProvider({ children }: { children: React.ReactNode }) {
  const { collection } = useCollection()
  const [forms, setForms] = useState<Form[]>([])

  useEffect(() => {
    const next = [...(collection?.form_list?.forms ?? [])]
    next.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    setForms(next)
  }, [collection])

  const addForm = (form: Form) =>
    setForms((prev) => [...prev, form])

  const moveForm = (formKey: string, dir: 'up' | 'down') =>
    setForms((prev) => {
      const i = prev.findIndex((f) => f.form_key === formKey)
      if (dir === 'up' && i === 0) return prev
      if (dir === 'down' && i === prev.length - 1) return prev
      const next = [...prev]
      const swap = dir === 'up' ? i - 1 : i + 1
      ;[next[i], next[swap]] = [next[swap], next[i]]
      return next.map((form, index) => ({ ...form, sort_order: index }))
    })

  const deleteForm = (formKey: string) =>
    setForms((prev) => prev.filter((f) => f.form_key !== formKey))

  const updateForm = (oldKey: string, updates: Partial<Form>) =>
    setForms((prev) => prev.map((f) => f.form_key === oldKey ? { ...f, ...updates } : f))

  return (
    <FormsContext.Provider value={{ forms, addForm, moveForm, deleteForm, updateForm }}>
      {children}
    </FormsContext.Provider>
  )
}
