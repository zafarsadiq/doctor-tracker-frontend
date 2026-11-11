'use client';
import Link from 'next/link';
import { DataList, Field, PageHeader, Pagination, QueryBoundary, useDebounced, useListState } from '@/components/ui';
import { usePatientActions } from '@/components/PatientActions';
import { PAGE_SIZE } from '@/lib/constants';
import { useDoctor, usePatients } from '@/lib/hooks';

const columns = [
  { label: 'Patient', key: 'name' },
  { label: 'Age', key: 'age' },
  { label: 'Condition', render: (p) => <span className="chip">{p.condition}</span> },
  { label: 'Added', key: 'createdAt' },
];

export default function DoctorPatients({ params }) {
  const [f, set, setPage] = useListState({ q: '' });
  const q = useDebounced(f.q);
  const doctor = useDoctor(params.id);
  const query = usePatients({ doctorId: params.id, q, page: f.page, limit: PAGE_SIZE });
  const actions = usePatientActions();
  const doc = doctor.data;

  return (
    <>
      <Link href="/doctors" className="text-sm font-semibold text-teal-700 hover:underline">Back to doctors</Link>
      {doctor.isError ? (
        <p role="alert" className="text-red-700">{doctor.error.message}</p>
      ) : (
        <PageHeader title={doc ? `${doc.name}’s patients` : 'Loading…'} sub={doc && `${doc.specialization} at ${doc.hospital}`}>
          <Link href={`/patients/new?doctorId=${params.id}`} className="btn btn-primary">Add patient</Link>
        </PageHeader>
      )}
      <div className="card">
        <div className="mb-4 max-w-sm"><Field label="Search"><input className="input" placeholder="Patient name" value={f.q} onChange={set('q')} /></Field></div>
        <QueryBoundary query={query}>
          {({ data, total, page }) => (
            <>
              <DataList columns={columns} rows={data} actions={actions} empty="This doctor has no patients yet." />
              <Pagination page={page} total={total} size={PAGE_SIZE} onChange={setPage} />
            </>
          )}
        </QueryBoundary>
      </div>
    </>
  );
}
