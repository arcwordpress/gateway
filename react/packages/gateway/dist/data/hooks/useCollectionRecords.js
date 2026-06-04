import { useContext } from 'react';
import CollectionContext from "../contexts/CollectionContext";

/**
 * Hook to access collection records and CRUD operations from CollectionProvider
 *
 * @returns {Object} Collection records and operations
 * @returns {Array} records - Array of records
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message if any
 * @returns {Function} createRecord - Create a new record
 * @returns {Function} updateRecord - Update an existing record
 * @returns {Function} deleteRecord - Delete a record
 * @returns {Function} refresh - Function to refresh records
 * @returns {Function} getRecordById - Get a record by ID from current records
 *
 * @example
 * const {
 *   records,
 *   loading,
 *   createRecord,
 *   updateRecord,
 *   deleteRecord
 * } = useCollectionRecords();
 *
 * // Create a new record
 * await createRecord({ title: 'New Event', date: '2024-01-01' });
 *
 * // Update a record
 * await updateRecord(123, { title: 'Updated Event' });
 *
 * // Delete a record
 * await deleteRecord(123);
 */
export var useCollectionRecords = () => {
  var context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollectionRecords must be used within a CollectionProvider');
  }
  return {
    records: context.records,
    loading: context.recordsLoading,
    error: context.recordsError,
    createRecord: context.createRecord,
    updateRecord: context.updateRecord,
    deleteRecord: context.deleteRecord,
    refresh: context.refreshRecords,
    getRecordById: context.getRecordById
  };
};
export default useCollectionRecords;