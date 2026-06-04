import { ListFilter } from 'lucide-react';
import { jsx as _jsx } from "react/jsx-runtime";
var FilterIcon = _ref => {
  var onClick = _ref.onClick,
    isOpen = _ref.isOpen;
  return /*#__PURE__*/_jsx("button", {
    onClick: onClick,
    className: "filter-icon-button",
    "aria-label": "Toggle filters",
    "aria-expanded": isOpen,
    children: /*#__PURE__*/_jsx(ListFilter, {
      size: 24,
      className: "view-switcher__icon"
    })
  });
};
export default FilterIcon;