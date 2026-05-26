// Accepts either an explicit `count` or a TanStack `table` instance.
const TableRowCount = ({ table, count }) => {
  const n = count ?? table?.options?.data?.length ?? 0;
  return (
    <div className="table-view__row-count">
      {n} {n === 1 ? 'row' : 'rows'}
    </div>
  );
};

export default TableRowCount;
