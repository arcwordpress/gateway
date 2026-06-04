import { useTableContext } from "../../context/TableContext";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var TablePaginationControls = _ref => {
  var tableProp = _ref.table;
  var ctx = useTableContext();
  var table = tableProp !== null && tableProp !== void 0 ? tableProp : ctx === null || ctx === void 0 ? void 0 : ctx.table;
  if (!table) return null;
  return /*#__PURE__*/_jsxs("div", {
    className: "table-view__pagination-controls",
    children: [/*#__PURE__*/_jsx("button", {
      onClick: () => table.setPageIndex(0),
      disabled: !table.getCanPreviousPage(),
      className: "table-view__btn table-view__btn--pagination",
      children: '<<'
    }), /*#__PURE__*/_jsx("button", {
      onClick: () => table.previousPage(),
      disabled: !table.getCanPreviousPage(),
      className: "table-view__btn table-view__btn--pagination",
      children: '<'
    }), /*#__PURE__*/_jsx("button", {
      onClick: () => table.nextPage(),
      disabled: !table.getCanNextPage(),
      className: "table-view__btn table-view__btn--pagination",
      children: '>'
    }), /*#__PURE__*/_jsx("button", {
      onClick: () => table.setPageIndex(table.getPageCount() - 1),
      disabled: !table.getCanNextPage(),
      className: "table-view__btn table-view__btn--pagination",
      children: '>>'
    })]
  });
};
export default TablePaginationControls;