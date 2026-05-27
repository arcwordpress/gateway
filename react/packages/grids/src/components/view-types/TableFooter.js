import TablePaginationControls from './TablePaginationControls';
import TableRowCount from './TableRowCount';
import TablePageSizer from './TablePageSizer';

// Renders the pagination footer. Defaults to all three controls if no children provided.
const TableFooter = ({ children }) => (
  <div className="table-view__pagination">
    {children ?? (
      <>
        <TablePaginationControls />
        <TableRowCount />
        <TablePageSizer />
      </>
    )}
  </div>
);

export default TableFooter;
