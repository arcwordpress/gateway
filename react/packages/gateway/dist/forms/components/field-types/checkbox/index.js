function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { useMemo } from 'react';
import { useGatewayForm } from "../../..";
import Field from "../../field";
import "./checkbox-style.css";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var CheckboxControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config,
    error = _ref.error;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('CheckboxFieldTypeInput: No "name" provided in config');
    return null;
  }
  var fieldError = error || formState.errors[name];
  var label = config.label,
    _config$required = config.required,
    required = _config$required === void 0 ? false : _config$required,
    _config$help = config.help,
    help = _config$help === void 0 ? '' : _config$help,
    _config$default = config.default,
    defaultChecked = _config$default === void 0 ? false : _config$default;
  return /*#__PURE__*/_jsx("div", {
    className: "checkbox-field",
    children: /*#__PURE__*/_jsxs("div", {
      className: "checkbox-field__container",
      children: [/*#__PURE__*/_jsx("input", _objectSpread(_objectSpread({
        type: "checkbox",
        id: name
      }, register(name)), {}, {
        defaultChecked: defaultChecked,
        className: "checkbox-field__input ".concat(fieldError ? 'checkbox-field__input--error' : '')
      })), /*#__PURE__*/_jsxs("label", {
        htmlFor: name,
        className: "checkbox-field__label",
        children: [label, required && /*#__PURE__*/_jsx("span", {
          className: "checkbox-field__required",
          children: "*"
        })]
      })]
    })
  });
};
var CheckboxFieldTypeInput = _ref2 => {
  var _ref2$config = _ref2.config,
    config = _ref2$config === void 0 ? {} : _ref2$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(CheckboxControl, {
      config: config
    })
  });
};
var CheckboxFieldTypeDisplay = _ref3 => {
  var value = _ref3.value,
    config = _ref3.config;
  if (value === null || value === undefined) {
    return /*#__PURE__*/_jsx("span", {
      className: "checkbox-field__display checkbox-field__display--unchecked",
      children: "\u2610"
    });
  }
  var isChecked = Boolean(value);
  return /*#__PURE__*/_jsx("span", {
    className: "checkbox-field__display ".concat(isChecked ? 'checkbox-field__display--checked' : 'checkbox-field__display--unchecked'),
    children: isChecked ? '☑' : '☐'
  });
};
export var checkboxFieldType = {
  type: 'checkbox',
  Input: CheckboxFieldTypeInput,
  Display: CheckboxFieldTypeDisplay,
  defaultConfig: {
    default: false
  }
};
export var useCheckboxField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(CheckboxFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(CheckboxFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};