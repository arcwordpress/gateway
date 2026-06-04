import { flexRender } from '@tanstack/react-table';
import { useTableContext } from "../../context/TableContext";

// onRowClick prop overrides the one from TableView context.
import { jsx as _jsx } from "react/jsx-runtime";
var TableBody = _ref => {
  var _ref2;
  var onRowClickProp = _ref.onRowClick;
  var ctx = useTableContext();
  var table = ctx === null || ctx === void 0 ? void 0 : ctx.table;
  var onRowClick = (_ref2 = onRowClickProp !== null && onRowClickProp !== void 0 ? onRowClickProp : ctx === null || ctx === void 0 ? void 0 : ctx.onRowClick) !== null && _ref2 !== void 0 ? _ref2 : null;
  if (!table) return null;
  return /*#__PURE__*/_jsx("tbody", {
    className: "table-view__tbody",
    children: table.getRowModel().rows.map(row => /*#__PURE__*/_jsx("tr", {
      className: "table-view__row table-view__row--body".concat(onRowClick ? ' table-view__row--clickable' : ''),
      onClick: onRowClick ? () => onRowClick(row.original) : undefined,
      children: row.getVisibleCells().map(cell => /*#__PURE__*/_jsx("td", {
        className: "table-view__td",
        children: /*#__PURE__*/_jsx("div", {
          className: "table-view__cell-content",
          children: flexRender(cell.column.columnDef.cell, cell.getContext())
        })
      }, cell.id))
    }, row.id))
  });
};
export default TableBody;