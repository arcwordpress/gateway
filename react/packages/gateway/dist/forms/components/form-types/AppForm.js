function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/**
 * AppForm - Form state manager with auto-save functionality
 *
 * Notes:
 * - The `collection` prop accepts either a string collection key (which triggers a network fetch)
 *   or a collection JSON object (which is used immediately without fetching).
 * - `collectionKey` prop is deprecated but still supported for backward compatibility.
 * - If neither `collection` (object) nor a collection key is provided, the component renders silently in demo/offline mode
 *   (no validation or auto-save).
 * - Auto-save runs only when both `recordId` and a valid collection endpoint are available.
 * - Runtime safety: component is silent by default (no console output or UI banners) when `collection` or `recordId` are missing;
 *   it guards against missing data and should not throw uncaught errors. Consuming code (children) should be prepared to receive
 *   `null` or incomplete `collection` values from context until load succeeds.
 *
 * Recommended usage:
 * - Prefer passing `collection` (object) or a collection key string; pass `recordId` for auto-save.
 * - Use `onLoad`, `onFieldUpdate`, and `onFieldError` as needed.
 *
 * @param {string|object} props.collection - Collection key (string) or collection JSON (object)
 * @param {string} [props.collectionKey] - Deprecated: collection key to load (use `collection` instead)
 * @param {number} props.recordId - Record ID to edit (required for auto-save)
 * @param {object} [props.apiAuth] - Optional auth object passed to API helpers
 * @param {function} [props.onFieldUpdate] - Callback invoked after a successful field update
 * @param {function} [props.onFieldError] - Callback invoked when field update fails
 * @param {function} [props.onLoad] - Callback invoked after collection and record are successfully loaded
 * @param {function} [props.onSave] - Optional callback invoked before autosave; receives the full form values object
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCollection, getRecord, updateRecord } from "../../services/api";
import { generateZodSchema } from "../../utils/zodSchemaGenerator";
import { createGatewayFormContext, GatewayFormContext } from "../../utils/gatewayFormContext";

// Helper: determine whether a prop is a collection key (string) or an actual collection object
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
function resolveBaseEndpoint(routes) {
  var _ref, _routes$find;
  if (!Array.isArray(routes) || routes.length === 0) return null;
  var r = (_ref = (_routes$find = routes.find(r => r.type === 'create')) !== null && _routes$find !== void 0 ? _routes$find : routes.find(r => r.type === 'get_many')) !== null && _ref !== void 0 ? _ref : null;
  return r ? r.route : null;
}
var isCollectionKey = value => typeof value === 'string' && value.trim().length > 0;
var isCollectionObject = value => {
  return value && typeof value === 'object' && (Array.isArray(value.fields) ||
  // typical collection shape
  typeof value.routes === 'object' || typeof value.key === 'string');
};
var AppForm = _ref2 => {
  var collectionKey = _ref2.collectionKey,
    collectionProp = _ref2.collection,
    recordId = _ref2.recordId,
    apiAuth = _ref2.apiAuth,
    onFieldUpdate = _ref2.onFieldUpdate,
    onFieldError = _ref2.onFieldError,
    onLoad = _ref2.onLoad,
    onSave = _ref2.onSave,
    children = _ref2.children;
  // Derive whether we were given a key or an object via the `collection` prop
  var providedCollectionKey = isCollectionKey(collectionProp) ? collectionProp : collectionKey;
  var immediateCollection = isCollectionObject(collectionProp) ? collectionProp : null;
  var _useState = useState(immediateCollection || null),
    _useState2 = _slicedToArray(_useState, 2),
    collection = _useState2[0],
    setCollection = _useState2[1];
  // Only set loading when we expect to fetch a remote collection
  var _useState3 = useState(Boolean(providedCollectionKey && !immediateCollection)),
    _useState4 = _slicedToArray(_useState3, 2),
    loading = _useState4[0],
    setLoading = _useState4[1];
  var _useState5 = useState(null),
    _useState6 = _slicedToArray(_useState5, 2),
    error = _useState6[0],
    setError = _useState6[1];
  var _useState7 = useState({}),
    _useState8 = _slicedToArray(_useState7, 2),
    fieldErrors = _useState8[0],
    setFieldErrors = _useState8[1];
  var _useState9 = useState({}),
    _useState0 = _slicedToArray(_useState9, 2),
    updatingFields = _useState0[0],
    setUpdatingFields = _useState0[1];
  var updateTimeoutRef = useRef({});
  var previousValuesRef = useRef({});

  // Generate validation schema from collection data
  var validationSchema = useMemo(() => {
    if (!collection) return null;
    return generateZodSchema(collection);
  }, [collection]);
  var methods = useForm({
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
    mode: 'onChange'
  });
  var reset = methods.reset,
    watch = methods.watch;
  var formValues = watch();
  useEffect(() => {
    if (providedCollectionKey && !immediateCollection) {
      loadCollection();
    } else if (!providedCollectionKey && !immediateCollection) {
      setLoading(false);
    }
  }, [providedCollectionKey, immediateCollection]);
  useEffect(() => {
    if (recordId && collection) {
      loadRecord();
    }
  }, [recordId, collection]);

  // Watch for field changes and trigger auto-save.
  // Call `onSave` once per DOM update (safely) and only schedule autosave timers when enabled.
  useEffect(() => {
    // Call onSave synchronously per update (snapshot of full form values). Swallow errors from user code.
    if (typeof onSave === 'function') {
      try {
        onSave(_objectSpread({}, formValues));
      } catch (err) {
        // swallow user errors to avoid breaking autosave
      }
    }

    // If autosave not enabled, update previousValuesRef to avoid treating initial values as changes
    if (!collection || !recordId || loading) {
      Object.keys(formValues).forEach(fieldName => {
        previousValuesRef.current[fieldName] = formValues[fieldName];
      });
      return;
    }
    Object.keys(formValues).forEach(fieldName => {
      var currentValue = formValues[fieldName];
      var previousValue = previousValuesRef.current[fieldName];
      if (currentValue === previousValue || updatingFields[fieldName]) {
        return;
      }

      // Save current value as previous immediately to avoid duplicate scheduling
      previousValuesRef.current[fieldName] = currentValue;
      if (previousValue === undefined) {
        return;
      }
      if (updateTimeoutRef.current[fieldName]) {
        clearTimeout(updateTimeoutRef.current[fieldName]);
      }
      updateTimeoutRef.current[fieldName] = setTimeout(() => {
        updateField(fieldName, currentValue);
      }, 300);
    });
  }, [formValues, collection, recordId, loading, updatingFields, onSave]);
  useEffect(() => {
    return () => {
      Object.values(updateTimeoutRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);
  var loadCollection = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator(function* () {
      try {
        setLoading(true);
        setError(null);
        var response = yield getCollection(providedCollectionKey, {
          auth: apiAuth
        });
        setCollection(response);
      } catch (err) {
        var _err$response;
        var errorMessage = ((_err$response = err.response) === null || _err$response === void 0 ? void 0 : _err$response.status) === 404 ? "Collection \"".concat(providedCollectionKey, "\" not found") : err.message || 'Failed to load collection';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    });
    return function loadCollection() {
      return _ref3.apply(this, arguments);
    };
  }();
  var loadRecord = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator(function* () {
      try {
        setLoading(true);
        setError(null);
        var endpoint = resolveBaseEndpoint(collection.routes);
        if (!endpoint) {
          throw new Error('No endpoint available for this collection');
        }
        var response = yield getRecord(endpoint, recordId, {
          auth: apiAuth
        });
        if (response.data) {
          reset(response.data);
          previousValuesRef.current = _objectSpread({}, response.data);
        }

        // Call onLoad callback if provided
        if (onLoad) {
          onLoad(collection, response.data);
        }
      } catch (err) {
        var _err$response2;
        var errorMessage = ((_err$response2 = err.response) === null || _err$response2 === void 0 ? void 0 : _err$response2.status) === 404 ? "Record #".concat(recordId, " not found") : err.message || 'Failed to load record';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    });
    return function loadRecord() {
      return _ref4.apply(this, arguments);
    };
  }();
  var updateField = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator(function* (fieldName, value) {
      var endpoint = resolveBaseEndpoint(collection === null || collection === void 0 ? void 0 : collection.routes);
      if (!endpoint) {
        console.error('No endpoint available for update');
        return;
      }
      try {
        setUpdatingFields(prev => _objectSpread(_objectSpread({}, prev), {}, {
          [fieldName]: true
        }));
        setFieldErrors(prev => {
          var newErrors = _objectSpread({}, prev);
          delete newErrors[fieldName];
          return newErrors;
        });
        var updateData = {
          [fieldName]: value
        };
        var response = yield updateRecord(endpoint, recordId, updateData, {
          auth: apiAuth
        });
        if (onFieldUpdate) {
          onFieldUpdate(fieldName, value, response);
        }
      } catch (err) {
        var _err$response3;
        var errorMessage = ((_err$response3 = err.response) === null || _err$response3 === void 0 || (_err$response3 = _err$response3.data) === null || _err$response3 === void 0 ? void 0 : _err$response3.message) || err.message || 'Failed to update field';
        console.error("[AppForm] Error updating field \"".concat(fieldName, "\":"), err);
        setFieldErrors(prev => _objectSpread(_objectSpread({}, prev), {}, {
          [fieldName]: errorMessage
        }));
        if (onFieldError) {
          onFieldError(fieldName, value, errorMessage);
        }
      } finally {
        setUpdatingFields(prev => {
          var newState = _objectSpread({}, prev);
          delete newState[fieldName];
          return newState;
        });
      }
    });
    return function updateField(_x, _x2) {
      return _ref5.apply(this, arguments);
    };
  }();
  var contextValue = useMemo(() => createGatewayFormContext(methods, collection, recordId, loading, error, fieldErrors, updatingFields), [methods, collection, recordId, loading, error, fieldErrors, updatingFields]);
  if (loading) {
    var displayKey = providedCollectionKey || (collection === null || collection === void 0 ? void 0 : collection.key) || '';
    return /*#__PURE__*/_jsxs("div", {
      className: "gty-appform__container",
      children: ["Loading collection \"", displayKey, "\"..."]
    });
  }
  if (error) {
    return /*#__PURE__*/_jsx("div", {
      className: "gty-appform__container",
      children: /*#__PURE__*/_jsxs("div", {
        className: "gty-appform__alert gty-appform__alert--error",
        children: [/*#__PURE__*/_jsx("strong", {
          children: "Error:"
        }), " ", error]
      })
    });
  }
  return /*#__PURE__*/_jsx(GatewayFormContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsx("div", {
      className: "gty-appform",
      children: children
    })
  });
};
export { AppForm };