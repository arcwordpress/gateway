import { useState, useMemo, useEffect } from '@wordpress/element';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Filters, Filter } from '@arcwp/gateway-filters';
import '../style.css';

/**
 * DataTable Component with TanStack Table
 * Displays collection data in a sortable, filterable table
 */
const DataTable = ({ data = [], columns = [], loading = false, filters = [] }) => {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  // Initialize filter values based on filter configs
  const initialFilterValues = useMemo(() => {
    const values = {};
    filters.forEach((filter) => {
      if (filter.type === 'date_range' || filter.type === 'range') {
        values[filter.field] = filter.type === 'date_range'
          ? { start: '', end: '' }
          : { min: '', max: '' };
      } else {
        values[filter.field] = '';
      }
    });
    return values;
  }, [filters]);

  const [filterValues, setFilterValues] = useState(initialFilterValues);

  // Update filter values when filters prop changes
  useEffect(() => {
    setFilterValues(initialFilterValues);
  }, [initialFilterValues]);

  // Pre-filter data for filters that don't rely on columns (like date_range)
  const preFilteredData = useMemo(() => {
    let filtered = data;

    filters.forEach((filter) => {
      const value = filterValues[filter.field];

      if (filter.type === 'date_range' && value && (value.start || value.end)) {
        // Apply date range filter
        filtered = filtered.filter((row) => {
          const cellValue = row[filter.field];
          if (!cellValue) return false;

          const cellDate = new Date(cellValue);
          if (isNaN(cellDate.getTime())) return false;

          if (value.start) {
            const startDate = new Date(value.start);
            startDate.setHours(0, 0, 0, 0);
            if (cellDate < startDate) return false;
          }

          if (value.end) {
            const endDate = new Date(value.end);
            endDate.setHours(23, 59, 59, 999);
            if (cellDate > endDate) return false;
          }

          return true;
        });
      }
    });

    return filtered;
  }, [data, filterValues, filters]);

  // Process filter configurations - add dynamic choices for select filters
  const filterConfigs = useMemo(() => {
    return filters.map((filter) => {
      // For select filters, auto-generate choices from data if not provided
      if (filter.type === 'select' && !filter.choices) {
        const choices = new Set();
        data.forEach((row) => {
          const value = row[filter.field];
          if (value) {
            choices.add(value);
          }
        });

        return {
          ...filter,
          choices: Array.from(choices).map((value) => ({
            value,
            label: typeof value === 'string'
              ? value.charAt(0).toUpperCase() + value.slice(1)
              : String(value),
          })),
        };
      }

      return filter;
    });
  }, [filters, data]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilterValues((prev) => ({ ...prev, [field]: value }));

    // Find the filter config for this field
    const filterConfig = filters.find((f) => f.field === field);
    if (!filterConfig) return;

    // Handle different filter types
    if (filterConfig.type === 'text') {
      // Text filters use global filter
      setGlobalFilter(value);
    } else if (filterConfig.type === 'select') {
      // Select filters use column filters
      if (value) {
        const otherFilters = columnFilters.filter((f) => f.id !== field);
        setColumnFilters([...otherFilters, { id: field, value }]);
      } else {
        setColumnFilters(columnFilters.filter((f) => f.id !== field));
      }
    }
    // Note: date_range and range filters are handled via pre-filtering
  };

  const table = useReactTable({
    data: preFilteredData, // Use pre-filtered data instead of raw data
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Handle loading and empty states in render instead of early returns
  if (loading) {
    return (
      <div className="data-table__state data-table__state--loading">
        <div className="data-table__message">Loading...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="data-table__state data-table__state--empty">
        <div className="data-table__message">No data available</div>
      </div>
    );
  }

  return (
    <div className="data-table">
      {/* Filters Section */}
      <div className="data-table__filters">
        <Filters direction="row">
          {filterConfigs.map((filterConfig) => (
            <Filter
              key={filterConfig.field}
              filter={filterConfig}
              value={filterValues[filterConfig.field]}
              onChange={(value) => handleFilterChange(filterConfig.field, value)}
            />
          ))}
        </Filters>
      </div>

      {/* Table */}
      <div className="data-table__wrapper">
        <table className="data-table__table">
          <thead className="data-table__thead">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="data-table__row">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="data-table__th"
                  >
                    {header.isPlaceholder ? null : (
                      <div>
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'data-table__header data-table__header--sortable'
                              : 'data-table__header'
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="data-table__sort-icon">
                              {{
                                asc: '↑',
                                desc: '↓',
                              }[header.column.getIsSorted()] ?? '⇅'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="data-table__tbody">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="data-table__row data-table__row--body">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="data-table__td"
                  >
                    <div className="data-table__cell-content">
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
      <div className="data-table__pagination">
        <div className="data-table__pagination-controls">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="data-table__btn data-table__btn--pagination"
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="data-table__btn data-table__btn--pagination"
          >
            {'<'}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="data-table__btn data-table__btn--pagination"
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="data-table__btn data-table__btn--pagination"
          >
            {'>>'}
          </button>
        </div>

        <div className="data-table__row-count">
          {table.getFilteredRowModel().rows.length} of {data.length} row(s)
        </div>

        <div className="data-table__page-size">
          <span className="data-table__page-info">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="data-table__select"
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

export default DataTable;
