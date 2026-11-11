'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Field } from '@/components/ui';
import { useCreateDoctor, useLookup } from '@/lib/hooks';

export default function DoctorForm() {
  const router = useRouter();
  const create = useCreateDoctor();
  const specs = useLookup('specializations').data ?? [];
  const hosps = useLookup('hospitals').data ?? [];
  const [v, setV] = useState({ name: '', specialization: '', hospital: '', phone: '', email: '' });
  const [err, setErr] = useState({});
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!v.name.trim()) er.name = 'Enter the doctor’s name.';
    if (!v.specialization) er.specialization = 'Choose a specialization.';
    if (!v.hospital) er.hospital = 'Choose a hospital.';
    if (!/^[+\d][\d\s-]{6,}$/.test(v.phone)) er.phone = 'Enter a valid phone number.';
    if (!/^\S+@\S+\.\S+$/.test(v.email)) er.email = 'Enter a valid email address.';
    setErr(er);
    if (Object.keys(er).length) return;
    create.mutate({ ...v, name: v.name.trim() }, { onSuccess: () => router.push('/doctors') });
  };

  const opts = (list) => list.map((s) => <option key={s.name}>{s.name}</option>);
  return (
    <form onSubmit={submit} noValidate className="card grid max-w-2xl gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><Field label="Name" error={err.name}><input className="input" value={v.name} onChange={set('name')} /></Field></div>
      <Field label="Specialization" error={err.specialization}><select className="input" value={v.specialization} onChange={set('specialization')}><option value="">Select</option>{opts(specs)}</select></Field>
      <Field label="Hospital" error={err.hospital}><select className="input" value={v.hospital} onChange={set('hospital')}><option value="">Select</option>{opts(hosps)}</select></Field>
      <Field label="Phone" error={err.phone}><input className="input" type="tel" value={v.phone} onChange={set('phone')} /></Field>
      <Field label="Email" error={err.email}><input className="input" type="email" value={v.email} onChange={set('email')} /></Field>
      {create.error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{create.error.message}</p>}
      <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
        <button className="btn btn-primary" disabled={create.isPending}>{create.isPending ? 'Saving…' : 'Create doctor'}</button>
      </div>
    </form>
  );
}
