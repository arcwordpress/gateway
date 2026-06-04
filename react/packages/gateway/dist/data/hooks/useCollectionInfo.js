import { useContext } from 'react';
import CollectionContext from "../contexts/CollectionContext";

/**
 * Hook to access collection metadata from CollectionProvider
 *
 * @returns {Object} Collection info
 * @returns {Object} collection - Collection metadata object
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message if any
 * @returns {Function} refresh - Function to refresh collection metadata
 *
 * @example
 * const { collection, loading, error } = useCollectionInfo();
 *
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 *
 */
export var useCollectionInfo = () => {
  var context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollectionInfo must be used within a CollectionProvider');
  }
  return {
    collection: context.collection,
    loading: context.collectionLoading,
    error: context.collectionError,
    refresh: context.refreshCollection
  };
};
export default useCollectionInfo;