# Frontend API Integration Guide

## Purpose

This document explains how frontend should consume backend APIs in IITMConnect.

Use this file to answer:

- Which route to call
- In what order to call routes
- What data to send
- Where to get unknown reference values (hostel, department, course)
- How to handle auth, refresh, and onboarding gates without panic

This guide is frontend-focused and practical. Swagger is still the contract source for request/response schema details.

---

## Do Not Panic: Working Rules

1. Never guess payload shape from UI labels.
2. Always verify with Swagger and route docs before wiring a form.
3. If backend expects an ID, send ID, not display text.
4. If one route does not give full data, chain routes intentionally.
5. Treat `401`, `403`, and `409` as normal integration states, not failures.

If something breaks, follow this sequence:

1. Confirm endpoint path and method.
2. Confirm request body keys and value types.
3. Confirm auth cookie presence and `withCredentials` behavior.
4. Confirm onboarding status and route gate.
5. Confirm data source for reference fields.

---

## Source Of Truth Stack

Use these in order:

1. Swagger UI: `http://localhost:5000/api-docs`
2. Swagger JSON: `http://localhost:5000/api-docs.json`
3. Engineering status and route intent: `server/Current_Status.md`
4. Product-level context only: `PRD.md`

Use Swagger for field-level schema and examples.
Use `server/Current_Status.md` for access rationale and flow intent.

---

## API Base And Response Shape

## Base URL

Frontend uses:

- `VITE_API_URL` from environment
- fallback: `http://localhost:5000`

All API routes are under `/api/v1/*`.

## Response Envelope

Backend standard success response shape:

```json
{
    "statusCode": 200,
    "data": {},
    "message": "Some success message",
    "success": true
}
```

Frontend should primarily consume `response.data.data`.

---

## Auth Model (Cookie Session)

- Access token and refresh token are sent via `httpOnly` cookies.
- Frontend must keep `withCredentials: true` for axios requests.
- On access token expiry, frontend should attempt refresh route and retry original request.

Current behavior:

- Refresh route is `GET /api/v1/auth/refresh`.
- Planned migration is `POST /api/v1/auth/refresh`.

Do not hardcode assumptions that refresh will remain GET forever.

---

## Route Catalog For Frontend

## Auth Routes

- `GET /api/v1/auth/google`: start login
- `GET /api/v1/auth/refresh`: refresh tokens
- `GET /api/v1/auth/logout`: logout current session
- `POST /api/v1/auth/logout-all`: logout all other sessions
- `GET /api/v1/auth/sessions`: list sessions
- `POST /api/v1/auth/sessions/:sessionId/logout`: revoke one session

## Student Routes

- `PATCH /api/v1/students/onboarding`
- `GET /api/v1/students/username-availability?username=...`
- `GET /api/v1/students/me`
- `PATCH /api/v1/students/me/profile`
- `PATCH /api/v1/students/me/photo`
- `PATCH /api/v1/students/me/cover`
- `PATCH /api/v1/students/me/hostel`
- `PATCH /api/v1/students/me/privacy`
- `POST /api/v1/students/cards`
- `GET /api/v1/students/search?q=&limit=&cursor=`
- `GET /api/v1/students/:username`

Student search note:

- Name matching is based on `displayName` token/initial matching and username prefix matching.

## Social Routes

- `POST /api/v1/social/follow/:followingId`
- `DELETE /api/v1/social/follow/:followingId/request`
- `DELETE /api/v1/social/follow/:followingId`
- `POST /api/v1/social/follow/:followerId/accept`
- `POST /api/v1/social/follow/:followerId/reject`
- `DELETE /api/v1/social/follow/:followerId/remove`
- `GET /api/v1/social/follow/followers?limit=&cursor=`
- `GET /api/v1/social/follow/following?limit=&cursor=`
- `GET /api/v1/social/follow/requests?limit=&cursor=`
- `GET /api/v1/social/follow/requests/sent?limit=&cursor=`
- `POST /api/v1/social/block/:blockedId`
- `DELETE /api/v1/social/block/:blockedId`
- `GET /api/v1/social/block?limit=&cursor=`
- `GET /api/v1/social/relationship/:studentId`

Social list pagination response shape:

```json
{
    "items": [],
    "nextCursor": "opaque-cursor-or-null",
    "hasMore": true
}
```

## Master Data Routes

- `GET /api/v1/master-data/bootstrap`
- `GET /api/v1/master-data/hostels`
- `GET /api/v1/master-data/departments`
- `GET /api/v1/master-data/courses`

