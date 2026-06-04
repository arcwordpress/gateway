import "./style.css";

/**
 * RangeFilter Component
 * Min/max numeric range filter
 *
 * @param {Object} props
 * @param {Object} props.value - Current filter value {min: number, max: number}
 * @param {Function} props.onChange - Change handler receives {min, max}
 * @param {string} props.label - Label text for the range
 * @param {number} props.min - Minimum allowed value
 * @param {number} props.max - Maximum allowed value
 * @param {string} props.minPlaceholder - Placeholder for min input
 * @param {string} props.maxPlaceholder - Placeholder for max input
 * @param {string} props.className - Additional CSS classes
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var RangeFilter = _ref => {
  var _ref$value = _ref.value,
    value = _ref$value === void 0 ? {
      min: '',
      max: ''
    } : _ref$value,
    onChange = _ref.onChange,
    _ref$label = _ref.label,
    label = _ref$label === void 0 ? '' : _ref$label,
    min = _ref.min,
    max = _ref.max,
    _ref$minPlaceholder = _ref.minPlaceholder,
    minPlaceholder = _ref$minPlaceholder === void 0 ? 'Min' : _ref$minPlaceholder,
    _ref$maxPlaceholder = _ref.maxPlaceholder,
    maxPlaceholder = _ref$maxPlaceholder === void 0 ? 'Max' : _ref$maxPlaceholder,
    _ref$className = _ref.className,
    className = _ref$className === void 0 ? '' : _ref$className;
  var handleMinChange = e => {
    var newMin = e.target.value;
    if (onChange) {
      onChange({
        min: newMin,
        max: value.max
      });
    }
  };
  var handleMaxChange = e => {
    var newMax = e.target.value;
    if (onChange) {
      onChange({
        min: value.min,
        max: newMax
      });
    }
  };
  return /*#__PURE__*/_jsxs("div", {
    className: ['range-filter', className].filter(Boolean).join(' '),
    children: [label && /*#__PURE__*/_jsx("label", {
      className: "range-filter__label",
      children: label
    }), /*#__PURE__*/_jsxs("div", {
      className: "range-filter__inputs",
      children: [/*#__PURE__*/_jsx("input", {
        type: "number",
        value: value.min,
        onChange: handleMinChange,
        placeholder: minPlaceholder,
        min: min,
        max: max,
        className: "range-filter__input"
      }), /*#__PURE__*/_jsx("span", {
        className: "range-filter__separator",
        children: "to"
      }), /*#__PURE__*/_jsx("input", {
        type: "number",
        value: value.max,
        onChange: handleMaxChange,
        placeholder: maxPlaceholder,
        min: min,
        max: max,
        className: "range-filter__input"
      })]
    })]
  });
};
export default RangeFilter;