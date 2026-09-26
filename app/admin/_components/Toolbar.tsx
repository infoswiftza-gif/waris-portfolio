'use client';

/**
 * Search, status filter and sort controls.
 *
 * Search is debounced in the hook, so this stays a plain controlled input. The
 * status filter is only rendered for collections that actually have a
 * `published` flag — offering "Drafts" on the stack page would be a dead end.
 */
export function Toolbar({
  search,
  onSearch,
  status,
  onStatus,
  hasPublished,
  sort,
  dir,
  onSortField,
  onToggleDir,
  sortable,
}: {
  search: string;
  onSearch: (v: string) => void;
  status: 'all' | 'published' | 'draft';
  onStatus: (v: 'all' | 'published' | 'draft') => void;
  hasPublished: boolean;
  sort: string;
  dir: 'asc' | 'desc';
  onSortField: (v: string) => void;
  onToggleDir: () => void;
  sortable: readonly string[];
}) {
  return (
    <div className="adm-toolbar">
      <div className="adm-search">
        <span className="adm-search-icon" aria-hidden="true">
          ⌕
        </span>
        <label className="adm-sr" htmlFor="adm-search-input">
          Search records
        </label>
        <input
          id="adm-search-input"
          className="adm-input"
          type="search"
          value={search}
          placeholder="Search…"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {hasPublished ? (
        <>
          <label className="adm-sr" htmlFor="adm-status-filter">
            Filter by status
          </label>
          <select
            id="adm-status-filter"
            className="adm-select"
            style={{ width: 'auto' }}
            value={status}
            onChange={(e) => onStatus(e.target.value as 'all' | 'published' | 'draft')}
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </>
      ) : null}

      {sortable.length > 1 ? (
        <>
          <label className="adm-sr" htmlFor="adm-sort-field">
            Sort by
          </label>
          <select
            id="adm-sort-field"
            className="adm-select"
            style={{ width: 'auto' }}
            value={sort}
            onChange={(e) => onSortField(e.target.value)}
          >
            <option value="">Default order</option>
            {sortable.map((f) => (
              <option key={f} value={f}>
                Sort: {f}
              </option>
            ))}
          </select>
        </>
      ) : null}

      {sort ? (
        <button type="button" className="adm-btn adm-btn-sm" onClick={onToggleDir}>
          {dir === 'asc' ? '↑ Ascending' : '↓ Descending'}
        </button>
      ) : null}
    </div>
  );
}
