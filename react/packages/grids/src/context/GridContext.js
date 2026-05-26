import { createContext, useContext } from 'react';

const GridContext = createContext({
  namespace: null,
  route: null,
  collection: null,
  records: [],
  getRecordById: (id) => null,
  onRefresh: null,
  auth: null, // { username, password } or null
});

export const GridProvider = GridContext.Provider;

export const useGridContext = () => {
  const context = useContext(GridContext);
  // Provide default values if context is undefined (no provider)
  if (!context) {
    return {
      namespace: null,
      route: null,
      collection: null,
      records: [],
      getRecordById: () => null,
      onRefresh: null,
      auth: null,
    };
  }
  return context;
};

/**
 * Hook to get a specific record by ID from the grid context
 * @param {number|string} id - Record ID
 * @returns {Object|null} Record object or null if not found
 */
export const useRecord = (id) => {
  const { getRecordById } = useGridContext(); 
  return getRecordById ? getRecordById(id) : null;
};

export default GridContext;