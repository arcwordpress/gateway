function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { useMemo } from 'react';
import Filters from "./Filters";
import Filter from "./Filter";
import { extractUniqueValues } from "../utils/filterUtils";

/**
 * GridFilters Component
 * Renders a collection of filters based on collection metadata
 */
import { jsx as _jsx } from "react/jsx-runtime";
var GridFilters = _ref => {
  var filters = _ref.filters,
    values = _ref.values,
    _onChange = _ref.onChange,
    data = _ref.data,
    isOpen = _ref.isOpen;
  var processedFilters = useMemo(() => {
    return filters.map(filter => {
      if (filter.type === 'select' && !filter.choices) {
        return _objectSpread(_objectSpread({}, filter), {}, {
          choices: extractUniqueValues(data, filter.field)
        });
      }
      return filter;
    });
  }, [filters, data]);
  if (!isOpen) return null;
  return /*#__PURE__*/_jsx("div", {
    className: "gty-grid__filters",
    children: /*#__PURE__*/_jsx("div", {
      className: "gty-grid__filters-container",
      children: /*#__PURE__*/_jsx(Filters, {
        direction: "row",
        children: processedFilters.map(filter => /*#__PURE__*/_jsx(Filter, {
          filter: filter,
          value: values[filter.field],
          onChange: value => _onChange(prev => _objectSpread(_objectSpread({}, prev), {}, {
            [filter.field]: value
          }))
        }, filter.field))
      })
    })
  });
};
export default GridFilters;