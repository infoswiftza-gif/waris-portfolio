'use client';

/** Page controls. Disabled buttons rather than hidden ones, so the row of
 * controls does not change width between pages. */
export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="adm-pager">
      <span>
        {total === 0 ? 'No records' : `${from}–${to} of ${total}`}
        {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ''}
      </span>
      <div className="adm-pager-btns">
        <button
          type="button"
          className="adm-btn adm-btn-sm"
          onClick={() => onPage(1)}
          disabled={page <= 1}
        >
          First
        </button>
        <button
          type="button"
          className="adm-btn adm-btn-sm"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
        >
          Prev
        </button>
        <button
          type="button"
          className="adm-btn adm-btn-sm"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
        <button
          type="button"
          className="adm-btn adm-btn-sm"
          onClick={() => onPage(totalPages)}
          disabled={page >= totalPages}
        >
          Last
        </button>
      </div>
    </div>
  );
}

/** Table body placeholder while a request is in flight. */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c}>
              <div className="adm-skel" style={{ width: `${45 + ((r * 7 + c * 13) % 45)}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
