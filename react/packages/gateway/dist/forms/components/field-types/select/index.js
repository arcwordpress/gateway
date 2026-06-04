function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { useMemo } from 'react';
import { useGatewayForm } from "../../..";
import Field from "../../field";
import { normalizeOptions } from "../../../utils/normalizeOptions";
import "./style.css";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var SelectControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('SelectFieldTypeInput: No "name" provided in config');
    return null;
  }
  var fieldError = formState.errors[name];
  var options = normalizeOptions(config.options);
  var label = config.label,
    _config$placeholder = config.placeholder,
    placeholder = _config$placeholder === void 0 ? 'Select an option' : _config$placeholder,
    _config$required = config.required,
    required = _config$required === void 0 ? false : _config$required,
    _config$help = config.help,
    help = _config$help === void 0 ? '' : _config$help,
    _config$default = config.default,
    defaultValue = _config$default === void 0 ? '' : _config$default;
  var selectClasses = ['select-field__select'];
  if (fieldError) {
    selectClasses.push('select-field__select--error');
  }
  return /*#__PURE__*/_jsx("div", {
    className: "select-field",
    children: /*#__PURE__*/_jsxs("select", _objectSpread(_objectSpread({
      id: name
    }, register(name)), {}, {
      defaultValue: defaultValue,
      className: selectClasses.join(' '),
      children: [/*#__PURE__*/_jsx("option", {
        value: "",
        children: placeholder
      }), options.map(option => {
        var value = typeof option === 'object' ? option.value : option;
        var label = typeof option === 'object' ? option.label : option;
        return /*#__PURE__*/_jsx("option", {
          value: value,
          children: label
        }, value);
      })]
    }))
  });
};
var SelectFieldTypeInput = _ref2 => {
  var _ref2$config = _ref2.config,
    config = _ref2$config === void 0 ? {} : _ref2$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(SelectControl, {
      config: config
    })
  });
};
var SelectFieldTypeDisplay = _ref3 => {
  var value = _ref3.value,
    config = _ref3.config;
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "select-field__display select-field__display--empty",
      children: "-"
    });
  }
  var options = normalizeOptions(config === null || config === void 0 ? void 0 : config.options);
  var selectedOption = options.find(option => {
    var optionValue = typeof option === 'object' ? option.value : option;
    return optionValue === value;
  });
  var displayValue = selectedOption ? typeof selectedOption === 'object' ? selectedOption.label : selectedOption : String(value);
  return /*#__PURE__*/_jsx("span", {
    className: "select-field__display",
    children: displayValue
  });
};
export var selectFieldType = {
  type: 'select',
  Input: SelectFieldTypeInput,
  Display: SelectFieldTypeDisplay,
  defaultConfig: {
    options: [],
    placeholder: 'Select an option' // @TODO is placeholder applicable to a select field type?
  }
};
export var useSelectField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(SelectFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(SelectFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};