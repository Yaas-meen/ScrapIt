import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

function SortIcon({ direction }) {
  if (direction === 'asc')  return <ChevronUp size={12} />;
  if (direction === 'desc') return <ChevronDown size={12} />;
  return <ChevronsUpDown size={12} className="opacity-40" />;
}

export default function Table({
  columns  = [],
  data     = [],
  loading  = false,
  skeletonRows = 5,
  emptyIcon,
  emptyTitle   = 'No data',
  emptyMessage,
  sortKey,
  sortDir,
  onSort,
  onRowClick,
  rowKey = '_id',
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">

        {/* Head */}
        <thead className="bg-ink-50/60 text-xs uppercase tracking-wide
          text-ink-500">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={col.sortable && onSort
                  ? () => onSort(col.key)
                  : undefined}
                className={`p-3 font-medium text-left whitespace-nowrap
                  ${col.align === 'right' ? 'text-right' : ''}
                  ${col.sortable ? 'cursor-pointer select-none hover:text-ink-700' : ''}`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <SortIcon direction={sortKey === col.key ? sortDir : null} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i} className="border-b border-ink-100">
                {columns.map((col) => (
                  <td key={col.key} className="p-3">
                    <Skeleton className="h-4 rounded-lg" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  icon={emptyIcon}
                  title={emptyTitle}
                  message={emptyMessage}
                />
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row[rowKey] || row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-ink-100 last:border-0
                  ${onRowClick ? 'cursor-pointer hover:bg-ink-50/60' : ''}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`p-3 ${col.align === 'right' ? 'text-right' : ''}`}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}