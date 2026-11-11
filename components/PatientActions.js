'use client';
import Link from 'next/link';
import { useCallback } from 'react';
import { useDeletePatient } from '@/lib/hooks';

// Returns a stable `actions` renderer so the memoised DataList doesn't re-render on unrelated updates.
export function usePatientActions() {
  const { mutate } = useDeletePatient();
  return useCallback((p) => (
    <>
      <Link href={`/patients/${p.id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
      <button className="btn btn-danger btn-sm" onClick={() => confirm(`Delete ${p.name}?`) && mutate(p.id)}>Delete</button>
    </>
  ), [mutate]);
}
