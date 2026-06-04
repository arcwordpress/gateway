import SelectFilter from "./filter-types/select/SelectFilter";
import TextFilter from "./filter-types/text/TextFilter";
import RangeFilter from "./filter-types/range/RangeFilter";
import DateRangeFilter from "./filter-types/date_range/DateRangeFilter";
import CheckboxFacet from "./filter-types/checkbox/CheckboxFacet";

/**
 * Filter Component
 * Generic filter component that renders the appropriate filter type based on config
 *
 * @param {Object} props
 * @param {Object} props.filter - Filter configuration object
 * @param {string} props.filter.type - Filter type ('select', 'text', 'range', 'date_range')
 * @param {string} props.filter.label - Filter label
 * @param {string} props.filter.field - Field name to filter on
 * @param {Array} props.filter.choices - Options for select filter
 * @param {number} props.filter.min - Min value for range filter
 * @param {number} props.filter.max - Max value for range filter
 * @param {*} props.value - Current filter value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.className - Additional CSS classes
 */
import { jsx as _jsx } from "react/jsx-runtime";
var Filter = _ref => {
  var filter = _ref.filter,
    value = _ref.value,
    onChange = _ref.onChange,
    _ref$className = _ref.className,
    className = _ref$className === void 0 ? '' : _ref$className;
  if (!filter || !filter.type) {
    console.warn('Filter component requires a filter config with a type property');
    return null;
  }
  var type = filter.type,
    label = filter.label,
    choices = filter.choices,
    placeholder = filter.placeholder,
    min = filter.min,
    max = filter.max,
    field = filter.field;
  switch (type) {
    case 'select':
      return /*#__PURE__*/_jsx(SelectFilter, {
        label: label,
        choices: choices || [],
        value: value || '',
        onChange: onChange,
        placeholder: placeholder || 'Select...',
        className: className
      });
    case 'text':
      return /*#__PURE__*/_jsx(TextFilter, {
        label: label,
        value: value || '',
        onChange: onChange,
        placeholder: placeholder || 'Search...',
        className: className
      });
    case 'range':
      return /*#__PURE__*/_jsx(RangeFilter, {
        label: label,
        value: value || {
          min: '',
          max: ''
        },
        onChange: onChange,
        min: min,
        max: max,
        minPlaceholder: (placeholder === null || placeholder === void 0 ? void 0 : placeholder.min) || 'Min',
        maxPlaceholder: (placeholder === null || placeholder === void 0 ? void 0 : placeholder.max) || 'Max',
        className: className
      });
    case 'date_range':
      return /*#__PURE__*/_jsx(DateRangeFilter, {
        label: label,
        value: value || {
          start: '',
          end: ''
        },
        onChange: onChange,
        startPlaceholder: (placeholder === null || placeholder === void 0 ? void 0 : placeholder.start) || 'Start Date',
        endPlaceholder: (placeholder === null || placeholder === void 0 ? void 0 : placeholder.end) || 'End Date',
        className: className
      });
    case 'checkbox':
      return /*#__PURE__*/_jsx(CheckboxFacet, {
        label: label,
        value: value || false,
        onChange: onChange,
        className: className
      });
    default:
      console.warn("Unknown filter type: ".concat(type));
      return null;
  }
};
export default Filter;