function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { useEffect, useMemo } from 'react';
import { useGatewayForm } from "../../..";
import Field from "../../field";
import { normalizeOptions } from "../../../utils/normalizeOptions";
import "./style.css";

// Button Group Control Component (for button rendering)
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
var ButtonGroupControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    watch = _useGatewayForm.watch,
    setValue = _useGatewayForm.setValue;
  var name = config.name;
  var currentValue = watch(name);

  // Normalize options to {label, value} format
  var normalizedOptions = normalizeOptions(config.options).map(option => {
    if (typeof option === 'string') {
      return {
        label: option,
        value: option
      };
    }
    return option;
  });
  var handleClick = value => {
    setValue(name, value, {
      shouldValidate: true
    });
  };
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx("input", _objectSpread({
      type: "hidden"
    }, register(name))), /*#__PURE__*/_jsx("div", {
      className: "button-group-field__buttons",
      role: "group",
      children: normalizedOptions.map((option, index) => {
        var isFirst = index === 0;
        var isLast = index === normalizedOptions.length - 1;
        var isSelected = currentValue === option.value;
        var classes = ['button-group-field__button', isFirst && 'button-group-field__button--first', isLast && 'button-group-field__button--last', isSelected && 'button-group-field__button--selected', !isFirst && 'button-group-field__button--not-first'].filter(Boolean).join(' ');
        return /*#__PURE__*/_jsx("button", {
          type: "button",
          onClick: () => handleClick(option.value),
          className: classes,
          children: option.label
        }, index);
      })
    })]
  });
};

// Input Component (for forms)
var ButtonGroupFieldTypeInput = _ref2 => {
  var _ref2$config = _ref2.config,
    config = _ref2$config === void 0 ? {} : _ref2$config;
  var _useGatewayForm2 = useGatewayForm(),
    watch = _useGatewayForm2.watch,
    setValue = _useGatewayForm2.setValue;
  var name = config.name;
  if (!name) {
    console.warn('ButtonGroupFieldTypeInput: No "name" provided in config');
    return null;
  }
  var defaultValue = config.default;
  var currentValue = watch(name);

  // Set default value only once on mount if undefined
  useEffect(() => {
    if (defaultValue !== undefined && currentValue === undefined) {
      setValue(name, defaultValue);
    }
  }, []);
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(ButtonGroupControl, {
      config: config
    })
  });
};

// Display Component (for grids and read-only views)
export var ButtonGroupFieldTypeDisplay = _ref3 => {
  var value = _ref3.value,
    config = _ref3.config;
  // Handle null/undefined/empty values
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "button-group-field__display button-group-field__display--empty",
      children: "-"
    });
  }

  // Normalize options to {label, value} format
  var normalizedOptions = normalizeOptions(config === null || config === void 0 ? void 0 : config.options).map(option => {
    if (typeof option === 'string') {
      return {
        label: option,
        value: option
      };
    }
    return option;
  });

  // Find the selected option's label
  var selectedOption = normalizedOptions.find(opt => opt.value === value);
  var displayValue = selectedOption ? selectedOption.label : String(value);
  return /*#__PURE__*/_jsx("span", {
    className: "button-group-field__display",
    children: displayValue
  });
};

// Field Type Definition for registry
export var buttonGroupFieldType = {
  type: 'button-group',
  Input: ButtonGroupFieldTypeInput,
  Display: ButtonGroupFieldTypeDisplay,
  defaultConfig: {
    options: []
  }
};

// Hook for easy usage
export var useButtonGroupField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(ButtonGroupFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(ButtonGroupFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};