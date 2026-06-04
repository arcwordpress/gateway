function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { useMemo } from 'react';
import { useGatewayForm } from "../../..";
import Field from "../../field";
import "./hidden-style.css";
import { jsx as _jsx } from "react/jsx-runtime";
var HiddenControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register;
  var name = config.name;
  if (!name) {
    console.warn('Hidden Field: No "name" provided in config');
    return null;
  }
  var fieldValue = config.value || config.default || '';
  return /*#__PURE__*/_jsx("input", _objectSpread(_objectSpread({
    type: "hidden",
    id: name
  }, register(name)), {}, {
    defaultValue: fieldValue,
    className: "hidden-field__input"
  }));
};
var HiddenFieldTypeInput = _ref2 => {
  var _ref2$config = _ref2.config,
    config = _ref2$config === void 0 ? {} : _ref2$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(HiddenControl, {
      config: config
    })
  });
};
var HiddenFieldTypeDisplay = _ref3 => {
  var value = _ref3.value,
    config = _ref3.config;
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "hidden-field__display hidden-field__display--empty",
      children: "-"
    });
  }
  return /*#__PURE__*/_jsx("span", {
    className: "hidden-field__display",
    children: String(value)
  });
};
export var hiddenFieldType = {
  type: 'hidden',
  Input: HiddenFieldTypeInput,
  Display: HiddenFieldTypeDisplay,
  defaultConfig: {
    value: '',
    default: ''
  }
};

// Hook for easy usage
export var useHiddenField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(HiddenFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(HiddenFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};