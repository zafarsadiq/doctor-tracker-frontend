# Doctor Tracker – Frontend

Next.js 14 (App Router) + Tailwind CSS + React Query + Recharts. Runs on a built-in demo adapter by default, so it works without a backend.

## Run
```bash
npm install
cp .env.example .env
npm run dev   # http://localhost:3000  (login: any email + 6+ char password)
```
To use the Express API (described in `docs/BACKEND_CONTRACT.md`), set `NEXT_PUBLIC_USE_MOCK=false` and `API_PROXY_TARGET` to the API's address. Leave `NEXT_PUBLIC_API_URL=/api`: the browser calls the frontend's own `/api` path and Next.js forwards it to the backend, so the two can be hosted on different servers or domains. `API_PROXY_TARGET` is read at build time.

## Pages
`/login` · `/dashboard` · `/doctors` · `/doctors/new` · `/doctors/[id]/patients` · `/patients` · `/patients/new?doctorId=` · `/patients/[id]/edit` · `/specializations` · `/hospitals`

## Performance and structure
- **Server-driven lists:** search, filters and pagination are sent to the API as query params; the browser only ever holds one page of rows.
- **React Query:** caching, request de-duplication, `keepPreviousData` for flicker-free paging, targeted invalidation after mutations, longer cache for rarely-changing lookups.
- **Debounced search** (300 ms) so typing doesn't fire a request per keystroke.
- **Fewer re-renders:** no global store; `DataList` is memoised and fed stable columns/actions; charts are memoised.
- **Code splitting:** Recharts is loaded with `next/dynamic` only on the dashboard.
- **One dashboard request:** `/stats` returns pre-aggregated data.
- **Route protection:** `middleware.js` redirects unauthenticated users before any page renders; the API also returns 401, which sends users to `/login`.
- **UX states:** skeleton loading, error with retry, empty states, disabled buttons while saving, server error messages shown in forms.
- **Layout:** `app/` routes, `components/` reusable UI, `lib/` API adapter, hooks and constants.
