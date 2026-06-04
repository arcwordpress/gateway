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
import "./relation-style.css";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var RelationControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('RelationFieldTypeInput: No "name" provided in config');
    return null;
  }
  var fieldError = formState.errors[name];
  var label = config.label,
    _config$required = config.required,
    required = _config$required === void 0 ? false : _config$required,
    _config$help = config.help,
    help = _config$help === void 0 ? '' : _config$help,
    _config$relation = config.relation,
    relationConfig = _config$relation === void 0 ? {} : _config$relation;
  var endpoint = relationConfig.endpoint,
    _relationConfig$label = relationConfig.labelField,
    labelField = _relationConfig$label === void 0 ? 'title' : _relationConfig$label,
    _relationConfig$value = relationConfig.valueField,
    valueField = _relationConfig$value === void 0 ? 'id' : _relationConfig$value,
    _relationConfig$place = relationConfig.placeholder,
    placeholder = _relationConfig$place === void 0 ? 'Select an option...' : _relationConfig$place;
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
    if (!endpoint) {
      setFetchError('No endpoint configured for relation field');
      setLoading(false);
      return;
    }
    var fetchOptions = /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* () {
        try {
          setLoading(true);
          setFetchError(null);
          var client = getApiClient();
          var response = yield client.get(endpoint);
          var data = response.data.data.items;
          if (!Array.isArray(data)) {
            throw new Error('API response items is not an array');
          }
          setOptions(data);
        } catch (err) {
          console.error('Failed to fetch relation options:', err);
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
  }, [endpoint]);
  return /*#__PURE__*/_jsx("div", {
    className: "relation-field",
    children: loading ? /*#__PURE__*/_jsx("div", {
      className: "relation-field__loading",
      children: "Loading options..."
    }) : fetchError ? /*#__PURE__*/_jsxs("div", {
      className: "relation-field__error-fetch",
      children: ["Error: ", fetchError]
    }) : /*#__PURE__*/_jsxs("select", _objectSpread(_objectSpread({
      id: name
    }, register(name)), {}, {
      className: "relation-field__select ".concat(fieldError ? 'relation-field__select--error' : ''),
      children: [/*#__PURE__*/_jsx("option", {
        value: "",
        children: placeholder
      }), options.map(option => /*#__PURE__*/_jsx("option", {
        value: option[valueField],
        children: option[labelField]
      }, option[valueField]))]
    }))
  });
};
var RelationFieldTypeInput = _ref3 => {
  var _ref3$config = _ref3.config,
    config = _ref3$config === void 0 ? {} : _ref3$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(RelationControl, {
      config: config
    })
  });
};
var RelationFieldTypeDisplay = _ref4 => {
  var _config$relation2;
  var value = _ref4.value,
    config = _ref4.config;
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "relation-field__display relation-field__display--empty",
      children: "-"
    });
  }
  var labelField = (config === null || config === void 0 || (_config$relation2 = config.relation) === null || _config$relation2 === void 0 ? void 0 : _config$relation2.labelField) || (config === null || config === void 0 ? void 0 : config.labelField) || 'title';
  if (typeof value === 'object' && value !== null) {
    var label = value[labelField] || value.name || value.title || value.label;
    return /*#__PURE__*/_jsx("span", {
      className: "relation-field__display",
      children: label || '-'
    });
  }
  return /*#__PURE__*/_jsx("span", {
    className: "relation-field__display",
    children: String(value)
  });
};
export var relationFieldType = {
  type: 'relation',
  Input: RelationFieldTypeInput,
  Display: RelationFieldTypeDisplay,
  defaultConfig: {
    relation: {
      labelField: 'title',
      valueField: 'id',
      placeholder: 'Select an option...'
    }
  }
};
export var useRelationField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(RelationFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(RelationFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};