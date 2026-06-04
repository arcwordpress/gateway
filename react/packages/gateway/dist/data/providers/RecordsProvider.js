function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import RecordsContext from "../contexts/RecordsContext";
import * as api from "../services/collectionApi";

/**
 * RecordsProvider - Lightweight provider for collection records without metadata
 *
 * Use this for public forms, read-only displays, or when you don't need
 * collection metadata (fields, filters, etc). Skips authentication checks
 * for collection info.
 *
 * @param {Object} props
 * @param {string} props.route - Full route path (e.g., 'gateway/v1/events')
 * @param {Object} props.queryParams - Optional query parameters for fetching records
 * @param {boolean} props.autoLoad - Whether to automatically load records (default: true)
 * @param {React.ReactNode} props.children - Child components
 */
import { jsx as _jsx } from "react/jsx-runtime";
export var RecordsProvider = _ref => {
  var route = _ref.route,
    _ref$queryParams = _ref.queryParams,
    queryParams = _ref$queryParams === void 0 ? {} : _ref$queryParams,
    _ref$autoLoad = _ref.autoLoad,
    autoLoad = _ref$autoLoad === void 0 ? true : _ref$autoLoad,
    children = _ref.children;
  var initialLoadDone = useRef(false);

  // Stabilize queryParams to prevent unnecessary re-renders
  var stableQueryParams = useMemo(() => queryParams, [JSON.stringify(queryParams)]);

  // Parse route into namespace and path
  var routeInfo = useMemo(() => {
    if (!route) return null;

    // Split route like 'gateway/v1/events' into namespace and path
    var parts = route.split('/');
    if (parts.length < 3) {
      console.error('Invalid route format. Expected format: "namespace/version/path" (e.g., "gateway/v1/events")');
      return null;
    }

    // Take first two parts as namespace, rest as route path
    var namespace = "".concat(parts[0], "/").concat(parts[1]);
    var routePath = parts.slice(2).join('/');
    return {
      namespace,
      route: routePath
    };
  }, [route]);

  // Records state
  var _useState = useState([]),
    _useState2 = _slicedToArray(_useState, 2),
    records = _useState2[0],
    setRecords = _useState2[1];
  var _useState3 = useState(true),
    _useState4 = _slicedToArray(_useState3, 2),
    loading = _useState4[0],
    setLoading = _useState4[1];
  var _useState5 = useState(null),
    _useState6 = _slicedToArray(_useState5, 2),
    error = _useState6[0],
    setError = _useState6[1];

  /**
   * Fetch collection records
   */
  var fetchRecords = useCallback(/*#__PURE__*/_asyncToGenerator(function* () {
    if (!(routeInfo !== null && routeInfo !== void 0 && routeInfo.namespace) || !(routeInfo !== null && routeInfo !== void 0 && routeInfo.route)) {
      setError('Invalid route format');
      setLoading(false);
      return;
    }
    try {
      var _data$data;
      setLoading(true);
      setError(null);
      var data = yield api.fetchRecords(routeInfo.namespace, routeInfo.route, stableQueryParams);
      // Extract items array from response: {data: {items: []}}
      var items = (data === null || data === void 0 || (_data$data = data.data) === null || _data$data === void 0 ? void 0 : _data$data.items) || (data === null || data === void 0 ? void 0 : data.items) || data || [];
      setRecords(items);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError(err.message || 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  }), [routeInfo === null || routeInfo === void 0 ? void 0 : routeInfo.namespace, routeInfo === null || routeInfo === void 0 ? void 0 : routeInfo.route, stableQueryParams]);

  /**
   * Create a new record
   */
  var createRecord = useCallback(/*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator(function* (data) {
      if (!(routeInfo !== null && routeInfo !== void 0 && routeInfo.namespace) || !(routeInfo !== null && routeInfo !== void 0 && routeInfo.route)) {
        throw new Error('Route info not available');
      }
      try {
        var newRecord = yield api.createRecord(routeInfo.namespace, routeInfo.route, data);

        // Optimistically add to records
        setRecords(prev => [...prev, newRecord]);

        // Refresh to ensure consistency
        yield fetchRecords();
        return newRecord;
      } catch (err) {
        console.error('Error creating record:', err);
        throw err;
      }
    });
    return function (_x) {
      return _ref3.apply(this, arguments);
    };
  }(), [routeInfo, fetchRecords]);

  /**
   * Get a record by ID from the current records
   */
  var getRecordById = useCallback(id => {
    // Ensure records is an array
    var recordsArray = Array.isArray(records) ? records : [];
    return recordsArray.find(record => record.id === id) || null;
  }, [records]);

  /**
   * Refresh records manually
   */
  var refresh = useCallback(/*#__PURE__*/_asyncToGenerator(function* () {
    yield fetchRecords();
  }), [fetchRecords]);

  // Auto-load records when route is available
  useEffect(() => {
    if (autoLoad && routeInfo && !initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchRecords();
    }
  }, [autoLoad, routeInfo, fetchRecords]);

  // Reset initial load flag when route changes
  useEffect(() => {
    initialLoadDone.current = false;
  }, [route]);

  // Memoize context value to prevent unnecessary re-renders
  var value = useMemo(() => ({
    records,
    loading,
    error,
    refresh,
    createRecord,
    getRecordById
  }), [records, loading, error, refresh, createRecord, getRecordById]);
  return /*#__PURE__*/_jsx(RecordsContext.Provider, {
    value: value,
    children: children
  });
};
export default RecordsProvider;