import { cn } from '../../utils/cn';

interface Column<T = any> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({ columns, data, onRowClick, emptyMessage }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="card flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-gray-400">{emptyMessage || 'No hay datos disponibles'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden !p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {columns.map((col) => (
                <th key={col.key} className={cn('text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3', col.className)}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((item, i) => (
              <tr
                key={item._id || i}
                className={cn('transition-colors', onRowClick && 'cursor-pointer hover:bg-white/5')}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3 text-sm', col.className)}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
