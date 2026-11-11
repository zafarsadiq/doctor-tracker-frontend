'use client';
import { memo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#0F766E', '#14B8A6', '#0EA5E9', '#6366F1', '#F59E0B', '#94A3B8'];
const ChartCard = ({ title, children }) => (
  <div className="card"><h2 className="mb-4 font-semibold">{title}</h2><div className="h-64">{children}</div></div>
);

// Loaded with next/dynamic, so Recharts stays out of every other page's bundle.
function DashboardCharts({ data }) {
  return (
    <>
      <div className="grid gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <ChartCard title="New patients per month">
            <ResponsiveContainer><LineChart data={data.monthly}><CartesianGrid stroke="#E2E8F0" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} width={30} tick={{ fontSize: 12 }} /><Tooltip /><Line dataKey="patients" stroke="#0F766E" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="xl:col-span-2">
          <ChartCard title="Patients per doctor">
            <ResponsiveContainer><BarChart data={data.perDoctor} layout="vertical"><CartesianGrid stroke="#E2E8F0" horizontal={false} /><XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} /><YAxis type="category" dataKey="name" width={96} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="patients" fill="#0F766E" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
      <ChartCard title="Patients by condition">
        <ResponsiveContainer><PieChart><Pie data={data.conditions} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>{data.conditions.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
      </ChartCard>
    </>
  );
}
export default memo(DashboardCharts);
