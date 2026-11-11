'use client';
import { memo, useEffect, useState } from 'react';

// Filter state that jumps back to page 1 whenever a filter changes.
export function useListState(init) {
  const [f, setF] = useState({ ...init, page: 1 });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value, page: 1 }));
  const setPage = (page) => setF((s) => ({ ...s, page }));
  return [f, set, setPage];
}

export function PageHeader({ title, sub, children }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {sub && <p className="mt-1 text-sm text-slate-600">{sub}</p>}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span role="alert" className="mt-1 block text-sm text-red-700">{error}</span>}
    </label>
  );
}

export const FilterBar = ({ children }) => (
  <div className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{children}</div>
);

export function Pagination({ page, total, size = 8, onChange }) {
  const pages = Math.max(1, Math.ceil(total / size));
  const from = total ? (page - 1) * size + 1 : 0;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm text-slate-600">
      <span>Showing {from}–{Math.min(page * size, total)} of {total}</span>
      <div className="flex items-center gap-3">
        <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
        <span>Page {page} of {pages}</span>
        <button className="btn btn-outline btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </div>
  );
}

// Table on md+, stacked cards on phones. The first column becomes the card title.
function DataListBase({ columns, rows, actions, empty = 'Nothing here yet.' }) {
  if (!rows.length) return <p className="py-12 text-center text-sm text-slate-600">{empty}</p>;
  const cell = (c, r) => (c.render ? c.render(r) : r[c.key]);
  const th = 'border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold text-slate-600';
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {columns.map((c) => <th key={c.label} className={th}>{c.label}</th>)}
              {actions && <th className={th + ' text-right'}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0">
                {columns.map((c) => <td key={c.label} className="px-3 py-3 align-middle">{cell(c, r)}</td>)}
                {actions && <td className="px-3 py-3"><div className="flex justify-end gap-2">{actions(r)}</div></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-slate-100 md:hidden">
        {rows.map((r) => (
          <li key={r.id} className="space-y-2 py-4">
            {columns.map((c, i) =>
              i === 0 ? (
                <div key={c.label} className="font-semibold">{cell(c, r)}</div>
              ) : (
                <div key={c.label} className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-600">{c.label}</span>
                  <span className="text-right">{cell(c, r)}</span>
                </div>
              )
            )}
            {actions && <div className="flex flex-wrap gap-2 pt-1">{actions(r)}</div>}
          </li>
        ))}
      </ul>
    </>
  );
}

// Memoised: with stable `columns`/`actions` props, rows only re-render when the data changes.
export const DataList = memo(DataListBase);

export function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

// Loading skeleton, error + retry, and a dimmed state while the next page loads.
export function QueryBoundary({ query, children }) {
  if (query.isPending)
    return <div className="space-y-3 py-2" aria-busy="true">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}</div>;
  if (query.isError)
    return (
      <div role="alert" className="py-10 text-center text-sm">
        <p className="text-red-700">{query.error.message}</p>
        <button className="btn btn-outline btn-sm mt-3" onClick={() => query.refetch()}>Try again</button>
      </div>
    );
  return <div className={query.isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>{children(query.data)}</div>;
}
