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
import { useState, useEffect, useMemo } from 'react';
import { useGatewayForm } from "../../..";
import Field from "../../field";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import "./date-picker-style.css";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var DatePickerControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config,
    error = _ref.error;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    setValue = _useGatewayForm.setValue,
    watch = _useGatewayForm.watch,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('DatePickerFieldTypeInput: No "name" provided in config');
    return null;
  }
  var fieldError = error || formState.errors[name];
  var label = config.label,
    _config$required = config.required,
    required = _config$required === void 0 ? false : _config$required,
    help = config.help,
    _config$default = config.default,
    defaultValue = _config$default === void 0 ? '' : _config$default,
    _config$dateFormat = config.dateFormat,
    dateFormat = _config$dateFormat === void 0 ? 'MM/dd/yyyy' : _config$dateFormat,
    _config$placeholder = config.placeholder,
    placeholder = _config$placeholder === void 0 ? 'Select date...' : _config$placeholder,
    minDate = config.minDate,
    maxDate = config.maxDate;
  var currentValue = watch(name);
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    selectedDate = _useState2[0],
    setSelectedDate = _useState2[1];
  useEffect(() => {
    if (currentValue) {
      var date = new Date(currentValue);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    }
  }, [currentValue]);
  useEffect(() => {
    if (currentValue === undefined && defaultValue) {
      var resolvedDefault = defaultValue;
      if (defaultValue === 'today') {
        var today = new Date();
        var year = today.getFullYear();
        var month = String(today.getMonth() + 1).padStart(2, '0');
        var day = String(today.getDate()).padStart(2, '0');
        resolvedDefault = "".concat(year, "-").concat(month, "-").concat(day);
      }
      setValue(name, resolvedDefault);
    }
  }, []);
  var handleChange = date => {
    setSelectedDate(date);
    if (date) {
      var year = date.getFullYear();
      var month = String(date.getMonth() + 1).padStart(2, '0');
      var day = String(date.getDate()).padStart(2, '0');
      setValue(name, "".concat(year, "-").concat(month, "-").concat(day), {
        shouldValidate: true
      });
    } else {
      setValue(name, '');
    }
  };
  return /*#__PURE__*/_jsxs("div", {
    className: "date-picker-field",
    children: [/*#__PURE__*/_jsx("input", _objectSpread({
      type: "hidden"
    }, register(name))), /*#__PURE__*/_jsx(DatePicker, {
      selected: selectedDate,
      onChange: handleChange,
      dateFormat: dateFormat,
      placeholderText: placeholder,
      minDate: minDate ? new Date(minDate) : null,
      maxDate: maxDate ? new Date(maxDate) : null,
      isClearable: !required,
      showMonthDropdown: true,
      showYearDropdown: true,
      dropdownMode: "select",
      className: "date-picker-field__input ".concat(fieldError ? 'date-picker-field__input--error' : '')
    })]
  });
};
var DatePickerFieldTypeInput = _ref2 => {
  var _ref2$config = _ref2.config,
    config = _ref2$config === void 0 ? {} : _ref2$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(DatePickerControl, {
      config: config
    })
  });
};
var DatePickerFieldTypeDisplay = _ref3 => {
  var value = _ref3.value,
    config = _ref3.config;
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "date-picker-field__display date-picker-field__display--empty",
      children: "-"
    });
  }
  var date = new Date(value);
  if (isNaN(date.getTime())) {
    return /*#__PURE__*/_jsx("span", {
      className: "date-picker-field__display date-picker-field__display--invalid",
      children: "Invalid date"
    });
  }
  var formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return /*#__PURE__*/_jsx("span", {
    className: "date-picker-field__display",
    children: formattedDate
  });
};
export var datePickerFieldType = {
  type: 'date-picker',
  Input: DatePickerFieldTypeInput,
  Display: DatePickerFieldTypeDisplay,
  defaultConfig: {
    dateFormat: 'MM/dd/yyyy',
    placeholder: 'Select date...'
  }
};
export var useDatePickerField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(DatePickerFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(DatePickerFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};