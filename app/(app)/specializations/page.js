'use client';
import NameManager from '@/components/NameManager';
import { PageHeader } from '@/components/ui';

export default function Page() {
  return (<><PageHeader title="Specializations" sub="Add, rename or remove the specializations doctors can have." /><NameManager kind="specializations" noun="specialization" /></>);
}
