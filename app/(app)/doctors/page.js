'use client';
import Link from 'next/link';
import { DataList, Field, FilterBar, PageHeader, Pagination, QueryBoundary, useDebounced, useListState } from '@/components/ui';
import { PAGE_SIZE } from '@/lib/constants';
import { useDoctors, useLookup } from '@/lib/hooks';

// Module-level so their identity never changes between renders (keeps the memoised DataList idle).
const columns = [
  { label: 'Doctor', render: (d) => <div><div className="font-semibold">{d.name}</div><div className="text-xs font-normal text-slate-600">{d.email}</div></div> },
  { label: 'Specialization', render: (d) => <span className="chip">{d.specialization}</span> },
  { label: 'Hospital', key: 'hospital' },
  { label: 'Phone', key: 'phone' },
  { label: 'Patients', key: 'patientCount' },
  { label: 'Added', key: 'createdAt' },
];
const actions = (d) => (
  <>
    <Link href={`/doctors/${d.id}/patients`} className="btn btn-outline btn-sm">View patients</Link>
    <Link href={`/patients/new?doctorId=${d.id}`} className="btn btn-primary btn-sm">Add patient</Link>
  </>
);

export default function Doctors() {
  const [f, set, setPage] = useListState({ q: '', specialization: '', hospital: '', from: '', to: '' });
  const q = useDebounced(f.q);
  const query = useDoctors({ ...f, q, limit: PAGE_SIZE });
  const specs = useLookup('specializations').data ?? [];
  const hosps = useLookup('hospitals').data ?? [];

  return (
    <>
      <PageHeader title="Doctors" sub={`${query.data?.total ?? '…'} doctors`}>
        <Link href="/doctors/new" className="btn btn-primary">Add doctor</Link>
      </PageHeader>
      <FilterBar>
        <Field label="Search"><input className="input" placeholder="Name or email" value={f.q} onChange={set('q')} /></Field>
        <Field label="Specialization"><select className="input" value={f.specialization} onChange={set('specialization')}><option value="">All</option>{specs.map((s) => <option key={s.name}>{s.name}</option>)}</select></Field>
        <Field label="Hospital"><select className="input" value={f.hospital} onChange={set('hospital')}><option value="">All</option>{hosps.map((s) => <option key={s.name}>{s.name}</option>)}</select></Field>
        <Field label="Added from"><input type="date" className="input" value={f.from} onChange={set('from')} /></Field>
        <Field label="Added to"><input type="date" className="input" value={f.to} onChange={set('to')} /></Field>
      </FilterBar>
      <div className="card">
        <QueryBoundary query={query}>
          {({ data, total, page }) => (
            <>
              <DataList columns={columns} rows={data} actions={actions} empty="No doctors match these filters." />
              <Pagination page={page} total={total} size={PAGE_SIZE} onChange={setPage} />
            </>
          )}
        </QueryBoundary>
      </div>
    </>
  );
}