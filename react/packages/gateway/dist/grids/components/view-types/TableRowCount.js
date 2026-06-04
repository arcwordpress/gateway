import { useTableContext } from "../../context/TableContext";
import { jsxs as _jsxs } from "react/jsx-runtime";
var TableRowCount = _ref => {
  var _ref2, _table$options;
  var tableProp = _ref.table,
    countProp = _ref.count;
  var ctx = useTableContext();
  var table = tableProp !== null && tableProp !== void 0 ? tableProp : ctx === null || ctx === void 0 ? void 0 : ctx.table;
  var n = (_ref2 = countProp !== null && countProp !== void 0 ? countProp : table === null || table === void 0 || (_table$options = table.options) === null || _table$options === void 0 || (_table$options = _table$options.data) === null || _table$options === void 0 ? void 0 : _table$options.length) !== null && _ref2 !== void 0 ? _ref2 : 0;
  return /*#__PURE__*/_jsxs("div", {
    className: "table-view__row-count",
    children: [n, " ", n === 1 ? 'row' : 'rows']
  });
};
export default TableRowCount;