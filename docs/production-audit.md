# AgroVision AI Production Audit

Date: 2026-09-05

## Verified

- Frontend TypeScript check passes.
- Backend JavaScript syntax check passes.
- AI service Python syntax check passes.
- Authenticated dashboard summary had an undefined `learningStreak`; it now derives a consecutive-day streak from Academy activity.
- Backend now fails closed on a missing JWT secret in production, limits JSON and URL-encoded bodies, emits request IDs, sets baseline security headers, rate-limits sensitive auth routes, and validates image file signatures in addition to MIME and extension.
- AI uploads are limited to 5 MiB and restricted to JPG, PNG, and WEBP content types. Model loading is cached, `/health` reports degraded state when unavailable, and `/ready` reports readiness.
- The bundled TensorFlow model loaded successfully and produced a real inference for a dataset image: `Corn (maize) / Common rust`, confidence `96.06%`. This is a smoke test, not a quality benchmark.
- Root validation scripts now delegate to the frontend package.
- Live `GET /api/health` reported backend online, database connected, and AI service online.
- Live `GET /ready` reported the AI model ready.
- An unauthenticated live request to `/api/predictions` returned `401` with a safe response.
- The public landing page rendered in a browser, Arabic switched the document to RTL, and a 390px viewport had no horizontal overflow.
- Auth and farm-tool form labels now have explicit control associations; the crop preview image has alt text.
- Two disposable staging users were created and cleaned up. User B saw zero User A predictions and received `404` for User A's prediction ID; User B dashboard/profile data remained scoped to User B. Unauthenticated predictions returned `401`.
- A live development CORS mismatch was fixed by allowing only the documented local ports when explicit development origins are absent; production still requires explicit configured origins.
- Invalid credentials now remain on the login page with the server error instead of being redirected away by the global `401` interceptor.
- Authenticated browser checks passed for Dashboard, Academy catalog/course/lesson rendering, AI Chat, all four tool result states, crop upload/result rendering, logout, invalid credentials, six language switches, Arabic RTL, theme persistence, and a 390px dashboard viewport.
- A dependency-free `npm run test:smoke` suite now covers frontend availability, backend health, protected APIs, AI readiness, and invalid image handling.
- Production configuration now fails closed when `JWT_SECRET`, `AI_SERVICE_URL`, or `FRONTEND_URL` are missing instead of silently using development defaults.
- Academy validator source declares an expected inventory of 20 courses, 100 units, 500 lessons, 3,000 localized lesson versions, and six locales. The command result is recorded by the validation run, not assumed here.

## Not yet verified

- Supabase LMS migration application and schema verification; no direct SQL client, Supabase CLI, database URL, or management token is available in this environment.
- Signup, login, logout, token expiry, password reset, and protected-route behavior against live services.
- Live AI provider chat responses and all six-language response quality.
- Formal model metrics; the evaluation script loaded 14,059 validation images across 38 classes but emitted no aggregate metrics before stopping.
- End-to-end crop upload, prediction persistence, Academy progress persistence, quiz scoring, and dashboard streak behavior.
- Academy progress persistence is currently blocked in the configured Supabase project because `academy_progress` is not provisioned; requests return `503` with migration guidance.
- Tablet authenticated regression at both requested widths.
- Full automated contrast, screen-reader, and keyboard audit across authenticated pages.
- Authenticated browser journeys, including Academy persistence, tools, crop upload, AI Chat, logout/login, and dark mode.
- Production deployment, TLS, reverse proxy limits, backups, migrations, observability, and load behavior.

## Remaining risks

- Rate limiting is process-local and should be replaced with shared infrastructure for multi-instance deployment.
- The backend uses a Supabase service key and therefore remains responsible for every authorization predicate; live database policies and schema must be reviewed before deployment.
- Image bytes are validated by signature and decoded by Pillow in the AI service, but production should still run behind network and resource limits.
- No Playwright/axe/Lighthouse package is installed; only the dependency-free smoke suite and integrated browser checks are available.
- The Academy validator requires the frontend dependency environment and must be run from the repository root after installation.
- Backend `qs` advisory was remediated with a non-breaking `qs@6.16.0` override; backend production audit now reports zero vulnerabilities. Frontend still reports two moderate React Router advisories requiring a breaking major upgrade.
- Two-user Academy isolation remains unverified because the configured Academy progress table is missing; the disposable staging users were cleaned up after testing.
- The selected Apple-scab browser image was classified as Corn/Common rust; this is an observed model result, not a correctness or accuracy claim.
- Full Lighthouse/axe output was not available in the environment; accessibility evidence is targeted browser inspection and form-label fixes.
- Three representative images from Grape healthy, Tomato early blight, and Potato late blight were all classified as Corn/Common rust. This is a model-quality blocker requiring investigation, not an accuracy claim.
- React Router 6.30.6 remains on two moderate advisories; the candidate fix is React Router 7.18.3 and is a breaking major migration.

## Production status

Not production-ready yet. Core local staging flows are substantially verified, but the LMS migration, Academy persistence, formal AI metrics/model quality, automated accessibility scoring, React Router remediation, and HTTPS staging deployment remain blockers or unverified.
