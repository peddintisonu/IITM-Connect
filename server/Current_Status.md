# IITMConnect — Current Status

## Snapshot

- Date: 19-04-2026
- Stack in active use: Express + TypeScript + MongoDB + Passport Google OAuth + Zod + Swagger + React + Vite
- Current source of truth split:
    - `PRD.md` -> product vision and V1/V2 scope
    - `server/Current_Status.md` -> implementation reality and next execution steps

---

## 1. Monorepo and Platform Status

### Completed

- Monorepo with npm workspaces is active (`client` + `server`).
- Shared root scripts for dev, build, lint, format are in place.
- Express app is bootstrapped with:
    - JSON parsing
    - CORS
    - Cookie parser
    - Morgan logging
    - Passport initialization
    - centralized error handler
- Health and docs endpoints are active.

### Current API Mounts

- `/api/v1/auth`
- `/api/v1/master-data`
- `/api/v1/students`
- `/api/v1/social`
- `/api/v1/health`
- `/api-docs` and `/api-docs.json`

---

## 2. Backend Module Status

## 2.1 Auth Module

### Completed

- Google OAuth with strict `@smail.iitm.ac.in` gate.
- Session-based JWT auth with cookie delivery.
- Access + refresh token strategy implemented.
- Refresh token hashing and persistence implemented.
- Session model supports multi-device tracking and revocation metadata.
- Token version invalidation (`tokenVersion`) enforced.
- Refresh rotation with previous token grace window logic implemented.
- Session listing and targeted session revocation implemented.

### Current Auth Routes

| Method | Route                                     | What this route does (detailed)                                                                            | Who can access                                                                      | Why this access gate exists                                                                                          | Status                         |
| :----- | :---------------------------------------- | :--------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- | :----------------------------- |
| GET    | `/api/v1/auth/google`                     | Starts Google OAuth by redirecting user to Google consent screen.                                          | Unauthenticated users and authenticated users who intentionally re-enter auth flow. | This is the external login entrypoint; blocking public access would prevent sign-in.                                 | implemented                    |
| GET    | `/api/v1/auth/google/callback`            | Handles Google callback, validates smail domain, creates student if needed, issues cookies, and redirects. | Public callback endpoint, but guarded by redirect-if-authenticated behavior.        | Google must call this endpoint without prior app session context; guard prevents duplicate/accidental re-auth loops. | implemented                    |
| GET    | `/api/v1/auth/failure`                    | Returns a standardized auth failure response when OAuth fails.                                             | Public.                                                                             | Failure path must be reachable without auth to complete OAuth error handling safely.                                 | implemented                    |
| GET    | `/api/v1/auth/refresh`                    | Validates refresh cookie and rotates session/token state to issue a fresh access token.                    | Public route relying on refresh cookie presence/validity.                           | Access token may expire while user is otherwise valid; route must be callable even when access token is absent.      | implemented (temporary method) |
| GET    | `/api/v1/auth/logout`                     | Ends current session (current device) using active auth context.                                           | Authenticated users only (`protectRoute`).                                          | Logout is session-scoped and must target a verified current session identity.                                        | implemented                    |
| POST   | `/api/v1/auth/logout-all`                 | Revokes all other active sessions and preserves/rotates current session state.                             | Authenticated and onboarded users only.                                             | Multi-session controls are user-security actions and should be available only after full account readiness.          | implemented                    |
| GET    | `/api/v1/auth/sessions`                   | Returns active/recent sessions with current session identification for device management UI.               | Authenticated and onboarded users only.                                             | Session metadata is sensitive account data and is exposed only for fully onboarded account management.               | implemented                    |
| POST   | `/api/v1/auth/sessions/:sessionId/logout` | Revokes one selected session/device from the current user session list.                                    | Authenticated and onboarded users only.                                             | Prevents unauthorized session revocation and keeps session governance tied to verified account state.                | implemented                    |

### Contract Note

- `GET /auth/refresh` is a known temporary choice and should be migrated to `POST` with coordinated frontend update.

---

## 2.2 Student Module

### Completed

- New student creation from OAuth profile and parsed roll metadata.
- Onboarding flow implemented with one-time completion guard.
- Username availability check implemented.
- Current student self endpoint (`/me`) implemented.
- Profile text update endpoint implemented.
- Hostel update endpoint implemented.
- Privacy update endpoint implemented.
- Profile and cover photo upload endpoints implemented.
- Privacy-aware public profile fetch by username implemented.
- Student cards endpoint implemented for batch profile-card retrieval.
- Student search endpoint implemented with cursor support.

### Current Student Routes

