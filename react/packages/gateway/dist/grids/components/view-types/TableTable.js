import TableHead from "./TableHead";
import TableBody from "./TableBody";

// Renders the <table> wrapper. Defaults to Head + Body if no children provided.
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
var TableTable = _ref => {
  var children = _ref.children;
  return /*#__PURE__*/_jsx("div", {
    className: "table-view__wrapper",
    children: /*#__PURE__*/_jsx("table", {
      className: "table-view__table",
      children: children !== null && children !== void 0 ? children : /*#__PURE__*/_jsxs(_Fragment, {
        children: [/*#__PURE__*/_jsx(TableHead, {}), /*#__PURE__*/_jsx(TableBody, {})]
      })
    })
  });
};
export default TableTable;