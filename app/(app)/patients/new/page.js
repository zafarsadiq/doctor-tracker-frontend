'use client';
import PatientForm from '@/components/PatientForm';
import { PageHeader } from '@/components/ui';

export default function NewPatient({ searchParams }) {
  return (<><PageHeader title="Add patient" sub="Register a patient under a doctor." /><PatientForm defaultDoctorId={searchParams?.doctorId || ''} /></>);
}
