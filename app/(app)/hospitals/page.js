'use client';
import NameManager from '@/components/NameManager';
import { PageHeader } from '@/components/ui';

export default function Page() {
  return (<><PageHeader title="Hospitals" sub="Add, rename or remove the hospitals doctors work at." /><NameManager kind="hospitals" noun="hospital" /></>);
}
