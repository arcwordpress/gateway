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
import "./file-style.css";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var FileControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    setValue = _useGatewayForm.setValue,
    watch = _useGatewayForm.watch,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('File Field: No "name" provided in config');
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
    _config$allowedTypes = config.allowedTypes,
    allowedTypes = _config$allowedTypes === void 0 ? null : _config$allowedTypes,
    _config$mediaTitle = config.mediaTitle,
    mediaTitle = _config$mediaTitle === void 0 ? 'Select File' : _config$mediaTitle,
    _config$mediaButtonTe = config.mediaButtonText,
    mediaButtonText = _config$mediaButtonTe === void 0 ? 'Use this file' : _config$mediaButtonTe,
    _config$buttonText = config.buttonText,
    buttonText = _config$buttonText === void 0 ? 'Select File' : _config$buttonText,
    _config$description = config.description,
    description = _config$description === void 0 ? 'Click to select a file from the media library' : _config$description;
  var currentValue = watch(name);
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    file = _useState2[0],
    setFile = _useState2[1];
  var _useState3 = useState(null),
    _useState4 = _slicedToArray(_useState3, 2),
    fileId = _useState4[0],
    setFileId = _useState4[1];
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
      setFileId(currentValue);
      fetchFileData(currentValue);
    }
  }, [currentValue]);
  var fetchFileData = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(function* (attachmentId) {
      try {
        var _window$wpApiSettings;
        var response = yield fetch("/wp-json/wp/v2/media/".concat(attachmentId), {
          headers: {
            'X-WP-Nonce': ((_window$wpApiSettings = window.wpApiSettings) === null || _window$wpApiSettings === void 0 ? void 0 : _window$wpApiSettings.nonce) || ''
          }
        });
        if (response.ok) {
          var _media$title, _media$media_details;
          var media = yield response.json();
          setFile({
            id: media.id,
            url: media.source_url,
            filename: ((_media$title = media.title) === null || _media$title === void 0 ? void 0 : _media$title.rendered) || 'File',
            filesize: (_media$media_details = media.media_details) === null || _media$media_details === void 0 ? void 0 : _media$media_details.filesize,
            mime_type: media.mime_type
          });
        }
      } catch (err) {
        console.error('Error fetching file:', err);
      }
    });
    return function fetchFileData(_x) {
      return _ref2.apply(this, arguments);
    };
  }();
  var openMediaLibrary = () => {
    if (!window.wp || !window.wp.media) {
      console.error('WordPress media library not available');
      return;
    }
    var frameConfig = {
      title: mediaTitle,
      button: {
        text: mediaButtonText
      },
      multiple: false
    };
    if (allowedTypes) {
      frameConfig.library = {
        type: allowedTypes
      };
    }
    var frame = window.wp.media(frameConfig);
    frame.on('select', () => {
      var attachment = frame.state().get('selection').first().toJSON();
      setFileId(attachment.id);
      setValue(name, attachment.id, {
        shouldValidate: true
      });
      setFile({
        id: attachment.id,
        url: attachment.url,
        filename: attachment.filename || attachment.title,
        filesize: attachment.filesizeInBytes,
        mime_type: attachment.mime
      });
    });
    frame.open();
  };
  var removeFile = () => {
    setFileId(null);
    setFile(null);
    setValue(name, '', {
      shouldValidate: true
    });
  };
  var formatFileSize = bytes => {
    if (!bytes) return '';
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };
  var getFileIcon = mimeType => {
    if (!mimeType) return '📄';
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return '🗜️';
    return '📄';
  };
  var containerClasses = ['file-field__container'];
  if (fieldError) {
    containerClasses.push('file-field__container--error');
  }
  return /*#__PURE__*/_jsx("div", {
    className: "file-field",
    children: /*#__PURE__*/_jsx("div", {
      className: containerClasses.join(' '),
      children: file ? /*#__PURE__*/_jsxs("div", {
        className: "file-field__preview",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "file-field__file-info",
          children: [/*#__PURE__*/_jsx("div", {
            className: "file-field__file-icon",
            children: getFileIcon(file.mime_type)
          }), /*#__PURE__*/_jsxs("div", {
            className: "file-field__file-details",
            children: [/*#__PURE__*/_jsx("div", {
              className: "file-field__file-name",
              children: file.filename
            }), /*#__PURE__*/_jsxs("div", {
              className: "file-field__file-meta",
              children: [file.filesize && /*#__PURE__*/_jsx("span", {
                className: "file-field__file-size",
                children: formatFileSize(file.filesize)
              }), file.mime_type && /*#__PURE__*/_jsx("span", {
                className: "file-field__file-type",
                children: file.mime_type
              })]
            }), /*#__PURE__*/_jsx("a", {
              href: file.url,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "file-field__file-link",
              children: "View file \u2192"
            })]
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "file-field__actions",
          children: [/*#__PURE__*/_jsx("button", {
            type: "button",
            onClick: openMediaLibrary,
            className: "file-field__button file-field__button--change",
            children: "Change File"
          }), /*#__PURE__*/_jsx("button", {
            type: "button",
            onClick: removeFile,
            className: "file-field__button file-field__button--remove",
            children: "Remove"
          })]
        }), fileId && /*#__PURE__*/_jsxs("div", {
          className: "file-field__id",
          children: ["Attachment ID: ", fileId]
        })]
      }) : /*#__PURE__*/_jsxs("div", {
        className: "file-field__empty",
        children: [/*#__PURE__*/_jsx("svg", {
          className: "file-field__empty-icon",
          stroke: "currentColor",
          fill: "none",
          viewBox: "0 0 48 48",
          children: /*#__PURE__*/_jsx("path", {
            d: "M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6",
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeLinejoin: "round"
          })
        }), /*#__PURE__*/_jsx("div", {
          children: /*#__PURE__*/_jsx("button", {
            type: "button",
            onClick: openMediaLibrary,
            className: "file-field__button file-field__button--select",
            children: buttonText
          })
        }), /*#__PURE__*/_jsx("p", {
          className: "file-field__empty-description",
          children: description
        }), allowedTypes && /*#__PURE__*/_jsxs("p", {
          className: "file-field__empty-types",
          children: ["Allowed types: ", Array.isArray(allowedTypes) ? allowedTypes.join(', ') : allowedTypes]
        })]
      })
    })
  });
};
var FileFieldTypeInput = _ref3 => {
  var _ref3$config = _ref3.config,
    config = _ref3$config === void 0 ? {} : _ref3$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(FileControl, {
      config: config
    })
  });
};
var FileFieldTypeDisplay = _ref4 => {
  var value = _ref4.value,
    config = _ref4.config;
  var _useState5 = useState(null),
    _useState6 = _slicedToArray(_useState5, 2),
    file = _useState6[0],
    setFile = _useState6[1];
  useEffect(() => {
    if (value) {
      fetchFileData(value);
    }
  }, [value]);
  var fetchFileData = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator(function* (attachmentId) {
      try {
        var response = yield fetch("/wp-json/wp/v2/media/".concat(attachmentId));
        if (response.ok) {
          var _media$title2;
          var media = yield response.json();
          setFile({
            url: media.source_url,
            filename: ((_media$title2 = media.title) === null || _media$title2 === void 0 ? void 0 : _media$title2.rendered) || 'File'
          });
        }
      } catch (err) {
        console.error('Error fetching file:', err);
      }
    });
    return function fetchFileData(_x2) {
      return _ref5.apply(this, arguments);
    };
  }();
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "file-field__display file-field__display--empty",
      children: "-"
    });
  }
  if (!file) {
    return /*#__PURE__*/_jsx("span", {
      className: "file-field__display",
      children: "Loading..."
    });
  }
  return /*#__PURE__*/_jsx("a", {
    href: file.url,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "file-field__display file-field__display--link",
    children: file.filename
  });
};
export var fileFieldType = {
  type: 'file',
  Input: FileFieldTypeInput,
  Display: FileFieldTypeDisplay,
  defaultConfig: {
    allowedTypes: null,
    mediaTitle: 'Select File',
    mediaButtonText: 'Use this file',
    buttonText: 'Select File',
    description: 'Click to select a file from the media library'
  }
};
export var useFileField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(FileFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(FileFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};