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
import { useState, useMemo } from 'react';
import { useGatewayForm } from "../../..";
import Field from "../../field";
import "./color-picker-style.css";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
var ColorPickerControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    setValue = _useGatewayForm.setValue,
    watch = _useGatewayForm.watch,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('Color Picker: No "name" provided in config');
    return null;
  }
  var fieldError = formState.errors[name];
  var label = config.label,
    _config$required = config.required,
    required = _config$required === void 0 ? false : _config$required,
    customSwatches = config.swatches,
    _config$showSwatches = config.showSwatches,
    showSwatches = _config$showSwatches === void 0 ? true : _config$showSwatches,
    _config$default = config.default,
    defaultValue = _config$default === void 0 ? '#000000' : _config$default,
    _config$help = config.help,
    help = _config$help === void 0 ? '' : _config$help;
  var currentValue = watch(name) || defaultValue;
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    showPicker = _useState2[0],
    setShowPicker = _useState2[1];
  var handleColorChange = e => {
    var color = e.target.value;
    setValue(name, color, {
      shouldValidate: true
    });
  };
  var defaultSwatches = ['#000000', '#FFFFFF', '#EF4444', '#F59E0B'];
  var swatches = customSwatches || defaultSwatches;
  return /*#__PURE__*/_jsxs("div", {
    className: "color-picker-field",
    children: [/*#__PURE__*/_jsx("input", _objectSpread({
      type: "hidden"
    }, register(name))), /*#__PURE__*/_jsxs("div", {
      className: "color-picker-field__controls",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "color-picker-field__preview-container",
        children: [/*#__PURE__*/_jsx("button", {
          type: "button",
          onClick: () => setShowPicker(!showPicker),
          className: "color-picker-field__preview ".concat(fieldError ? 'color-picker-field__preview--error' : ''),
          style: {
            backgroundColor: currentValue
          },
          "aria-label": "Pick color"
        }), showPicker && /*#__PURE__*/_jsxs(_Fragment, {
          children: [/*#__PURE__*/_jsx("div", {
            className: "color-picker-field__overlay",
            onClick: () => setShowPicker(false)
          }), /*#__PURE__*/_jsx("div", {
            className: "color-picker-field__popup",
            children: /*#__PURE__*/_jsx("input", {
              type: "color",
              value: currentValue,
              onChange: handleColorChange,
              className: "color-picker-field__picker"
            })
          })]
        })]
      }), /*#__PURE__*/_jsx("div", {
        className: "color-picker-field__input-wrapper",
        children: /*#__PURE__*/_jsx("input", {
          type: "text",
          value: currentValue,
          onChange: e => {
            var color = e.target.value;
            setValue(name, color, {
              shouldValidate: true
            });
          },
          placeholder: "#000000",
          pattern: "^#[0-9A-Fa-f]{6}$",
          className: "color-picker-field__input ".concat(fieldError ? 'color-picker-field__input--error' : '')
        })
      }), showSwatches && /*#__PURE__*/_jsx("div", {
        className: "color-picker-field__swatches",
        children: swatches.map(color => /*#__PURE__*/_jsx("button", {
          type: "button",
          onClick: () => {
            setValue(name, color, {
              shouldValidate: true
            });
          },
          className: "color-picker-field__swatch ".concat((currentValue === null || currentValue === void 0 ? void 0 : currentValue.toUpperCase()) === color.toUpperCase() ? 'color-picker-field__swatch--selected' : ''),
          style: {
            backgroundColor: color
          },
          "aria-label": "Select ".concat(color)
        }, color))
      })]
    })]
  });
};
var ColorPickerFieldTypeInput = _ref2 => {
  var _ref2$config = _ref2.config,
    config = _ref2$config === void 0 ? {} : _ref2$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(ColorPickerControl, {
      config: config
    })
  });
};
var ColorPickerFieldTypeDisplay = _ref3 => {
  var value = _ref3.value,
    config = _ref3.config;
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "color-picker-field__display color-picker-field__display--empty",
      children: "-"
    });
  }
  return /*#__PURE__*/_jsxs("span", {
    className: "color-picker-field__display",
    children: [/*#__PURE__*/_jsx("span", {
      className: "color-picker-field__display-swatch",
      style: {
        backgroundColor: value
      },
      "aria-label": value
    }), /*#__PURE__*/_jsx("span", {
      className: "color-picker-field__display-value",
      children: value
    })]
  });
};
export var colorPickerFieldType = {
  type: 'color-picker',
  Input: ColorPickerFieldTypeInput,
  Display: ColorPickerFieldTypeDisplay,
  defaultConfig: {
    default: '#000000',
    showSwatches: true
  }
};
export var useColorPickerField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(ColorPickerFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(ColorPickerFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};