function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCollection, createRecord, getRecord, updateRecord } from "../../services/api";
import { useFieldType } from "../../index";
import { generateZodSchema } from "../../utils/zodSchemaGenerator";
import { createGatewayFormContext } from "../../utils/gatewayFormContext";

// Import the shared context
import { GatewayFormContext, useGatewayForm } from "../../utils/gatewayFormContext";

/**
 * Resolve the base REST endpoint from a collection's routes array.
 * Prefers the 'create' route (same path as 'get_many'), falls back to 'get_many'.
 * Returns null when routes is missing or has no usable entry.
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function resolveBaseEndpoint(routes) {
  var _ref, _routes$find;
  if (!Array.isArray(routes) || routes.length === 0) return null;
  var r = (_ref = (_routes$find = routes.find(r => r.type === 'create')) !== null && _routes$find !== void 0 ? _routes$find : routes.find(r => r.type === 'get_many')) !== null && _ref !== void 0 ? _ref : null;
  return r ? r.route : null;
}

// Memoized field renderer - now uses context instead of props
var FieldRenderer = /*#__PURE__*/React.memo(_ref2 => {
  var fieldConfig = _ref2.fieldConfig;
  // Debug: log the field config before using it
  if (!fieldConfig.type) {
    console.error('[Form] Field config missing type:', fieldConfig);
  } else {
    // Optionally, log all field configs for extra debugging
  }
  var Input;
  try {
    var _useFieldType = useFieldType(fieldConfig);
    Input = _useFieldType.Input;
  } catch (e) {
    console.error('[Form] useFieldType error for field:', fieldConfig, e);
    throw e;
  }
  var _useGatewayForm = useGatewayForm(),
    formState = _useGatewayForm.formState;
  var error = formState.errors[fieldConfig.name];
  return /*#__PURE__*/_jsx(Input, {
    config: fieldConfig,
    error: error
  });
});
var Form = _ref3 => {
  var collectionKey = _ref3.collectionKey,
    recordId = _ref3.recordId,
    apiAuth = _ref3.apiAuth;
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    collection = _useState2[0],
    setCollection = _useState2[1];
  var _useState3 = useState(true),
    _useState4 = _slicedToArray(_useState3, 2),
    loading = _useState4[0],
    setLoading = _useState4[1];
  var _useState5 = useState(false),
    _useState6 = _slicedToArray(_useState5, 2),
    submitting = _useState6[0],
    setSubmitting = _useState6[1];
  var _useState7 = useState(null),
    _useState8 = _slicedToArray(_useState7, 2),
    error = _useState8[0],
    setError = _useState8[1];
  var _useState9 = useState(null),
    _useState0 = _slicedToArray(_useState9, 2),
    success = _useState0[0],
    setSuccess = _useState0[1];
  var _useState1 = useState(false),
    _useState10 = _slicedToArray(_useState1, 2),
    isEditMode = _useState10[0],
    setIsEditMode = _useState10[1];

  // Generate validation schema from collection data
  var validationSchema = useMemo(() => {
    if (!collection) return null;
    return generateZodSchema(collection);
  }, [collection]);
  var methods = useForm({
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
    mode: 'onSubmit'
  });
  var reset = methods.reset;
  useEffect(() => {
    if (collectionKey) {
      loadCollection();
    }
  }, [collectionKey]);
  useEffect(() => {
    if (recordId && collection) {
      loadRecord();
    }
  }, [recordId, collection]);
  var loadCollection = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator(function* () {
      try {
        setLoading(true);
        setError(null);
        var response = yield getCollection(collectionKey, {
          auth: apiAuth
        });
        setCollection(response);
      } catch (err) {
        var _err$response;
        var errorMessage = ((_err$response = err.response) === null || _err$response === void 0 ? void 0 : _err$response.status) === 404 ? "Collection \"".concat(collectionKey, "\" not found") : err.message || 'Failed to load collection';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    });
    return function loadCollection() {
      return _ref4.apply(this, arguments);
    };
  }();
  var loadRecord = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator(function* () {
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

        // Populate form with existing data
        if (response.data) {
          reset(response.data);
          setIsEditMode(true);
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
      return _ref5.apply(this, arguments);
    };
  }();
  var onSubmit = /*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator(function* (data) {
      var endpoint = resolveBaseEndpoint(collection === null || collection === void 0 ? void 0 : collection.routes);
      if (!endpoint) {
        setError('No endpoint available for submission');
        return;
      }
      try {
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        var response;
        if (isEditMode && recordId) {
          response = yield updateRecord(endpoint, recordId, data, {
            auth: apiAuth
          });
          setSuccess('Record updated successfully!');
        } else {
          response = yield createRecord(endpoint, data, {
            auth: apiAuth
          });
          setSuccess('Record created successfully!');
          reset(); // Clear form only on create
        }
      } catch (err) {
        var _err$response3;
        setError(((_err$response3 = err.response) === null || _err$response3 === void 0 || (_err$response3 = _err$response3.data) === null || _err$response3 === void 0 ? void 0 : _err$response3.message) || err.message || 'Failed to save record');
        console.error('Submit error:', err);
      } finally {
        setSubmitting(false);
      }
    });
    return function onSubmit(_x) {
      return _ref6.apply(this, arguments);
    };
  }();

  // Combined context value to provide to children (fields)
  var contextValue = useMemo(() => createGatewayFormContext(methods, collection, recordId, loading, error, {},
  // No fieldErrors for FormBuilder
  {} // No updatingFields for FormBuilder
  ), [methods, collection, recordId, loading, error]);
  if (!collectionKey) {
    return /*#__PURE__*/_jsx("div", {
      className: "gty-form__container",
      children: /*#__PURE__*/_jsx("div", {
        className: "gty-form__alert gty-form__alert--warning",
        children: "No collection key provided. Add data-collection attribute."
      })
    });
  }
  if (loading) {
    return /*#__PURE__*/_jsxs("div", {
      className: "gty-form__container",
      children: ["Loading collection \"", collectionKey, "\"..."]
    });
  }
  if (error) {
    return /*#__PURE__*/_jsx("div", {
      className: "gty-form__container",
      children: /*#__PURE__*/_jsxs("div", {
        className: "gty-form__alert gty-form__alert--error",
        children: [/*#__PURE__*/_jsx("strong", {
          children: "Error:"
        }), " ", error]
      })
    });
  }
  if (!collection || !collection.fields) {
    return /*#__PURE__*/_jsx("div", {
      className: "gty-form__container",
      children: /*#__PURE__*/_jsxs("div", {
        className: "gty-form__alert gty-form__alert--warning",
        children: ["Collection \"", collectionKey, "\" loaded but has no fields."]
      })
    });
  }
  return /*#__PURE__*/_jsx(GatewayFormContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsx("div", {
      className: "gty-form__container",
      children: /*#__PURE__*/_jsxs("div", {
        className: "gty-form",
        children: [error && /*#__PURE__*/_jsx("div", {
          className: "gty-form__alert gty-form__alert--error",
          children: error
        }), success && /*#__PURE__*/_jsx("div", {
          className: "gty-form__alert gty-form__alert--success",
          children: success
        }), /*#__PURE__*/_jsxs("form", {
          onSubmit: methods.handleSubmit(onSubmit),
          className: "gty-form__fields",
          children: [methods.formState.isSubmitted && Object.keys(methods.formState.errors).length > 0 && /*#__PURE__*/_jsxs("div", {
            className: "gty-form__validation-summary",
            children: [/*#__PURE__*/_jsx("p", {
              className: "gty-form__validation-summary-title",
              children: "Please fix the following before continuing:"
            }), /*#__PURE__*/_jsx("ul", {
              className: "gty-form__validation-summary-list",
              children: Object.entries(methods.formState.errors).map(_ref7 => {
                var _collection$fields;
                var _ref8 = _slicedToArray(_ref7, 2),
                  fieldName = _ref8[0],
                  err = _ref8[1];
                var fieldDef = collection === null || collection === void 0 || (_collection$fields = collection.fields) === null || _collection$fields === void 0 ? void 0 : _collection$fields[fieldName];
                var label = (fieldDef === null || fieldDef === void 0 ? void 0 : fieldDef.label) || fieldName;
                return /*#__PURE__*/_jsxs("li", {
                  className: "gty-form__validation-summary-item",
                  children: [/*#__PURE__*/_jsxs("strong", {
                    children: [label, ":"]
                  }), " ", err === null || err === void 0 ? void 0 : err.message]
                }, fieldName);
              })
            })]
          }), Object.entries(collection.fields || {}).map(_ref9 => {
            var _ref0 = _slicedToArray(_ref9, 2),
              fieldName = _ref0[0],
              fieldDef = _ref0[1];
            // When fillable is present, honour it as a filter
            if (collection.fillable && Array.isArray(collection.fillable) && !collection.fillable.includes(fieldName)) {
              return null;
            }
            var fieldConfig = _objectSpread({
              name: fieldName
            }, fieldDef);
            if (fieldConfig.hidden) return null;
            return /*#__PURE__*/_jsx(FieldRenderer, {
              fieldConfig: fieldConfig
            }, fieldName);
          }), /*#__PURE__*/_jsx("button", {
            type: "submit",
            disabled: submitting,
            className: "gty-form__submit",
            children: submitting ? isEditMode ? 'Updating...' : 'Creating...' : isEditMode ? 'Update Record' : 'Create Record'
          })]
        })]
      })
    })
  });
};
export { Form };