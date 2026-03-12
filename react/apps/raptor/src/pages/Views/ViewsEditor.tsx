import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { View } from '../../lib/object_types'
import { apiUrl, authHeaders } from '../../lib/api'
import { HandleIcon } from '../../components/HandleIcon'
import { useCollection, useViews, SurfaceState } from './ViewsPageContext'
import { EditPanel } from '../Fields/FieldsEditor'

const baseInput =
  'w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-100 ' +
  'placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 ' +
  'focus:ring-blue-500 transition-colors disabled:opacity-50 text-sm'

const baseTextarea =
  'w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-100 ' +
  'placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 ' +
  'focus:ring-blue-500 transition-colors disabled:opacity-50 text-sm resize-none'

export function ViewsList({ setEditSurface }: { setEditSurface: (s: SurfaceState) => void }) {
  const { views, addView, moveView } = useViews()
  const { collection } = useCollection()
  const queryClient = useQueryClient()
  const collectionKey = collection?.collection_key
  const viewListId = collection?.view_list?.id

  const addMutation = useMutation({
    mutationFn: async (data: { view_key: string; title: string; description: string }) => {
      const res = await fetch(apiUrl('gateway/v1/raptor/view'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ 
          view_list_id: viewListId, 
          collection_key: collectionKey,
          status: 'active',
          source: collectionKey,
          columns: [],
          facet_filters: [],
          default_sort: {},
          per_page: 20,
          sort_order: views.length,
          ...data 
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to create view')
      return json.view as View
    },
    onSuccess: (view) => {
      addView(view)
      void queryClient.invalidateQueries({ queryKey: ['raptor-collections', collectionKey] })
    },
  })

  const handleAdd = () => {
    const taken = new Set(views.map((view) => view.view_key))
    let number = views.length
    let key = `view_${number}`

    while (taken.has(key)) {
      number += 1
      key = `view_${number}`
    }

    addMutation.mutate({ view_key: key, title: 'New View', description: '' })
  }

  const persistOrder = async (orderedViews: View[]) => {
    await Promise.all(
      orderedViews.map((view, index) =>
        fetch(apiUrl(`gateway/v1/raptor/view/${view.view_key}`), {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ sort_order: index }),
        })
      )
    )
    void queryClient.invalidateQueries({ queryKey: ['raptor-collections', collectionKey] })
  }

  const moveViewAndPersist = (viewKey: string, dir: 'up' | 'down') => {
    const currentIndex = views.findIndex((view) => view.view_key === viewKey)
    if (currentIndex < 0) return
    const targetIndex = dir === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= views.length) return

    const orderedViews = arrayMove(views, currentIndex, targetIndex).map((view, index) => ({
      ...view,
      sort_order: index,
    }))

    moveView(viewKey, dir)
    void persistOrder(orderedViews)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeView = views.find((view) => view.view_key === active.id)
    const overView = views.find((view) => view.view_key === over.id)

    if (!activeView || !overView) return

    const activeIndex = views.indexOf(activeView)
    const overIndex = views.indexOf(overView)

    const orderedViews = arrayMove(views, activeIndex, overIndex).map((view, index) => ({
      ...view,
      sort_order: index,
    }))

    if (activeIndex < overIndex) {
      for (let i = activeIndex; i < overIndex; i++) {
        moveView(views[i].view_key, 'down')
      }
    } else {
      for (let i = activeIndex; i > overIndex; i--) {
        moveView(views[i].view_key, 'up')
      }
    }

    void persistOrder(orderedViews)
  }

  return (
    <section>
      <header className="flex justify-between items-center gap-6 mb-10">
        <h2 className="!text-white text-xl font-medium">View List</h2>
        <button
          className="text-3xl disabled:opacity-50"
          disabled={addMutation.isPending || !viewListId}
          onClick={handleAdd}
        >
          +
        </button>
      </header>

      {!viewListId && (
        <p className="mb-6 text-xs text-zinc-400">
          This is very unusual, this Collection does not have a View List row associated with it.
        </p>
      )}

      {addMutation.isError && (
        <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {(addMutation.error as Error).message}
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={views.map((view) => view.view_key)} strategy={verticalListSortingStrategy}>
          <ul className="min-w-96 space-y-2">
            {views.map((view) => (
              <SortableViewItem
                key={view.id}
                view={view}
                setEditSurface={setEditSurface}
                onMove={(dir) => moveViewAndPersist(view.view_key, dir)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {views.length === 0 && !addMutation.isPending && (
        <div className="text-gray-500 text-sm italic">No views yet. Add one above to get started.</div>
      )}
    </section>
  )
}

function SortableViewItem({
  view,
  setEditSurface,
  onMove,
}: {
  view: View
  setEditSurface: (s: SurfaceState) => void
  onMove: (dir: 'up' | 'down') => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: view.view_key })
  const { collection } = useCollection()
  const navigate = useNavigate()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group relative flex gap-4 items-center border border-white px-4 py-2 rounded transition-opacity ${
        isDragging ? 'bg-gray-900/50' : 'hover:bg-gray-900/30'
      }`}
    >
      <div {...attributes} {...listeners} className="flex items-center cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300">
        <HandleIcon />
      </div>
      <div className="flex-1">
        <h3 className="!text-white">{view.title}</h3>
        <span className="text-xs text-gray-400 font-mono">{view.view_key}</span>
      </div>
      <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
        <button
          onClick={() => onMove('up')}
          className="px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          ↑
        </button>
        <button
          onClick={() => onMove('down')}
          className="px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          ↓
        </button>
        <button
          onClick={() => setEditSurface({ mode: 'editView', view })}
          className="px-2 py-1 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => {
            void navigate({ to: `/collections/${collection?.collection_key}/views/${view.view_key}/design` })
          }}
          className="px-2 py-1 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100 transition-colors"
        >
          Design
        </button>
        <button
          onClick={() => setEditSurface({ mode: 'deleteConfirm', view })}
          className="px-2 py-1 text-xs rounded bg-red-700 hover:bg-red-600 text-white transition-colors"
        >
          Delete
        </button>
      </div>
    </li>
  )
}

export function ViewEditForm({ view, onClose }: { view: View; onClose: () => void }) {
  const { updateView } = useViews()
  const { collection } = useCollection()
  const queryClient = useQueryClient()
  const availableFields = collection?.field_list?.fields ?? []
  const [title, setTitle] = useState(view.title)
  const [description, setDescription] = useState(view.description)
  const [source, setSource] = useState(view.source)
  const [perPage, setPerPage] = useState(view.per_page)
  const [selectedColumns, setSelectedColumns] = useState<string[]>(view.columns ?? [])

  const toggleColumn = (fieldName: string) => {
    setSelectedColumns((prev) =>
      prev.includes(fieldName)
        ? prev.filter((name) => name !== fieldName)
        : [...prev, fieldName]
    )
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/view/${view.view_key}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          title,
          description,
          source,
          per_page: perPage,
          columns: selectedColumns,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to update view')
      return json.view as View
    },
    onSuccess: (updated) => {
      updateView(view.view_key, updated)
      void queryClient.invalidateQueries({ queryKey: ['raptor-collections', collection?.collection_key] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={baseInput}
          required
          disabled={mutation.isPending}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={baseTextarea}
          rows={3}
          disabled={mutation.isPending}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Source Collection</label>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className={baseInput}
          disabled={mutation.isPending}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Per Page</label>
        <input
          type="number"
          value={perPage}
          onChange={(e) => setPerPage(Number(e.target.value))}
          className={baseInput}
          min={1}
          disabled={mutation.isPending}
        />
      </div>

      <div className="pt-3 border-t border-gray-800">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Fields In View
        </div>

        {availableFields.length === 0 ? (
          <p className="text-xs text-gray-500">
            This collection has no fields yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {availableFields.map((field) => {
              const checked = selectedColumns.includes(field.name)
              return (
                <label
                  key={field.name}
                  className="flex items-center justify-between gap-3 rounded border border-gray-800 px-3 py-2 cursor-pointer hover:bg-gray-900/40"
                >
                  <div className="min-w-0">
                    <div className="text-sm text-gray-200 truncate">{field.label || field.name}</div>
                    <div className="text-xs text-gray-500 font-mono truncate">{field.name}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleColumn(field.name)}
                    disabled={mutation.isPending}
                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-zinc-400"
                  />
                </label>
              )
            })}
          </div>
        )}
      </div>

      {mutation.isError && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {(mutation.error as Error).message}
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={mutation.isPending}
          className="px-4 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export function DeleteConfirmation({ view, onClose }: { view: View; onClose: () => void }) {
  const { deleteView } = useViews()
  const { collection } = useCollection()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/view/${view.view_key}`), {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to delete view')
    },
    onSuccess: () => {
      deleteView(view.view_key)
      void queryClient.invalidateQueries({ queryKey: ['raptor-collections', collection?.collection_key] })
      onClose()
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-300 text-sm">
        Are you sure you want to delete the view <strong className="text-white">{view.title}</strong>?
        This action cannot be undone.
      </p>
      {mutation.isError && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {(mutation.error as Error).message}
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'Deleting…' : 'Delete'}
        </button>
        <button
          onClick={onClose}
          disabled={mutation.isPending}
          className="px-4 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export function Editor({ setEditSurface }: { setEditSurface: (s: SurfaceState) => void }) {
  return (
    <section className="text-white">
      <ViewsList setEditSurface={setEditSurface} />
    </section>
  )
}

export { EditPanel }
