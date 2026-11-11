'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { PageHeader, QueryBoundary } from '@/components/ui';
import { useStats } from '@/lib/hooks';

const Charts = dynamic(() => import('@/components/DashboardCharts'), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-slate-100" />,
});

export default function Dashboard() {
  const [months, setMonths] = useState(6);
  const query = useStats(months);
  return (
    <>
      <PageHeader title="Dashboard" sub="Clinic overview and patient trends">
        <select className="input w-auto" aria-label="Date range" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
          <option value={3}>Last 3 months</option><option value={6}>Last 6 months</option><option value={12}>Last 12 months</option>
        </select>
      </PageHeader>
      <QueryBoundary query={query}>
        {(s) => (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
              {[['Total doctors', s.totals.doctors], ['Total patients', s.totals.patients], ['Patients per doctor', s.totals.average], ['New in last 30 days', s.totals.recent]].map(([label, value]) => (
                <div key={label} className="card"><div className="text-sm text-slate-600">{label}</div><div className="mt-1 text-2xl font-bold sm:text-3xl">{value}</div></div>
              ))}
            </div>
            <Charts data={s} />
          </div>
        )}
      </QueryBoundary>
    </>
  );
}
