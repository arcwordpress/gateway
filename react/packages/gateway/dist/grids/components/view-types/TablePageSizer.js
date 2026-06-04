import { useTableContext } from "../../context/TableContext";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
var defaultPageSizes = [10, 20, 30, 40, 50];
var TablePageSizer = _ref => {
  var tableProp = _ref.table,
    _ref$pageSizes = _ref.pageSizes,
    pageSizes = _ref$pageSizes === void 0 ? defaultPageSizes : _ref$pageSizes;
  var ctx = useTableContext();
  var table = tableProp !== null && tableProp !== void 0 ? tableProp : ctx === null || ctx === void 0 ? void 0 : ctx.table;
  if (!table) return null;
  var _table$getState$pagin = table.getState().pagination,
    pageIndex = _table$getState$pagin.pageIndex,
    pageSize = _table$getState$pagin.pageSize;
  var pageCount = table.getPageCount();
  return /*#__PURE__*/_jsxs("div", {
    className: "table-view__page-size",
    children: [/*#__PURE__*/_jsxs("span", {
      className: "table-view__page-info",
      children: ["Page ", pageIndex + 1, " of ", pageCount]
    }), /*#__PURE__*/_jsx("select", {
      value: pageSize,
      onChange: e => table.setPageSize(Number(e.target.value)),
      className: "table-view__select",
      children: pageSizes.map(size => /*#__PURE__*/_jsxs("option", {
        value: size,
        children: ["Show ", size]
      }, size))
    })]
  });
};
export default TablePageSizer;