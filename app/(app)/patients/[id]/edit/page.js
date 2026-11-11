'use client';
import PatientForm from '@/components/PatientForm';
import { PageHeader, QueryBoundary } from '@/components/ui';
import { usePatient } from '@/lib/hooks';

export default function EditPatient({ params }) {
  const query = usePatient(params.id);
  return (
    <>
      <PageHeader title="Edit patient" sub={query.data?.name} />
      <QueryBoundary query={query}>{(patient) => <PatientForm patient={patient} />}</QueryBoundary>
    </>
  );
}
