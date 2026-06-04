import { createContext } from 'react';

/**
 * Context for a specific collection's data and metadata
 * Provides both collection info and records with CRUD operations
 */
export const CollectionContext = createContext({
  // Collection metadata
  collection: null,
  collectionLoading: false,
  collectionError: null,

  // Collection records
  records: [],
  recordsLoading: false,
  recordsError: null,

  // CRUD operations
  createRecord: async () => {},
  updateRecord: async () => {},
  deleteRecord: async () => {},
  refreshRecords: async () => {},
  refreshCollection: async () => {},

  // Utility
  getRecordById: () => null,
});

export default CollectionContext;
