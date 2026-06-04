function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import { useState } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel } from '@tanstack/react-table';
import TableContext from "../../context/TableContext";
import TableTable from "./TableTable";
import TableHead from "./TableHead";
import TableBody from "./TableBody";
import TableFooter from "./TableFooter";
import TablePaginationControls from "./TablePaginationControls";
import TableRowCount from "./TableRowCount";
import TablePageSizer from "./TablePageSizer";

/**
 * TableView — compound component.
 *
 * With no children it renders everything (table + full footer).
 * Pass children to control exactly what renders:
 *
 *   <TableView data={rows} columns={cols} onRowClick={handler}>
 *     <TableView.Table>
 *       <TableView.Head />
 *       <TableView.Body />
 *     </TableView.Table>
 *     <TableView.Footer>
 *       <TableView.PaginationControls />
 *       <TableView.RowCount />
 *     </TableView.Footer>
 *   </TableView>
 *
 * Each level defaults to its own children when none are provided, so
 * <TableView.Table /> alone renders Head + Body, and <TableView.Footer />
 * alone renders all three pagination controls.
 */
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
var TableView = _ref => {
  var _ref$data = _ref.data,
    data = _ref$data === void 0 ? [] : _ref$data,
    _ref$columns = _ref.columns,
    columns = _ref$columns === void 0 ? [] : _ref$columns,
    _ref$loading = _ref.loading,
    loading = _ref$loading === void 0 ? false : _ref$loading,
    _ref$onRowClick = _ref.onRowClick,
    onRowClick = _ref$onRowClick === void 0 ? null : _ref$onRowClick,
    children = _ref.children;
  var _useState = useState([]),
    _useState2 = _slicedToArray(_useState, 2),
    sorting = _useState2[0],
    setSorting = _useState2[1];
  var _useState3 = useState({
      pageIndex: 0,
      pageSize: 10
    }),
    _useState4 = _slicedToArray(_useState3, 2),
    pagination = _useState4[0],
    setPagination = _useState4[1];
  var table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });
  if (loading) {
    return /*#__PURE__*/_jsx("div", {
      className: "table-view__state table-view__state--loading",
      children: /*#__PURE__*/_jsx("div", {
        className: "table-view__message",
        children: "Loading..."
      })
    });
  }
  if (!data || data.length === 0) {
    return /*#__PURE__*/_jsx("div", {
      className: "table-view__state table-view__state--empty",
      children: /*#__PURE__*/_jsx("div", {
        className: "table-view__message",
        children: "No records available."
      })
    });
  }
  return /*#__PURE__*/_jsx(TableContext.Provider, {
    value: {
      table,
      onRowClick
    },
    children: /*#__PURE__*/_jsx("div", {
      className: "table-view",
      children: children !== null && children !== void 0 ? children : /*#__PURE__*/_jsxs(_Fragment, {
        children: [/*#__PURE__*/_jsx(TableTable, {}), /*#__PURE__*/_jsx(TableFooter, {})]
      })
    })
  });
};
TableView.Table = TableTable;
TableView.Head = TableHead;
TableView.Body = TableBody;
TableView.Footer = TableFooter;
TableView.PaginationControls = TablePaginationControls;
TableView.RowCount = TableRowCount;
TableView.PageSizer = TablePageSizer;
export default TableView;