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
import { useState, useEffect, useMemo } from 'react';
import { useGatewayForm } from "../../..";
import Field from "../../field";
import { getApiClient } from "../../../../data";
import "./relationship-style.css";

/**
 * Resolve the target collection key for a given relationship name by scanning
 * the current collection's relationships array (provided via collection info).
 *
 * Returns null when the relationship or its target cannot be resolved.
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function resolveTargetKey(collection, relationshipName) {
  var _rel$target_key;
  if (!collection || !relationshipName) return null;
  var rel = (collection.relationships || []).find(r => r.name === relationshipName);
  return (_rel$target_key = rel === null || rel === void 0 ? void 0 : rel.target_key) !== null && _rel$target_key !== void 0 ? _rel$target_key : null;
}
var RelationshipControl = _ref => {
  var _config$relationship, _config$displayField, _config$valueField, _config$placeholder;
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    formState = _useGatewayForm.formState,
    collection = _useGatewayForm.collection;
  var name = config.name;
  if (!name) {
    console.warn('RelationshipField: No "name" provided in config');
    return null;
  }
  var fieldError = formState.errors[name];

  // Config keys are flat (no dot-notation) — set when saved via the Raptor
  // field editor or when defined directly in a PHP collection class.
  var relationshipName = (_config$relationship = config.relationship) !== null && _config$relationship !== void 0 ? _config$relationship : '';
  var displayField = (_config$displayField = config.displayField) !== null && _config$displayField !== void 0 ? _config$displayField : 'title';
  var valueField = (_config$valueField = config.valueField) !== null && _config$valueField !== void 0 ? _config$valueField : 'id';
  var placeholder = (_config$placeholder = config.placeholder) !== null && _config$placeholder !== void 0 ? _config$placeholder : 'Select an option...';
  var _useState = useState([]),
    _useState2 = _slicedToArray(_useState, 2),
    options = _useState2[0],
    setOptions = _useState2[1];
  var _useState3 = useState(true),
    _useState4 = _slicedToArray(_useState3, 2),
    loading = _useState4[0],
    setLoading = _useState4[1];
  var _useState5 = useState(null),
    _useState6 = _slicedToArray(_useState5, 2),
    fetchError = _useState6[0],
    setFetchError = _useState6[1];
  useEffect(() => {
    if (!relationshipName) {
      setFetchError('No relationship name configured');
      setLoading(false);
      return;
    }
    var targetKey = resolveTargetKey(collection, relationshipName);
    if (!targetKey) {
      setFetchError("Relationship \"".concat(relationshipName, "\" not found in collection info"));
      setLoading(false);
      return;
    }
    var fetchOptions = /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* () {
        try {
          var _ref3, _routesArr$find, _recordsRes$data$data, _recordsRes$data;
          setLoading(true);
          setFetchError(null);
          var client = getApiClient();

          // Fetch the target collection info to discover its route
          var infoRes = yield client.get("gateway/v1/collections/".concat(targetKey));
          var targetColl = infoRes.data;
          var routesArr = Array.isArray(targetColl === null || targetColl === void 0 ? void 0 : targetColl.routes) ? targetColl.routes : [];
          var getManyRoute = (_ref3 = (_routesArr$find = routesArr.find(r => r.type === 'get_many')) !== null && _routesArr$find !== void 0 ? _routesArr$find : routesArr[0]) !== null && _ref3 !== void 0 ? _ref3 : null;
          if (!getManyRoute) {
            throw new Error("No route found for target collection \"".concat(targetKey, "\""));
          }
          var endpoint = "".concat(getManyRoute.namespace, "/").concat(getManyRoute.path);
          var recordsRes = yield client.get(endpoint);
          var items = (_recordsRes$data$data = (_recordsRes$data = recordsRes.data) === null || _recordsRes$data === void 0 || (_recordsRes$data = _recordsRes$data.data) === null || _recordsRes$data === void 0 ? void 0 : _recordsRes$data.items) !== null && _recordsRes$data$data !== void 0 ? _recordsRes$data$data : recordsRes.data;
          if (!Array.isArray(items)) {
            throw new Error('Unexpected response shape from target collection');
          }
          setOptions(items);
        } catch (err) {
          console.error('RelationshipField: failed to fetch options', err);
          setFetchError(err.message || 'Failed to load options');
        } finally {
          setLoading(false);
        }
      });
      return function fetchOptions() {
        return _ref2.apply(this, arguments);
      };
    }();
    fetchOptions();
  }, [relationshipName, collection]);
  return /*#__PURE__*/_jsx("div", {
    className: "relationship-field",
    children: loading ? /*#__PURE__*/_jsx("div", {
      className: "relationship-field__loading",
      children: "Loading options..."
    }) : fetchError ? /*#__PURE__*/_jsxs("div", {
      className: "relationship-field__error-fetch",
      children: ["Error: ", fetchError]
    }) : /*#__PURE__*/_jsxs("select", _objectSpread(_objectSpread({
      id: name
    }, register(name)), {}, {
      className: "relationship-field__select ".concat(fieldError ? 'relationship-field__select--error' : ''),
      children: [/*#__PURE__*/_jsx("option", {
        value: "",
        children: placeholder
      }), options.map(option => {
        var _ref4, _ref5, _option$displayField;
        return /*#__PURE__*/_jsx("option", {
          value: option[valueField],
          children: (_ref4 = (_ref5 = (_option$displayField = option[displayField]) !== null && _option$displayField !== void 0 ? _option$displayField : option.title) !== null && _ref5 !== void 0 ? _ref5 : option.name) !== null && _ref4 !== void 0 ? _ref4 : option[valueField]
        }, option[valueField]);
      })]
    }))
  });
};
var RelationshipFieldTypeInput = _ref6 => {
  var _ref6$config = _ref6.config,
    config = _ref6$config === void 0 ? {} : _ref6$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(RelationshipControl, {
      config: config
    })
  });
};

/**
 * Display a relationship value.
 *
 * When records are fetched with relations=true, the related object is embedded
 * in the record (e.g. record.docSet = { id: 2, title: "My Doc Set" }).
 * In that case `value` will be that object and we render the display field.
 * When relations are not loaded `value` is the raw FK — shown as-is.
 */
var RelationshipFieldTypeDisplay = _ref7 => {
  var _config$displayField2;
  var value = _ref7.value,
    config = _ref7.config;
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "relationship-field__display relationship-field__display--empty",
      children: "-"
    });
  }
  var displayField = (_config$displayField2 = config === null || config === void 0 ? void 0 : config.displayField) !== null && _config$displayField2 !== void 0 ? _config$displayField2 : 'title';
  if (typeof value === 'object' && value !== null) {
    var _ref8, _ref9, _value$displayField;
    var label = (_ref8 = (_ref9 = (_value$displayField = value[displayField]) !== null && _value$displayField !== void 0 ? _value$displayField : value.title) !== null && _ref9 !== void 0 ? _ref9 : value.name) !== null && _ref8 !== void 0 ? _ref8 : value.label;
    return /*#__PURE__*/_jsx("span", {
      className: "relationship-field__display",
      children: label !== null && label !== void 0 ? label : '-'
    });
  }
  return /*#__PURE__*/_jsx("span", {
    className: "relationship-field__display",
    children: String(value)
  });
};
export var relationshipFieldType = {
  type: 'relationship',
  Input: RelationshipFieldTypeInput,
  Display: RelationshipFieldTypeDisplay,
  defaultConfig: {
    displayField: 'title',
    valueField: 'id',
    placeholder: 'Select an option...'
  }
};
export var useRelationshipField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(RelationshipFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(RelationshipFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};