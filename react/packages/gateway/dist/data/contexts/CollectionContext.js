function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
import { createContext } from 'react';

/**
 * Context for a specific collection's data and metadata
 * Provides both collection info and records with CRUD operations
 */
export var CollectionContext = /*#__PURE__*/createContext({
  // Collection metadata
  collection: null,
  collectionLoading: false,
  collectionError: null,
  // Collection records
  records: [],
  recordsLoading: false,
  recordsError: null,
  // CRUD operations
  createRecord: function () {
    var _createRecord = _asyncToGenerator(function* () {});
    function createRecord() {
      return _createRecord.apply(this, arguments);
    }
    return createRecord;
  }(),
  updateRecord: function () {
    var _updateRecord = _asyncToGenerator(function* () {});
    function updateRecord() {
      return _updateRecord.apply(this, arguments);
    }
    return updateRecord;
  }(),
  deleteRecord: function () {
    var _deleteRecord = _asyncToGenerator(function* () {});
    function deleteRecord() {
      return _deleteRecord.apply(this, arguments);
    }
    return deleteRecord;
  }(),
  refreshRecords: function () {
    var _refreshRecords = _asyncToGenerator(function* () {});
    function refreshRecords() {
      return _refreshRecords.apply(this, arguments);
    }
    return refreshRecords;
  }(),
  refreshCollection: function () {
    var _refreshCollection = _asyncToGenerator(function* () {});
    function refreshCollection() {
      return _refreshCollection.apply(this, arguments);
    }
    return refreshCollection;
  }(),
  // Utility
  getRecordById: () => null
});
export default CollectionContext;