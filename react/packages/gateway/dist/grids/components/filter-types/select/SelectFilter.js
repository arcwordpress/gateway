import "./style.css";

/**
 * SelectFilter Component
 * HTML5 select box filter with configurable options
 *
 * @param {Object} props
 * @param {Array} props.choices - Array of {value, label} objects
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.label - Label text for the select
 * @param {string} props.placeholder - Placeholder option text
 * @param {string} props.className - Additional CSS classes
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var SelectFilter = _ref => {
  var _ref$choices = _ref.choices,
    choices = _ref$choices === void 0 ? [] : _ref$choices,
    _ref$value = _ref.value,
    value = _ref$value === void 0 ? '' : _ref$value,
    onChange = _ref.onChange,
    _ref$label = _ref.label,
    label = _ref$label === void 0 ? '' : _ref$label,
    _ref$placeholder = _ref.placeholder,
    placeholder = _ref$placeholder === void 0 ? 'Select...' : _ref$placeholder,
    _ref$className = _ref.className,
    className = _ref$className === void 0 ? '' : _ref$className;
  var handleChange = e => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  return /*#__PURE__*/_jsxs("div", {
    className: ['select-filter', className].filter(Boolean).join(' '),
    children: [label && /*#__PURE__*/_jsx("label", {
      className: "select-filter__label",
      children: label
    }), /*#__PURE__*/_jsxs("select", {
      value: value,
      onChange: handleChange,
      className: "select-filter__control",
      children: [/*#__PURE__*/_jsx("option", {
        value: "",
        children: placeholder
      }), choices.map(choice => /*#__PURE__*/_jsx("option", {
        value: choice.value,
        children: choice.label
      }, choice.value))]
    })]
  });
};
export default SelectFilter;