const TablePaginationControls = ({ table }) => (
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
);

export default TablePaginationControls;
