import { createContext, useContext } from 'react';

const TableContext = createContext(null);

export const useTableContext = () => useContext(TableContext);

export default TableContext;
