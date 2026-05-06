import { createContext, useContext } from 'react'

export type WorkspaceCollection = {
  id: number
  collection_key: string
  title: string
}

export type WorkspaceExtension = {
  id: number
  extension_key: string
  title: string
}

export interface WorkspaceContextValue {
  activeCollectionKey: string | null
  setActiveCollectionKey: (key: string | null) => void
  collections: WorkspaceCollection[]
  isCollectionsLoading: boolean
  activeExtensionKey: string | null
  setActiveExtensionKey: (key: string | null) => void
  extensions: WorkspaceExtension[]
  isExtensionsLoading: boolean
}

export const WorkspaceContext = createContext<WorkspaceContextValue>({
  activeCollectionKey: null,
  setActiveCollectionKey: () => {},
  collections: [],
  isCollectionsLoading: false,
  activeExtensionKey: null,
  setActiveExtensionKey: () => {},
  extensions: [],
  isExtensionsLoading: false,
})

export const useWorkspace = () => useContext(WorkspaceContext)
