import { useTableContext } from '../../context/TableContext';

const TableRowCount = ({ table: tableProp, count: countProp }) => {
  const tableCtx = useTableContext();
  const table = tableProp ?? tableCtx;
  const n = countProp ?? table?.options?.data?.length ?? 0;

  return (
    <div className="table-view__row-count">
      {n} {n === 1 ? 'row' : 'rows'}
    </div>
  );
};

export default TableRowCount;
