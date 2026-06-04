import "./style.css";

/**
 * DateRangeFilter Component
 * Date range filter with start/end date inputs
 *
 * @param {Object} props
 * @param {Object} props.value - Current filter value {start: string, end: string}
 * @param {Function} props.onChange - Change handler receives {start, end}
 * @param {string} props.label - Label text for the date range
 * @param {string} props.startPlaceholder - Placeholder for start date
 * @param {string} props.endPlaceholder - Placeholder for end date
 * @param {string} props.className - Additional CSS classes
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var DateRangeFilter = _ref => {
  var _ref$value = _ref.value,
    value = _ref$value === void 0 ? {
      start: '',
      end: ''
    } : _ref$value,
    onChange = _ref.onChange,
    _ref$label = _ref.label,
    label = _ref$label === void 0 ? '' : _ref$label,
    _ref$startPlaceholder = _ref.startPlaceholder,
    startPlaceholder = _ref$startPlaceholder === void 0 ? 'Start Date' : _ref$startPlaceholder,
    _ref$endPlaceholder = _ref.endPlaceholder,
    endPlaceholder = _ref$endPlaceholder === void 0 ? 'End Date' : _ref$endPlaceholder,
    _ref$className = _ref.className,
    className = _ref$className === void 0 ? '' : _ref$className;
  var handleStartChange = e => {
    var newStart = e.target.value;
    if (onChange) {
      onChange({
        start: newStart,
        end: value.end
      });
    }
  };
  var handleEndChange = e => {
    var newEnd = e.target.value;
    if (onChange) {
      onChange({
        start: value.start,
        end: newEnd
      });
    }
  };
  return /*#__PURE__*/_jsxs("div", {
    className: ['date-range-filter', className].filter(Boolean).join(' '),
    children: [label && /*#__PURE__*/_jsx("label", {
      className: "date-range-filter__label",
      children: label
    }), /*#__PURE__*/_jsxs("div", {
      className: "date-range-filter__inputs",
      children: [/*#__PURE__*/_jsx("input", {
        type: "date",
        value: value.start,
        onChange: handleStartChange,
        placeholder: startPlaceholder,
        className: "date-range-filter__input"
      }), /*#__PURE__*/_jsx("span", {
        className: "date-range-filter__separator",
        children: "to"
      }), /*#__PURE__*/_jsx("input", {
        type: "date",
        value: value.end,
        onChange: handleEndChange,
        placeholder: endPlaceholder,
        className: "date-range-filter__input"
      })]
    })]
  });
};
export default DateRangeFilter;