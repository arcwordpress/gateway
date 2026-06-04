import { createContext, useContext } from 'react';
var TableContext = /*#__PURE__*/createContext(null);
export var useTableContext = () => useContext(TableContext);
export default TableContext;