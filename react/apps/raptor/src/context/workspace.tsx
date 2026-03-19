import { createContext, useContext } from 'react'

export type WorkspaceCollection = {
  id: number
  collection_key: string
  title: string
}

export interface WorkspaceContextValue {
  activeCollectionKey: string | null
  setActiveCollectionKey: (key: string | null) => void
  collections: WorkspaceCollection[]
  isCollectionsLoading: boolean
}

export const WorkspaceContext = createContext<WorkspaceContextValue>({
  activeCollectionKey: null,
  setActiveCollectionKey: () => {},
  collections: [],
  isCollectionsLoading: false,
})

export const useWorkspace = () => useContext(WorkspaceContext)
