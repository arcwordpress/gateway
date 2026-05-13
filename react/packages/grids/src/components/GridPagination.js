const defaultPageSizes = [10, 20, 30, 40, 50];

const GridPagination = ({
  table = null,
  pageIndex,
  pageCount,
  pageSize,
  rowCount,
  pageSizes = defaultPageSizes,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  onPageSizeChange,
  className = '',
}) => {
  const tableState = table?.getState?.()?.pagination || {};
  const currentPageIndex = pageIndex ?? tableState.pageIndex ?? 0;
  const currentPageSize = pageSize ?? tableState.pageSize ?? pageSizes[0];
  const currentPageCount = pageCount ?? table?.getPageCount?.() ?? 0;
  const currentRowCount = rowCount ?? table?.getRowModel?.()?.rows?.length ?? 0;

  const canPreviousPage = table
    ? Boolean(table.getCanPreviousPage?.())
    : currentPageIndex > 0;

  const canNextPage = table
    ? Boolean(table.getCanNextPage?.())
    : currentPageIndex + 1 < currentPageCount;

  const goToFirstPage = () => {
    if (table?.setPageIndex) {
      table.setPageIndex(0);
      return;
    }
    onFirstPage?.();
  };

  const goToPreviousPage = () => {
    if (table?.previousPage) {
      table.previousPage();
      return;
    }
    onPreviousPage?.();
  };

  const goToNextPage = () => {
    if (table?.nextPage) {
      table.nextPage();
      return;
    }
    onNextPage?.();
  };

  const goToLastPage = () => {
    if (table?.setPageIndex) {
      table.setPageIndex(Math.max(currentPageCount - 1, 0));
      return;
    }
    onLastPage?.();
  };

  const changePageSize = (value) => {
    const nextPageSize = Number(value);
    if (table?.setPageSize) {
      table.setPageSize(nextPageSize);
      return;
    }
    onPageSizeChange?.(nextPageSize);
  };

  return (
    <div className={['table-view__pagination', className].filter(Boolean).join(' ')}>
      <div className="table-view__pagination-controls">
        <button
          onClick={goToFirstPage}
          disabled={!canPreviousPage}
          className="table-view__btn table-view__btn--pagination"
        >
          {'<<'}
        </button>
        <button
          onClick={goToPreviousPage}
          disabled={!canPreviousPage}
          className="table-view__btn table-view__btn--pagination"
        >
          {'<'}
        </button>
        <button
          onClick={goToNextPage}
          disabled={!canNextPage}
          className="table-view__btn table-view__btn--pagination"
        >
          {'>'}
        </button>
        <button
          onClick={goToLastPage}
          disabled={!canNextPage}
          className="table-view__btn table-view__btn--pagination"
        >
          {'>>'}
        </button>
      </div>

      <div className="table-view__row-count">
        {currentRowCount} {currentRowCount === 1 ? 'row' : 'rows'}
      </div>

      <div className="table-view__page-size">
        <span className="table-view__page-info">
          Page {currentPageIndex + 1} of {currentPageCount}
        </span>
        <select
          value={currentPageSize}
          onChange={(e) => changePageSize(e.target.value)}
          className="table-view__select"
        >
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default GridPagination;
