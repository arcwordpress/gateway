import { useContext, useMemo, useCallback } from 'react';
import CollectionContext from '../contexts/CollectionContext';

/**
 * Hook to access a single record by ID from CollectionProvider
 *
 * @param {number|string} recordId - ID of the record to access
 * @returns {Object} Single record and operations
 * @returns {Object|null} record - Record object or null if not found
 * @returns {boolean} loading - Loading state from records
 * @returns {string|null} error - Error message if any
 * @returns {Function} update - Update this specific record
 * @returns {Function} remove - Delete this specific record
 * @returns {Function} refresh - Function to refresh all records
 *
 * @example
 * const { record, loading, update, remove } = useRecord(123);
 *
 * if (loading) return <div>Loading...</div>;
 * if (!record) return <div>Record not found</div>;
 *
 * // Update this record
 * await update({ title: 'Updated Title' });
 *
 * // Delete this record
 * await remove();
 */
export const useRecord = (recordId) => {
  const context = useContext(CollectionContext);

  if (!context) {
    throw new Error('useRecord must be used within a CollectionProvider');
  }

  // Get the record from the records array
  const record = useMemo(() => {
    if (!recordId) return null;
    return context.getRecordById(recordId);
  }, [recordId, context.getRecordById]);

  // Wrapper for updating this specific record
  const update = useCallback(
    async (data) => {
      if (!recordId) {
        throw new Error('Record ID is required for update');
      }
      return await context.updateRecord(recordId, data);
    },
    [recordId, context.updateRecord]
  );

  // Wrapper for deleting this specific record
  const remove = useCallback(async () => {
    if (!recordId) {
      throw new Error('Record ID is required for delete');
    }
    return await context.deleteRecord(recordId);
  }, [recordId, context.deleteRecord]);

  return {
    record,
    loading: context.recordsLoading,
    error: context.recordsError,
    update,
    remove,
    refresh: context.refreshRecords,
  };
};

export default useRecord;
