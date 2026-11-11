'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Field } from '@/components/ui';
import { CONDITIONS } from '@/lib/constants';
import { useDoctors, useSavePatient } from '@/lib/hooks';

export default function PatientForm({ patient, defaultDoctorId = '' }) {
  const router = useRouter();
  const save = useSavePatient();
  // Fine for a demo; at scale swap this for a searchable async select.
  const doctors = useDoctors({ limit: 100 }).data?.data ?? [];
  const [v, setV] = useState({
    name: patient?.name || '', age: patient?.age || '', phone: patient?.phone || '',
    condition: patient?.condition || '', doctorId: patient?.doctorId || defaultDoctorId,
  });
  const [err, setErr] = useState({});
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    const age = Number(v.age);
    if (!v.name.trim()) er.name = 'Enter the patient’s name.';
    if (!(age > 0 && age < 130)) er.age = 'Enter an age between 1 and 129.';
    if (!v.condition.trim()) er.condition = 'Enter the patient’s condition.';
    if (!v.doctorId) er.doctorId = 'Choose a doctor.';
    setErr(er);
    if (Object.keys(er).length) return;
    const data = { ...v, name: v.name.trim(), condition: v.condition.trim(), age };
    save.mutate({ id: patient?.id, data }, {
      onSuccess: () => router.push(defaultDoctorId && !patient ? `/doctors/${v.doctorId}/patients` : '/patients'),
    });
  };

  return (
    <form onSubmit={submit} noValidate className="card grid max-w-2xl gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><Field label="Full name" error={err.name}><input className="input" value={v.name} onChange={set('name')} /></Field></div>
      <Field label="Age" error={err.age}><input className="input" type="number" inputMode="numeric" value={v.age} onChange={set('age')} /></Field>
      <Field label="Phone"><input className="input" type="tel" value={v.phone} onChange={set('phone')} /></Field>
      <Field label="Condition" error={err.condition}>
        <input className="input" list="conditions" value={v.condition} onChange={set('condition')} />
        <datalist id="conditions">{CONDITIONS.map((c) => <option key={c} value={c} />)}</datalist>
      </Field>
      <Field label="Doctor" error={err.doctorId}>
        <select className="input" value={v.doctorId} onChange={set('doctorId')}>
          <option value="">Select</option>{doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </Field>
      {save.error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{save.error.message}</p>}
      <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
        <button className="btn btn-primary" disabled={save.isPending}>{save.isPending ? 'Saving…' : patient ? 'Save changes' : 'Add patient'}</button>
      </div>
    </form>
  );
}
