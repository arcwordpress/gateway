function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { useMemo } from 'react';
import { useGatewayForm } from "../../..";
import Field from "../../field";
import "./style.css";
import { jsx as _jsx } from "react/jsx-runtime";
var TextInputControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    formState = _useGatewayForm.formState,
    watch = _useGatewayForm.watch;
  var name = config.name;
  if (!name) {
    console.warn('TextInputControl: No "name" provided in config');
    return null;
  }
  var fieldError = formState.errors[name];
  var _config$placeholder = config.placeholder,
    placeholder = _config$placeholder === void 0 ? '' : _config$placeholder,
    _config$required = config.required,
    required = _config$required === void 0 ? false : _config$required,
    _config$default = config.default,
    defaultValue = _config$default === void 0 ? '' : _config$default;
  var watchResult = watch(name);
  var currentValue = watchResult !== null && watchResult !== void 0 ? watchResult : defaultValue;
  var inputClasses = ['text-field__input'];
  if (fieldError) {
    inputClasses.push('text-field__input--error');
  }
  return /*#__PURE__*/_jsx("input", _objectSpread({
    type: "text",
    name: name,
    placeholder: placeholder,
    value: currentValue,
    required: required,
    className: inputClasses.join(' ')
  }, register(name)));
};

// Input Component (for forms)
var TextFieldTypeInput = _ref2 => {
  var _ref2$config = _ref2.config,
    config = _ref2$config === void 0 ? {} : _ref2$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(TextInputControl, {
      config: config
    })
  });
};

// Display Component
var TextFieldTypeDisplay = _ref3 => {
  var value = _ref3.value,
    _ref3$config = _ref3.config,
    config = _ref3$config === void 0 ? {} : _ref3$config;
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "text-field__display text-field__display--empty",
      children: "-"
    });
  }
  return /*#__PURE__*/_jsx("span", {
    className: "text-field__display",
    children: String(value)
  });
};

// Field Type Definition for registry
export var textFieldType = {
  type: 'text',
  Input: TextFieldTypeInput,
  Display: TextFieldTypeDisplay,
  defaultConfig: {
    name: '',
    label: '',
    placeholder: '',
    help: '',
    instructions: '',
    required: false,
    default: ''
  }
};

// Hook for easy usage
export var useTextField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(TextFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(TextFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};