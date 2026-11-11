# API contract and MongoDB guidance

The frontend (`lib/api.js`) expects these REST endpoints. Set `NEXT_PUBLIC_USE_MOCK=false` to use them.
List endpoints return `{ data, total, page, pages }` and accept `page` and `limit` (cap `limit` at 100).

| Method | Path | Notes |
|---|---|---|
| POST | /auth/login, /auth/logout | Set/clear an **httpOnly** cookie named `dt_token` (SameSite=Lax, Secure in prod). CORS: allow the frontend origin with credentials. |
| GET | /doctors | `q, specialization, hospital, from, to, page, limit`. Each row includes `patientCount`. |
| GET / POST | /doctors, /doctors/:id | Unique `email`. |
| GET / POST | /patients | `q, condition, doctorId, from, to, page, limit`. Each row includes `doctorName`. |
| GET / PATCH / DELETE | /patients/:id | |
| GET / POST / PATCH / DELETE | /specializations, /hospitals (+ `/:name`) | Unique name. DELETE and rename must refuse or cascade when doctors use the name (return 409). |
| GET | /stats?months=6 | One payload: `totals{doctors,patients,average,recent}`, `monthly[{month,patients}]`, `perDoctor[{name,patients}]`, `conditions[{name,value}]`. |

## Indexes (Mongoose `schema.index`)
- doctors: `{ createdAt: -1 }`, `{ specialization: 1, hospital: 1, createdAt: -1 }`, unique `{ email: 1 }`, text index on `name, email, hospital`.
- patients: `{ doctorId: 1, createdAt: -1 }`, `{ condition: 1, createdAt: -1 }`, `{ createdAt: -1 }`, text index on `name`.
- specializations / hospitals: unique `{ name: 1 }`.

## Query patterns
- Use the same filter object for `find().sort().skip().limit().lean()` and `countDocuments()`; select only the fields the list needs.
- Keep `patientCount` as a counter on the doctor (`$inc` on patient create/delete) so the list never needs a `$lookup` per page.
- `/stats`: a single aggregation with `$facet` (monthly `$group` on year/month of `createdAt`, per-doctor `$group` on `doctorId`, condition `$group`) over the `createdAt` index.
- For very large collections, switch to keyset pagination (`createdAt` + `_id`) instead of `skip`.
- Validate bodies with Zod or Joi, return `{ message }` on errors with proper status codes, add helmet, rate-limit `/auth/login`.
