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
import "./time-picker-style.css";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export var TimePickerControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    setValue = _useGatewayForm.setValue,
    watch = _useGatewayForm.watch,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('TimePickerInput: No "name" provided in config');
    return null;
  }
  var fieldError = formState.errors[name];
  var _config$label = config.label,
    label = _config$label === void 0 ? '' : _config$label,
    _config$placeholder = config.placeholder,
    placeholder = _config$placeholder === void 0 ? '' : _config$placeholder,
    _config$help = config.help,
    help = _config$help === void 0 ? '' : _config$help,
    _config$default = config.default,
    defaultValue = _config$default === void 0 ? '' : _config$default,
    _config$timeIntervals = config.timeIntervals,
    timeIntervals = _config$timeIntervals === void 0 ? 15 : _config$timeIntervals,
    _config$timeFormat = config.timeFormat,
    timeFormat = _config$timeFormat === void 0 ? 'h:mm aa' : _config$timeFormat,
    _config$dateFormat = config.dateFormat,
    dateFormat = _config$dateFormat === void 0 ? 'h:mm aa' : _config$dateFormat;
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    selectedTime = _useState2[0],
    setSelectedTime = _useState2[1];
  var currentValue = watch(name);
  useEffect(() => {
    register(name);
    if (defaultValue && !currentValue) {
      setValue(name, defaultValue);
    }
    if (currentValue) {
      var _currentValue$split = currentValue.split(':'),
        _currentValue$split2 = _slicedToArray(_currentValue$split, 2),
        hours = _currentValue$split2[0],
        minutes = _currentValue$split2[1];
      var date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      setSelectedTime(date);
    }
  }, []);
  useEffect(() => {
    if (currentValue && currentValue !== selectedTime) {
      var _currentValue$split3 = currentValue.split(':'),
        _currentValue$split4 = _slicedToArray(_currentValue$split3, 2),
        hours = _currentValue$split4[0],
        minutes = _currentValue$split4[1];
      var date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      setSelectedTime(date);
    }
  }, [currentValue]);
  var handleChange = date => {
    setSelectedTime(date);
    if (date) {
      var hours = String(date.getHours()).padStart(2, '0');
      var minutes = String(date.getMinutes()).padStart(2, '0');
      var seconds = '00';
      setValue(name, "".concat(hours, ":").concat(minutes, ":").concat(seconds), {
        shouldValidate: true
      });
    } else {
      setValue(name, '', {
        shouldValidate: true
      });
    }
  };
  return /*#__PURE__*/_jsxs("div", {
    className: "time-picker-field",
    children: [label && /*#__PURE__*/_jsx("label", {
      htmlFor: name,
      className: "time-picker-field__label",
      children: label
    }), /*#__PURE__*/_jsx(DatePicker, {
      selected: selectedTime,
      onChange: handleChange,
      showTimeSelect: true,
      showTimeSelectOnly: true,
      timeIntervals: timeIntervals,
      timeCaption: "Time",
      dateFormat: dateFormat,
      placeholderText: placeholder,
      className: "time-picker-field__input ".concat(fieldError ? 'time-picker-field__input--error' : '')
    }), help && /*#__PURE__*/_jsx("p", {
      className: "time-picker-field__help",
      children: help
    }), fieldError && /*#__PURE__*/_jsx("p", {
      className: "time-picker-field__error",
      children: fieldError.message
    })]
  });
};
var TimePickerFieldTypeInput = _ref2 => {
  var _ref2$config = _ref2.config,
    config = _ref2$config === void 0 ? {} : _ref2$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(TimePickerControl, {
      config: config
    })
  });
};
export var TimePickerFieldTypeDisplay = _ref3 => {
  var value = _ref3.value,
    _ref3$config = _ref3.config,
    config = _ref3$config === void 0 ? {} : _ref3$config;
  var _config$label2 = config.label,
    label = _config$label2 === void 0 ? '' : _config$label2;
  if (!value) {
    return /*#__PURE__*/_jsx("span", {
      className: "time-picker-field__display time-picker-field__display--empty",
      children: "-"
    });
  }
  var formatTime = timeString => {
    var _timeString$split = timeString.split(':'),
      _timeString$split2 = _slicedToArray(_timeString$split, 2),
      hours = _timeString$split2[0],
      minutes = _timeString$split2[1];
    var date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  return /*#__PURE__*/_jsxs("div", {
    className: "time-picker-field",
    children: [label && /*#__PURE__*/_jsx("span", {
      className: "time-picker-field__label",
      children: label
    }), /*#__PURE__*/_jsx("div", {
      className: "time-picker-field__display",
      children: formatTime(value)
    })]
  });
};
export var timePickerFieldType = {
  type: 'time-picker',
  Input: TimePickerFieldTypeInput,
  Display: TimePickerFieldTypeDisplay,
  defaultConfig: {
    label: '',
    placeholder: '',
    help: '',
    default: '',
    timeIntervals: 15,
    timeFormat: 'h:mm aa',
    dateFormat: 'h:mm aa'
  }
};
export var useTimePickerField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(TimePickerFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(TimePickerFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};