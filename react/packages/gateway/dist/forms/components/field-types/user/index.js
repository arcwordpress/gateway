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
import "./user-style.css";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var UserControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    setValue = _useGatewayForm.setValue,
    watch = _useGatewayForm.watch,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('UserFieldTypeInput: No "name" provided in config');
    return null;
  }
  var fieldError = formState.errors[name];
  var _config$label = config.label,
    label = _config$label === void 0 ? '' : _config$label,
    _config$placeholder = config.placeholder,
    placeholder = _config$placeholder === void 0 ? 'Search for a user...' : _config$placeholder,
    _config$help = config.help,
    help = _config$help === void 0 ? '' : _config$help,
    _config$default = config.default,
    defaultValue = _config$default === void 0 ? null : _config$default,
    _config$multiple = config.multiple,
    multiple = _config$multiple === void 0 ? false : _config$multiple,
    _config$role = config.role,
    role = _config$role === void 0 ? '' : _config$role;
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    selectedUser = _useState2[0],
    setSelectedUser = _useState2[1];
  var _useState3 = useState(''),
    _useState4 = _slicedToArray(_useState3, 2),
    searchQuery = _useState4[0],
    setSearchQuery = _useState4[1];
  var _useState5 = useState([]),
    _useState6 = _slicedToArray(_useState5, 2),
    searchResults = _useState6[0],
    setSearchResults = _useState6[1];
  var _useState7 = useState(false),
    _useState8 = _slicedToArray(_useState7, 2),
    isSearching = _useState8[0],
    setIsSearching = _useState8[1];
  var _useState9 = useState(false),
    _useState0 = _slicedToArray(_useState9, 2),
    showDropdown = _useState0[0],
    setShowDropdown = _useState0[1];
  var dropdownRef = useRef(null);
  var currentValue = watch(name);
  useEffect(() => {
    register(name);
    if (defaultValue && !currentValue) {
      setValue(name, defaultValue);
      fetchSelectedUser(defaultValue);
    } else if (currentValue) {
      fetchSelectedUser(currentValue);
    }
  }, []);
  useEffect(() => {
    var handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  var fetchSelectedUser = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(function* (userId) {
      if (!userId) return;
      try {
        var _response$data$avatar;
        var client = getApiClient();
        var response = yield client.get("wp/v2/users/".concat(userId), {
          params: {
            context: 'edit'
          }
        });
        setSelectedUser({
          id: response.data.id,
          name: response.data.name,
          email: response.data.email || '',
          roles: response.data.roles || [],
          avatar: ((_response$data$avatar = response.data.avatar_urls) === null || _response$data$avatar === void 0 ? void 0 : _response$data$avatar['48']) || ''
        });
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    });
    return function fetchSelectedUser(_x) {
      return _ref2.apply(this, arguments);
    };
  }();
  var searchUsers = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator(function* (query) {
      if (!query || query.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        var params = {
          search: query,
          per_page: 10,
          context: 'edit'
        };
        if (role) {
          params.roles = role;
        }
        var client = getApiClient();
        var response = yield client.get('wp/v2/users', {
          params
        });
        var users = response.data.map(user => {
          var _user$avatar_urls;
          return {
            id: user.id,
            name: user.name,
            email: user.email || '',
            roles: user.roles || [],
            avatar: ((_user$avatar_urls = user.avatar_urls) === null || _user$avatar_urls === void 0 ? void 0 : _user$avatar_urls['48']) || ''
          };
        });
        setSearchResults(users);
        setShowDropdown(true);
      } catch (err) {
        console.error('Error searching users:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    });
    return function searchUsers(_x2) {
      return _ref3.apply(this, arguments);
    };
  }();
  var handleSearchChange = e => {
    var query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };
  var handleSelectUser = user => {
    setSelectedUser(user);
    setValue(name, user.id, {
      shouldValidate: true
    });
    setSearchQuery('');
    setShowDropdown(false);
    setSearchResults([]);
  };
  var handleClearSelection = () => {
    setSelectedUser(null);
    setValue(name, null, {
      shouldValidate: true
    });
    setSearchQuery('');
  };
  return /*#__PURE__*/_jsx("div", {
    className: "user-field",
    children: selectedUser ? /*#__PURE__*/_jsxs("div", {
      className: "user-field__selected",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "user-field__user-info",
        children: [selectedUser.avatar && /*#__PURE__*/_jsx("img", {
          src: selectedUser.avatar,
          alt: selectedUser.name,
          className: "user-field__avatar"
        }), /*#__PURE__*/_jsxs("div", {
          className: "user-field__user-details",
          children: [/*#__PURE__*/_jsx("div", {
            className: "user-field__user-name",
            children: selectedUser.name
          }), selectedUser.email && /*#__PURE__*/_jsx("div", {
            className: "user-field__user-email",
            children: selectedUser.email
          }), selectedUser.roles && selectedUser.roles.length > 0 && /*#__PURE__*/_jsx("div", {
            className: "user-field__user-roles",
            children: selectedUser.roles.map(role => /*#__PURE__*/_jsx("span", {
              className: "user-field__role-badge",
              children: role
            }, role))
          })]
        })]
      }), /*#__PURE__*/_jsx("button", {
        type: "button",
        onClick: handleClearSelection,
        className: "user-field__clear-button",
        children: "\xD7"
      })]
    }) : /*#__PURE__*/_jsxs("div", {
      className: "user-field__search-container",
      ref: dropdownRef,
      children: [/*#__PURE__*/_jsx("input", {
        type: "text",
        value: searchQuery,
        onChange: handleSearchChange,
        placeholder: placeholder,
        className: "user-field__search-input",
        onFocus: () => searchQuery && setShowDropdown(true)
      }), isSearching && /*#__PURE__*/_jsx("div", {
        className: "user-field__loading",
        children: "Searching..."
      }), showDropdown && searchResults.length > 0 && /*#__PURE__*/_jsx("div", {
        className: "user-field__dropdown",
        children: searchResults.map(user => /*#__PURE__*/_jsxs("button", {
          type: "button",
          onClick: () => handleSelectUser(user),
          className: "user-field__dropdown-item",
          children: [user.avatar && /*#__PURE__*/_jsx("img", {
            src: user.avatar,
            alt: user.name,
            className: "user-field__avatar"
          }), /*#__PURE__*/_jsxs("div", {
            className: "user-field__user-details",
            children: [/*#__PURE__*/_jsx("div", {
              className: "user-field__user-name",
              children: user.name
            }), user.email && /*#__PURE__*/_jsx("div", {
              className: "user-field__user-email",
              children: user.email
            })]
          })]
        }, user.id))
      }), showDropdown && !isSearching && searchQuery && searchResults.length === 0 && /*#__PURE__*/_jsx("div", {
        className: "user-field__no-results",
        children: "No users found"
      })]
    })
  });
};
var UserFieldTypeInput = _ref4 => {
  var _ref4$config = _ref4.config,
    config = _ref4$config === void 0 ? {} : _ref4$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(UserControl, {
      config: config
    })
  });
};
var UserFieldTypeDisplay = _ref5 => {
  var value = _ref5.value,
    config = _ref5.config;
  var _useState1 = useState(null),
    _useState10 = _slicedToArray(_useState1, 2),
    user = _useState10[0],
    setUser = _useState10[1];
  var _useState11 = useState(true),
    _useState12 = _slicedToArray(_useState11, 2),
    loading = _useState12[0],
    setLoading = _useState12[1];
  useEffect(() => {
    if (!value) {
      setLoading(false);
      return;
    }
    var fetchUser = /*#__PURE__*/function () {
      var _ref6 = _asyncToGenerator(function* () {
        try {
          var _response$data$avatar2;
          var client = getApiClient();
          var response = yield client.get("wp/v2/users/".concat(value), {
            params: {
              context: 'edit'
            }
          });
          setUser({
            id: response.data.id,
            name: response.data.name,
            email: response.data.email || '',
            roles: response.data.roles || [],
            avatar: ((_response$data$avatar2 = response.data.avatar_urls) === null || _response$data$avatar2 === void 0 ? void 0 : _response$data$avatar2['48']) || ''
          });
        } catch (err) {
          console.error('Error fetching user:', err);
        } finally {
          setLoading(false);
        }
      });
      return function fetchUser() {
        return _ref6.apply(this, arguments);
      };
    }();
    fetchUser();
  }, [value]);
  return /*#__PURE__*/_jsx("div", {
    className: "user-field",
    children: /*#__PURE__*/_jsx("div", {
      className: "user-field__display",
      children: loading ? /*#__PURE__*/_jsx("span", {
        className: "user-field__loading",
        children: "Loading user..."
      }) : user ? /*#__PURE__*/_jsxs("div", {
        className: "user-field__user-info",
        children: [user.avatar && /*#__PURE__*/_jsx("img", {
          src: user.avatar,
          alt: user.name,
          className: "user-field__avatar"
        }), /*#__PURE__*/_jsxs("div", {
          className: "user-field__user-details",
          children: [/*#__PURE__*/_jsx("div", {
            className: "user-field__user-name",
            children: user.name
          }), user.email && /*#__PURE__*/_jsx("div", {
            className: "user-field__user-email",
            children: user.email
          }), user.roles && user.roles.length > 0 && /*#__PURE__*/_jsx("div", {
            className: "user-field__user-roles",
            children: user.roles.map(role => /*#__PURE__*/_jsx("span", {
              className: "user-field__role-badge",
              children: role
            }, role))
          })]
        })]
      }) : /*#__PURE__*/_jsx("span", {
        className: "user-field__display--empty",
        children: "No user selected"
      })
    })
  });
};
export var userFieldType = {
  type: 'user',
  Input: UserFieldTypeInput,
  Display: UserFieldTypeDisplay,
  defaultConfig: {
    label: '',
    placeholder: 'Search for a user...',
    help: '',
    default: null,
    multiple: false,
    role: ''
  }
};
export var useUserField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(UserFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(UserFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    }))
  }), [config]);
};