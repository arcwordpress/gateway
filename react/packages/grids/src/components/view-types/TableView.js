import { useState } from '@wordpress/element';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

/**
 * TableView Component with TanStack Table
 * Displays collection data in a sortable, paginated table
 */
const TableView = ({
  data = [],
  columns = [],
  loading = false,
  onRowClick = null,
}) => {
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
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

  return (
    <div className="table-view">
      <div className="table-view__wrapper">
        <table className="table-view__table">
          <thead className="table-view__thead">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="table-view__row">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="table-view__th"
                  >
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
                  <td
                    key={cell.id}
                    className="table-view__td"
                  >
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

      {/* Pagination */}
      <div className="table-view__pagination">
        <div className="table-view__pagination-controls">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="table-view__btn table-view__btn--pagination"
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="table-view__btn table-view__btn--pagination"
          >
            {'<'}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="table-view__btn table-view__btn--pagination"
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="table-view__btn table-view__btn--pagination"
          >
            {'>>'}
          </button>
        </div>

        <div className="table-view__row-count">
          {data.length} {data.length === 1 ? 'row' : 'rows'}
        </div>

        <div className="table-view__page-size">
          <span className="table-view__page-info">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="table-view__select"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TableView;
