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
import { Pencil, RotateCcw } from 'lucide-react';
import { useGatewayForm } from "../../..";
import Field from "../../field";
import "./slug-style.css";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var slugify = text => {
  return text.toString().toLowerCase().trim().replace(/\s+/g, '-') // Replace spaces with -
  .replace(/[^\w\-]+/g, '') // Remove all non-word chars
  .replace(/\-\-+/g, '-') // Replace multiple - with single -
  .replace(/^-+/, '') // Trim - from start of text
  .replace(/-+$/, ''); // Trim - from end of text
};
var SlugControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var label = config.label,
    _config$required = config.required,
    required = _config$required === void 0 ? false : _config$required,
    _config$help = config.help,
    help = _config$help === void 0 ? '' : _config$help,
    _config$watchField = config.watchField,
    watchField = _config$watchField === void 0 ? 'title' : _config$watchField,
    _config$placeholder = config.placeholder,
    placeholder = _config$placeholder === void 0 ? '' : _config$placeholder,
    _config$prefix = config.prefix,
    prefix = _config$prefix === void 0 ? '' : _config$prefix;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    setValue = _useGatewayForm.setValue,
    watch = _useGatewayForm.watch,
    formState = _useGatewayForm.formState;
  var name = config.name;
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isManuallyEdited = _useState2[0],
    setIsManuallyEdited = _useState2[1];
  var _useState3 = useState(0),
    _useState4 = _slicedToArray(_useState3, 2),
    rerender = _useState4[0],
    setRerender = _useState4[1];
  useEffect(() => {
    var subscription = watch((allValues, _ref2) => {
      var changedName = _ref2.name;
      if (changedName === config.watchField) {
        setRerender(r => r + 1);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [watch, config.watchField]);
  useEffect(() => {
    var subscription = watch((value, _ref3) => {
      var changedName = _ref3.name;
      setRerender(r => r + 1);
    }, watchField);
    return () => {
      subscription.unsubscribe();
    };
  }, [watch, watchField]);
  if (!name) {
    console.warn('[SlugField] No "name" provided in config');
    return null;
  }
  var fieldError = formState.errors[name];
  var currentValue = watch(name);
  var watchedValue = watch(watchField);
  useEffect(() => {
    if (!isManuallyEdited && watchedValue !== undefined) {
      var newSlug = slugify(watchedValue);
      if (newSlug !== currentValue) {
        setValue(name, newSlug, {
          shouldValidate: true
        });
      }
    }
  }, [watchedValue, isManuallyEdited, currentValue, name, setValue]);
  var handleEditClick = () => {
    setIsManuallyEdited(true);
  };
  var handleUnlock = () => {
    setIsManuallyEdited(false);
    if (watchedValue !== undefined) {
      setValue(name, slugify(watchedValue), {
        shouldValidate: true
      });
    }
  };
  var handleChange = e => {
    if (isManuallyEdited) {
      var masked = slugify(e.target.value);
      setValue(name, masked, {
        shouldValidate: true
      });
    }
  };
  var handleBlur = e => {
    if (isManuallyEdited) {
      var slugified = slugify(e.target.value);
      setValue(name, slugified, {
        shouldValidate: true
      });
    }
  };
  return /*#__PURE__*/_jsxs("div", {
    className: "slug-field",
    children: [/*#__PURE__*/_jsxs("div", {
      className: "slug-field__input-wrapper",
      children: [prefix && /*#__PURE__*/_jsx("span", {
        className: "slug-field__prefix",
        children: prefix
      }), /*#__PURE__*/_jsx("input", _objectSpread(_objectSpread({
        type: "text",
        id: name
      }, register(name)), {}, {
        value: currentValue || '',
        onChange: handleChange,
        onBlur: handleBlur,
        placeholder: placeholder || "Auto-generated from ".concat(watchField),
        className: "slug-field__input ".concat(fieldError ? 'slug-field__input--error' : '', " ").concat(isManuallyEdited ? 'slug-field__input--manual' : ''),
        readOnly: !isManuallyEdited,
        style: !isManuallyEdited ? {
          background: "#f9f9f9",
          cursor: "not-allowed"
        } : {}
      })), !isManuallyEdited ? /*#__PURE__*/_jsx("button", {
        type: "button",
        onClick: handleEditClick,
        className: "slug-field__edit",
        title: "Edit slug manually",
        "aria-label": "Edit slug manually",
        children: /*#__PURE__*/_jsx(Pencil, {
          size: 16
        })
      }) : /*#__PURE__*/_jsx("button", {
        type: "button",
        onClick: handleUnlock,
        className: "slug-field__unlock",
        title: "Re-enable auto-generation",
        "aria-label": "Re-enable auto-generation from watched field",
        children: /*#__PURE__*/_jsx(RotateCcw, {
          size: 16
        })
      })]
    }), !isManuallyEdited && watchField && /*#__PURE__*/_jsx("p", {
      className: "slug-field__info",
      children: "Automatically generated."
    }), isManuallyEdited && /*#__PURE__*/_jsx("p", {
      className: "slug-field__info",
      children: "Manual mode."
    })]
  });
};
var SlugFieldTypeInput = _ref4 => {
  var _ref4$config = _ref4.config,
    config = _ref4$config === void 0 ? {} : _ref4$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(SlugControl, {
      config: config
    })
  });
};
var SlugFieldTypeDisplay = _ref5 => {
  var value = _ref5.value,
    config = _ref5.config;
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "slug-field__display slug-field__display--empty",
      children: "-"
    });
  }
  var _ref6 = config || {},
    _ref6$prefix = _ref6.prefix,
    prefix = _ref6$prefix === void 0 ? '' : _ref6$prefix;
  return /*#__PURE__*/_jsxs("span", {
    className: "slug-field__display",
    children: [prefix && /*#__PURE__*/_jsx("span", {
      className: "slug-field__display-prefix",
      children: prefix
    }), String(value)]
  });
};
export var slugFieldType = {
  type: 'slug',
  Input: SlugFieldTypeInput,
  Display: SlugFieldTypeDisplay,
  defaultConfig: {
    watchField: 'title',
    prefix: '',
    placeholder: ''
  }
};
export var useSlugField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(SlugFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(SlugFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};