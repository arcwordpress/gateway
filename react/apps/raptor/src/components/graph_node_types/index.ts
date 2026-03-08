import { type NodeTypes } from '@xyflow/react'
import { CollectionRootNode } from './CollectionRootNode'
import { DatabaseNode } from './DatabaseNode'
import { RecordsContainerNode } from './RecordsContainerNode'
import { RecordNode } from './RecordNode'
import { JsonSchemaNode } from './JsonSchemaNode'
import { ViewPreviewNode } from './ViewPreviewNode'

// Import Collections Viewer nodes
import { CollectionsLabelNode } from './CollectionsRootNode'
import { ExtensionNode } from './ExtensionNode'
import { CollectionsGroupNode } from './CollectionsGroupNode'
import { CollectionNode } from './CollectionNode'
import { FieldsNode } from './FieldsNode'
import { ViewsNode } from './ViewsNode'

// Export all types
export type {
  AdminCollectionInfo,
  CollRootNodeData,
  DbNodeData,
  RecordsStatus,
  RecordsContNodeData,
  RecordNodeData,
  JsonSchemaProp,
  SchemaNodeData,
  RecordsCtxValue,
  ViewPreviewNodeType,
  CollectionsLabelNodeType,
  ExtNodeType,
  CollGroupNodeType,
  CollNodeType,
  FieldsNodeType,
  ViewsNodeType,
} from './types'

// Export context
export { RecordsCtx } from './RecordsContext'

// Export node components
export { CollectionRootNode } from './CollectionRootNode'
export { DatabaseNode } from './DatabaseNode'
export { RecordsContainerNode } from './RecordsContainerNode'
export { RecordNode } from './RecordNode'
export { JsonSchemaNode } from './JsonSchemaNode'
export { ViewPreviewNode } from './ViewPreviewNode'

// Export Collections Viewer nodes
export { CollectionsLabelNode } from './CollectionsRootNode'
export { ExtensionNode } from './ExtensionNode'
export { CollectionsGroupNode } from './CollectionsGroupNode'
export { CollectionNode } from './CollectionNode'
export { FieldsNode } from './FieldsNode'
export { ViewsNode } from './ViewsNode'

// Export node types registry
export const FIELD_GRAPH_NODE_TYPES: NodeTypes = {
  collectionRootNode:   CollectionRootNode,
  databaseNode:         DatabaseNode,
  recordsContainerNode: RecordsContainerNode,
  recordNode:           RecordNode,
  jsonSchemaNode:       JsonSchemaNode,
  viewPreviewNode:      ViewPreviewNode,
}

// Export Collections Viewer node types registry
export const COLLECTIONS_GRAPH_NODE_TYPES: NodeTypes = {
  collectionsLabelNode:  CollectionsLabelNode,
  extensionNode:         ExtensionNode,
  collectionsGroupNode:  CollectionsGroupNode,
  collectionNode:        CollectionNode,
  fieldsNode:            FieldsNode,
  viewsNode:             ViewsNode,
}

// Export Collections Viewer layout utilities
export { NODE_DIMS, layoutWithDagre } from './layoutWithDagre'
