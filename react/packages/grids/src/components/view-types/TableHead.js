import { flexRender } from '@tanstack/react-table';
import { useTableContext } from '../../context/TableContext';

const TableHead = () => {
  const ctx = useTableContext();
  const table = ctx?.table;
  if (!table) return null;

  return (
    <thead className="table-view__thead">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id} className="table-view__row">
          {headerGroup.headers.map((header) => (
            <th key={header.id} className="table-view__th">
              {header.isPlaceholder ? null : (
                <div
                  className={
                    header.column.getCanSort()
                      ? 'table-view__header table-view__header--sortable'
                      : 'table-view__header'
                  }
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getCanSort() && (
                    <span className="table-view__sort-icon">
                      {{
                        asc: '↑',
                        desc: '↓',
                      }[header.column.getIsSorted()] ?? '⇅'}
                    </span>
                  )}
                </div>
              )}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
};

export default TableHead;
