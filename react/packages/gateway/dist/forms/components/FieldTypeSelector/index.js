function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import React from 'react';
import ReactSelect from 'react-select';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
var darkStyles = {
  control: (base, state) => _objectSpread(_objectSpread({}, base), {}, {
    backgroundColor: 'var(--gty-offset-1)',
    border: "1px solid ".concat(state.isFocused ? '#71717a' : '#27272a'),
    borderRadius: '0.5rem',
    boxShadow: state.isFocused ? '0 0 0 1px #71717a' : 'none',
    '&:hover': {
      borderColor: '#71717a'
    },
    minHeight: '38px'
  }),
  menu: base => _objectSpread(_objectSpread({}, base), {}, {
    backgroundColor: 'var(--gty-offset-1)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
    zIndex: 9999
  }),
  menuList: base => _objectSpread(_objectSpread({}, base), {}, {
    padding: '4px 0'
  }),
  option: (base, _ref) => {
    var isFocused = _ref.isFocused,
      isSelected = _ref.isSelected;
    return _objectSpread(_objectSpread({}, base), {}, {
      backgroundColor: isSelected ? '#3f3f46' : isFocused ? '#27272a' : 'transparent',
      color: isSelected ? '#fff' : '#d4d4d8',
      fontSize: '0.875rem',
      cursor: 'pointer'
    });
  },
  singleValue: base => _objectSpread(_objectSpread({}, base), {}, {
    color: '#f4f4f5',
    fontSize: '0.875rem'
  }),
  placeholder: base => _objectSpread(_objectSpread({}, base), {}, {
    color: '#71717a',
    fontSize: '0.875rem'
  }),
  input: base => _objectSpread(_objectSpread({}, base), {}, {
    color: '#f4f4f5',
    fontSize: '0.875rem',
    backgroundColor: 'transparent'
  }),
  valueContainer: base => _objectSpread(_objectSpread({}, base), {}, {
    padding: '2px 8px'
  }),
  indicatorSeparator: () => ({
    display: 'none'
  }),
  dropdownIndicator: base => _objectSpread(_objectSpread({}, base), {}, {
    color: '#71717a',
    '&:hover': {
      color: '#a1a1aa'
    },
    padding: '0 8px'
  }),
  noOptionsMessage: base => _objectSpread(_objectSpread({}, base), {}, {
    color: '#71717a',
    fontSize: '0.875rem'
  }),
  loadingMessage: base => _objectSpread(_objectSpread({}, base), {}, {
    color: '#71717a',
    fontSize: '0.875rem'
  })
};

/**
 * Searchable field-type selector built on react-select.
 *
 * Props:
 *   value       – current type string (e.g. "text", "relation")
 *   onChange    – (typeString) => void
 *   options     – FieldTypeDef[] ({ type, label? }) or plain { value, label }[]
 *   isLoading   – show loading state while types are being fetched
 *   isDisabled  – disable the control
 *   placeholder – placeholder text
 */
export function FieldTypeSelector(_ref2) {
  var _normalised$find;
  var value = _ref2.value,
    _onChange = _ref2.onChange,
    _ref2$options = _ref2.options,
    options = _ref2$options === void 0 ? [] : _ref2$options,
    _ref2$isLoading = _ref2.isLoading,
    isLoading = _ref2$isLoading === void 0 ? false : _ref2$isLoading,
    _ref2$isDisabled = _ref2.isDisabled,
    isDisabled = _ref2$isDisabled === void 0 ? false : _ref2$isDisabled,
    _ref2$placeholder = _ref2.placeholder,
    placeholder = _ref2$placeholder === void 0 ? 'Select type…' : _ref2$placeholder;
  var normalised = options.map(o => {
    var _o$value, _o$label, _ref3, _o$value2;
    return {
      value: (_o$value = o.value) !== null && _o$value !== void 0 ? _o$value : o.type,
      label: (_o$label = o.label) !== null && _o$label !== void 0 ? _o$label : formatLabel((_ref3 = (_o$value2 = o.value) !== null && _o$value2 !== void 0 ? _o$value2 : o.type) !== null && _ref3 !== void 0 ? _ref3 : '')
    };
  }).sort((a, b) => a.label.localeCompare(b.label));
  var selected = (_normalised$find = normalised.find(o => o.value === value)) !== null && _normalised$find !== void 0 ? _normalised$find : null;
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx("style", {
      children: ".gw-fts__input input{outline:0;border:0;box-shadow:none;}"
    }), /*#__PURE__*/_jsx(ReactSelect, {
      value: selected,
      onChange: opt => opt && _onChange(opt.value),
      options: normalised,
      isLoading: isLoading,
      isDisabled: isDisabled,
      isSearchable: true,
      placeholder: placeholder,
      styles: darkStyles,
      classNamePrefix: "gw-fts",
      noOptionsMessage: () => 'No match'
    })]
  });
}
function formatLabel(type) {
  return type.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}