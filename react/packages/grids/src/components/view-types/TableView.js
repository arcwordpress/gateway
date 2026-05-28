import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import TableContext from '../../context/TableContext';
import TableTable from './TableTable';
import TableHead from './TableHead';
import TableBody from './TableBody';
import TableFooter from './TableFooter';
import TablePaginationControls from './TablePaginationControls';
import TableRowCount from './TableRowCount';
import TablePageSizer from './TablePageSizer';

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
const TableView = ({
  data = [],
  columns = [],
  loading = false,
  onRowClick = null,
  children,
}) => {
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return (
      <div className="table-view__state table-view__state--loading">
        <div className="table-view__message">Loading...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-view__state table-view__state--empty">
        <div className="table-view__message">No records available.</div>
      </div>
    );
  }

  return (
    <TableContext.Provider value={{ table, onRowClick }}>
      <div className="table-view">
        {children ?? (
          <>
            <TableTable />
            <TableFooter />
          </>
        )}
      </div>
    </TableContext.Provider>
  );
};

TableView.Table = TableTable;
TableView.Head = TableHead;
TableView.Body = TableBody;
TableView.Footer = TableFooter;
TableView.PaginationControls = TablePaginationControls;
TableView.RowCount = TableRowCount;
TableView.PageSizer = TablePageSizer;

export default TableView;
