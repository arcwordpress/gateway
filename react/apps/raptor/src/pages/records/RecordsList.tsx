import { useNavigate, useParams } from '@tanstack/react-router'
import { Grid } from '@arcwp/gateway-grids'
import '@arcwp/gateway-forms/style.css'

export default function RecordsList() {
  const { collectionKey } = useParams({ strict: false }) as { collectionKey: string }
  const navigate = useNavigate()

  return (
    <div className="h-full overflow-auto bg-white">
      <Grid
        collectionKey={collectionKey}
        showFilters
        showActions
        onEdit={(id: number | string) =>
          void navigate({
            to: '/records/$collectionKey/edit/$id' as never,
            params: { collectionKey, id: String(id) } as never,
          })
        }
        onView={(record: { id: number | string }) =>
          void navigate({
            to: '/records/$collectionKey/view/$id' as never,
            params: { collectionKey, id: String(record.id) } as never,
          })
        }
        toolbarActions={
          <button
            onClick={() =>
              void navigate({
                to: '/records/$collectionKey/create' as never,
                params: { collectionKey } as never,
              })
            }
            className="gty-dashboard__create-button"
          >
            Create
          </button>
        }
      />
    </div>
  )
}
