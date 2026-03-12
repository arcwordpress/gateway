import { useNavigate, useParams } from '@tanstack/react-router'
import { Form } from '@arcwp/gateway-forms'
import '@arcwp/gateway-forms/style.css'

export default function RecordForm() {
  const { collectionKey, id } = useParams({ strict: false }) as {
    collectionKey: string
    id?: string
  }
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  return (
    <div className="h-full overflow-auto bg-white">
      <div className="border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <button
          onClick={() =>
            void navigate({
              to: '/records/$collectionKey' as never,
              params: { collectionKey },
            })
          }
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {collectionKey}
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700">
          {isEdit ? `Edit record #${id}` : 'Create record'}
        </span>
      </div>

      <div className="px-6 py-4">
        <Form collectionKey={collectionKey} recordId={id} />
      </div>
    </div>
  )
}
