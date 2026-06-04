function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { useMemo } from 'react';
import { useGatewayForm } from "../../..";
import Field from "../../field";
import "./textarea-style.css";
import { jsx as _jsx } from "react/jsx-runtime";
var TextareaControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('TextareaFieldTypeInput: No "name" provided in config');
    return null;
  }

  // Get errors for this field.
  var fieldError = formState.errors[name];
  var _config$label = config.label,
    label = _config$label === void 0 ? '' : _config$label,
    _config$placeholder = config.placeholder,
    placeholder = _config$placeholder === void 0 ? '' : _config$placeholder,
    _config$help = config.help,
    help = _config$help === void 0 ? '' : _config$help,
    _config$rows = config.rows,
    rows = _config$rows === void 0 ? 5 : _config$rows,
    _config$default = config.default,
    defaultValue = _config$default === void 0 ? '' : _config$default;
  var textareaClasses = ['textarea-field__input'];
  if (fieldError) {
    textareaClasses.push('textarea-field__input--error');
  }
  return /*#__PURE__*/_jsx("div", {
    className: "gty-field-control gty-textarea-field-control",
    children: /*#__PURE__*/_jsx("textarea", _objectSpread(_objectSpread({
      id: name,
      className: textareaClasses.join(' ')
    }, register(name)), {}, {
      defaultValue: defaultValue,
      rows: rows,
      placeholder: placeholder
    }))
  });
};
var TextareaFieldTypeInput = _ref2 => {
  var _ref2$config = _ref2.config,
    config = _ref2$config === void 0 ? {} : _ref2$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(TextareaControl, {
      config: config
    })
  });
};
var TextareaFieldTypeDisplay = _ref3 => {
  var value = _ref3.value,
    config = _ref3.config;
  if (!value || value.trim() === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "textarea-field__display textarea-field__display--empty",
      children: "-"
    });
  }
  return /*#__PURE__*/_jsx("div", {
    className: "textarea-field__display",
    children: value.split('\n').map((line, index) => /*#__PURE__*/_jsx("p", {
      children: line || '\u00A0'
    }, index))
  });
};
export var textareaFieldType = {
  type: 'textarea',
  Input: TextareaFieldTypeInput,
  Display: TextareaFieldTypeDisplay,
  defaultConfig: {
    label: '',
    placeholder: '',
    help: '',
    rows: 5,
    default: ''
  }
};
export var useTextareaField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(TextareaFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(TextareaFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};