// Providers
export { CollectionProvider } from './providers/CollectionProvider';

// Hooks
export { useCollectionInfo } from './hooks/useCollectionInfo';
export { useCollectionRecords } from './hooks/useCollectionRecords';
export { useRecord } from './hooks/useRecord';

// Contexts (for advanced use cases)
export { default as CollectionContext } from './contexts/CollectionContext';

// API services (for direct API calls without hooks)
export * as collectionApi from './services/collectionApi';
export { getApiClient } from './services/apiClient';
