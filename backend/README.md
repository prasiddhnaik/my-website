# Backend API

Simple Express + SQLite API for contact submissions and lightweight analytics.

## Run locally

```bash
cd backend
npm i
ADMIN_TOKEN=change-me npm run start
# or for auto-reload
ADMIN_TOKEN=change-me npm run dev
```

API: `http://localhost:3001`

## Endpoints

- `GET /api/health` health check
- `POST /api/contacts` body: `{ name, email, message }`
- `GET /api/contacts?limit=50` header: `x-admin-token: <ADMIN_TOKEN>`
- `POST /api/events` body: `{ eventName, pagePath, pageTitle, meta }`
- `GET /api/events?limit=100` header: `x-admin-token: <ADMIN_TOKEN>`

SQLite DB is stored at `backend/data.sqlite`.





