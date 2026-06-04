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
import "./password-style.css";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var PasswordControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('PasswordFieldTypeInput: No "name" provided in config');
    return null;
  }
  var fieldError = formState.errors[name];
  var label = config.label,
    _config$placeholder = config.placeholder,
    placeholder = _config$placeholder === void 0 ? '' : _config$placeholder,
    _config$required = config.required,
    required = _config$required === void 0 ? false : _config$required,
    _config$help = config.help,
    help = _config$help === void 0 ? '' : _config$help,
    _config$autoComplete = config.autoComplete,
    autoComplete = _config$autoComplete === void 0 ? 'current-password' : _config$autoComplete,
    defaultValue = config.default;
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    showPassword = _useState2[0],
    setShowPassword = _useState2[1];
  var togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  var inputClasses = ['password-field__input'];
  if (fieldError) {
    inputClasses.push('password-field__input--error');
  }
  return /*#__PURE__*/_jsx("div", {
    className: "password-field",
    children: /*#__PURE__*/_jsxs("div", {
      className: "password-field__wrapper",
      children: [/*#__PURE__*/_jsx("input", _objectSpread(_objectSpread({
        type: showPassword ? 'text' : 'password',
        id: name
      }, register(name)), {}, {
        defaultValue: defaultValue !== undefined ? defaultValue : '',
        placeholder: placeholder,
        autoComplete: autoComplete,
        className: inputClasses.join(' ')
      })), /*#__PURE__*/_jsx("button", {
        type: "button",
        onClick: togglePasswordVisibility,
        className: "password-field__toggle",
        "aria-label": showPassword ? 'Hide password' : 'Show password',
        children: showPassword ? /*#__PURE__*/_jsx("svg", {
          className: "password-field__icon",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /*#__PURE__*/_jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
          })
        }) : /*#__PURE__*/_jsxs("svg", {
          className: "password-field__icon",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: [/*#__PURE__*/_jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          }), /*#__PURE__*/_jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          })]
        })
      })]
    })
  });
};
var PasswordFieldTypeInput = _ref2 => {
  var _ref2$config = _ref2.config,
    config = _ref2$config === void 0 ? {} : _ref2$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(PasswordControl, {
      config: config
    })
  });
};
var PasswordFieldTypeDisplay = _ref3 => {
  var value = _ref3.value,
    config = _ref3.config;
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "password-field__display password-field__display--empty",
      children: "-"
    });
  }
  return /*#__PURE__*/_jsx("span", {
    className: "password-field__display password-field__display--masked",
    children: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  });
};
export var passwordFieldType = {
  type: 'password',
  Input: PasswordFieldTypeInput,
  Display: PasswordFieldTypeDisplay,
  defaultConfig: {
    autoComplete: 'current-password'
  }
};
export var usePasswordField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(PasswordFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(PasswordFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};