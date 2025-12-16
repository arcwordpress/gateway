import { createContext } from 'react';

/**
 * Context for collection records without metadata
 * Lightweight provider for public/read-only access
 */
export const RecordsContext = createContext({
  // Records data
  records: [],
  loading: false,
  error: null,

  // Operations
  refresh: async () => {},
  createRecord: async () => {},
  
  // Utility
  getRecordById: () => null,
});

export default RecordsContext;
