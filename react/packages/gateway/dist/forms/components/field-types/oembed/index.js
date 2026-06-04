function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import { useState, useEffect, useMemo } from 'react';
import { useGatewayForm } from "../../..";
import Field from "../../field";
import "./oembed-style.css";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var OEmbedControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    setValue = _useGatewayForm.setValue,
    watch = _useGatewayForm.watch,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('OEmbedFieldTypeInput: No "name" provided in config');
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
    placeholder = _config$placeholder === void 0 ? 'https://www.youtube.com/watch?v=...' : _config$placeholder;
  var currentValue = watch(name);
  var _useState = useState(''),
    _useState2 = _slicedToArray(_useState, 2),
    url = _useState2[0],
    setUrl = _useState2[1];
  var _useState3 = useState(null),
    _useState4 = _slicedToArray(_useState3, 2),
    embedData = _useState4[0],
    setEmbedData = _useState4[1];
  var _useState5 = useState(false),
    _useState6 = _slicedToArray(_useState5, 2),
    loading = _useState6[0],
    setLoading = _useState6[1];
  var _useState7 = useState(null),
    _useState8 = _slicedToArray(_useState7, 2),
    embedError = _useState8[0],
    setEmbedError = _useState8[1];
  var _useState9 = useState(false),
    _useState0 = _slicedToArray(_useState9, 2),
    isEditing = _useState0[0],
    setIsEditing = _useState0[1];
  useEffect(() => {
    register(name);
  }, [name, register]);
  useEffect(() => {
    if (currentValue === undefined && defaultValue) {
      setValue(name, defaultValue);
    }
  }, []);
  useEffect(() => {
    if (currentValue && currentValue !== url) {
      setUrl(currentValue);
      fetchEmbed(currentValue);
    }
  }, [currentValue]);
  var fetchEmbed = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(function* (embedUrl) {
      if (!embedUrl) {
        setEmbedData(null);
        return;
      }
      setLoading(true);
      setEmbedError(null);
      try {
        var _window$wpApiSettings;
        var response = yield fetch("/wp-json/oembed/1.0/proxy?url=".concat(encodeURIComponent(embedUrl)), {
          headers: {
            'X-WP-Nonce': ((_window$wpApiSettings = window.wpApiSettings) === null || _window$wpApiSettings === void 0 ? void 0 : _window$wpApiSettings.nonce) || ''
          }
        });
        if (response.ok) {
          var data = yield response.json();
          setEmbedData(data);
          setIsEditing(false);
        } else {
          setEmbedError('Unable to fetch embed. Please check the URL.');
          setEmbedData(null);
        }
      } catch (err) {
        console.error('Error fetching embed:', err);
        setEmbedError('Failed to load embed preview.');
        setEmbedData(null);
      } finally {
        setLoading(false);
      }
    });
    return function fetchEmbed(_x) {
      return _ref2.apply(this, arguments);
    };
  }();
  var handleSubmit = e => {
    e.preventDefault();
    if (url) {
      setValue(name, url, {
        shouldValidate: true
      });
      fetchEmbed(url);
    }
  };
  var handleClear = () => {
    setUrl('');
    setEmbedData(null);
    setEmbedError(null);
    setValue(name, '', {
      shouldValidate: true
    });
    setIsEditing(false);
  };
  var handleEdit = () => {
    setIsEditing(true);
    setEmbedError(null);
  };
  var hasEmbed = embedData && !isEditing;
  var containerClasses = ['oembed-field__container'];
  if (fieldError) {
    containerClasses.push('oembed-field__container--error');
  }
  return /*#__PURE__*/_jsx("div", {
    className: "oembed-field",
    children: /*#__PURE__*/_jsx("div", {
      className: containerClasses.join(' '),
      children: hasEmbed ? /*#__PURE__*/_jsxs("div", {
        className: "oembed-field__preview",
        children: [/*#__PURE__*/_jsx("div", {
          className: "oembed-field__embed",
          children: embedData.html && /*#__PURE__*/_jsx("div", {
            className: "oembed-field__embed-container",
            dangerouslySetInnerHTML: {
              __html: embedData.html
            }
          })
        }), /*#__PURE__*/_jsxs("div", {
          className: "oembed-field__meta",
          children: [embedData.title && /*#__PURE__*/_jsx("div", {
            className: "oembed-field__title",
            children: embedData.title
          }), embedData.author_name && /*#__PURE__*/_jsxs("div", {
            className: "oembed-field__author",
            children: ["by ", embedData.author_name]
          }), /*#__PURE__*/_jsx("a", {
            href: url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "oembed-field__url",
            children: url
          }), embedData.provider_name && /*#__PURE__*/_jsxs("div", {
            className: "oembed-field__provider",
            children: [/*#__PURE__*/_jsx("span", {
              className: "oembed-field__provider-name",
              children: embedData.provider_name
            }), embedData.width && embedData.height && /*#__PURE__*/_jsxs("span", {
              className: "oembed-field__dimensions",
              children: [embedData.width, " \xD7 ", embedData.height]
            })]
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "oembed-field__actions",
          children: [/*#__PURE__*/_jsx("button", {
            type: "button",
            onClick: handleEdit,
            className: "oembed-field__button oembed-field__button--edit",
            children: "Change URL"
          }), /*#__PURE__*/_jsx("button", {
            type: "button",
            onClick: handleClear,
            className: "oembed-field__button oembed-field__button--remove",
            children: "Remove"
          })]
        })]
      }) : /*#__PURE__*/_jsx("div", {
        className: "oembed-field__form",
        children: /*#__PURE__*/_jsxs("form", {
          onSubmit: handleSubmit,
          className: "oembed-field__form-inner",
          children: [/*#__PURE__*/_jsx("div", {
            children: /*#__PURE__*/_jsx("input", {
              type: "url",
              value: url,
              onChange: e => setUrl(e.target.value),
              placeholder: placeholder,
              className: "oembed-field__input",
              disabled: loading
            })
          }), embedError && /*#__PURE__*/_jsx("div", {
            className: "oembed-field__error-message",
            children: embedError
          }), loading && /*#__PURE__*/_jsx("div", {
            className: "oembed-field__loading",
            children: "Loading preview..."
          }), /*#__PURE__*/_jsxs("div", {
            className: "oembed-field__buttons",
            children: [/*#__PURE__*/_jsx("button", {
              type: "submit",
              disabled: !url || loading,
              className: "oembed-field__button oembed-field__button--submit",
              children: loading ? 'Loading...' : embedData ? 'Update' : 'Preview'
            }), (url || embedData) && !loading && /*#__PURE__*/_jsx("button", {
              type: "button",
              onClick: handleClear,
              className: "oembed-field__button oembed-field__button--clear",
              children: "Clear"
            })]
          }), /*#__PURE__*/_jsx("p", {
            className: "oembed-field__hint",
            children: "Supports YouTube, Vimeo, Twitter, Instagram, Spotify, SoundCloud, and more"
          })]
        })
      })
    })
  });
};
var OEmbedFieldTypeInput = _ref3 => {
  var _ref3$config = _ref3.config,
    config = _ref3$config === void 0 ? {} : _ref3$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(OEmbedControl, {
      config: config
    })
  });
};
var OEmbedFieldTypeDisplay = _ref4 => {
  var value = _ref4.value,
    config = _ref4.config;
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "oembed-field__display oembed-field__display--empty",
      children: "-"
    });
  }
  return /*#__PURE__*/_jsx("a", {
    href: value,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "oembed-field__display oembed-field__display--link",
    children: value
  });
};
export var oembedFieldType = {
  type: 'oembed',
  Input: OEmbedFieldTypeInput,
  Display: OEmbedFieldTypeDisplay,
  defaultConfig: {
    placeholder: 'https://www.youtube.com/watch?v=...'
  }
};
export var useOEmbedField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(OEmbedFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(OEmbedFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};