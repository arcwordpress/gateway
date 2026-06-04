function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
import { useContext, useMemo, useCallback } from 'react';
import CollectionContext from "../contexts/CollectionContext";

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
export var useRecord = recordId => {
  var context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useRecord must be used within a CollectionProvider');
  }

  // Get the record from the records array
  var record = useMemo(() => {
    if (!recordId) return null;
    return context.getRecordById(recordId);
  }, [recordId, context.getRecordById]);

  // Wrapper for updating this specific record
  var update = useCallback(/*#__PURE__*/function () {
    var _ref = _asyncToGenerator(function* (data) {
      if (!recordId) {
        throw new Error('Record ID is required for update');
      }
      return yield context.updateRecord(recordId, data);
    });
    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }(), [recordId, context.updateRecord]);

  // Wrapper for deleting this specific record
  var remove = useCallback(/*#__PURE__*/_asyncToGenerator(function* () {
    if (!recordId) {
      throw new Error('Record ID is required for delete');
    }
    return yield context.deleteRecord(recordId);
  }), [recordId, context.deleteRecord]);
  return {
    record,
    loading: context.recordsLoading,
    error: context.recordsError,
    update,
    remove,
    refresh: context.refreshRecords
  };
};
export default useRecord;