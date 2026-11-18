import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ListFilter, RotateCcw, Search, SearchX, X } from 'lucide-react';
import {
  AGE_BANDS,
  filterRecords,
  records,
  recordsCSV,
  sortRecords,
  summarize,
  type SortKey,
} from '../lib/cohort';
import { setFilters } from '../lib/navigation';
import { ExportButton, PageIntro, SelectField } from '../components/Shared';
import { RecordTable } from '../components/Records';

export function Explorer({ params }: { params: URLSearchParams }) {
  const query = params.get('q') || '';
  const ageBand = AGE_BANDS.includes(params.get('age') || '') ? params.get('age')! : '';
  const label = ['YES', 'NO'].includes(params.get('label') || '') ? params.get('label')! : '';
  const score = /^(10|[0-9])$/.test(params.get('score') ?? '') ? params.get('score')! : '';
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: 'id', desc: false });
  const search = useRef<HTMLInputElement>(null);
  const rows = useMemo(
    () =>
      sortRecords(filterRecords(records, { query, ageBand, label, score }), sort.key, sort.desc),
    [query, ageBand, label, score, sort],
  );
  const stats = useMemo(() => summarize(rows), [rows]);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize)),
    current = Math.min(pageNumber, pages);
  const start = (current - 1) * pageSize;
  const active = [query, ageBand, label, score].filter(Boolean).length;
  function update(change: Record<string, string>) {
    setPageNumber(1);
    setFilters('explorer', params, change);
  }
  function reset() {
    update({ q: '', age: '', score: '', label: '' });
  }
  useEffect(() => {
    const shortcut = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !(e.target instanceof HTMLInputElement) &&
        !document.querySelector('dialog[open]')
      ) {
        e.preventDefault();
        search.current?.focus();
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);
  return (
    <>
      <PageIntro
        eyebrow="Cohort workspace"
        title="Data explorer"
        description="Find a cohort, inspect its responses, and export the matching records."
        action={
          <ExportButton filename="spectrum-atlas-cohort.csv" content={() => recordsCSV(rows)}>
            Export CSV
          </ExportButton>
        }
      />
      <section className="panel explorer-filters" aria-label="Cohort filters">
        <div className="filter-heading">
          <h2>
            <ListFilter size={17} />
            Cohort filters
          </h2>
          <button className="reset-link" onClick={reset} disabled={!active}>
            <RotateCcw size={13} />
            Reset filters
          </button>
        </div>
        <div className="filter-controls">
          <div className="select-field search-field">
            <label htmlFor="search-records">Search records</label>
            <span className="search-box">
              <Search size={16} />
              <input
                id="search-records"
                ref={search}
                type="text"
                value={query}
                onChange={(e) => update({ q: e.target.value })}
                placeholder="Country or record ID…"
              />
              {query ? (
                <button aria-label="Clear search" onClick={() => update({ q: '' })}>
                  <X size={14} />
                </button>
              ) : (
                <kbd>/</kbd>
              )}
            </span>
          </div>
          <SelectField
            name="age"
            label="Age band"
            value={ageBand}
            onChange={(v) => update({ age: v })}
            options={[
              { value: '', text: 'All age bands' },
              ...AGE_BANDS.map((v) => ({ value: v, text: v })),
            ]}
          />
          <SelectField
            name="label"
            label="Screening label"
            value={label}
            onChange={(v) => update({ label: v })}
            options={[
              { value: '', text: 'All labels' },
              { value: 'YES', text: 'Positive' },
              { value: 'NO', text: 'Negative' },
            ]}
          />
          <SelectField
            name="score"
            label="AQ-10 score"
            value={score}
            onChange={(v) => update({ score: v })}
            options={[
              { value: '', text: 'All scores' },
              ...Array.from({ length: 11 }, (_, i) => ({ value: String(i), text: String(i) })),
            ]}
          />
        </div>
      </section>
      <div className="cohort-summary" aria-live="polite">
        <div>
          <span className="summary-dot" />
          <strong>{rows.length}</strong>
          <span>matching records</span>
        </div>
        <div>
          <strong>{stats.mean?.toFixed(2) ?? '—'}</strong>
          <span>mean score</span>
        </div>
        <div>
          <strong>{stats.count ? `${stats.positiveRate.toFixed(1)}%` : '—'}</strong>
          <span>positive screens</span>
        </div>
      </div>
      <section className="panel explorer-table">
        <div className="preview-heading">
          <div>
            <div className="figure-label">
              <i />
              Cohort browser
            </div>
            <h2>Screening records</h2>
          </div>
          <span className="count-tag">
            {rows.length} of {records.length}
          </span>
        </div>
        {rows.length ? (
          <RecordTable
            rows={rows.slice(start, start + pageSize)}
            sort={sort}
            onSort={(key) => {
              setSort({ key, desc: key === sort.key && !sort.desc });
              setPageNumber(1);
            }}
          />
        ) : (
          <div className="empty-state">
            <SearchX size={29} />
            <h3>No matching records</h3>
            <p>Try another country, score, or age band.</p>
            <button className="button secondary" onClick={reset}>
              Clear filters
            </button>
          </div>
        )}
        <div className="pagination">
          <span>
            {rows.length
              ? `${start + 1}–${Math.min(start + pageSize, rows.length)} of ${rows.length} records`
              : '0 records'}
          </span>
          <div className="paging-controls">
            <label>
              Rows{' '}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageNumber(1);
                }}
              >
                {[10, 20, 50].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <button
              className="paging-button"
              aria-label="Previous page"
              disabled={current === 1}
              onClick={() => setPageNumber(current - 1)}
            >
              <ArrowLeft size={15} />
            </button>
            <small>
              {current} / {pages}
            </small>
            <button
              className="paging-button"
              aria-label="Next page"
              disabled={current >= pages}
              onClick={() => setPageNumber(current + 1)}
            >
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
