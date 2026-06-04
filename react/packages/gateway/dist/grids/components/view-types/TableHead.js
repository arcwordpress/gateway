import { flexRender } from '@tanstack/react-table';
import { useTableContext } from "../../context/TableContext";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var TableHead = () => {
  var ctx = useTableContext();
  var table = ctx === null || ctx === void 0 ? void 0 : ctx.table;
  if (!table) return null;
  return /*#__PURE__*/_jsx("thead", {
    className: "table-view__thead",
    children: table.getHeaderGroups().map(headerGroup => /*#__PURE__*/_jsx("tr", {
      className: "table-view__row",
      children: headerGroup.headers.map(header => {
        var _asc$desc$header$colu;
        return /*#__PURE__*/_jsx("th", {
          className: "table-view__th",
          children: header.isPlaceholder ? null : /*#__PURE__*/_jsxs("div", {
            className: header.column.getCanSort() ? 'table-view__header table-view__header--sortable' : 'table-view__header',
            onClick: header.column.getToggleSortingHandler(),
            children: [flexRender(header.column.columnDef.header, header.getContext()), header.column.getCanSort() && /*#__PURE__*/_jsx("span", {
              className: "table-view__sort-icon",
              children: (_asc$desc$header$colu = {
                asc: '↑',
                desc: '↓'
              }[header.column.getIsSorted()]) !== null && _asc$desc$header$colu !== void 0 ? _asc$desc$header$colu : '⇅'
            })]
          })
        }, header.id);
      })
    }, headerGroup.id))
  });
};
export default TableHead;