| Method | Route                                              | What this route does (detailed)                                                                               | Who can access                                       | Why this access gate exists                                                                                       | Status      |
| :----- | :------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- | :---------- |
| PATCH  | `/api/v1/students/onboarding`                      | Completes one-time onboarding by setting display identity, account type, and optional hostel/room references. | Authenticated users who are not fully onboarded yet. | Onboarding must be protected from anonymous writes, but available before onboarding-complete gate is satisfied.   | implemented |
| GET    | `/api/v1/students/username-availability?username=` | Validates whether a username can be claimed by current user under server rules.                               | Authenticated users.                                 | Prevents anonymous enumeration and keeps validation aligned with logged-in account context.                       | implemented |
| GET    | `/api/v1/students/me`                              | Returns current student profile from DB with self-view fields and latest server state.                        | Authenticated users.                                 | Self profile is account data and must be tied to verified token/session context.                                  | implemented |
| PATCH  | `/api/v1/students/me/profile`                      | Updates editable text profile fields such as display name, username, bio, links, skills, interests.           | Authenticated + onboarded users.                     | Core profile edits are a post-onboarding activity and require fully initialized account identity.                 | implemented |
| PATCH  | `/api/v1/students/me/photo`                        | Uploads and sets profile photo through upload middleware and cloud storage integration.                       | Authenticated + onboarded users.                     | Media updates should be available only once account has completed onboarding and identity is stable.              | implemented |
| PATCH  | `/api/v1/students/me/cover`                        | Uploads and sets profile cover image through upload middleware and cloud storage integration.                 | Authenticated + onboarded users.                     | Same control boundary as other post-onboarding profile customization actions.                                     | implemented |
| PATCH  | `/api/v1/students/me/hostel`                       | Updates hostel reference and room number, and appends hostel history for traceability.                        | Authenticated + onboarded users.                     | Residence data affects privacy and social visibility; update allowed only after baseline onboarding state exists. | implemented |
| PATCH  | `/api/v1/students/me/privacy`                      | Updates account visibility mode and hidden-field preferences with snapshot behavior.                          | Authenticated + onboarded users.                     | Privacy controls are account-critical and depend on initialized profile/onboarding state.                         | implemented |
| POST   | `/api/v1/students/cards`                           | Returns lightweight profile card data for a list of user IDs, filtered by block/privacy constraints.          | Authenticated + onboarded users.                     | Bulk identity lookups can expose social graph context; gate reduces abuse and enforces social/privacy rules.      | implemented |
| GET    | `/api/v1/students/search`                          | Searches students with query, limit, and cursor semantics while excluding blocked relations.                  | Authenticated + onboarded users.                     | Discovery features are post-onboarding social features and should not be available to incomplete accounts.        | implemented |
| GET    | `/api/v1/students/:username`                       | Returns privacy-filtered view of a specific student profile based on relationship and block rules.            | Authenticated + onboarded users.                     | Profile viewing is social-domain behavior and must respect onboarding and relationship privacy contracts.         | implemented |

### Important Data Contract Rules (Current)

- `currentHostelId` is an ID reference, not a hostel name string.
- `currentRoomNo` is numeric.
- If hostel is provided, room number is required.
- If room number is provided, hostel is required.
- Username validation is lowercase + number + underscore format.

---

## 2.3 Social Module

### Completed

- Follow request lifecycle implemented:
    - send request
    - cancel sent request
    - accept/reject request
    - unfollow
    - remove follower
- Follower/following/pending/sent-pending list endpoints implemented.
- Relationship lookup endpoint implemented.
- Block/unblock/list block endpoints implemented.
- Block operation removes follow edges as expected.

### Current Social Routes

