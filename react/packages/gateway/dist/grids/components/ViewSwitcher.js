function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import { useState, useRef, useEffect } from 'react';
import { Rows2, Grid3x2, List } from 'lucide-react';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var ICON_SIZE = 24;
var VIEW_CONFIGS = {
  table: {
    label: 'Table',
    Icon: Rows2
  },
  list: {
    label: 'List',
    Icon: List
  },
  cards: {
    label: 'Cards',
    Icon: Grid3x2
  }
};
var ViewSwitcher = _ref => {
  var currentView = _ref.currentView,
    onViewChange = _ref.onViewChange,
    _ref$enabledViews = _ref.enabledViews,
    enabledViews = _ref$enabledViews === void 0 ? ['table', 'list', 'cards'] : _ref$enabledViews;
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    open = _useState2[0],
    setOpen = _useState2[1];
  var dropdownRef = useRef(null);
  if (!enabledViews || enabledViews.length < 2) return null;
  var currentConfig = VIEW_CONFIGS[currentView];
  var otherViews = enabledViews.filter(view => view !== currentView);
  useEffect(() => {
    if (!open) return;
    var handleClick = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);
  return /*#__PURE__*/_jsxs("div", {
    className: "view-switcher",
    ref: dropdownRef,
    children: [/*#__PURE__*/_jsx("button", {
      className: "view-switcher__trigger",
      onClick: () => setOpen(v => !v),
      "aria-haspopup": "listbox",
      "aria-expanded": open,
      type: "button",
      children: (currentConfig === null || currentConfig === void 0 ? void 0 : currentConfig.Icon) && /*#__PURE__*/_jsx(currentConfig.Icon, {
        size: ICON_SIZE,
        className: "view-switcher__icon"
      })
    }), open && /*#__PURE__*/_jsx("ul", {
      className: "view-switcher__dropdown",
      role: "listbox",
      children: otherViews.map((viewType, idx) => {
        var config = VIEW_CONFIGS[viewType];
        if (!config) return null;
        return /*#__PURE__*/_jsx("li", {
          className: idx > 0 ? 'view-switcher__option--divided' : '',
          children: /*#__PURE__*/_jsxs("button", {
            className: "view-switcher__option",
            onClick: () => {
              setOpen(false);
              onViewChange(viewType);
            },
            type: "button",
            role: "option",
            children: [/*#__PURE__*/_jsx(config.Icon, {
              size: ICON_SIZE,
              className: "view-switcher__icon"
            }), /*#__PURE__*/_jsx("span", {
              className: "view-switcher__label",
              children: config.label
            })]
          })
        }, viewType);
      })
    })]
  });
};
export default ViewSwitcher;