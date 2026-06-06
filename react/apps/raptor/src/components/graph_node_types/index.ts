import { type NodeTypes, type EdgeTypes } from '@xyflow/react'
import { FieldNode } from './FieldNode'
import { CollectionRootNode } from './CollectionRootNode'
import { DatabaseNode } from './DatabaseNode'
import { RecordsContainerNode } from './RecordsContainerNode'
import { RecordNode } from './RecordNode'
import { JsonSchemaNode } from './JsonSchemaNode'
import { ViewPreviewNode } from './ViewPreviewNode'
import { ViewListLabelNode } from './ViewListLabelNode'
import { ViewNode } from './ViewNode'
import { RenderStrategyNode } from './RenderStrategyNode'
import { RenderOutputNode } from './RenderOutputNode'
import { FormListLabelNode } from './FormListLabelNode'
import { FormNode } from './FormNode'
import { PackageNode } from './PackageNode'

// Import Collections Viewer nodes
import { CollectionsLabelNode } from './CollectionsRootNode'
import { ExtensionNode } from './ExtensionNode'
import { CollectionNode } from './CollectionNode'
import { BusEdge } from './BusEdge'

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
  CollNodeType,
} from './types'
export type { ViewListLabelNodeType } from './ViewListLabelNode'
export type { FormListLabelNodeType } from './FormListLabelNode'
export type { FormNodeType } from './FormNode'
export type { ViewNodeType } from './ViewNode'
export type { RenderStrategyNodeType } from './RenderStrategyNode'
export type { RenderOutputNodeType } from './RenderOutputNode'
// Export context
export { RecordsCtx } from './RecordsContext'

// Export node components
export { FieldNode } from './FieldNode'
export type { FieldNodeType } from './FieldNode'
export { CollectionRootNode } from './CollectionRootNode'
export { DatabaseNode } from './DatabaseNode'
export { RecordsContainerNode } from './RecordsContainerNode'
export { RecordNode } from './RecordNode'
export { JsonSchemaNode } from './JsonSchemaNode'
export { ViewPreviewNode, FacetCardPreview } from './ViewPreviewNode'
export { ViewListLabelNode } from './ViewListLabelNode'
export { FormListLabelNode } from './FormListLabelNode'
export { FormNode } from './FormNode'
export { ViewNode } from './ViewNode'
export { RenderStrategyNode } from './RenderStrategyNode'
export { RenderOutputNode } from './RenderOutputNode'

// Export Collections Viewer nodes
export { CollectionsLabelNode } from './CollectionsRootNode'
export { ExtensionNode } from './ExtensionNode'
export { CollectionNode } from './CollectionNode'
export { BusEdge } from './BusEdge'
export { NodeTypeHeader } from './NodeTypeHeader'

// Export node types registry
export const FIELD_GRAPH_NODE_TYPES: NodeTypes = {
  collectionRootNode:   CollectionRootNode,
  databaseNode:         DatabaseNode,
  recordsContainerNode: RecordsContainerNode,
  recordNode:           RecordNode,
  jsonSchemaNode:       JsonSchemaNode,
  viewPreviewNode:      ViewPreviewNode,
  viewListLabel:        ViewListLabelNode,
  viewNode:             ViewNode,
  renderStrategyNode:   RenderStrategyNode,
  renderOutputNode:     RenderOutputNode,
  formListLabel:        FormListLabelNode,
  formNode:             FormNode,
}

// Export Collections Viewer node types registry
export const COLLECTIONS_GRAPH_NODE_TYPES: NodeTypes = {
  collectionsLabelNode: CollectionsLabelNode,
  extensionNode:        ExtensionNode,
  collectionNode:       CollectionNode,
}

// Node types registry for /fields, /forms, /views global overview graphs
export const GLOBAL_OVERVIEW_NODE_TYPES: NodeTypes = {
  collectionRootNode: CollectionRootNode,
  fieldNode:          FieldNode,
  formNode:           FormNode,
  viewNode:           ViewNode,
}

// Export Collections Viewer edge types registry
export const COLLECTIONS_GRAPH_EDGE_TYPES: EdgeTypes = {
  busEdge: BusEdge,
}

// Export Collections Viewer layout utilities
export { NODE_DIMS, layoutWithDagre, layoutCollectionsLR, layoutCollectionsDagre } from './layoutWithDagre'

export { PackageNode } from './PackageNode'
export type { PackageNodeType, PackageNodeData } from './PackageNode'

export const PACKAGES_GRAPH_NODE_TYPES: NodeTypes = {
  extensionNode: ExtensionNode,
  packageNode:   PackageNode,
}
