import { type Node } from '@xyflow/react'

export type AdminCollectionInfo = {
  key: string
  title: string
  table: string
  record_count: number
  routes: { type: string; method: string; route: string }[]
}

export type CollRootNodeData    = Node<{
  title: string
  collKey: string
  onManage?: (collKey: string) => void
}, 'collectionRootNode'>
export type DbNodeData          = Node<{ tableName: string; recordCount: number | null }, 'databaseNode'>
export type RecordsStatus       = 'idle' | 'loading' | 'empty' | 'loaded' | 'no-route'
export type RecordsContNodeData = Node<{ count: number }, 'recordsContainerNode'>
export type RecordNodeData      = Node<{ recordId: number | string; label: string }, 'recordNode'>

export type JsonSchemaProp = { name: string; type: string; format?: string; description?: string; required: boolean }
export type SchemaNodeData  = Node<{ title: string; properties: JsonSchemaProp[] }, 'jsonSchemaNode'>

export type RecordsCtxValue = { status: RecordsStatus; count: number; onRefresh: () => void }

export type ViewPreviewNodeType = Node<
  {
    title: string
    columns: string[]
    rows: Record<string, unknown>[]
  },
  'viewPreviewNode'
>

// Collections Viewer node types
export type CollectionsLabelNodeType = Node<{ onCreate?: () => void }, 'collectionsLabelNode'>
export type ExtNodeType = Node<{ title: string; extKey: string; isActive: boolean; onManage?: () => void }, 'extensionNode'>
export type CollGroupNodeType = Node<{ isExpanded: boolean; onToggle: () => void; onCreate?: () => void }, 'collectionsGroupNode'>
export type CollNodeType = Node<
  {
    title: string
    collKey: string
    isActive: boolean
    onEdit?: () => void
    onDelete?: () => void
  },
  'collectionNode'
>

export type FieldsNodeType = Node<
  {
    collectionSlug: string
    onNavigate?: (slug: string) => void
  },
  'fieldsNode'
>

export type ViewsNodeType = Node<
  {
    collectionSlug: string
    onNavigate?: (slug: string) => void
  },
  'viewsNode'
>

export type RenderStrategyNodeType = Node<
  {
    strategies: { type: string }[]
    activeStrategy: string | null
    onSelect: (type: string) => void
  },
  'renderStrategyNode'
>

export type RenderOutputNodeType = Node<
  {
    strategyType: string
    viewKey: string
  },
  'renderOutputNode'
>
