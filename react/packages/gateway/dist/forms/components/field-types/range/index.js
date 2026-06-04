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
import "./range-style.css";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var RangeControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    setValue = _useGatewayForm.setValue,
    watch = _useGatewayForm.watch,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('RangeFieldTypeInput: No "name" provided in config');
    return null;
  }
  var fieldError = formState.errors[name];
  var label = config.label,
    _config$required = config.required,
    required = _config$required === void 0 ? false : _config$required,
    _config$min = config.min,
    min = _config$min === void 0 ? 0 : _config$min,
    _config$max = config.max,
    max = _config$max === void 0 ? 100 : _config$max,
    _config$step = config.step,
    step = _config$step === void 0 ? 1 : _config$step,
    defaultValue = config.default,
    _config$showMinMax = config.showMinMax,
    showMinMax = _config$showMinMax === void 0 ? true : _config$showMinMax,
    append = config.append,
    prepend = config.prepend,
    _config$help = config.help,
    help = _config$help === void 0 ? '' : _config$help;
  var initialValue = defaultValue !== null && defaultValue !== void 0 ? defaultValue : min;
  var _useState = useState(initialValue),
    _useState2 = _slicedToArray(_useState, 2),
    currentValue = _useState2[0],
    setCurrentValue = _useState2[1];
  var watchedValue = watch(name);
  useEffect(() => {
    register(name);
  }, [name, register]);
  useEffect(() => {
    if (watchedValue === undefined && defaultValue !== undefined) {
      setValue(name, defaultValue);
      setCurrentValue(defaultValue);
    }
  }, []);
  useEffect(() => {
    if (watchedValue !== undefined && watchedValue !== currentValue) {
      setCurrentValue(watchedValue);
    }
  }, [watchedValue]);
  var handleChange = e => {
    var newValue = parseFloat(e.target.value);
    setCurrentValue(newValue);
    setValue(name, newValue, {
      shouldValidate: true
    });
  };
  var percentage = (currentValue - min) / (max - min) * 100;
  return /*#__PURE__*/_jsx("div", {
    className: "range-field",
    children: /*#__PURE__*/_jsxs("div", {
      className: "range-field__wrapper",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "range-field__slider-container",
        children: [/*#__PURE__*/_jsx("div", {
          className: "range-field__slider-wrapper",
          children: /*#__PURE__*/_jsx("input", {
            type: "range",
            id: name,
            min: min,
            max: max,
            step: step,
            value: currentValue,
            onChange: handleChange,
            className: "range-field__slider",
            style: {
              background: "linear-gradient(to right, #2563eb 0%, #2563eb ".concat(percentage, "%, #e5e7eb ").concat(percentage, "%, #e5e7eb 100%)")
            }
          })
        }), (showMinMax || showMinMax === undefined) && /*#__PURE__*/_jsxs("div", {
          className: "range-field__minmax",
          children: [/*#__PURE__*/_jsx("span", {
            className: "range-field__min",
            children: min
          }), /*#__PURE__*/_jsx("span", {
            className: "range-field__max",
            children: max
          })]
        })]
      }), /*#__PURE__*/_jsx("div", {
        className: "range-field__value-container",
        children: /*#__PURE__*/_jsxs("div", {
          className: "range-field__value-wrapper",
          children: [prepend && /*#__PURE__*/_jsx("span", {
            className: "range-field__prepend",
            children: prepend
          }), /*#__PURE__*/_jsx("input", {
            type: "number",
            value: currentValue,
            onChange: handleChange,
            min: min,
            max: max,
            step: step,
            className: "range-field__number-input"
          }), append && /*#__PURE__*/_jsx("span", {
            className: "range-field__append",
            children: append
          })]
        })
      })]
    })
  });
};
var RangeFieldTypeInput = _ref2 => {
  var _ref2$config = _ref2.config,
    config = _ref2$config === void 0 ? {} : _ref2$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(RangeControl, {
      config: config
    })
  });
};
var RangeFieldTypeDisplay = _ref3 => {
  var value = _ref3.value,
    config = _ref3.config;
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "range-field__display range-field__display--empty",
      children: "-"
    });
  }
  var append = (config === null || config === void 0 ? void 0 : config.append) || '';
  var prepend = (config === null || config === void 0 ? void 0 : config.prepend) || '';
  return /*#__PURE__*/_jsxs("span", {
    className: "range-field__display",
    children: [prepend, String(value), append]
  });
};
export var rangeFieldType = {
  type: 'range',
  Input: RangeFieldTypeInput,
  Display: RangeFieldTypeDisplay,
  defaultConfig: {
    min: 0,
    max: 100,
    step: 1,
    showMinMax: true
  }
};
export var useRangeField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(RangeFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(RangeFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};