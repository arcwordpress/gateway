import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import TablePaginationControls from './TablePaginationControls';
import TableRowCount from './TableRowCount';
import TablePageSizer from './TablePageSizer';

/**
 * TableView Component with TanStack Table
 * Displays collection data in a sortable, paginated table.
 *
 * Footer visibility:
 *   showPaginationControls — first/prev/next/last buttons (default: true)
 *   showRowCount           — total row count label (default: true)
 *   showPageSizer          — page-info text + per-page select (default: true)
 *   pageSizes              — override the page-size options (default: [10,20,30,40,50])
 */
const TableView = ({
  data = [],
  columns = [],
  loading = false,
  onRowClick = null,
  showPaginationControls = true,
  showRowCount = true,
  showPageSizer = true,
  pageSizes = [10, 20, 30, 40, 50],
}) => {
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSizes[0] ?? 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
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

  const showFooter = showPaginationControls || showRowCount || showPageSizer;

  return (
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

      {showFooter && (
        <div className="table-view__pagination">
          {showPaginationControls && <TablePaginationControls table={table} />}
          {showRowCount && <TableRowCount count={data.length} />}
          {showPageSizer && <TablePageSizer table={table} pageSizes={pageSizes} />}
        </div>
      )}
    </div>
  );
};

export default TableView;
