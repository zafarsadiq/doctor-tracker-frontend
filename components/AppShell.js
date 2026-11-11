'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const NAV = [
  ['/dashboard', 'Dashboard'], ['/doctors', 'Doctors'], ['/patients', 'Patients'],
  ['/specializations', 'Specializations'], ['/hospitals', 'Hospitals'],
];

export default function AppShell({ children }) {
  const qc = useQueryClient();
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);
  const logout = async () => { await api.logout(); qc.clear(); router.replace('/login'); };

  return (
    <div className="min-h-screen lg:flex">
      <header className="flex items-center justify-between bg-[#0B2B2A] px-4 py-2 text-white lg:hidden">
        <span className="font-bold">Doctor Tracker</span>
        <button className="btn h-11 w-11 px-0 text-white hover:bg-white/10" aria-label="Open menu" onClick={() => setOpen(true)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </header>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col gap-1 bg-[#0B2B2A] p-4 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? '' : '-translate-x-full'}`}>
        <div className="px-3 pb-5 text-lg font-bold text-white">Doctor Tracker</div>
        {NAV.map(([href, label]) => (
          <Link key={href} href={href} className={`rounded-lg px-3 py-3 text-sm ${path.startsWith(href) ? 'bg-teal-900 font-semibold text-white' : 'text-teal-50/80 hover:bg-white/5'}`}>{label}</Link>
        ))}
        <button onClick={logout} className="mt-auto rounded-lg px-3 py-3 text-left text-sm text-teal-50/80 hover:bg-white/5">Sign out</button>
      </aside>
      <main className="min-w-0 flex-1 space-y-6 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
