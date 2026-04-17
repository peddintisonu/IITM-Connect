# IITMConnect — Current Status

## Snapshot

- Date: 18-04-2026
- Backend stack: Express + TypeScript + MongoDB + Passport Google OAuth + Zod + Swagger
- Scope covered: Auth, Students, Social, Core master data, middleware, upload pipeline, API docs

---

## Completed: Platform and Infra

- Monorepo and npm workspaces setup completed.
- Express app bootstrapped with cookie parser, morgan, passport init, health route, and centralized error handler.
- Shared utilities in place: ApiError, ApiResponse, asyncHandler, validation parsing, mongoose helpers.
- OpenAPI/Swagger wired via swagger-jsdoc and module-level swagger files.
- Seed pipeline implemented for hostels, departments, courses.

---

## Completed: Auth Module

- Google OAuth with strict `@smail.iitm.ac.in` domain gate.
- Session-based JWT auth with access token + refresh token cookies.
- Refresh-token hashing + session persistence.
- Token version invalidation strategy (`tokenVersion`) active.
- Session lifecycle model supports:
    - rotation state (`previousRefreshToken`, `graceExpiresAt`, `rotatedAt`)
    - device/user-agent/location context
    - revocation and end reasons
    - retention cleanup (`deletesAt` TTL)
- Routes implemented:
    - `GET /api/v1/auth/google`
    - `GET /api/v1/auth/google/callback`
    - `GET /api/v1/auth/failure`
    - `GET /api/v1/auth/refresh`
    - `GET /api/v1/auth/logout`
    - `POST /api/v1/auth/logout-all`
    - `GET /api/v1/auth/sessions`
    - `POST /api/v1/auth/sessions/:sessionId/logout`

---

## Completed: Student Module

- Student creation from OAuth with parsed academic prefill:
    - roll no, department, course, batch, graduation year
- Onboarding implemented with validation and one-time completion guard.
- Username uniqueness enforced on onboarding/profile update.
- Username availability endpoint added:
    - `GET /api/v1/students/username-availability?username=...`
- Profile management implemented:
    - `GET /api/v1/students/me`
    - `PATCH /api/v1/students/me/profile`
    - `PATCH /api/v1/students/me/hostel`
    - `PATCH /api/v1/students/me/privacy`
    - `PATCH /api/v1/students/me/photo`
    - `PATCH /api/v1/students/me/cover`
    - `GET /api/v1/students/:username`
- Privacy model upgraded:
    - `hiddenFields`
    - `publicHiddenFields`
    - `privateHiddenFields`
- Account type toggling restores per-mode hidden-field preferences.

---

## Completed: Social Module

- Follow + block models implemented with indexes.
- Follow service supports:
    - send/cancel/accept/reject/unfollow/remove follower
    - followers/following/pending/sent-pending lists
    - relationship state endpoint
- Block service supports:
    - block/unblock/list
    - removes follow edges on block
- Route set implemented under `/api/v1/social/*` for all current follow/block operations.

---

## Completed: Access Control and Middleware

- `protectRoute` validates access token, session state, token version, and attaches `req.user`.
- `redirectIfAuthenticated` implemented for OAuth callback flow.
- `requireOnboardingComplete` middleware added and enforced:
    - all social routes
    - student routes except onboarding-safe endpoints
    - selected auth routes (`logout-all`, `sessions`, `session revoke`)
- Current behavior:
    - non-onboarded users can login
    - restricted to onboarding-safe endpoints until onboarding is completed

---

## Completed: Swagger Documentation

- Student/auth/social swagger updated to match current code behavior.
- Temporary current behavior preserved in docs (e.g., `GET /auth/refresh`, `GET /auth/logout`).
- New endpoint documented: username availability.
- Onboarding-required `403` responses documented on protected routes.
- Student schema updated with latest privacy field shape.

---

## Next Up (PRD-Aligned)

### Auth Module (5)

- [ ] Convert `GET /api/v1/auth/refresh` to `POST` with coordinated client update.
- [ ] Add rate-limiting for auth-sensitive routes (google callback, refresh, logout-all).
- [ ] Add audit logging for login/logout/refresh/revoke events.
- [ ] Add transaction-safe revocation path for `logout-all` and per-session revoke.
- [ ] Add automated integration tests for session rotation + grace-window logic.

### Student Module (5)

- [ ] Add paginated student search endpoint (`/students/search`).
- [ ] Add profile completion/checklist endpoint for onboarding UX prompts.
- [ ] Add delete endpoints for profile and cover photos.
- [ ] Add stricter image validation (dimensions/aspect) using upload constants.
- [ ] Add profile report endpoint with abuse reason + metadata.

### Social Module (5)

- [ ] Add pagination and cursor support for followers/following/requests lists.
- [ ] Add social suggestions endpoint based on shared context (dept/hostel/mutuals).
- [ ] Add mutual connections endpoint and service.
- [ ] Add notification hooks/events for follow-request lifecycle.
- [ ] Add tests for block-follow interaction guarantees.

### Core Module (4)

- [ ] Expose read-only lookup APIs for hostels/departments/courses (`/api/v1/meta/*`).
- [ ] Add service-level validation for master-data references in onboarding/profile flows.
- [ ] Add seed idempotency checks and verification command output.
- [ ] Add minimal caching strategy for lookup endpoints.

### Shared/Infra Module (4)

- [ ] Add API-level rate limiter middleware with route-group policy presets.
- [ ] Add structured request logging with request id and user id correlation.
- [ ] Add standardized error codes (not only messages) for frontend flow control.
- [ ] Add contract tests for middleware chain behavior (auth + onboarding gates).

### Documentation and QA Module (5)

- [ ] Keep swagger examples aligned with all current request/response payloads.
- [ ] Add route-to-swagger consistency check as CI step.
- [ ] Add module-level integration test suites (auth/student/social).
- [ ] Add API changelog section in README for each release.
- [ ] Document privacy snapshot behavior and onboarding gate behavior explicitly.

### Frontend Module (PRD Delivery) (5)

- [ ] Implement onboarding-first route guard and forced redirect handling.
- [ ] Build username availability check with debounce and conflict UX.
- [ ] Build privacy settings modal with per-mode restore UX.
- [ ] Wire session-management UI (`/auth/sessions` and session revoke).
- [ ] Build social relationship UI states using relationship endpoint.

---

## Risks / Notes

- Auth refresh and logout methods are intentionally GET for now; docs match code.
- Onboarding gate is now critical path; client must handle `403` onboarding-required responses centrally.
- Session revocation and logout-all flows work, but transaction hardening is still pending.
