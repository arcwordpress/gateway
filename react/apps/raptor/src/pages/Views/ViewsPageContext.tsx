import { createContext, useContext, useEffect, useState } from 'react'
import { View } from '../../lib/object_types'
import { useCollection } from '../Fields/FieldsPageContext'

export type SurfaceState =
  | { mode: 'deleteConfirm'; view: View }
  | { mode: 'editView'; view: View }
  | null

export { useCollection, CollectionProvider } from '../Fields/FieldsPageContext'

const ViewsContext = createContext<{
  views: View[]
  addView: (view: View) => void
  moveView: (viewKey: string, dir: 'up' | 'down') => void
  deleteView: (viewKey: string) => void
  updateView: (oldKey: string, updates: Partial<View>) => void
} | null>(null)

export const useViews = () => {
  const ctx = useContext(ViewsContext)
  if (!ctx) throw new Error('useViews must be used within ViewsProvider')
  return ctx
}

export function ViewsProvider({ children }: { children: React.ReactNode }) {
  const { collection } = useCollection()
  const [views, setViews] = useState<View[]>([])

  useEffect(() => {
    const next = [...(collection?.view_list?.views ?? [])]
    next.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    setViews(next)
  }, [collection])

  const addView = (view: View) =>
    setViews((prev) => [...prev, view])

  const moveView = (viewKey: string, dir: 'up' | 'down') =>
    setViews((prev) => {
      const i = prev.findIndex((v) => v.view_key === viewKey)
      if (dir === 'up' && i === 0) return prev
      if (dir === 'down' && i === prev.length - 1) return prev
      const next = [...prev]
      const swap = dir === 'up' ? i - 1 : i + 1
      ;[next[i], next[swap]] = [next[swap], next[i]]
      return next.map((view, index) => ({ ...view, sort_order: index }))
    })

  const deleteView = (viewKey: string) =>
    setViews((prev) => prev.filter((v) => v.view_key !== viewKey))

  const updateView = (oldKey: string, updates: Partial<View>) =>
    setViews((prev) => prev.map((v) => v.view_key === oldKey ? { ...v, ...updates } : v))

  return (
    <ViewsContext.Provider value={{ views, addView, moveView, deleteView, updateView }}>
      {children}
    </ViewsContext.Provider>
  )
}
