// Demo adapter. Behaves like the Express API: filtering, pagination, joins and validation happen "server-side",
// so pages only ever receive one page of rows. Same method names as the real adapter in lib/api.js.
import { CONDITIONS } from './constants';

const day = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10);
const SPECS = ['Cardiology', 'Pediatrics', 'Neurology', 'Orthopedics', 'Dermatology'];
const HOSPS = ['Square Hospital', 'Apollo Dhaka', 'Labaid', 'United Hospital', 'Evercare'];
const DOCS = ['Amina Rahman', 'Sajid Khan', 'Nusrat Hasan', 'Tania Akter', 'Rafiq Islam', 'Farhan Chowdhury', 'Mehnaz Sultana', 'Arif Hossain'];
const F = ['Farhana', 'Imran', 'Mita', 'Karim', 'Sadia', 'Tanvir', 'Lamia', 'Rashed', 'Nabila', 'Jamil', 'Shirin', 'Omar'];
const L = ['Begum', 'Hossain', 'Das', 'Uddin', 'Noor', 'Ahmed', 'Khatun', 'Sarker'];

const db = {
  specializations: [...SPECS],
  hospitals: [...HOSPS],
  doctors: DOCS.map((n, i) => ({
    id: 'd' + i, name: 'Dr. ' + n, specialization: SPECS[i % 5], hospital: HOSPS[(i * 2) % 5],
    phone: `+880 1711 000 ${100 + i}`, email: n.split(' ')[0].toLowerCase() + '@clinic.com', createdAt: day(i * 25),
  })),
  patients: Array.from({ length: 48 }, (_, i) => ({
    id: 'p' + i, name: `${F[i % 12]} ${L[(i * 5) % 8]}`, age: 8 + ((i * 7) % 70), phone: `+880 1811 000 ${200 + i}`,
    condition: CONDITIONS[i % 6], doctorId: 'd' + (i % 8), createdAt: day((i * 4) % 180),
  })),
};
const FIELD = { specializations: 'specialization', hospitals: 'hospital' };

const wait = (v) => new Promise((r) => setTimeout(() => r(structuredClone(v)), 120));
const fail = (m) => new Promise((_, r) => setTimeout(() => r(new Error(m)), 120));
const inRange = (row, p) => (!p.from || row.createdAt >= p.from) && (!p.to || row.createdAt <= p.to);
const match = (q, ...vals) => !q || vals.some((v) => v.toLowerCase().includes(q.toLowerCase()));
const paged = (rows, p) => {
  const page = Number(p.page) || 1, limit = Number(p.limit) || 8;
  return { data: rows.slice((page - 1) * limit, page * limit), total: rows.length, page, pages: Math.max(1, Math.ceil(rows.length / limit)) };
};

export const mock = {
  login: async (email, password) => {
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter a valid email address.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');
    document.cookie = 'dt_token=demo; path=/; SameSite=Lax';
    return { email };
  },
  logout: async () => { document.cookie = 'dt_token=; path=/; max-age=0'; },

  doctors: {
    list: (p = {}) => {
      const counts = {};
      db.patients.forEach((x) => { counts[x.doctorId] = (counts[x.doctorId] || 0) + 1; });
      const rows = db.doctors
        .filter((d) => match(p.q, d.name, d.email, d.hospital) && (!p.specialization || d.specialization === p.specialization) && (!p.hospital || d.hospital === p.hospital) && inRange(d, p))
        .map((d) => ({ ...d, patientCount: counts[d.id] || 0 }));
      return wait(paged(rows, p));
    },
    get: (id) => { const d = db.doctors.find((x) => x.id === id); return d ? wait(d) : fail('Doctor not found.'); },
    create: (b) => {
      if (db.doctors.some((d) => d.email.toLowerCase() === b.email.toLowerCase())) return fail('A doctor with this email already exists.');
      db.doctors.unshift({ ...b, id: uid(), createdAt: day(0) });
      return wait({ ok: true });
    },
  },

  patients: {
    list: (p = {}) => {
      const names = Object.fromEntries(db.doctors.map((d) => [d.id, d.name]));
      const rows = db.patients
        .filter((x) => match(p.q, x.name) && (!p.condition || x.condition === p.condition) && (!p.doctorId || x.doctorId === p.doctorId) && inRange(x, p))
        .map((x) => ({ ...x, doctorName: names[x.doctorId] || '—' }));
      return wait(paged(rows, p));
    },
    get: (id) => { const x = db.patients.find((y) => y.id === id); return x ? wait(x) : fail('Patient not found.'); },
    create: (b) => { db.patients.unshift({ ...b, id: uid(), createdAt: day(0) }); return wait({ ok: true }); },
    update: (id, b) => { db.patients = db.patients.map((x) => (x.id === id ? { ...x, ...b } : x)); return wait({ ok: true }); },
    remove: (id) => { db.patients = db.patients.filter((x) => x.id !== id); return wait({ ok: true }); },
  },

  lookups: {
    list: (k) => wait(db[k].map((name) => ({ name, usage: db.doctors.filter((d) => d[FIELD[k]] === name).length }))),
    add: (k, name) => {
      if (db[k].some((n) => n.toLowerCase() === name.toLowerCase())) return fail('That name already exists.');
      db[k].push(name); return wait({ name });
    },
    rename: (k, old, name) => {
      if (db[k].some((n) => n !== old && n.toLowerCase() === name.toLowerCase())) return fail('That name already exists.');
      db[k] = db[k].map((n) => (n === old ? name : n));
      db.doctors.forEach((d) => { if (d[FIELD[k]] === old) d[FIELD[k]] = name; });
      return wait({ name });
    },
    remove: (k, name) => {
      const u = db.doctors.filter((d) => d[FIELD[k]] === name).length;
      if (u) return fail(`${name} is used by ${u} doctor${u > 1 ? 's' : ''}. Reassign them first.`);
      db[k] = db[k].filter((n) => n !== name); return wait({ ok: true });
    },
  },

  // One aggregated payload for the whole dashboard (a single round trip; $group/$facet on the real API).
  stats: (months = 6) => {
    const now = new Date();
    const monthly = [];
    for (let i = months - 1; i >= 0; i--) {
      const t = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthly.push({ key: `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`, month: t.toLocaleString('en', { month: 'short' }), patients: 0 });
    }
    const byDoctor = {}, byCondition = {};
    db.patients.forEach((p) => {
      const b = monthly.find((x) => x.key === p.createdAt.slice(0, 7)); if (b) b.patients++;
      byDoctor[p.doctorId] = (byDoctor[p.doctorId] || 0) + 1;
      byCondition[p.condition] = (byCondition[p.condition] || 0) + 1;
    });
    const cutoff = day(30);
    return wait({
      totals: {
        doctors: db.doctors.length, patients: db.patients.length,
        average: db.doctors.length ? +(db.patients.length / db.doctors.length).toFixed(1) : 0,
        recent: db.patients.filter((p) => p.createdAt >= cutoff).length,
      },
      monthly,
      perDoctor: db.doctors.map((d) => ({ name: d.name.replace('Dr. ', ''), patients: byDoctor[d.id] || 0 })).sort((a, b) => b.patients - a.patients).slice(0, 6),
      conditions: Object.entries(byCondition).map(([name, value]) => ({ name, value })),
    });
  },
};
