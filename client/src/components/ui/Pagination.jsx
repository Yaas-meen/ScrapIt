import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page,
  pages,
  total,
  limit,
  onPage,
}) {
  if (pages <= 1) return null;

  const from  = (page - 1) * limit + 1;
  const to    = Math.min(page * limit, total);

  const getRange = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(1, page - delta);
      i <= Math.min(pages, page + delta);
      i++
    ) {
      range.push(i);
    }
    return range;
  };

  const btnCls = (active, disabled) =>
    `inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm
     font-medium transition select-none
     ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
     ${active
       ? 'bg-eco-600 text-white'
       : 'bg-white border border-ink-200 text-ink-600 hover:bg-ink-50'}`;

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <p className="text-sm text-ink-500">
        Showing <strong>{from}–{to}</strong> of <strong>{total}</strong>
      </p>

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => page > 1 && onPage(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className={btnCls(false, page === 1)}
        >
          <ChevronLeft size={14} />
        </button>

        {/* First */}
        {getRange()[0] > 1 && (
          <>
            <button onClick={() => onPage(1)} className={btnCls(false, false)}>
              1
            </button>
            {getRange()[0] > 2 && (
              <span className="text-ink-400 px-1">…</span>
            )}
          </>
        )}

        {/* Page numbers */}
        {getRange().map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={btnCls(p === page, false)}
          >
            {p}
          </button>
        ))}

        {/* Last */}
        {getRange().at(-1) < pages && (
          <>
            {getRange().at(-1) < pages - 1 && (
              <span className="text-ink-400 px-1">…</span>
            )}
            <button onClick={() => onPage(pages)} className={btnCls(false, false)}>
              {pages}
            </button>
          </>
        )}

        {/* Next */}
        <button
          onClick={() => page < pages && onPage(page + 1)}
          disabled={page === pages}
          aria-label="Next page"
          className={btnCls(false, page === pages)}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}