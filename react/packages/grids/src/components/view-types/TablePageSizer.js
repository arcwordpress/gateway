const defaultPageSizes = [10, 20, 30, 40, 50];

// Requires a TanStack `table` instance. Pass `pageSizes` to override the default options.
const TablePageSizer = ({ table, pageSizes = defaultPageSizes }) => {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();

  return (
    <div className="table-view__page-size">
      <span className="table-view__page-info">
        Page {pageIndex + 1} of {pageCount}
      </span>
      <select
        value={pageSize}
        onChange={(e) => table.setPageSize(Number(e.target.value))}
        className="table-view__select"
      >
        {pageSizes.map((size) => (
          <option key={size} value={size}>
            Show {size}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TablePageSizer;
