import TablePaginationControls from "./TablePaginationControls";
import TableRowCount from "./TableRowCount";
import TablePageSizer from "./TablePageSizer";

// Renders the pagination footer. Defaults to all three controls if no children provided.
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
var TableFooter = _ref => {
  var children = _ref.children;
  return /*#__PURE__*/_jsx("div", {
    className: "table-view__pagination",
    children: children !== null && children !== void 0 ? children : /*#__PURE__*/_jsxs(_Fragment, {
      children: [/*#__PURE__*/_jsx(TablePaginationControls, {}), /*#__PURE__*/_jsx(TableRowCount, {}), /*#__PURE__*/_jsx(TablePageSizer, {})]
    })
  });
};
export default TableFooter;