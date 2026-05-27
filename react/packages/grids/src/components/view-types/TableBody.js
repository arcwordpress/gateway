import { flexRender } from '@tanstack/react-table';
import { useTableContext } from '../../context/TableContext';

// onRowClick prop overrides the one from TableView context.
const TableBody = ({ onRowClick: onRowClickProp }) => {
  const ctx = useTableContext();
  const table = ctx?.table;
  const onRowClick = onRowClickProp ?? ctx?.onRowClick ?? null;
  if (!table) return null;

  return (
    <tbody className="table-view__tbody">
      {table.getRowModel().rows.map((row) => (
        <tr
          key={row.id}
          className={`table-view__row table-view__row--body${onRowClick ? ' table-view__row--clickable' : ''}`}
          onClick={onRowClick ? () => onRowClick(row.original) : undefined}
        >
          {row.getVisibleCells().map((cell) => (
            <td key={cell.id} className="table-view__td">
              <div className="table-view__cell-content">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

export default TableBody;
