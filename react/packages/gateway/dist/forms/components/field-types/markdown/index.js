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
import { useEffect, useState, useRef, useMemo } from 'react';
import { useGatewayForm } from "../../..";
import Field from "../../field";
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import "./markdown-style.css";
import { jsx as _jsx } from "react/jsx-runtime";
var MarkdownControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    setValue = _useGatewayForm.setValue,
    watch = _useGatewayForm.watch,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('MarkdownFieldTypeInput: No "name" provided in config');
    return null;
  }
  var fieldError = formState.errors[name];
  var label = config.label,
    _config$required = config.required,
    required = _config$required === void 0 ? false : _config$required,
    _config$help = config.help,
    help = _config$help === void 0 ? '' : _config$help,
    _config$default = config.default,
    defaultValue = _config$default === void 0 ? '' : _config$default,
    _config$placeholder = config.placeholder,
    placeholder = _config$placeholder === void 0 ? 'Enter markdown text...' : _config$placeholder,
    _config$minHeight = config.minHeight,
    minHeight = _config$minHeight === void 0 ? '200px' : _config$minHeight,
    _config$maxHeight = config.maxHeight,
    maxHeight = _config$maxHeight === void 0 ? '500px' : _config$maxHeight;
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isReady = _useState2[0],
    setIsReady = _useState2[1];
  var currentValue = watch(name);
  var initialValue = useRef(currentValue || defaultValue);
  useEffect(() => {
    register(name);
    setIsReady(true);
  }, [name, register]);
  useEffect(() => {
    if (currentValue === undefined && defaultValue) {
      setValue(name, defaultValue);
    }
  }, []);
  var handleChange = value => {
    setValue(name, value, {
      shouldValidate: true
    });
  };
  var editorOptions = useMemo(() => ({
    spellChecker: false,
    placeholder,
    status: false,
    toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'link', 'image', '|', 'preview', 'side-by-side', 'fullscreen', '|', 'guide'],
    minHeight,
    maxHeight
  }), [placeholder, minHeight, maxHeight]);
  if (!isReady) {
    return /*#__PURE__*/_jsx("div", {
      className: "markdown-field__loading",
      children: "Loading editor..."
    });
  }
  var wrapperClasses = ['markdown-field__wrapper'];
  if (fieldError) {
    wrapperClasses.push('markdown-field__wrapper--error');
  }
  return /*#__PURE__*/_jsx("div", {
    className: "markdown-field",
    children: /*#__PURE__*/_jsx("div", {
      className: wrapperClasses.join(' '),
      children: /*#__PURE__*/_jsx(SimpleMDE, {
        id: name,
        value: initialValue.current || '',
        onChange: handleChange,
        options: editorOptions
      })
    })
  });
};
var MarkdownFieldTypeInput = _ref2 => {
  var _ref2$config = _ref2.config,
    config = _ref2$config === void 0 ? {} : _ref2$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(MarkdownControl, {
      config: config
    })
  });
};
var MarkdownFieldTypeDisplay = _ref3 => {
  var value = _ref3.value,
    config = _ref3.config;
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "markdown-field__display markdown-field__display--empty",
      children: "-"
    });
  }
  var truncatedValue = value.length > 100 ? value.substring(0, 100) + '...' : value;
  return /*#__PURE__*/_jsx("span", {
    className: "markdown-field__display",
    title: value,
    children: truncatedValue
  });
};
export var markdownFieldType = {
  type: 'markdown',
  Input: MarkdownFieldTypeInput,
  Display: MarkdownFieldTypeDisplay,
  defaultConfig: {
    minHeight: '200px',
    maxHeight: '500px'
  }
};
export var useMarkdownField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(MarkdownFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(MarkdownFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};