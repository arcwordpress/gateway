function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import CollectionContext from "../contexts/CollectionContext";
import * as api from "../services/collectionApi";

/**
 * CollectionProvider - Main provider for a specific collection
 *
 * Manages both collection metadata and records in a unified state.
 * Provides CRUD operations that automatically refresh the records state.
 *
 * @param {Object} props
 * @param {string} props.collectionKey - Collection key (e.g., 'events')
 * @param {Object} props.directAccess - Optional direct route info to skip metadata fetch: { namespace, route }
 * @param {boolean} props.skipMetadata - Skip fetching collection metadata (default: false)
 * @param {Object} props.queryParams - Optional query parameters for fetching records
 * @param {boolean} props.autoLoad - Whether to automatically load records (default: true)
 * @param {React.ReactNode} props.children - Child components
 */
import { jsx as _jsx } from "react/jsx-runtime";
export var CollectionProvider = _ref => {
  var collectionKey = _ref.collectionKey,
    directAccess = _ref.directAccess,
    _ref$skipMetadata = _ref.skipMetadata,
    skipMetadata = _ref$skipMetadata === void 0 ? false : _ref$skipMetadata,
    _ref$queryParams = _ref.queryParams,
    queryParams = _ref$queryParams === void 0 ? {} : _ref$queryParams,
    _ref$autoLoad = _ref.autoLoad,
    autoLoad = _ref$autoLoad === void 0 ? true : _ref$autoLoad,
    children = _ref.children;
  // Use ref to track if initial load has occurred
  var initialLoadDone = useRef(false);

  // Collection metadata state — declared before routeInfo so the useMemo
  // dependency array sees the current value, not the hoisted undefined.
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    collection = _useState2[0],
    setCollection = _useState2[1];
  var _useState3 = useState(true),
    _useState4 = _slicedToArray(_useState3, 2),
    collectionLoading = _useState4[0],
    setCollectionLoading = _useState4[1];
  var _useState5 = useState(null),
    _useState6 = _slicedToArray(_useState5, 2),
    collectionError = _useState6[0],
    setCollectionError = _useState6[1];

  // Stabilize queryParams to prevent unnecessary re-renders
  var stableQueryParams = useMemo(() => queryParams, [JSON.stringify(queryParams)]);

  // Determine route info from either directAccess or collection metadata
  var routeInfo = useMemo(() => {
    var _collection$routes;
    if (directAccess !== null && directAccess !== void 0 && directAccess.namespace && directAccess !== null && directAccess !== void 0 && directAccess.route) {
      return {
        namespace: directAccess.namespace,
        route: directAccess.route
      };
    }
    var getManyRoute = collection === null || collection === void 0 || (_collection$routes = collection.routes) === null || _collection$routes === void 0 ? void 0 : _collection$routes.find(r => r.type === 'get_many');
    if (getManyRoute) {
      return {
        namespace: getManyRoute.namespace,
        route: getManyRoute.path
      };
    }
    return null;
  }, [directAccess, collection === null || collection === void 0 ? void 0 : collection.routes]);

  // Collection records state
  var _useState7 = useState([]),
    _useState8 = _slicedToArray(_useState7, 2),
    records = _useState8[0],
    setRecords = _useState8[1];
  var _useState9 = useState(true),
    _useState0 = _slicedToArray(_useState9, 2),
    recordsLoading = _useState0[0],
    setRecordsLoading = _useState0[1];
  var _useState1 = useState(null),
    _useState10 = _slicedToArray(_useState1, 2),
    recordsError = _useState10[0],
    setRecordsError = _useState10[1];

  /**
   * Fetch collection metadata
   */
  var fetchCollectionInfo = useCallback(/*#__PURE__*/_asyncToGenerator(function* () {
    if (!collectionKey) {
      setCollectionError('Collection key is required');
      setCollectionLoading(false);
      return;
    }
    try {
      setCollectionLoading(true);
      setCollectionError(null);
      var data = yield api.fetchCollection(collectionKey);
      setCollection(data);
    } catch (error) {
      console.error('Error fetching collection:', error);
      setCollectionError(error.message || 'Failed to fetch collection');
    } finally {
      setCollectionLoading(false);
    }
  }), [collectionKey]);

  /**
   * Fetch collection records
   */
  var fetchCollectionRecords = useCallback(/*#__PURE__*/_asyncToGenerator(function* () {
    if (!(routeInfo !== null && routeInfo !== void 0 && routeInfo.namespace) || !(routeInfo !== null && routeInfo !== void 0 && routeInfo.route)) {
      // Don't fetch records until we have route info (from metadata or directAccess)
      return;
    }
    try {
      var _ref4, _ref5, _data$data$items, _data$data;
      setRecordsLoading(true);
      setRecordsError(null);
      var data = yield api.fetchRecords(routeInfo.namespace, routeInfo.route, stableQueryParams);
      var items = (_ref4 = (_ref5 = (_data$data$items = data === null || data === void 0 || (_data$data = data.data) === null || _data$data === void 0 ? void 0 : _data$data.items) !== null && _data$data$items !== void 0 ? _data$data$items : data === null || data === void 0 ? void 0 : data.items) !== null && _ref5 !== void 0 ? _ref5 : data) !== null && _ref4 !== void 0 ? _ref4 : [];
      setRecords(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Error fetching records:', error);
      setRecordsError(error.message || 'Failed to fetch records');
    } finally {
      setRecordsLoading(false);
    }
  }), [routeInfo === null || routeInfo === void 0 ? void 0 : routeInfo.namespace, routeInfo === null || routeInfo === void 0 ? void 0 : routeInfo.route, stableQueryParams]);

  /**
   * Create a new record
   */
  var createRecord = useCallback(/*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator(function* (data) {
      if (!(routeInfo !== null && routeInfo !== void 0 && routeInfo.namespace) || !(routeInfo !== null && routeInfo !== void 0 && routeInfo.route)) {
        throw new Error('Collection route info not available');
      }
      try {
        var newRecord = yield api.createRecord(routeInfo.namespace, routeInfo.route, data);

        // Optimistically add to records
        setRecords(prev => [...prev, newRecord]);

        // Optionally refresh to ensure consistency
        yield fetchCollectionRecords();
        return newRecord;
      } catch (error) {
        console.error('Error creating record:', error);
        throw error;
      }
    });
    return function (_x) {
      return _ref6.apply(this, arguments);
    };
  }(), [routeInfo, fetchCollectionRecords]);

  /**
   * Update an existing record
   */
  var updateRecord = useCallback(/*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator(function* (id, data) {
      if (!(routeInfo !== null && routeInfo !== void 0 && routeInfo.namespace) || !(routeInfo !== null && routeInfo !== void 0 && routeInfo.route)) {
        throw new Error('Collection route info not available');
      }
      try {
        var updatedRecord = yield api.updateRecord(routeInfo.namespace, routeInfo.route, id, data);

        // Optimistically update in records
        setRecords(prev => prev.map(record => record.id === id ? updatedRecord : record));

        // Optionally refresh to ensure consistency
        yield fetchCollectionRecords();
        return updatedRecord;
      } catch (error) {
        console.error('Error updating record:', error);
        // Rollback on error by refreshing
        yield fetchCollectionRecords();
        throw error;
      }
    });
    return function (_x2, _x3) {
      return _ref7.apply(this, arguments);
    };
  }(), [routeInfo, fetchCollectionRecords]);

  /**
   * Delete a record
   */
  var deleteRecord = useCallback(/*#__PURE__*/function () {
    var _ref8 = _asyncToGenerator(function* (id) {
      if (!(routeInfo !== null && routeInfo !== void 0 && routeInfo.namespace) || !(routeInfo !== null && routeInfo !== void 0 && routeInfo.route)) {
        throw new Error('Collection route info not available');
      }
      try {
        yield api.deleteRecord(routeInfo.namespace, routeInfo.route, id);

        // Optimistically remove from records
        setRecords(prev => prev.filter(record => record.id !== id));

        // Optionally refresh to ensure consistency
        yield fetchCollectionRecords();
      } catch (error) {
        console.error('Error deleting record:', error);
        // Rollback on error by refreshing
        yield fetchCollectionRecords();
        throw error;
      }
    });
    return function (_x4) {
      return _ref8.apply(this, arguments);
    };
  }(), [routeInfo, fetchCollectionRecords]);

  /**
   * Get a record by ID from the current records
   */
  var getRecordById = useCallback(id => {
    return records.find(record => record.id === id) || null;
  }, [records]);

  /**
   * Refresh records manually
   */
  var refreshRecords = useCallback(/*#__PURE__*/_asyncToGenerator(function* () {
    yield fetchCollectionRecords();
  }), [fetchCollectionRecords]);

  /**
   * Refresh collection metadata manually
   */
  var refreshCollection = useCallback(/*#__PURE__*/_asyncToGenerator(function* () {
    yield fetchCollectionInfo();
  }), [fetchCollectionInfo]);

  // Initial load - fetch collection metadata (unless skipped)
  useEffect(() => {
    if (!skipMetadata) {
      fetchCollectionInfo();
    } else {
      // If skipping metadata, mark as not loading
      setCollectionLoading(false);
    }
  }, [skipMetadata, fetchCollectionInfo]);

  // Auto-load records when route info is available
  useEffect(() => {
    if (autoLoad && routeInfo && !collectionLoading && !initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchCollectionRecords();
    }
  }, [autoLoad, routeInfo, collectionLoading, fetchCollectionRecords]);

  // Reset initial load flag when collectionKey changes
  useEffect(() => {
    initialLoadDone.current = false;
  }, [collectionKey]);

  // Memoize context value to prevent unnecessary re-renders
  var value = useMemo(() => ({
    // Collection metadata
    collection,
    collectionLoading,
    collectionError,
    // Collection records
    records,
    recordsLoading,
    recordsError,
    // CRUD operations
    createRecord,
    updateRecord,
    deleteRecord,
    refreshRecords,
    refreshCollection,
    // Utility
    getRecordById
  }), [collection, collectionLoading, collectionError, records, recordsLoading, recordsError, createRecord, updateRecord, deleteRecord, refreshRecords, refreshCollection, getRecordById]);
  return /*#__PURE__*/_jsx(CollectionContext.Provider, {
    value: value,
    children: children
  });
};
export default CollectionProvider;