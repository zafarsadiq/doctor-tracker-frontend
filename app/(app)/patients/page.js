'use client';
import Link from 'next/link';
import { DataList, Field, FilterBar, PageHeader, Pagination, QueryBoundary, useDebounced, useListState } from '@/components/ui';
import { usePatientActions } from '@/components/PatientActions';
import { CONDITIONS, PAGE_SIZE } from '@/lib/constants';
import { useDoctors, usePatients } from '@/lib/hooks';

const columns = [
  { label: 'Patient', key: 'name' },
  { label: 'Age', key: 'age' },
  { label: 'Condition', render: (p) => <span className="chip">{p.condition}</span> },
  { label: 'Doctor', key: 'doctorName' },
  { label: 'Added', key: 'createdAt' },
];

export default function Patients() {
  const [f, set, setPage] = useListState({ q: '', condition: '', doctorId: '', from: '', to: '' });
  const q = useDebounced(f.q);
  const query = usePatients({ ...f, q, limit: PAGE_SIZE });
  const doctors = useDoctors({ limit: 100 }).data?.data ?? [];
  const actions = usePatientActions();

  return (
    <>
      <PageHeader title="Patients" sub={`${query.data?.total ?? '…'} patients`}>
        <Link href="/patients/new" className="btn btn-primary">Add patient</Link>
      </PageHeader>
      <FilterBar>
        <Field label="Search"><input className="input" placeholder="Patient name" value={f.q} onChange={set('q')} /></Field>
        <Field label="Condition"><select className="input" value={f.condition} onChange={set('condition')}><option value="">All</option>{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Doctor"><select className="input" value={f.doctorId} onChange={set('doctorId')}><option value="">All</option>{doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
        <Field label="Added from"><input type="date" className="input" value={f.from} onChange={set('from')} /></Field>
        <Field label="Added to"><input type="date" className="input" value={f.to} onChange={set('to')} /></Field>
      </FilterBar>
      <div className="card">
        <QueryBoundary query={query}>
          {({ data, total, page }) => (
            <>
              <DataList columns={columns} rows={data} actions={actions} empty="No patients match these filters." />
              <Pagination page={page} total={total} size={PAGE_SIZE} onChange={setPage} />
            </>
          )}
        </QueryBoundary>
      </div>
    </>
  );
}
