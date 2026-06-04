import { useContext } from 'react';
import RecordsContext from "../contexts/RecordsContext";

/**
 * Hook to access collection records from RecordsProvider
 *
 * @returns {Object} Records and operations
 * @returns {Array} records - Array of records
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message if any
 * @returns {Function} refresh - Function to refresh records
 * @returns {Function} createRecord - Create a new record
 * @returns {Function} getRecordById - Get a record by ID from current records
 *
 * @example
 * const { records, loading, createRecord } = useRecords();
 *
 * // Display records
 * if (loading) return <div>Loading...</div>;
 * records.map(record => <div key={record.id}>{record.title}</div>);
 *
 * // Create a new record
 * await createRecord({ title: 'New Event', date: '2024-01-01' });
 */
export var useRecords = () => {
  var context = useContext(RecordsContext);
  if (!context) {
    throw new Error('useRecords must be used within a RecordsProvider');
  }
  return context;
};
export default useRecords;