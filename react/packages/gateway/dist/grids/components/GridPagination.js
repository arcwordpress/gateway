import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var defaultPageSizes = [10, 20, 30, 40, 50];
var GridPagination = _ref => {
  var _table$getState, _ref2, _ref3, _ref4, _table$getPageCount, _ref5, _table$getRowModel, _table$getCanPrevious, _table$getCanNextPage;
  var _ref$table = _ref.table,
    table = _ref$table === void 0 ? null : _ref$table,
    pageIndex = _ref.pageIndex,
    pageCount = _ref.pageCount,
    pageSize = _ref.pageSize,
    rowCount = _ref.rowCount,
    _ref$pageSizes = _ref.pageSizes,
    pageSizes = _ref$pageSizes === void 0 ? defaultPageSizes : _ref$pageSizes,
    onFirstPage = _ref.onFirstPage,
    onPreviousPage = _ref.onPreviousPage,
    onNextPage = _ref.onNextPage,
    onLastPage = _ref.onLastPage,
    onPageSizeChange = _ref.onPageSizeChange,
    _ref$className = _ref.className,
    className = _ref$className === void 0 ? '' : _ref$className;
  var tableState = (table === null || table === void 0 || (_table$getState = table.getState) === null || _table$getState === void 0 || (_table$getState = _table$getState.call(table)) === null || _table$getState === void 0 ? void 0 : _table$getState.pagination) || {};
  var currentPageIndex = (_ref2 = pageIndex !== null && pageIndex !== void 0 ? pageIndex : tableState.pageIndex) !== null && _ref2 !== void 0 ? _ref2 : 0;
  var currentPageSize = (_ref3 = pageSize !== null && pageSize !== void 0 ? pageSize : tableState.pageSize) !== null && _ref3 !== void 0 ? _ref3 : pageSizes[0];
  var currentPageCount = (_ref4 = pageCount !== null && pageCount !== void 0 ? pageCount : table === null || table === void 0 || (_table$getPageCount = table.getPageCount) === null || _table$getPageCount === void 0 ? void 0 : _table$getPageCount.call(table)) !== null && _ref4 !== void 0 ? _ref4 : 0;
  var currentRowCount = (_ref5 = rowCount !== null && rowCount !== void 0 ? rowCount : table === null || table === void 0 || (_table$getRowModel = table.getRowModel) === null || _table$getRowModel === void 0 || (_table$getRowModel = _table$getRowModel.call(table)) === null || _table$getRowModel === void 0 || (_table$getRowModel = _table$getRowModel.rows) === null || _table$getRowModel === void 0 ? void 0 : _table$getRowModel.length) !== null && _ref5 !== void 0 ? _ref5 : 0;
  var canPreviousPage = table ? Boolean((_table$getCanPrevious = table.getCanPreviousPage) === null || _table$getCanPrevious === void 0 ? void 0 : _table$getCanPrevious.call(table)) : currentPageIndex > 0;
  var canNextPage = table ? Boolean((_table$getCanNextPage = table.getCanNextPage) === null || _table$getCanNextPage === void 0 ? void 0 : _table$getCanNextPage.call(table)) : currentPageIndex + 1 < currentPageCount;
  var goToFirstPage = () => {
    if (table !== null && table !== void 0 && table.setPageIndex) {
      table.setPageIndex(0);
      return;
    }
    onFirstPage === null || onFirstPage === void 0 || onFirstPage();
  };
  var goToPreviousPage = () => {
    if (table !== null && table !== void 0 && table.previousPage) {
      table.previousPage();
      return;
    }
    onPreviousPage === null || onPreviousPage === void 0 || onPreviousPage();
  };
  var goToNextPage = () => {
    if (table !== null && table !== void 0 && table.nextPage) {
      table.nextPage();
      return;
    }
    onNextPage === null || onNextPage === void 0 || onNextPage();
  };
  var goToLastPage = () => {
    if (table !== null && table !== void 0 && table.setPageIndex) {
      table.setPageIndex(Math.max(currentPageCount - 1, 0));
      return;
    }
    onLastPage === null || onLastPage === void 0 || onLastPage();
  };
  var changePageSize = value => {
    var nextPageSize = Number(value);
    if (table !== null && table !== void 0 && table.setPageSize) {
      table.setPageSize(nextPageSize);
      return;
    }
    onPageSizeChange === null || onPageSizeChange === void 0 || onPageSizeChange(nextPageSize);
  };
  return /*#__PURE__*/_jsxs("div", {
    className: ['table-view__pagination', className].filter(Boolean).join(' '),
    children: [/*#__PURE__*/_jsxs("div", {
      className: "table-view__pagination-controls",
      children: [/*#__PURE__*/_jsx("button", {
        onClick: goToFirstPage,
        disabled: !canPreviousPage,
        className: "table-view__btn table-view__btn--pagination",
        children: '<<'
      }), /*#__PURE__*/_jsx("button", {
        onClick: goToPreviousPage,
        disabled: !canPreviousPage,
        className: "table-view__btn table-view__btn--pagination",
        children: '<'
      }), /*#__PURE__*/_jsx("button", {
        onClick: goToNextPage,
        disabled: !canNextPage,
        className: "table-view__btn table-view__btn--pagination",
        children: '>'
      }), /*#__PURE__*/_jsx("button", {
        onClick: goToLastPage,
        disabled: !canNextPage,
        className: "table-view__btn table-view__btn--pagination",
        children: '>>'
      })]
    }), /*#__PURE__*/_jsxs("div", {
      className: "table-view__row-count",
      children: [currentRowCount, " ", currentRowCount === 1 ? 'row' : 'rows']
    }), /*#__PURE__*/_jsxs("div", {
      className: "table-view__page-size",
      children: [/*#__PURE__*/_jsxs("span", {
        className: "table-view__page-info",
        children: ["Page ", currentPageIndex + 1, " of ", currentPageCount]
      }), /*#__PURE__*/_jsx("select", {
        value: currentPageSize,
        onChange: e => changePageSize(e.target.value),
        className: "table-view__select",
        children: pageSizes.map(size => /*#__PURE__*/_jsxs("option", {
          value: size,
          children: ["Show ", size]
        }, size))
      })]
    })]
  });
};
export default GridPagination;