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
import { useMemo, useState, useEffect } from 'react';
import { useGatewayForm } from "../../..";
import Field from "../../field";
import "./link-style.css";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
var LinkControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    setValue = _useGatewayForm.setValue,
    watch = _useGatewayForm.watch,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('LinkFieldTypeInput: No "name" provided in config');
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
    _config$urlPlaceholde = config.urlPlaceholder,
    urlPlaceholder = _config$urlPlaceholde === void 0 ? 'https://example.com' : _config$urlPlaceholde,
    _config$titlePlacehol = config.titlePlaceholder,
    titlePlaceholder = _config$titlePlacehol === void 0 ? 'Click here' : _config$titlePlacehol,
    _config$requireTitle = config.requireTitle,
    requireTitle = _config$requireTitle === void 0 ? false : _config$requireTitle,
    _config$enableTarget = config.enableTarget,
    enableTarget = _config$enableTarget === void 0 ? true : _config$enableTarget,
    _config$addButtonText = config.addButtonText,
    addButtonText = _config$addButtonText === void 0 ? 'Add Link' : _config$addButtonText;
  var currentValue = watch(name);
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isEditing = _useState2[0],
    setIsEditing = _useState2[1];
  var _useState3 = useState({
      url: '',
      title: '',
      target: '_self'
    }),
    _useState4 = _slicedToArray(_useState3, 2),
    linkData = _useState4[0],
    setLinkData = _useState4[1];
  useEffect(() => {
    register(name);
  }, [name, register]);
  useEffect(() => {
    if (currentValue === undefined && defaultValue) {
      setValue(name, defaultValue);
    }
  }, []);
  useEffect(() => {
    if (currentValue) {
      try {
        var data = typeof currentValue === 'string' ? JSON.parse(currentValue) : currentValue;
        if (data && typeof data === 'object') {
          setLinkData({
            url: data.url || '',
            title: data.title || '',
            target: data.target || '_self'
          });
        }
      } catch (err) {
        console.error('Error parsing link value:', err);
      }
    }
  }, [currentValue]);
  var updateFormValue = data => {
    if (data.url) {
      setValue(name, JSON.stringify(data), {
        shouldValidate: true
      });
    } else {
      setValue(name, '', {
        shouldValidate: true
      });
    }
  };
  var handleChange = (field, value) => {
    var newData = _objectSpread(_objectSpread({}, linkData), {}, {
      [field]: value
    });
    setLinkData(newData);
    updateFormValue(newData);
  };
  var handleSave = () => {
    if (linkData.url) {
      updateFormValue(linkData);
      setIsEditing(false);
    }
  };
  var handleRemove = () => {
    setLinkData({
      url: '',
      title: '',
      target: '_self'
    });
    setValue(name, '', {
      shouldValidate: true
    });
    setIsEditing(false);
  };
  var hasLink = linkData.url && !isEditing;
  var containerClasses = ['link-field__container'];
  if (fieldError) {
    containerClasses.push('link-field__container--error');
  }
  return /*#__PURE__*/_jsx("div", {
    className: "link-field",
    children: /*#__PURE__*/_jsx("div", {
      className: containerClasses.join(' '),
      children: hasLink ? /*#__PURE__*/_jsxs("div", {
        className: "link-field__preview",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "link-field__link-info",
          children: [/*#__PURE__*/_jsx("div", {
            className: "link-field__link-icon",
            children: /*#__PURE__*/_jsx("svg", {
              className: "link-field__icon",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              children: /*#__PURE__*/_jsx("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              })
            })
          }), /*#__PURE__*/_jsxs("div", {
            className: "link-field__link-details",
            children: [/*#__PURE__*/_jsx("div", {
              className: "link-field__link-title",
              children: linkData.title || 'Link'
            }), /*#__PURE__*/_jsx("a", {
              href: linkData.url,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "link-field__link-url",
              children: linkData.url
            }), /*#__PURE__*/_jsxs("div", {
              className: "link-field__link-target",
              children: ["Target: ", linkData.target === '_blank' ? 'New window' : 'Same window']
            })]
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "link-field__actions",
          children: [/*#__PURE__*/_jsx("button", {
            type: "button",
            onClick: () => setIsEditing(true),
            className: "link-field__button link-field__button--edit",
            children: "Edit Link"
          }), /*#__PURE__*/_jsx("button", {
            type: "button",
            onClick: handleRemove,
            className: "link-field__button link-field__button--remove",
            children: "Remove"
          })]
        })]
      }) : /*#__PURE__*/_jsxs("div", {
        className: "link-field__form",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "link-field__form-group",
          children: [/*#__PURE__*/_jsxs("label", {
            className: "link-field__form-label",
            children: ["URL ", /*#__PURE__*/_jsx("span", {
              className: "link-field__required",
              children: "*"
            })]
          }), /*#__PURE__*/_jsx("input", {
            type: "url",
            value: linkData.url,
            onChange: e => handleChange('url', e.target.value),
            placeholder: urlPlaceholder,
            className: "link-field__input"
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "link-field__form-group",
          children: [/*#__PURE__*/_jsxs("label", {
            className: "link-field__form-label",
            children: ["Link Text ", requireTitle && /*#__PURE__*/_jsx("span", {
              className: "link-field__required",
              children: "*"
            })]
          }), /*#__PURE__*/_jsx("input", {
            type: "text",
            value: linkData.title,
            onChange: e => handleChange('title', e.target.value),
            placeholder: titlePlaceholder,
            className: "link-field__input"
          })]
        }), enableTarget && /*#__PURE__*/_jsxs("div", {
          className: "link-field__form-group",
          children: [/*#__PURE__*/_jsx("label", {
            className: "link-field__form-label",
            children: "Link Target"
          }), /*#__PURE__*/_jsxs("select", {
            value: linkData.target,
            onChange: e => handleChange('target', e.target.value),
            className: "link-field__select",
            children: [/*#__PURE__*/_jsx("option", {
              value: "_self",
              children: "Same window"
            }), /*#__PURE__*/_jsx("option", {
              value: "_blank",
              children: "New window"
            })]
          })]
        }), /*#__PURE__*/_jsx("div", {
          className: "link-field__actions",
          children: linkData.url ? /*#__PURE__*/_jsxs(_Fragment, {
            children: [/*#__PURE__*/_jsx("button", {
              type: "button",
              onClick: handleSave,
              className: "link-field__button link-field__button--save",
              children: "Save Link"
            }), !required && /*#__PURE__*/_jsx("button", {
              type: "button",
              onClick: handleRemove,
              className: "link-field__button link-field__button--cancel",
              children: "Cancel"
            })]
          }) : /*#__PURE__*/_jsx("button", {
            type: "button",
            onClick: () => setIsEditing(false),
            className: "link-field__button link-field__button--add",
            disabled: !linkData.url,
            children: addButtonText
          })
        }), /*#__PURE__*/_jsx("p", {
          className: "link-field__hint",
          children: "Enter a URL to enable saving"
        })]
      })
    })
  });
};
var LinkFieldTypeInput = _ref2 => {
  var _ref2$config = _ref2.config,
    config = _ref2$config === void 0 ? {} : _ref2$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(LinkControl, {
      config: config
    })
  });
};
var LinkFieldTypeDisplay = _ref3 => {
  var value = _ref3.value,
    config = _ref3.config;
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "link-field__display link-field__display--empty",
      children: "-"
    });
  }
  try {
    var data = typeof value === 'string' ? JSON.parse(value) : value;
    if (data && typeof data === 'object' && data.url) {
      return /*#__PURE__*/_jsx("a", {
        href: data.url,
        target: data.target || '_self',
        rel: "noopener noreferrer",
        className: "link-field__display link-field__display--link",
        children: data.title || data.url
      });
    }
  } catch (err) {
    console.error('Error parsing link value:', err);
  }
  return /*#__PURE__*/_jsx("span", {
    className: "link-field__display link-field__display--empty",
    children: "-"
  });
};

// Field Type Definition for registry
export var linkFieldType = {
  type: 'link',
  Input: LinkFieldTypeInput,
  Display: LinkFieldTypeDisplay,
  defaultConfig: {
    urlPlaceholder: 'https://example.com',
    titlePlaceholder: 'Click here',
    requireTitle: false,
    enableTarget: true,
    addButtonText: 'Add Link'
  }
};

// Hook for easy usage
export var useLinkField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(LinkFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(LinkFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};