| Method | Route                                        | What this route does (detailed)                                                                | Who can access                   | Why this access gate exists                                                                              | Status      |
| :----- | :------------------------------------------- | :--------------------------------------------------------------------------------------------- | :------------------------------- | :------------------------------------------------------------------------------------------------------- | :---------- |
| POST   | `/api/v1/social/block/:blockedId`            | Blocks target student and removes follow edges in both directions.                             | Authenticated + onboarded users. | Blocking is a safety control inside social graph and must operate only for valid, initialized accounts.  | implemented |
| DELETE | `/api/v1/social/block/:blockedId`            | Removes an existing block between current user and target student.                             | Authenticated + onboarded users. | Unblock alters relationship permissions and is restricted to authenticated social context.               | implemented |
| GET    | `/api/v1/social/block`                       | Returns current user block list for privacy/safety management UI.                              | Authenticated + onboarded users. | Block list reveals sensitive social safety state and must remain private to owner account.               | implemented |
| POST   | `/api/v1/social/follow/:followingId`         | Creates follow edge or pending request based on target account visibility rules.               | Authenticated + onboarded users. | Follow operations are core social actions and require complete onboarding state to avoid ghost accounts. | implemented |
| DELETE | `/api/v1/social/follow/:followingId/request` | Cancels a follow request previously sent to a private account.                                 | Authenticated + onboarded users. | Request lifecycle integrity requires verified identity and valid social actor state.                     | implemented |
| DELETE | `/api/v1/social/follow/:followingId`         | Unfollows an already followed target.                                                          | Authenticated + onboarded users. | Relationship mutation is user-specific social data and requires authenticated context.                   | implemented |
| POST   | `/api/v1/social/follow/:followerId/accept`   | Accepts a pending follow request received by current user.                                     | Authenticated + onboarded users. | Only request receiver should approve access to their private profile graph.                              | implemented |
| POST   | `/api/v1/social/follow/:followerId/reject`   | Rejects a pending follow request received by current user.                                     | Authenticated + onboarded users. | Same privacy/ownership rule as accept; decision is profile owner's control.                              | implemented |
| DELETE | `/api/v1/social/follow/:followerId/remove`   | Removes an existing follower from current user's follower set.                                 | Authenticated + onboarded users. | Follower management is ownership-sensitive social control.                                               | implemented |
| GET    | `/api/v1/social/follow/followers`            | Returns list of followers for current user with social visibility constraints.                 | Authenticated + onboarded users. | Social graph lists are protected account relationship data.                                              | implemented |
| GET    | `/api/v1/social/follow/following`            | Returns list of accounts current user follows.                                                 | Authenticated + onboarded users. | Prevents anonymous graph scraping and keeps graph tied to verified account identity.                     | implemented |
| GET    | `/api/v1/social/follow/requests`             | Returns incoming pending follow requests for private-account handling UI.                      | Authenticated + onboarded users. | Pending requests are private moderation queue for account owner only.                                    | implemented |
| GET    | `/api/v1/social/follow/requests/sent`        | Returns outgoing follow requests currently pending approval.                                   | Authenticated + onboarded users. | Outgoing pending state is user-specific and should not be publicly exposed.                              | implemented |
| GET    | `/api/v1/social/relationship/:studentId`     | Returns relationship state between current user and target (follow, pending, blocked context). | Authenticated + onboarded users. | Required for UI state decisions and must be constrained to authenticated social interactions.            | implemented |

---

## 2.4 Core Master Data Module

### Completed

- Hostels, departments, and courses models exist.
- Master data seed pipeline exists.
- Runtime CRUD endpoints for master data exist.
- Bootstrap endpoint exists for consuming multiple master-data sets.

### Current Master Data Routes

| Method | Route                                           | What this route does (detailed)                                                          | Who can access              | Why this access gate exists                                                                                 | Status      |
| :----- | :---------------------------------------------- | :--------------------------------------------------------------------------------------- | :-------------------------- | :---------------------------------------------------------------------------------------------------------- | :---------- |
| GET    | `/api/v1/master-data/bootstrap`                 | Returns hostels, departments, and courses in one call for form bootstrapping and caches. | Any authenticated user.     | Reference data is needed by normal product flows; auth is still required to avoid unauthenticated scraping. | implemented |
| GET    | `/api/v1/master-data/hostels`                   | Returns hostel master list for dropdowns, filters, and validations.                      | Any authenticated user.     | Hostel reference list is widely needed by user flows after login.                                           | implemented |
| POST   | `/api/v1/master-data/hostels`                   | Creates a new hostel master record.                                                      | Admin and super-admin only. | Master data mutations affect the entire system and require elevated governance control.                     | implemented |
| PATCH  | `/api/v1/master-data/hostels/:hostelId`         | Updates hostel metadata such as name/code/type.                                          | Admin and super-admin only. | Prevents unauthorized edits to global reference identifiers used across student records.                    | implemented |
| DELETE | `/api/v1/master-data/hostels/:hostelId`         | Deletes a hostel master record.                                                          | Admin and super-admin only. | Deletion is high-impact and restricted to privileged governance roles.                                      | implemented |
| GET    | `/api/v1/master-data/departments`               | Returns department master list for profile and academic references.                      | Any authenticated user.     | Departments are core reference data required for user-facing forms and display mapping.                     | implemented |
| POST   | `/api/v1/master-data/departments`               | Creates a new department master record.                                                  | Admin and super-admin only. | Department set integrity must be centrally controlled to avoid invalid academic mappings.                   | implemented |
| PATCH  | `/api/v1/master-data/departments/:departmentId` | Updates department name/code metadata.                                                   | Admin and super-admin only. | Department keys are system-wide references and require privileged change control.                           | implemented |
| DELETE | `/api/v1/master-data/departments/:departmentId` | Deletes a department master record.                                                      | Admin and super-admin only. | High-impact reference removal is restricted to platform administrators.                                     | implemented |
| GET    | `/api/v1/master-data/courses`                   | Returns course master list for degree metadata and graduation calculations.              | Any authenticated user.     | Course reference data is required to render and validate academic profile context.                          | implemented |
| POST   | `/api/v1/master-data/courses`                   | Creates a new course master record.                                                      | Admin and super-admin only. | Course additions impact parsing and academic workflows, so privilege restriction is required.               | implemented |
| PATCH  | `/api/v1/master-data/courses/:courseId`         | Updates course metadata including code/abbreviation/duration.                            | Admin and super-admin only. | Protects consistency of course-derived logic (such as graduation year expectations).                        | implemented |
| DELETE | `/api/v1/master-data/courses/:courseId`         | Deletes a course master record.                                                          | Admin and super-admin only. | Prevents accidental removal of globally referenced course entities by non-admin users.                      | implemented |

