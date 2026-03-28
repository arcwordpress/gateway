import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Form } from '../../lib/object_types'
import { apiUrl, authHeaders } from '../../lib/api'
import { HandleIcon } from '../../components/HandleIcon'
import { useCollection, useForms, SurfaceState } from './FormsPageContext'
import { EditPanel } from '../Fields/FieldsEditor'

const baseInput =
  'w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 ' +
  'placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 ' +
  'focus:ring-zinc-500 transition-colors disabled:opacity-50 text-sm'

const baseTextarea =
  'w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 ' +
  'placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 ' +
  'focus:ring-zinc-500 transition-colors disabled:opacity-50 text-sm resize-none'

export function FormsList({ setEditSurface }: { setEditSurface: (s: SurfaceState) => void }) {
  const { forms, addForm, moveForm } = useForms()
  const { collection } = useCollection()
  const queryClient = useQueryClient()
  const collectionKey = collection?.collection_key
  const formListId = collection?.form_list?.id

  const addMutation = useMutation({
    mutationFn: async (data: { form_key: string; title: string; description: string }) => {
      const res = await fetch(apiUrl('gateway/v1/raptor/form'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          form_list_id: formListId,
          status: 'active',
          sort_order: forms.length,
          ...data,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to create form')
      return json.form as Form
    },
    onSuccess: (form) => {
      addForm(form)
      void queryClient.invalidateQueries({ queryKey: ['raptor-collections', collectionKey] })
    },
  })

  const handleAdd = () => {
    const taken = new Set(forms.map((form) => form.form_key))
    let number = forms.length
    let key = `form_${number}`

    while (taken.has(key)) {
      number += 1
      key = `form_${number}`
    }

    addMutation.mutate({ form_key: key, title: 'New Form', description: '' })
  }

  const persistOrder = async (orderedForms: Form[]) => {
    await Promise.all(
      orderedForms.map((form, index) =>
        fetch(apiUrl(`gateway/v1/raptor/form/${form.form_key}`), {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ sort_order: index }),
        })
      )
    )
    void queryClient.invalidateQueries({ queryKey: ['raptor-collections', collectionKey] })
  }

  const moveFormAndPersist = (formKey: string, dir: 'up' | 'down') => {
    const currentIndex = forms.findIndex((form) => form.form_key === formKey)
    if (currentIndex < 0) return
    const targetIndex = dir === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= forms.length) return

    const orderedForms = arrayMove(forms, currentIndex, targetIndex).map((form, index) => ({
      ...form,
      sort_order: index,
    }))

    moveForm(formKey, dir)
    void persistOrder(orderedForms)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeForm = forms.find((form) => form.form_key === active.id)
    const overForm = forms.find((form) => form.form_key === over.id)

    if (!activeForm || !overForm) return

    const activeIndex = forms.indexOf(activeForm)
    const overIndex = forms.indexOf(overForm)

    const orderedForms = arrayMove(forms, activeIndex, overIndex).map((form, index) => ({
      ...form,
      sort_order: index,
    }))

    if (activeIndex < overIndex) {
      for (let i = activeIndex; i < overIndex; i++) {
        moveForm(forms[i].form_key, 'down')
      }
    } else {
      for (let i = activeIndex; i > overIndex; i--) {
        moveForm(forms[i].form_key, 'up')
      }
    }

    void persistOrder(orderedForms)
  }

  return (
    <section>
      <header className="flex justify-between items-center gap-6 mb-10">
        <div>
          <h2 className="!text-white text-xl font-medium">Form List</h2>
        </div>
        <button
          className="disabled:opacity-50 cursor-pointer hover:text-zinc-300 transition-colors w-8 h-8 flex items-center justify-center rounded"
          disabled={addMutation.isPending || !formListId}
          onClick={handleAdd}
        >
          <Plus size={20} strokeWidth={2} />
        </button>
      </header>

      {!formListId && (
        <p className="mb-6 text-xs text-zinc-400">
          This is very unusual, this Collection does not have a Form List row associated with it.
        </p>
      )}

      {addMutation.isError && (
        <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {(addMutation.error as Error).message}
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={forms.map((form) => form.form_key)} strategy={verticalListSortingStrategy}>
          <div className="overflow-x-auto">
          <ul className="min-w-96 space-y-2">
            {forms.map((form) => (
              <SortableFormItem
                key={form.id}
                form={form}
                setEditSurface={setEditSurface}
                onMove={(dir) => moveFormAndPersist(form.form_key, dir)}
              />
            ))}
          </ul>
          </div>
        </SortableContext>
      </DndContext>

      {forms.length === 0 && !addMutation.isPending && (
        <div className="text-zinc-500 text-sm italic">No forms yet. Add one above to get started.</div>
      )}
    </section>
  )
}

function SortableFormItem({
  form,
  setEditSurface,
  onMove,
}: {
  form: Form
  setEditSurface: (s: SurfaceState) => void
  onMove: (dir: 'up' | 'down') => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: form.form_key })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group relative flex gap-4 items-center border border-zinc-700 px-4 py-2 rounded transition-opacity ${
        isDragging ? 'bg-zinc-900/50' : 'hover:bg-zinc-900/30'
      }`}
    >
      <div {...attributes} {...listeners} className="flex items-center cursor-grab active:cursor-grabbing text-zinc-500 hover:text-zinc-300">
        <HandleIcon />
      </div>
      <div className="flex-1">
        <h3 className="!text-white">{form.title}</h3>
        <span className="text-xs text-zinc-400 font-mono">{form.form_key}</span>
      </div>
      <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
        <button
          onClick={() => onMove('up')}
          className="px-2 py-1 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
        >
          ↑
        </button>
        <button
          onClick={() => onMove('down')}
          className="px-2 py-1 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
        >
          ↓
        </button>
        <button
          title="Edit form"
          onClick={() => setEditSurface({ mode: 'editForm', form })}
          className="p-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100 transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          title="Delete form"
          onClick={() => setEditSurface({ mode: 'deleteConfirm', form })}
          className="p-1.5 rounded bg-red-700 hover:bg-red-600 text-white transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </li>
  )
}

export function FormEditForm({ form, onClose }: { form: Form; onClose: () => void }) {
  const { updateForm } = useForms()
  const { collection } = useCollection()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(form.title)
  const [description, setDescription] = useState(form.description ?? '')
  const [successMessage, setSuccessMessage] = useState(form.success_message ?? '')
  const [notificationEmail, setNotificationEmail] = useState(form.notification_email ?? '')
  const [layout, setLayout] = useState<'single' | '2-col'>((form.form_config?.layout as 'single' | '2-col') ?? 'single')

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/form/${form.form_key}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          title,
          description,
          success_message: successMessage,
          notification_email: notificationEmail,
          form_config: {
            ...form.form_config,
            layout,
          },
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to update form')
      return json.form as Form
    },
    onSuccess: (updated) => {
      updateForm(form.form_key, updated)
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
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Title</label>
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
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={baseTextarea}
          rows={2}
          disabled={mutation.isPending}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Layout</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setLayout('single')}
            disabled={mutation.isPending}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              layout === 'single'
                ? 'bg-zinc-700 text-zinc-100 border-zinc-600'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
            } border`}
          >
            Single Column
          </button>
          <button
            type="button"
            onClick={() => setLayout('2-col')}
            disabled={mutation.isPending}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              layout === '2-col'
                ? 'bg-zinc-700 text-zinc-100 border-zinc-600'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
            } border`}
          >
            2 Columns
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Success Message</label>
        <textarea
          value={successMessage}
          onChange={(e) => setSuccessMessage(e.target.value)}
          className={baseTextarea}
          rows={2}
          disabled={mutation.isPending}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Notification Email</label>
        <input
          type="email"
          value={notificationEmail}
          onChange={(e) => setNotificationEmail(e.target.value)}
          className={baseInput}
          disabled={mutation.isPending}
        />
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
          className="px-4 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={mutation.isPending}
          className="px-4 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export function DeleteConfirmation({ form, onClose }: { form: Form; onClose: () => void }) {
  const { deleteForm } = useForms()
  const { collection } = useCollection()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`gateway/v1/raptor/form/${form.form_key}`), {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Failed to delete form')
    },
    onSuccess: () => {
      deleteForm(form.form_key)
      void queryClient.invalidateQueries({ queryKey: ['raptor-collections', collection?.collection_key] })
      onClose()
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-zinc-300 text-sm">
        Are you sure you want to delete the form <strong className="text-white">{form.title}</strong>?
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
          className="px-4 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm transition-colors disabled:opacity-50"
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
      <FormsList setEditSurface={setEditSurface} />
    </section>
  )
}

export { EditPanel }
