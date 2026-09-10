# AgroVision AI Deployment Runbook

This runbook deploys the existing three-service architecture without resetting data:

- Frontend: Vite-built SPA
- Backend: Node.js/Express API
- AI service: FastAPI/TensorFlow model service
- Database: existing Supabase project and additive SQL migration

## 1. Prerequisites

- Node.js 20+ and npm
- Python 3.11+ for the AI service
- A Supabase project with the existing users and predictions tables
- A production AI provider key if AI Chat is enabled
- TLS termination and a reverse proxy or managed hosting platform

Never commit `.env` files, service keys, JWT secrets, or provider keys.

## 2. Database

1. Back up the Supabase project.
2. Run `backend/supabase_lms.sql` in the Supabase SQL editor.
3. Confirm the migration is additive and that `academy_progress` has its composite primary key and user/course index.
4. Confirm backend access uses the Supabase service key only on the server.
5. Verify production backups and restore procedures before launch.

Do not run destructive resets against production.

## 3. Environment

Backend/AI values belong only on the server:

```env
NODE_ENV=production
PORT=5000
AI_SERVICE_URL=https://ai.internal.example
FRONTEND_URL=https://app.example.com
ALLOWED_ORIGINS=https://app.example.com
JWT_SECRET=<long-random-secret>
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=<server-only-supabase-service-key>
AI_API_KEY=<server-only-provider-key>
AI_MODEL=<provider-model>
AI_BASE_URL=https://api.openai.com/v1
AI_TIMEOUT_MS=30000
```

The frontend may expose only safe public values, such as:

```env
VITE_API_URL=https://api.example.com/api
```

Do not put `JWT_SECRET`, Supabase service keys, or AI provider keys in frontend variables.

## 4. AI service

```bash
cd ai-service
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
AI_ALLOWED_ORIGINS=https://api.example.com \
  uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1
```

Use a process manager or container restart policy. Do not use `--reload` in production. Configure the reverse proxy and platform health check to call `/ready`; `/health` is suitable for liveness reporting.

The model file and `classes.txt` must be present in `ai-service/models/` before startup.

## 5. Backend

```bash
cd backend
npm ci --omit=dev
NODE_ENV=production npm start
```

Set the backend environment before starting. The backend should be reachable only through the API hostname or private network, with TLS handled by the proxy. Proxy request and timeout limits must be at least as strict as the application limits.

Health check: `GET /api/health`.

## 6. Frontend

```bash
cd frontend
npm ci
npm run typecheck
npm run build
```

Serve `frontend/dist` as static files from a production web server or managed static host. Configure SPA fallback so application routes return `index.html`. Do not use `vite dev` or `vite preview` as the production server.

## 7. Validation before release

From the repository root:

```bash
npm run typecheck
npm run build
npm run validate:academy
npm run check:backend
npm run check:ai
```

Also test the live frontend, backend `/api/health`, AI `/ready`, authentication, private data isolation, image upload limits, and rollback procedure in a staging environment.

## 8. Rollback

1. Stop or disable new frontend traffic at the proxy.
2. Roll back the frontend artifact and backend/AI image or release to the previous known-good versions.
3. Do not roll back or delete database rows as part of an application rollback.
4. If a migration caused an issue, use a reviewed additive repair migration after taking a backup.
5. Recheck `/api/health`, `/ready`, authentication, and private data access before restoring traffic.

## 9. Troubleshooting

- Backend reports missing JWT secret: set a strong `JWT_SECRET` and restart.
- CORS rejection: set `ALLOWED_ORIGINS` to the exact HTTPS frontend origin, comma-separated for multiple origins.
- AI unavailable: check AI service `/ready`, model files, memory, and `AI_SERVICE_URL`.
- Academy progress unavailable: verify `backend/supabase_lms.sql` was applied and the service key can access the table.
- SPA route returns 404 on refresh: enable the web server's fallback to `index.html`.
- Provider timeout: inspect provider health and keep `AI_TIMEOUT_MS` bounded; do not expose provider credentials to the browser.

## Current release blockers

- Live authenticated browser E2E and two-user isolation testing are still required.
- Backend `qs` is pinned to patched `6.16.0` through a non-breaking package override and currently reports zero production advisories.
- Frontend React Router 6.30.6 has two moderate advisories fixed in React Router 7.18.3, which is a breaking major upgrade requiring compatibility work.
- Accessibility, load, and multi-instance rate-limit testing must be completed in staging.
- The current release must not be promoted while the LMS migration is unapplied, formal AI metrics are unavailable, and representative class images show suspiciously uniform predictions.
