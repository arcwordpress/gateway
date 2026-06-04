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
import "./gallery-style.css";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var GalleryControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    setValue = _useGatewayForm.setValue,
    watch = _useGatewayForm.watch,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('Gallery FieldType: No "name" provided in config');
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
    _config$maxImages = config.maxImages,
    maxImages = _config$maxImages === void 0 ? null : _config$maxImages,
    _config$thumbnailSize = config.thumbnailSize,
    thumbnailSize = _config$thumbnailSize === void 0 ? 'thumbnail' : _config$thumbnailSize,
    _config$mediaTitle = config.mediaTitle,
    mediaTitle = _config$mediaTitle === void 0 ? 'Select Images' : _config$mediaTitle,
    _config$mediaButtonTe = config.mediaButtonText,
    mediaButtonText = _config$mediaButtonTe === void 0 ? 'Add to gallery' : _config$mediaButtonTe,
    _config$buttonText = config.buttonText,
    buttonText = _config$buttonText === void 0 ? 'Add Images' : _config$buttonText,
    _config$description = config.description,
    description = _config$description === void 0 ? 'Click to select images from the media library' : _config$description;
  var currentValue = watch(name);
  var _useState = useState([]),
    _useState2 = _slicedToArray(_useState, 2),
    images = _useState2[0],
    setImages = _useState2[1];
  var _useState3 = useState(null),
    _useState4 = _slicedToArray(_useState3, 2),
    draggedIndex = _useState4[0],
    setDraggedIndex = _useState4[1];
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
        var ids = typeof currentValue === 'string' ? JSON.parse(currentValue) : currentValue;
        if (Array.isArray(ids) && ids.length > 0) {
          fetchImages(ids);
        }
      } catch (err) {
        console.error('Error parsing gallery value:', err);
      }
    }
  }, [currentValue]);
  var fetchImages = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(function* (attachmentIds) {
      try {
        var promises = attachmentIds.map(id => {
          var _window$wpApiSettings;
          return fetch("/wp-json/wp/v2/media/".concat(id), {
            headers: {
              'X-WP-Nonce': ((_window$wpApiSettings = window.wpApiSettings) === null || _window$wpApiSettings === void 0 ? void 0 : _window$wpApiSettings.nonce) || ''
            }
          });
        });
        var responses = yield Promise.all(promises);
        var mediaData = yield Promise.all(responses.map(/*#__PURE__*/function () {
          var _ref3 = _asyncToGenerator(function* (res) {
            if (res.ok) {
              return yield res.json();
            }
            return null;
          });
          return function (_x2) {
            return _ref3.apply(this, arguments);
          };
        }()));
        var imageList = mediaData.filter(media => media !== null).map(media => {
          var _media$media_details, _media$title;
          return {
            id: media.id,
            url: ((_media$media_details = media.media_details) === null || _media$media_details === void 0 || (_media$media_details = _media$media_details.sizes) === null || _media$media_details === void 0 || (_media$media_details = _media$media_details[thumbnailSize]) === null || _media$media_details === void 0 ? void 0 : _media$media_details.source_url) || media.source_url,
            fullUrl: media.source_url,
            alt: media.alt_text || '',
            title: ((_media$title = media.title) === null || _media$title === void 0 ? void 0 : _media$title.rendered) || ''
          };
        });
        setImages(imageList);
      } catch (err) {
        console.error('Error fetching images:', err);
      }
    });
    return function fetchImages(_x) {
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
      multiple: true,
      library: {
        type: 'image'
      }
    });
    frame.on('open', () => {
      var selection = frame.state().get('selection');
      var ids = images.map(img => img.id);
      ids.forEach(id => {
        var attachment = window.wp.media.attachment(id);
        attachment.fetch();
        selection.add(attachment);
      });
    });
    frame.on('select', () => {
      var attachments = frame.state().get('selection').toJSON();
      var newImages = attachments.map(attachment => {
        var _attachment$sizes;
        return {
          id: attachment.id,
          url: ((_attachment$sizes = attachment.sizes) === null || _attachment$sizes === void 0 || (_attachment$sizes = _attachment$sizes[thumbnailSize]) === null || _attachment$sizes === void 0 ? void 0 : _attachment$sizes.url) || attachment.url,
          fullUrl: attachment.url,
          alt: attachment.alt || '',
          title: attachment.title || ''
        };
      });
      setImages(newImages);
      updateFormValue(newImages);
    });
    frame.open();
  };
  var updateFormValue = imageList => {
    var ids = imageList.map(img => img.id);
    setValue(name, JSON.stringify(ids), {
      shouldValidate: true
    });
  };
  var removeImage = indexToRemove => {
    var newImages = images.filter((_, index) => index !== indexToRemove);
    setImages(newImages);
    updateFormValue(newImages);
  };
  var handleDragStart = index => {
    setDraggedIndex(index);
  };
  var handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) {
      return;
    }
    var newImages = [...images];
    var draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    setImages(newImages);
    setDraggedIndex(index);
    updateFormValue(newImages);
  };
  var handleDragEnd = () => {
    setDraggedIndex(null);
  };
  var canAddMore = !maxImages || images.length < maxImages;
  var containerClasses = ['gallery-field__container'];
  if (fieldError) {
    containerClasses.push('gallery-field__container--error');
  }
  return /*#__PURE__*/_jsx("div", {
    className: "gallery-field",
    children: /*#__PURE__*/_jsx("div", {
      className: containerClasses.join(' '),
      children: images.length > 0 ? /*#__PURE__*/_jsxs("div", {
        className: "gallery-field__preview",
        children: [/*#__PURE__*/_jsx("div", {
          className: "gallery-field__grid",
          children: images.map((image, index) => {
            var itemClasses = ['gallery-field__item'];
            if (draggedIndex === index) {
              itemClasses.push('gallery-field__item--dragging');
            }
            return /*#__PURE__*/_jsxs("div", {
              draggable: true,
              onDragStart: () => handleDragStart(index),
              onDragOver: e => handleDragOver(e, index),
              onDragEnd: handleDragEnd,
              className: itemClasses.join(' '),
              children: [/*#__PURE__*/_jsx("div", {
                className: "gallery-field__image-wrapper",
                children: /*#__PURE__*/_jsx("img", {
                  src: image.url,
                  alt: image.alt || "Gallery image ".concat(index + 1),
                  className: "gallery-field__image"
                })
              }), /*#__PURE__*/_jsx("div", {
                className: "gallery-field__drag-handle",
                children: /*#__PURE__*/_jsx("svg", {
                  className: "gallery-field__drag-icon",
                  fill: "currentColor",
                  viewBox: "0 0 20 20",
                  children: /*#__PURE__*/_jsx("path", {
                    d: "M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"
                  })
                })
              }), /*#__PURE__*/_jsx("button", {
                type: "button",
                onClick: () => removeImage(index),
                className: "gallery-field__remove",
                title: "Remove image",
                children: /*#__PURE__*/_jsx("svg", {
                  className: "gallery-field__remove-icon",
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24",
                  children: /*#__PURE__*/_jsx("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M6 18L18 6M6 6l12 12"
                  })
                })
              }), /*#__PURE__*/_jsxs("div", {
                className: "gallery-field__order",
                children: ["#", index + 1]
              })]
            }, image.id);
          })
        }), /*#__PURE__*/_jsxs("div", {
          className: "gallery-field__footer",
          children: [/*#__PURE__*/_jsxs("div", {
            className: "gallery-field__count",
            children: [images.length, " ", images.length === 1 ? 'image' : 'images', maxImages && " (max ".concat(maxImages, ")")]
          }), /*#__PURE__*/_jsxs("div", {
            className: "gallery-field__actions",
            children: [canAddMore && /*#__PURE__*/_jsx("button", {
              type: "button",
              onClick: openMediaLibrary,
              className: "gallery-field__button gallery-field__button--edit",
              children: images.length > 0 ? 'Edit Gallery' : 'Add Images'
            }), images.length > 0 && /*#__PURE__*/_jsx("button", {
              type: "button",
              onClick: () => {
                setImages([]);
                setValue(name, '');
              },
              className: "gallery-field__button gallery-field__button--clear",
              children: "Clear All"
            })]
          })]
        }), /*#__PURE__*/_jsx("p", {
          className: "gallery-field__hint",
          children: "Drag and drop images to reorder"
        })]
      }) : /*#__PURE__*/_jsxs("div", {
        className: "gallery-field__empty",
        children: [/*#__PURE__*/_jsx("svg", {
          className: "gallery-field__empty-icon",
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
            className: "gallery-field__button gallery-field__button--add",
            children: buttonText
          })
        }), /*#__PURE__*/_jsx("p", {
          className: "gallery-field__empty-description",
          children: description
        }), maxImages && /*#__PURE__*/_jsxs("p", {
          className: "gallery-field__empty-max",
          children: ["Maximum ", maxImages, " images"]
        })]
      })
    })
  });
};
var GalleryFieldTypeInput = _ref4 => {
  var _ref4$config = _ref4.config,
    config = _ref4$config === void 0 ? {} : _ref4$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(GalleryControl, {
      config: config
    })
  });
};
var GalleryFieldTypeDisplay = _ref5 => {
  var value = _ref5.value,
    config = _ref5.config;
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "gallery-field__display gallery-field__display--empty",
      children: "-"
    });
  }
  try {
    var ids = typeof value === 'string' ? JSON.parse(value) : value;
    if (Array.isArray(ids) && ids.length > 0) {
      return /*#__PURE__*/_jsxs("span", {
        className: "gallery-field__display",
        children: [ids.length, " ", ids.length === 1 ? 'image' : 'images']
      });
    }
  } catch (err) {
    console.error('Error parsing gallery value:', err);
  }
  return /*#__PURE__*/_jsx("span", {
    className: "gallery-field__display gallery-field__display--empty",
    children: "-"
  });
};
export var galleryFieldType = {
  type: 'gallery',
  Input: GalleryFieldTypeInput,
  Display: GalleryFieldTypeDisplay,
  defaultConfig: {
    maxImages: null,
    thumbnailSize: 'thumbnail',
    mediaTitle: 'Select Images',
    mediaButtonText: 'Add to gallery',
    buttonText: 'Add Images',
    description: 'Click to select images from the media library'
  }
};

// Hook for easy usage
export var useGalleryField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(GalleryFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(GalleryFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};