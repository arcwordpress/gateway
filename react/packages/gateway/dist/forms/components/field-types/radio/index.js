function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { useMemo } from 'react';
import { useGatewayForm } from "../../..";
import Field from "../../field";
import { normalizeOptions } from "../../../utils/normalizeOptions";
import "./radio-style.css";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var RadioControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('RadioFieldTypeInput: No "name" provided in config');
    return null;
  }
  var fieldError = formState.errors[name];
  var label = config.label,
    _config$required = config.required,
    required = _config$required === void 0 ? false : _config$required,
    _config$layout = config.layout,
    layout = _config$layout === void 0 ? 'vertical' : _config$layout,
    _config$help = config.help,
    help = _config$help === void 0 ? '' : _config$help,
    defaultValue = config.default;
  var normalizedOptions = normalizeOptions(config.options).map(option => {
    if (typeof option === 'string') {
      return {
        label: option,
        value: option
      };
    }
    return option;
  });
  var containerClasses = ['radio-field__options'];
  if (layout === 'horizontal') {
    containerClasses.push('radio-field__options--horizontal');
  }
  return /*#__PURE__*/_jsx("div", {
    className: "radio-field",
    children: /*#__PURE__*/_jsx("div", {
      className: containerClasses.join(' '),
      children: normalizedOptions.map((option, index) => /*#__PURE__*/_jsxs("div", {
        className: "radio-field__option",
        children: [/*#__PURE__*/_jsx("input", _objectSpread(_objectSpread({
          type: "radio",
          id: "".concat(name, "-").concat(index),
          value: option.value
        }, register(name)), {}, {
          defaultChecked: defaultValue === option.value,
          className: "radio-field__input"
        })), /*#__PURE__*/_jsx("label", {
          htmlFor: "".concat(name, "-").concat(index),
          className: "radio-field__option-label",
          children: option.label
        })]
      }, index))
    })
  });
};
var RadioFieldTypeInput = _ref2 => {
  var _ref2$config = _ref2.config,
    config = _ref2$config === void 0 ? {} : _ref2$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(RadioControl, {
      config: config
    })
  });
};
var RadioFieldTypeDisplay = _ref3 => {
  var value = _ref3.value,
    config = _ref3.config;
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "radio-field__display radio-field__display--empty",
      children: "-"
    });
  }
  var normalizedOptions = normalizeOptions(config === null || config === void 0 ? void 0 : config.options).map(option => {
    if (typeof option === 'string') {
      return {
        label: option,
        value: option
      };
    }
    return option;
  });
  var selectedOption = normalizedOptions.find(opt => opt.value === value);
  var displayValue = selectedOption ? selectedOption.label : String(value);
  return /*#__PURE__*/_jsx("span", {
    className: "radio-field__display",
    children: displayValue
  });
};
export var radioFieldType = {
  type: 'radio',
  Input: RadioFieldTypeInput,
  Display: RadioFieldTypeDisplay,
  defaultConfig: {
    options: [],
    layout: 'vertical'
  }
};
export var useRadioField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(RadioFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(RadioFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};