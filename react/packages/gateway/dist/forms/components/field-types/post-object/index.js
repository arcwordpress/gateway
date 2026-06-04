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
import { useState, useEffect, useRef, useMemo } from 'react';
import { useGatewayForm } from "../../..";
import Field from "../../field";
import { getApiClient } from "../../../../data";
import "./post-object-style.css";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var PostObjectControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    setValue = _useGatewayForm.setValue,
    watch = _useGatewayForm.watch,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('PostObjectFieldTypeInput: No "name" provided in config');
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
    _config$postType = config.postType,
    postType = _config$postType === void 0 ? 'post' : _config$postType,
    _config$multiple = config.multiple,
    multiple = _config$multiple === void 0 ? false : _config$multiple,
    _config$resultsPerPag = config.resultsPerPage,
    resultsPerPage = _config$resultsPerPag === void 0 ? 10 : _config$resultsPerPag,
    postStatus = config.postStatus,
    placeholder = config.placeholder;
  var currentValue = watch(name);
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    selectedPost = _useState2[0],
    setSelectedPost = _useState2[1];
  var _useState3 = useState([]),
    _useState4 = _slicedToArray(_useState3, 2),
    searchResults = _useState4[0],
    setSearchResults = _useState4[1];
  var _useState5 = useState(''),
    _useState6 = _slicedToArray(_useState5, 2),
    searchTerm = _useState6[0],
    setSearchTerm = _useState6[1];
  var _useState7 = useState(false),
    _useState8 = _slicedToArray(_useState7, 2),
    searching = _useState8[0],
    setSearching = _useState8[1];
  var _useState9 = useState(false),
    _useState0 = _slicedToArray(_useState9, 2),
    isOpen = _useState0[0],
    setIsOpen = _useState0[1];
  var dropdownRef = useRef(null);
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
      fetchSelectedPost(currentValue);
    } else {
      setSelectedPost(null);
    }
  }, [currentValue]);
  useEffect(() => {
    var handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  var fetchSelectedPost = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(function* (postId) {
      var restBase = postType === 'post' ? 'posts' : postType;
      try {
        var client = getApiClient();
        var response = yield client.get("wp/v2/".concat(restBase, "/").concat(postId));
        if (response.data) {
          var _response$data$title;
          setSelectedPost({
            id: response.data.id,
            title: ((_response$data$title = response.data.title) === null || _response$data$title === void 0 ? void 0 : _response$data$title.rendered) || 'Untitled',
            type: response.data.type,
            status: response.data.status
          });
        }
      } catch (err) {
        console.error('Error fetching post:', err);
      }
    });
    return function fetchSelectedPost(_x) {
      return _ref2.apply(this, arguments);
    };
  }();
  var searchPosts = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator(function* (term) {
      if (!term || term.length < 2) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        var params = {
          search: term,
          per_page: resultsPerPage,
          _fields: 'id,title,type,status'
        };
        if (postStatus) {
          params.status = postStatus;
        }
        var restBase = postType === 'post' ? 'posts' : postType;
        var client = getApiClient();
        var response = yield client.get("wp/v2/".concat(restBase), {
          params
        });
        var results = response.data.map(post => {
          var _post$title;
          return {
            id: post.id,
            title: ((_post$title = post.title) === null || _post$title === void 0 ? void 0 : _post$title.rendered) || 'Untitled',
            type: post.type,
            status: post.status
          };
        });
        setSearchResults(results);
      } catch (err) {
        console.error('Error searching posts:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    });
    return function searchPosts(_x2) {
      return _ref3.apply(this, arguments);
    };
  }();
  var handleSearchChange = e => {
    var term = e.target.value;
    setSearchTerm(term);
    searchPosts(term);
  };
  var handleSelectPost = post => {
    setSelectedPost(post);
    setValue(name, post.id, {
      shouldValidate: true
    });
    setSearchTerm('');
    setSearchResults([]);
    setIsOpen(false);
  };
  var handleClear = () => {
    setSelectedPost(null);
    setValue(name, '', {
      shouldValidate: true
    });
    setSearchTerm('');
    setSearchResults([]);
  };
  var handleFocus = () => {
    setIsOpen(true);
    if (!searchTerm) {
      searchPosts('');
    }
  };
  var selectedClasses = ['post-object-field__selected'];
  if (fieldError) {
    selectedClasses.push('post-object-field__selected--error');
  }
  var inputClasses = ['post-object-field__input'];
  if (fieldError) {
    inputClasses.push('post-object-field__input--error');
  }
  return /*#__PURE__*/_jsx("div", {
    className: "post-object-field",
    children: /*#__PURE__*/_jsx("div", {
      className: "post-object-field__wrapper",
      ref: dropdownRef,
      children: selectedPost ? /*#__PURE__*/_jsxs("div", {
        className: selectedClasses.join(' '),
        children: [/*#__PURE__*/_jsxs("div", {
          className: "post-object-field__post-info",
          children: [/*#__PURE__*/_jsx("div", {
            className: "post-object-field__post-icon",
            children: /*#__PURE__*/_jsx("svg", {
              className: "post-object-field__icon",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              children: /*#__PURE__*/_jsx("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              })
            })
          }), /*#__PURE__*/_jsxs("div", {
            className: "post-object-field__post-details",
            children: [/*#__PURE__*/_jsx("div", {
              className: "post-object-field__post-title",
              children: selectedPost.title
            }), /*#__PURE__*/_jsxs("div", {
              className: "post-object-field__post-meta",
              children: [/*#__PURE__*/_jsxs("span", {
                className: "post-object-field__post-id",
                children: ["ID: ", selectedPost.id]
              }), selectedPost.status && selectedPost.status !== 'publish' && /*#__PURE__*/_jsxs("span", {
                className: "post-object-field__post-status",
                children: ["(", selectedPost.status, ")"]
              })]
            })]
          })]
        }), /*#__PURE__*/_jsx("button", {
          type: "button",
          onClick: handleClear,
          className: "post-object-field__button post-object-field__button--remove",
          children: "Remove"
        })]
      }) : /*#__PURE__*/_jsxs("div", {
        children: [/*#__PURE__*/_jsx("input", {
          type: "text",
          value: searchTerm,
          onChange: handleSearchChange,
          onFocus: handleFocus,
          placeholder: placeholder || "Search ".concat(postType, "..."),
          className: inputClasses.join(' ')
        }), isOpen && (searchResults.length > 0 || searching) && /*#__PURE__*/_jsx("div", {
          className: "post-object-field__dropdown",
          children: searching ? /*#__PURE__*/_jsx("div", {
            className: "post-object-field__dropdown-message",
            children: "Searching..."
          }) : /*#__PURE__*/_jsx("ul", {
            className: "post-object-field__results",
            children: searchResults.map(post => /*#__PURE__*/_jsx("li", {
              className: "post-object-field__result-item",
              children: /*#__PURE__*/_jsxs("button", {
                type: "button",
                onClick: () => handleSelectPost(post),
                className: "post-object-field__result-button",
                children: [/*#__PURE__*/_jsx("div", {
                  className: "post-object-field__result-title",
                  children: post.title
                }), /*#__PURE__*/_jsxs("div", {
                  className: "post-object-field__result-meta",
                  children: [/*#__PURE__*/_jsxs("span", {
                    className: "post-object-field__result-id",
                    children: ["ID: ", post.id]
                  }), post.status && post.status !== 'publish' && /*#__PURE__*/_jsxs("span", {
                    className: "post-object-field__result-status",
                    children: ["(", post.status, ")"]
                  })]
                })]
              })
            }, post.id))
          })
        }), isOpen && !searching && searchTerm.length >= 2 && searchResults.length === 0 && /*#__PURE__*/_jsx("div", {
          className: "post-object-field__dropdown",
          children: /*#__PURE__*/_jsxs("div", {
            className: "post-object-field__dropdown-message",
            children: ["No ", postType, " found"]
          })
        }), isOpen && searchTerm.length > 0 && searchTerm.length < 2 && /*#__PURE__*/_jsx("div", {
          className: "post-object-field__dropdown",
          children: /*#__PURE__*/_jsx("div", {
            className: "post-object-field__dropdown-message",
            children: "Type at least 2 characters to search"
          })
        })]
      })
    })
  });
};
var PostObjectFieldTypeInput = _ref4 => {
  var _ref4$config = _ref4.config,
    config = _ref4$config === void 0 ? {} : _ref4$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(PostObjectControl, {
      config: config
    })
  });
};
var PostObjectFieldTypeDisplay = _ref5 => {
  var value = _ref5.value,
    config = _ref5.config;
  var _useState1 = useState(null),
    _useState10 = _slicedToArray(_useState1, 2),
    post = _useState10[0],
    setPost = _useState10[1];
  var postType = (config === null || config === void 0 ? void 0 : config.postType) || 'post';
  useEffect(() => {
    if (value) {
      fetchPost(value);
    } else {
      setPost(null);
    }
  }, [value]);
  var fetchPost = /*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator(function* (postId) {
      var restBase = postType === 'post' ? 'posts' : postType;
      try {
        var client = getApiClient();
        var response = yield client.get("wp/v2/".concat(restBase, "/").concat(postId));
        if (response.data) {
          var _response$data$title2;
          setPost({
            title: ((_response$data$title2 = response.data.title) === null || _response$data$title2 === void 0 ? void 0 : _response$data$title2.rendered) || 'Untitled',
            id: response.data.id
          });
        }
      } catch (err) {
        console.error('Error fetching post:', err);
      }
    });
    return function fetchPost(_x3) {
      return _ref6.apply(this, arguments);
    };
  }();
  if (value === null || value === undefined || value === '') {
    return /*#__PURE__*/_jsx("span", {
      className: "post-object-field__display post-object-field__display--empty",
      children: "-"
    });
  }
  if (!post) {
    return /*#__PURE__*/_jsx("span", {
      className: "post-object-field__display",
      children: "Loading..."
    });
  }
  return /*#__PURE__*/_jsxs("span", {
    className: "post-object-field__display",
    children: [post.title, " ", /*#__PURE__*/_jsxs("span", {
      className: "post-object-field__display-id",
      children: ["(ID: ", post.id, ")"]
    })]
  });
};
export var postObjectFieldType = {
  type: 'post-object',
  Input: PostObjectFieldTypeInput,
  Display: PostObjectFieldTypeDisplay,
  defaultConfig: {
    postType: 'post',
    resultsPerPage: 10
  }
};
export var usePostObjectField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(PostObjectFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(PostObjectFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};