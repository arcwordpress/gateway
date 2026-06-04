import "./style.css";

/**
 * CheckboxFacet Component
 * Boolean toggle facet for filtering
 *
 * @param {Object} props
 * @param {boolean} props.value - Current checked state
 * @param {Function} props.onChange - Change handler receives boolean
 * @param {string} props.label - Label text
 * @param {string} props.className - Additional CSS classes
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var CheckboxFacet = _ref => {
  var _ref$value = _ref.value,
    value = _ref$value === void 0 ? false : _ref$value,
    _onChange = _ref.onChange,
    _ref$label = _ref.label,
    label = _ref$label === void 0 ? '' : _ref$label,
    _ref$className = _ref.className,
    className = _ref$className === void 0 ? '' : _ref$className;
  return /*#__PURE__*/_jsx("div", {
    className: ['checkbox-facet', className].filter(Boolean).join(' '),
    children: /*#__PURE__*/_jsxs("label", {
      className: "checkbox-facet__label",
      children: [/*#__PURE__*/_jsx("input", {
        type: "checkbox",
        checked: !!value,
        onChange: e => _onChange && _onChange(e.target.checked),
        className: "checkbox-facet__input"
      }), label && /*#__PURE__*/_jsx("span", {
        className: "checkbox-facet__text",
        children: label
      })]
    })
  });
};
export default CheckboxFacet;