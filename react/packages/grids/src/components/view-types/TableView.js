import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import TableContext from '../../context/TableContext';
import TablePaginationControls from './TablePaginationControls';
import TableRowCount from './TableRowCount';
import TablePageSizer from './TablePageSizer';

/**
 * TableView — compound component.
 *
 * Render sub-components as children to include them; omit to exclude them.
 *
 *   <TableView data={rows} columns={cols}>
 *     <TableView.PaginationControls />
 *     <TableView.RowCount />
 *     <TableView.PageSizer />
 *   </TableView>
 *
 * Sub-components can also be used standalone by passing a `table` prop
 * from your own useReactTable instance.
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
    <TableContext.Provider value={table}>
      <div className="table-view">
        <div className="table-view__wrapper">
          <table className="table-view__table">
            <thead className="table-view__thead">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="table-view__row">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="table-view__th">
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'table-view__header table-view__header--sortable'
                              : 'table-view__header'
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="table-view__sort-icon">
                              {{
                                asc: '↑',
                                desc: '↓',
                              }[header.column.getIsSorted()] ?? '⇅'}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="table-view__tbody">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`table-view__row table-view__row--body${onRowClick ? ' table-view__row--clickable' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="table-view__td">
                      <div className="table-view__cell-content">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {children && (
          <div className="table-view__pagination">
            {children}
          </div>
        )}
      </div>
    </TableContext.Provider>
  );
};

TableView.PaginationControls = TablePaginationControls;
TableView.RowCount = TableRowCount;
TableView.PageSizer = TablePageSizer;

export default TableView;
