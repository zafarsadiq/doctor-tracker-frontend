'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Field } from '@/components/ui';
import { api } from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const [v, setV] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await api.login(v.email, v.password);
      router.push('/dashboard');
      router.refresh();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col justify-center gap-4 bg-[#0B2B2A] p-8 text-white lg:p-16">
        <div className="font-bold">Doctor Tracker</div>
        <h1 className="text-3xl font-bold leading-tight lg:text-4xl">Every doctor and patient, in one place.</h1>
        <p className="hidden text-teal-50/80 sm:block">Secure admin portal for managing doctors, their patients and clinic analytics.</p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6 sm:p-8" noValidate>
          <div>
            <h2 className="text-xl font-bold">Sign in</h2>
            <p className="mt-1 text-sm text-slate-600">username: admin@clinic.com password: admin123</p>
          </div>
          <Field label="Email"><input className="input" type="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
          <Field label="Password"><input className="input" type="password" autoComplete="current-password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} /></Field>
          {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
          <button className="btn btn-primary w-full">Sign in</button>
        </form>
      </section>
    </div>
  );
}