Admin-only master-data mutations exist but are usually not part of regular student frontend flows.

---

## Reference Data Rules (Critical)

Never send labels when backend expects references.

Examples:

- Send `currentHostelId`, not `"Tapti"`
- Send `currentDeptId`, not `"Computer Science & Engineering"`
- Send `currentCourseId`, not `"B.Tech"`

Pattern:

1. Fetch reference list from master-data route.
2. Render human-friendly label in UI.
3. Store selected `_id` value in form state.
4. Submit only `_id` in payload.

---

## Multi-Route Flow Examples

## Example 1: Onboarding Form (Hostel Dropdown + Username Check)

Goal: user completes onboarding without wrong field assumptions.

Step order:

1. Load `GET /api/v1/students/me`.
2. Load `GET /api/v1/master-data/hostels` (or `/master-data/bootstrap`).
3. As user types handle, call `GET /api/v1/students/username-availability` with debounce.
4. On submit, call `PATCH /api/v1/students/onboarding`.

Payload example:

```json
{
    "displayName": "Siva",
    "username": "siva_iitm",
    "accountType": "public",
    "currentHostelId": "6801aabbccddeeff00112233",
    "currentRoomNo": 127
}
```

Do not send:

```json
{
    "currentHostelId": "Tapti"
}
```

---

## Example 2: Profile Page For Another Student

Goal: render profile with correct relationship and action state.

Step order:

1. `GET /api/v1/students/:username` to load profile data.
2. `GET /api/v1/social/relationship/:studentId` to determine button state.
3. Optional: for list cards, use `POST /api/v1/students/cards` to hydrate basic card details in bulk.

Button state logic depends on relationship response:

- follow
- requested
- following
- blocked context

---

## Example 3: Session Management Screen

Goal: show active devices and allow revocation.

Step order:

1. `GET /api/v1/auth/sessions`
2. Mark `currentSessionId` in UI
3. On revoke button, call `POST /api/v1/auth/sessions/:sessionId/logout`
4. Refresh sessions list

Bulk sign-out option:

- `POST /api/v1/auth/logout-all`

---

## Example 4: Follow Request Handling For Private Accounts

Goal: handle incoming and outgoing pending requests correctly.

Step order:

1. Incoming queue: `GET /api/v1/social/follow/requests`
2. Accept: `POST /api/v1/social/follow/:followerId/accept`
3. Reject: `POST /api/v1/social/follow/:followerId/reject`
4. Outgoing queue: `GET /api/v1/social/follow/requests/sent`
5. Cancel sent request: `DELETE /api/v1/social/follow/:followingId/request`

For all list calls above, include `limit` and optional `cursor`, then continue pagination using returned `nextCursor` while `hasMore` is true.

---

## Error Handling Guide

Treat these as expected states:

- `400`: invalid payload or validation mismatch
- `401`: access expired or missing auth; try refresh flow
- `403`: onboarding required or insufficient role/permission
- `404`: missing target entity
- `409`: conflict (for example username already taken)

Frontend behavior recommendation:

1. For `401`, attempt refresh once and retry.
2. For onboarding-required `403`, redirect to onboarding flow.
3. For `409`, show inline conflict UI (do not generic-toast only).
4. For `400`, map validation details to field-level errors where possible.

---

## Practical Frontend Checklist Before Any New Integration

1. Confirm route exists in Swagger and `server/Current_Status.md`.
2. Confirm method and body type (JSON vs multipart).
3. Confirm gate: public, protected, onboarding-required, admin-only.
4. Confirm all reference values are IDs from master data routes.
5. Add loading, empty, error, and retry UX states.
6. Verify response parsing reads `response.data.data`.
7. Add fallback handling for refresh and onboarding redirection.

---

## How To Use This Guide Day To Day

1. Start each feature from a user flow, not a single endpoint.
2. Write route chain first (which calls, what order, why).
3. Implement read path first, then write path.
4. Add validation and error handling before polish UI.
5. Re-check Swagger examples before merging.

When confused:

- Use Swagger to validate fields.
- Use `server/Current_Status.md` to understand access intent.
- Do not guess IDs, enums, or flow ordering.

---

## Known Temporary Contracts

- Refresh route currently uses GET and will move to POST in future.
- Build frontend service wrappers so route method migration requires minimal code changes.

---

## Ownership And Updates

Update this guide whenever:

- route changes
- payload shape changes
- response shape changes
- auth gate behavior changes
- onboarding rules change

If this guide and Swagger differ, first assume Swagger is latest schema, then verify with backend code or maintainer.
