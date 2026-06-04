function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

/**
 * TextFilter Component
 * Text input filter with debouncing for search functionality
 *
 * @param {Object} props
 * @param {string} props.value - Current filter value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.label - Label text for the input
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.debounce - Debounce delay in ms (default: 300)
 * @param {string} props.className - Additional CSS classes
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var TextFilter = _ref => {
  var _ref$value = _ref.value,
    value = _ref$value === void 0 ? '' : _ref$value,
    onChange = _ref.onChange,
    _ref$label = _ref.label,
    label = _ref$label === void 0 ? '' : _ref$label,
    _ref$placeholder = _ref.placeholder,
    placeholder = _ref$placeholder === void 0 ? 'Search...' : _ref$placeholder,
    _ref$debounce = _ref.debounce,
    debounce = _ref$debounce === void 0 ? 300 : _ref$debounce,
    _ref$className = _ref.className,
    className = _ref$className === void 0 ? '' : _ref$className;
  var _useState = useState(value),
    _useState2 = _slicedToArray(_useState, 2),
    localValue = _useState2[0],
    setLocalValue = _useState2[1];

  // Debounce the onChange callback
  useEffect(() => {
    var timer = setTimeout(() => {
      if (onChange && localValue !== value) {
        onChange(localValue);
      }
    }, debounce);
    return () => clearTimeout(timer);
  }, [localValue, debounce, onChange, value]);

  // Update local value when prop changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  var handleChange = e => {
    setLocalValue(e.target.value);
  };
  return /*#__PURE__*/_jsxs("div", {
    className: "text-filter ".concat(className).trim(),
    children: [label && /*#__PURE__*/_jsx("label", {
      className: "text-filter__label",
      children: label
    }), /*#__PURE__*/_jsxs("div", {
      className: "text-filter__input-wrapper",
      children: [/*#__PURE__*/_jsx(Search, {
        className: "text-filter__icon",
        "aria-hidden": "true"
      }), /*#__PURE__*/_jsx("input", {
        type: "text",
        value: localValue,
        onChange: handleChange,
        placeholder: placeholder,
        className: "text-filter__input"
      })]
    })]
  });
};
export default TextFilter;