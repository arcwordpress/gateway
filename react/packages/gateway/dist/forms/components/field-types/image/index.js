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
import "./image-style.css";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var ImageControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    setValue = _useGatewayForm.setValue,
    watch = _useGatewayForm.watch,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('ImageFieldTypeInput: No "name" provided in config');
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
    _config$imageSize = config.imageSize,
    imageSize = _config$imageSize === void 0 ? 'medium' : _config$imageSize,
    _config$previewHeight = config.previewHeight,
    previewHeight = _config$previewHeight === void 0 ? '200px' : _config$previewHeight,
    _config$mediaTitle = config.mediaTitle,
    mediaTitle = _config$mediaTitle === void 0 ? 'Select Image' : _config$mediaTitle,
    _config$mediaButtonTe = config.mediaButtonText,
    mediaButtonText = _config$mediaButtonTe === void 0 ? 'Use this image' : _config$mediaButtonTe,
    _config$buttonText = config.buttonText,
    buttonText = _config$buttonText === void 0 ? 'Select Image' : _config$buttonText,
    _config$description = config.description,
    description = _config$description === void 0 ? 'Click to select an image from the media library' : _config$description;
  var currentValue = watch(name);
  var _useState = useState(''),
    _useState2 = _slicedToArray(_useState, 2),
    imageUrl = _useState2[0],
    setImageUrl = _useState2[1];
  var _useState3 = useState(null),
    _useState4 = _slicedToArray(_useState3, 2),
    imageId = _useState4[0],
    setImageId = _useState4[1];
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
      setImageId(currentValue);
      fetchImageUrl(currentValue);
    }
  }, [currentValue]);
  var fetchImageUrl = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(function* (attachmentId) {
      try {
        var _window$wpApiSettings;
        var response = yield fetch("/wp-json/wp/v2/media/".concat(attachmentId), {
          headers: {
            'X-WP-Nonce': ((_window$wpApiSettings = window.wpApiSettings) === null || _window$wpApiSettings === void 0 ? void 0 : _window$wpApiSettings.nonce) || ''
          }
        });
        if (response.ok) {
          var _media$media_details;
          var media = yield response.json();
          if ((_media$media_details = media.media_details) !== null && _media$media_details !== void 0 && (_media$media_details = _media$media_details.sizes) !== null && _media$media_details !== void 0 && (_media$media_details = _media$media_details[imageSize]) !== null && _media$media_details !== void 0 && _media$media_details.source_url) {
            setImageUrl(media.media_details.sizes[imageSize].source_url);
          } else {
            setImageUrl(media.source_url);
          }
        }
      } catch (err) {
        console.error('Error fetching image:', err);
      }
    });
    return function fetchImageUrl(_x) {
      return _ref2.apply(this, arguments);
    };
  }();
  var openMediaLibrary = () => {
    if (!window.wp || !window.wp.media) {
      console.error('WordPress media library not available');
      return;
    }
    var frame = window.wp.media({
      title: mediaTitle,
      button: {
        text: mediaButtonText
      },
      multiple: false,
      library: {
        type: 'image'
      }
    });
    frame.on('select', () => {
      var attachment = frame.state().get('selection').first().toJSON();
      setImageId(attachment.id);
      setValue(name, attachment.id, {
        shouldValidate: true
      });
      if (attachment.sizes && attachment.sizes[imageSize]) {
        setImageUrl(attachment.sizes[imageSize].url);
      } else {
        setImageUrl(attachment.url);
      }
    });
    frame.open();
  };
  var removeImage = () => {
    setImageId(null);
    setImageUrl('');
    setValue(name, '', {
      shouldValidate: true
    });
  };
  var containerClasses = ['image-field__container'];
  if (fieldError) {
    containerClasses.push('image-field__container--error');
  }
  return /*#__PURE__*/_jsx("div", {
    className: "image-field",
    children: /*#__PURE__*/_jsx("div", {
      className: containerClasses.join(' '),
      children: imageUrl ? /*#__PURE__*/_jsxs("div", {
        className: "image-field__preview",
        children: [/*#__PURE__*/_jsx("div", {
          className: "image-field__image-wrapper",
          children: /*#__PURE__*/_jsx("img", {
            src: imageUrl,
            alt: "Selected image",
            className: "image-field__image",
            style: {
              maxHeight: previewHeight
            }
          })
        }), /*#__PURE__*/_jsxs("div", {
          className: "image-field__actions",
          children: [/*#__PURE__*/_jsx("button", {
            type: "button",
            onClick: openMediaLibrary,
            className: "image-field__button image-field__button--change",
            children: "Change Image"
          }), /*#__PURE__*/_jsx("button", {
            type: "button",
            onClick: removeImage,
            className: "image-field__button image-field__button--remove",
            children: "Remove"
          })]
        }), imageId && /*#__PURE__*/_jsxs("div", {
          className: "image-field__id",
          children: ["Attachment ID: ", imageId]
        })]
      }) : /*#__PURE__*/_jsxs("div", {
        className: "image-field__empty",
        children: [/*#__PURE__*/_jsx("svg", {
          className: "image-field__empty-icon",
          stroke: "currentColor",
          fill: "none",
          viewBox: "0 0 48 48",
          children: /*#__PURE__*/_jsx("path", {
            d: "M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02",
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeLinejoin: "round"
          })
        }), /*#__PURE__*/_jsx("div", {
          children: /*#__PURE__*/_jsx("button", {
            type: "button",
            onClick: openMediaLibrary,
            className: "image-field__button image-field__button--select",
            children: buttonText
          })
        }), /*#__PURE__*/_jsx("p", {
          className: "image-field__empty-description",
          children: description
        })]
      })
    })
  });
};
var ImageFieldTypeInput = _ref3 => {
  var _ref3$config = _ref3.config,
    config = _ref3$config === void 0 ? {} : _ref3$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(ImageControl, {
      config: config
    })
  });
};
var ImageFieldTypeDisplay = _ref4 => {
  var value = _ref4.value,
    config = _ref4.config;
  var _useState5 = useState(null),
    _useState6 = _slicedToArray(_useState5, 2),
    imageUrl = _useState6[0],
    setImageUrl = _useState6[1];
  useEffect(() => {
    if (value) {
      fetchImageUrl(value);
    }
  }, [value]);
  var fetchImageUrl = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator(function* (attachmentId) {
      try {
        var response = yield fetch("/wp-json/wp/v2/media/".concat(attachmentId));
        if (response.ok) {
          var _media$media_details2;
          var media = yield response.json();
          var size = 'thumbnail';
          if ((_media$media_details2 = media.media_details) !== null && _media$media_details2 !== void 0 && (_media$media_details2 = _media$media_details2.sizes) !== null && _media$media_details2 !== void 0 && (_media$media_details2 = _media$media_details2[size]) !== null && _media$media_details2 !== void 0 && _media$media_details2.source_url) {
            setImageUrl(media.media_details.sizes[size].source_url);
          } else {
            setImageUrl(media.source_url);
          }
        }
      } catch (err) {
        console.error('Error fetching image:', err);
      }
    });
    return function fetchImageUrl(_x2) {
      return _ref5.apply(this, arguments);
    };
  }();
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "image-field__display image-field__display--empty",
      children: "-"
    });
  }
  if (!imageUrl) {
    return /*#__PURE__*/_jsx("span", {
      className: "image-field__display",
      children: "Loading..."
    });
  }
  return /*#__PURE__*/_jsx("img", {
    src: imageUrl,
    alt: "Image",
    className: "image-field__display-image"
  });
};
export var imageFieldType = {
  type: 'image',
  Input: ImageFieldTypeInput,
  Display: ImageFieldTypeDisplay,
  defaultConfig: {
    imageSize: 'medium',
    previewHeight: '200px',
    mediaTitle: 'Select Image',
    mediaButtonText: 'Use this image',
    buttonText: 'Select Image',
    description: 'Click to select an image from the media library'
  }
};
export var useImageField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(ImageFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(ImageFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};