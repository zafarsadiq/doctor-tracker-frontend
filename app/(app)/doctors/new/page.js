'use client';
import DoctorForm from '@/components/DoctorForm';
import { PageHeader } from '@/components/ui';

export default function NewDoctor() {
  return (<><PageHeader title="Add doctor" sub="Create a doctor profile." /><DoctorForm /></>);
}
