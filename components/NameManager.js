'use client';
import { useState } from 'react';
import { QueryBoundary, Field } from '@/components/ui';
import { useLookup, useLookupMutations } from '@/lib/hooks';

// Add / rename / delete for specializations and hospitals. Uniqueness and "in use" rules are enforced by the API.
export default function NameManager({ kind, noun }) {
  const query = useLookup(kind);
  const { add, rename, remove } = useLookupMutations(kind);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null);
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');
  const apiErr = add.error || rename.error || remove.error;

  const onAdd = (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return setErr(`Enter a ${noun} name.`);
    setErr(''); add.mutate(n, { onSuccess: () => setName('') });
  };
  const onSave = (old) => {
    const n = val.trim();
    if (!n) return setErr(`Enter a ${noun} name.`);
    setErr(''); rename.mutate({ old, name: n }, { onSuccess: () => setEditing(null) });
  };

  return (
    <div className="card max-w-2xl space-y-4">
      <form onSubmit={onAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end" noValidate>
        <div className="flex-1"><Field label={`New ${noun}`}><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field></div>
        <button className="btn btn-primary" disabled={add.isPending}>Add {noun}</button>
      </form>
      {(err || apiErr) && <p role="alert" className="text-sm text-red-700">{err || apiErr.message}</p>}
      <QueryBoundary query={query}>
        {(items) => items.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-600">No {noun}s yet. Add the first one above.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map(({ name: n, usage }) => (
              <li key={n} className="flex flex-wrap items-center gap-3 py-3">
                {editing === n ? (
                  <>
                    <input className="input flex-1" aria-label={`Rename ${n}`} value={val} onChange={(e) => setVal(e.target.value)} />
                    <button className="btn btn-primary btn-sm" onClick={() => onSave(n)} disabled={rename.isPending}>Save</button>
                    <button className="btn btn-outline btn-sm" onClick={() => { setEditing(null); setErr(''); rename.reset(); }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span className="min-w-0 flex-1 font-medium">{n}</span>
                    <span className="chip">{usage} doctors</span>
                    <button className="btn btn-outline btn-sm" onClick={() => { setEditing(n); setVal(n); setErr(''); }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => confirm(`Delete ${n}?`) && remove.mutate(n)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </QueryBoundary>
    </div>
  );
}
