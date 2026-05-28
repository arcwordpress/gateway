import TableHead from './TableHead';
import TableBody from './TableBody';

// Renders the <table> wrapper. Defaults to Head + Body if no children provided.
const TableTable = ({ children }) => (
  <div className="table-view__wrapper">
    <table className="table-view__table">
      {children ?? (
        <>
          <TableHead />
          <TableBody />
        </>
      )}
    </table>
  </div>
);

export default TableTable;
