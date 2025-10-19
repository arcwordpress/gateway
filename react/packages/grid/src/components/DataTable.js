import { useState, useMemo, useEffect } from '@wordpress/element';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import Filters from './filters/Filters';
import Filter from './filters/Filter';

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
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Filters Section */}
      <Filters direction="row">
        {filterConfigs.map((filterConfig) => (
          <Filter
            key={filterConfig.field}
            filter={filterConfig}
            value={filterValues[filterConfig.field]}
            onChange={(value) => handleFilterChange(filterConfig.field, value)}
          />
        ))}
        <div className="text-sm text-gray-500 self-end pb-2">
          {table.getFilteredRowModel().rows.length} of {data.length} row(s)
        </div>
      </Filters>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div>
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none flex items-center gap-2 hover:text-gray-700'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {{
                                asc: '↑',
                                desc: '↓',
                              }[header.column.getIsSorted()] ?? '⇅'}
                            </span>
                          )}
                        </div>
                        {header.column.getCanFilter() && (
                          <div className="mt-1">
                            <input
                              type="text"
                              value={(header.column.getFilterValue() ?? '')}
                              onChange={(e) =>
                                header.column.setFilterValue(e.target.value)
                              }
                              placeholder={`Filter...`}
                              className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {'<'}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {'>>'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
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
