import { jsx as _jsx } from "react/jsx-runtime";
/**
 * FilterGroup Component
 * Layout container for filter components with configurable direction (row/stack)
 */
var FilterGroup = _ref => {
  var children = _ref.children,
    _ref$direction = _ref.direction,
    direction = _ref$direction === void 0 ? 'row' : _ref$direction,
    _ref$className = _ref.className,
    className = _ref$className === void 0 ? '' : _ref$className;
  var baseClass = 'filters';
  var directionClasses = {
    row: 'filters--row',
    stack: 'filters--stack'
  };
  var combinedClasses = [baseClass, directionClasses[direction] || directionClasses.row, className].filter(Boolean).join(' ');
  return /*#__PURE__*/_jsx("div", {
    className: combinedClasses,
    children: children
  });
};
var Filters = FilterGroup;
export { FilterGroup, Filters };
export default FilterGroup;