---

## 2.5 Shared Middleware and Utility Layer

### Completed

- `protectRoute` auth/session/token-version validation.
- `requireOnboardingComplete` access gating.
- `redirectIfAuthenticated` OAuth flow guard.
- Upload middleware for image routes.
- Shared response/error utility classes and async wrapper.

### Current Behavioral Gate

- Non-onboarded users can authenticate but are restricted from onboarding-required routes.

---

## 2.6 API Documentation and Validation

### Completed

- Swagger generation and UI serving are implemented.
- Module-level swagger files are wired.
- Zod request validation is in place for key module inputs.

### Current Limitation

- Swagger alone is not sufficient to prevent frontend assumption gaps for reference fields and UX flow contracts.

---

## 3. Frontend Status (Current Reality)

### Completed

- React + Vite app scaffolded.
- Core pages/components scaffolded.
- Axios base API with credential cookies enabled.
- Auth context setup and session-aware user loading.
- Auto-refresh on 401 flow implemented in API interceptor.
- Onboarding page implemented with username availability check.

### In Progress / Partial

- Post-login product flows are partial and still evolving.
- Contract alignment with backend references needs stronger enforcement.

### Known Frontend Contract Gap

- Onboarding currently presents hostel as text-style UX, while backend expects `currentHostelId` as reference ID.

---

## 4. Completed vs PRD V1

### Already in Place

- Identity foundation (OAuth + sessions + onboarding gate)
- Student profile foundation
- Social graph foundation (follow + block)
- Master data foundation

### Not Yet in Place (Major V1 Buckets)

- Organization/POR hierarchy domain modules
- Feed and post system
- Events lifecycle
- Polls and forums
- Complaint workflow
- Notification and recommendation pipelines

---

## 5. Next Up (Execution Backlog)

## 5.1 Immediate Priority (Now)

- Finalize backend-frontend contract documentation per module.
- Ensure onboarding and profile flows consume master data by ID, not labels.
- Add frontend guard handling for onboarding-required API responses.

## 5.2 Auth Next Up

- Migrate `GET /auth/refresh` -> `POST /auth/refresh` with frontend interceptor update.
- Add rate limits on auth-sensitive routes.
- Add auth lifecycle audit logging.
- Add integration tests for rotation and grace-window behavior.

## 5.3 Student Next Up

- Add delete profile photo endpoint.
- Add delete cover photo endpoint.
- Add stricter upload validations (dimensions and limits).
- Add abuse/report endpoint.
- Add test coverage for onboarding and privacy behavior.

## 5.4 Social Next Up

- Add pagination/cursor normalization for all list endpoints.
- Add suggestions endpoint.
- Add mutual connections endpoint.
- Add tests for block-follow consistency rules.

## 5.5 Core and Infra Next Up

- Harden master-data reference validation from service layer.
- Add idempotent seed verification path.
- Add structured logging with request correlation.
- Add standard machine-readable error codes.

## 5.6 QA and Documentation Next Up

- Keep Swagger examples synchronized with implementation.
- Add route-to-swagger consistency checks in CI.
- Add module-level integration test suites.
- Maintain API changelog entries for contract-impacting changes.

---

## 6. V2 Scope (Engineering Planning View)

### V2 Candidate Modules

- Direct messages
- Group chat for official org spaces
- In-app election pipeline
- External participant portal
- Alumni mode
- Org analytics
- Buy/sell board
- Budget transparency
- Faculty/warden read-only access
- Native mobile app (post PWA adoption)

### V2 Entry Criteria

- Stable V1 authentication and onboarding funnel.
- Reliable social and profile baseline usage.
- Core operational modules delivered for V1 commitments.
- Backend test and contract confidence above current baseline.

---

## 7. Risks and Active Notes

- API method semantics mismatch still exists on refresh route and needs migration.
- Documentation must clearly separate display labels from ID references.
- Onboarding gate behavior must be handled centrally in frontend error flows.
- Large V1 scope requires strict sequencing to avoid parallel unfinished modules.

---

## 8. Update Rule

Update this document whenever any of the following changes:

- route added/removed/renamed
- request/response payload contract changed
- auth or onboarding gate behavior changed
- V1/V2 scope status changed
- backlog priority changed

This file is the implementation truth for teammates and AI assistants.
