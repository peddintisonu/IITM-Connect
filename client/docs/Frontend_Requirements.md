# Frontend Requirements (Module-Wise)

## Purpose

This document defines what frontend must build for IITMConnect from an execution perspective.

This is not just a feature list. It defines:

- pages and subviews
- required UI blocks
- required modals/drawers
- request and response handling UX
- module-wise user flows
- backend-driven UI suggestions so frontend does not guess contracts

Use this along with:

- `client/docs/Frontend_API_Integration_Guide.md`
- Swagger: `http://localhost:5000/api-docs`
- `server/Current_Status.md`

---

## How To Read This Document

Each module section has:

1. Scope now (current implementation)
2. Required pages
3. Required reusable UI blocks
4. Required modals/actions
5. Required API interactions
6. UX states (loading/empty/error/success)
7. Backend suggestions for request/response rendering
8. Acceptance checklist

If there is a conflict between UI assumption and API contract, API contract wins.

---

## Global Frontend Principles

1. Never infer request payload from display text labels.
2. Send IDs for reference fields, render labels for humans.
3. Treat `401`, `403`, and `409` as expected interaction states.
4. Every action view needs loading, empty, error, and retry handling.
5. Keep mutation feedback near the control that triggered it.
6. Avoid global generic toasts for field-specific validation failures.
7. Use optimistic updates only where rollback is simple and safe.

---

## App Shell Requirements

## Routing And Guards

Required guard behavior:

1. Not authenticated: allow landing/login routes only.
2. Authenticated but not onboarded: force redirect to onboarding-safe flow.
3. Authenticated and onboarded: allow all normal app routes.
4. On `403` onboarding-required response: route to onboarding immediately.

## Global Error UX

Required top-level handling:

1. `401` after refresh failure -> clear session state and route to login/landing.
2. `403` insufficient permissions -> show permission view, not generic crash screen.
3. network error -> show retry component with last action context.

## Request/Response Visibility Pattern

For actions like save/profile/follow/block:

- show action-level spinner
- disable relevant button only, not entire page unless needed
- map response message to contextual success text
- on failure, map backend message to inline helper text

---

## Module 1: Auth And Session

## Scope Now

Implemented backend routes include login, refresh, logout, logout-all, session listing, and single-session revoke.

## Required Pages

1. Landing/Auth Entry page
2. Session Management section in settings

## Required UI Blocks

1. OAuth entry CTA block
2. Session card list block
3. Current session badge block
4. Device metadata chip block (device/browser/last active)
5. Session revoke action row

## Required Modals

1. Confirm revoke selected session
2. Confirm logout all other sessions

## Required API Calls

1. `GET /api/v1/auth/google`
2. `GET /api/v1/auth/refresh`
3. `GET /api/v1/auth/logout`
4. `POST /api/v1/auth/logout-all`
5. `GET /api/v1/auth/sessions`
6. `POST /api/v1/auth/sessions/:sessionId/logout`

## UX Requirements

1. Session list loading skeleton
2. Empty state when only one active session exists
3. Inline pending state for revoke button per row
4. Disable destructive actions while request in-flight
5. Show clear success text: "Session revoked" / "Logged out from other devices"

## Backend Suggestions For UI

1. Use session list response to identify and pin current session visually.
2. Keep revoke action unavailable for current session row if backend semantics require that behavior.
3. Use route-specific messaging from response `message` to reduce ambiguity.

## Acceptance Checklist

1. User can see all sessions and identify current one.
2. User can revoke a specific session and list refreshes correctly.
3. User can logout all others without losing current session unexpectedly.
4. Expired access token flows recover via refresh once.

---

## Module 2: Onboarding

## Scope Now

Onboarding route exists and is mandatory before access to social/profile routes.

## Required Page

1. Onboarding page at first-login gate

## Required UI Blocks

1. Display name input
2. Username input with live availability indicator
3. Account type selector (public/private)
4. Hostel selector (dropdown using master-data IDs)
5. Room number numeric input
6. Primary submit CTA

## Critical Contract Requirement

- `currentHostelId` must be selected via dropdown with `_id` values.
- Do not use free text hostel input.

## Required Modals

No mandatory modal. Inline form validation is preferred.

## Required API Calls

1. `GET /api/v1/students/me`
2. `GET /api/v1/master-data/hostels` or `GET /api/v1/master-data/bootstrap`
3. `GET /api/v1/students/username-availability?username=...`
4. `PATCH /api/v1/students/onboarding`

## UX Requirements

1. Debounced username availability check
2. Inline status: checking / available / taken
3. Validation messages:
    - invalid username pattern
    - room required when hostel selected
    - hostel required when room entered
4. Submit button disabled while pending
5. On success: refresh user and redirect to home feed

## Backend Suggestions For UI

1. For hostels, render option label as hostel name, option value as hostel `_id`.
2. Keep room field optional unless hostel selected.
3. Preserve server error message and show near relevant form area.

## Acceptance Checklist

1. User cannot proceed to normal app routes without onboarding.
2. Hostel selection uses IDs from master data.
3. Username conflict is handled inline via `409` or availability response.
4. Successful onboarding updates auth user state and routing.

---

## Module 3: Student Profile (Self + Other)

## Scope Now

Profile fetch, profile update, hostel update, privacy update, profile and cover photo uploads are available.

## Required Pages

1. My profile view
2. Other user profile view
3. Settings profile edit section

## Required UI Blocks

1. Profile header card (avatar, cover, displayName, username)
2. Bio and metadata section
3. Skills/interests chips
4. External links list
5. Relationship action block (follow/unfollow/cancel)
6. Block/unblock action block

## Required Modals

1. Confirm block action
2. Optional unsaved-changes modal for profile editing

## Required API Calls

Read:

1. `GET /api/v1/students/me`
2. `GET /api/v1/students/:username`
3. `GET /api/v1/social/relationship/:studentId` (for other profile)

Write: 4. `PATCH /api/v1/students/me/profile` 5. `PATCH /api/v1/students/me/hostel` 6. `PATCH /api/v1/students/me/privacy` 7. `PATCH /api/v1/students/me/photo` (multipart) 8. `PATCH /api/v1/students/me/cover` (multipart)

## UX Requirements

1. Profile loading skeleton
2. Missing profile empty/error state with back navigation
3. Save action grouped by section with clear success/failure messages
4. Character limits displayed for bio and text arrays where relevant
5. Multipart upload progress or pending indicator

## Backend Suggestions For UI

1. Keep hostel edit as ID-based selector using master data.
2. Preserve privacy semantics: account type toggles visibility behavior.
3. For partial updates, send only changed fields where possible.
4. For multipart updates, keep request content type to `multipart/form-data`.

## Acceptance Checklist

1. Self profile renders full permitted fields.
2. Other profile respects privacy/filtering returned by backend.
3. Relationship button state matches relationship endpoint.
4. Profile and cover uploads refresh UI immediately after success.

---

## Module 4: Social Graph (Follow/Followers/Requests/Block)

## Scope Now

Follow lifecycle and block lifecycle routes are implemented.
All social list endpoints now return cursor-paginated responses.

## Required Pages

1. Connections page with tabs:
    - Followers
    - Following
    - Incoming requests
    - Sent requests
2. Block list section in settings

## Required UI Blocks

1. Reusable user relationship card
2. Follow action button variants (Follow, Requested, Following)
3. Request action row (Accept, Reject)
4. Block list row with unblock CTA

## Required Modals

1. Confirm destructive remove/unfollow actions (optional but recommended)
2. Confirm block action

## Required API Calls

1. `POST /api/v1/social/follow/:followingId`
2. `DELETE /api/v1/social/follow/:followingId/request`
3. `DELETE /api/v1/social/follow/:followingId`
4. `POST /api/v1/social/follow/:followerId/accept`
5. `POST /api/v1/social/follow/:followerId/reject`
6. `DELETE /api/v1/social/follow/:followerId/remove`
7. `GET /api/v1/social/follow/followers?limit=&cursor=`
8. `GET /api/v1/social/follow/following?limit=&cursor=`
9. `GET /api/v1/social/follow/requests?limit=&cursor=`
10. `GET /api/v1/social/follow/requests/sent?limit=&cursor=`
11. `POST /api/v1/social/block/:blockedId`
12. `DELETE /api/v1/social/block/:blockedId`
13. `GET /api/v1/social/block?limit=&cursor=`
14. `GET /api/v1/social/relationship/:studentId`

## UX Requirements

1. Tab-level loading states
2. Per-tab empty states with clear copy
3. Per-row action pending states
4. Relationship state freshness after action (invalidate/refetch)
5. Blocked state must visibly prevent follow action paths
6. Support load-more/infinite-scroll behavior using `nextCursor` and `hasMore`

## Backend Suggestions For UI

1. Always re-fetch relationship state after follow/block mutation.
2. Treat block as stronger relationship state than follow.
3. Use backend result as truth for action label transitions.
4. For list endpoints, consume response as `{ items, nextCursor, hasMore }` instead of raw arrays.

## Acceptance Checklist

1. Each tab reflects latest server state after actions.
2. Pending requests can be accepted/rejected correctly.
3. Sent requests can be canceled correctly.
4. Blocking removes actionable follow controls in UI.

---

## Module 5: Master Data Consumption

## Scope Now

Master data read APIs are available and should drive frontend reference selections.

## Required Views

1. Reference dropdowns in onboarding and settings profile sections
2. Optional bootstrap cache layer initialization at app start

## Required UI Blocks

1. Async select for hostels
2. Reusable id-label mapper utility for rendering references

## Required API Calls

1. `GET /api/v1/master-data/bootstrap`
2. `GET /api/v1/master-data/hostels`
3. `GET /api/v1/master-data/departments`
4. `GET /api/v1/master-data/courses`

## UX Requirements

1. Reference data loading state in dropdown
2. Retry action if reference fetch fails
3. Prevent form submit when required reference data unavailable

## Backend Suggestions For UI

1. Prefer bootstrap call for initial hydration when multiple reference datasets are needed.
2. Cache reference data client-side and invalidate on app reload or explicit refresh.
3. Keep selected ID stable even if label changes in future.

## Acceptance Checklist

1. No free-text hostels for `currentHostelId` payloads.
2. All reference fields submit IDs only.
3. UI labels are always mapped from fetched reference data.

---

## Module 6: Settings Workspace

## Scope Now

Settings includes profile edits, privacy controls, block list, and sessions.

## Required Subsections

1. Profile
2. Privacy
3. Blocking
4. Sessions

## Required UI Blocks

1. Section tab switcher
2. Editable profile form block
3. Privacy toggle cards
4. Block list manager
5. Session manager with device cards

## Required Modals

1. Confirm session revoke
2. Confirm logout all
3. Optional confirm privacy change to private

## UX Requirements

1. Preserve section-level state while switching tabs if feasible
2. Do not mix success/error messages across tabs
3. Use section-scoped feedback containers

## Backend Suggestions For UI

1. Profile and hostel updates may be separate endpoints; surface partial failures clearly.
2. For privacy updates, display behavioral meaning in plain language (public vs private).
3. Session APIs are onboarding-gated; ensure settings is not reachable pre-onboarding.

## Acceptance Checklist

1. Each settings tab independently functional.
2. API errors shown in same tab context.
3. Sensitive actions require explicit confirmation.

---

## Module 7: Organization Request Workflow

## Scope Now

Implemented backend routes:

1. `POST /api/v1/organizations/requests`
2. `POST /api/v1/organizations/requests/:requestId/approve`
3. `POST /api/v1/organizations/requests/:requestId/reject`

## Required Pages

1. Organization request submission page (student-facing)
2. Organization request review workspace (admin/super-admin-facing)

## Required UI Blocks

1. Organization basics form section (name, slug, category, optional parent)
2. First tenure form section (name, cycleYear, start/end date inputs)
3. First tenure role-config builder table (role, parentRoleId, level, sortOrder, maxHolders, canBeVacant)
4. Creator requested role selector
5. Approval requirement toggle (`requiresParentTopPorApproval`)

## Required Modals

1. Confirm request submit
2. Confirm approve request
3. Reject request modal with mandatory remarks field

## Required API Calls

1. `POST /api/v1/organizations/requests`
2. `POST /api/v1/organizations/requests/:requestId/approve`
3. `POST /api/v1/organizations/requests/:requestId/reject`

## UX Requirements

1. Slug conflict (`409`) must render inline against slug field.
2. Parent-approval toggle should enforce parent org selection in UI.
3. Reject action must enforce remarks before API call.
4. Approve/reject buttons should have per-action pending state and double-submit guard.

## Backend Suggestions For UI

1. Keep role and parent-role IDs from role source lists, never role labels in payload.
2. Use backend message text to show moderation outcome copy.
3. Approve/reject routes are admin-gated; hide actions for non-admin users.

## Acceptance Checklist

1. Student can submit valid request payload without contract mismatch.
2. Admin can approve/reject with clear success/failure states.
3. Reject remarks are mandatory and validated in UI.

---

## Module 8: POR Tenure, Role Config, and Assignment

## Scope Now

Implemented backend routes include tenure CRUD/status, role-config CRUD/tree/bulk/clone, and assignment create.

## Required Pages

1. Tenure list page per organization
2. Tenure create/edit drawer
3. Tenure role-config management page with hierarchy view
4. Assignment creation panel for tenure role configs

## Required UI Blocks

1. Month/year period picker (startMonth/startYear/endMonth/endYear)
2. Tenure status badge + status transition action block
3. Role config editable table and hierarchy tree view
4. Assignment form with optional partial month/year period fields

## Required Modals

1. Confirm tenure status transition
2. Confirm role-config deletion
3. Confirm clone role-configs from another tenure

## Required API Calls

1. `GET /api/v1/pors/tenures`
2. `GET /api/v1/pors/tenures/:tenureId`
3. `POST /api/v1/pors/tenures`
4. `PATCH /api/v1/pors/tenures/:tenureId`
5. `PATCH /api/v1/pors/tenures/:tenureId/status`
6. `GET /api/v1/pors/tenures/:tenureId/role-configs`
7. `GET /api/v1/pors/tenures/:tenureId/role-configs/tree`
8. `POST /api/v1/pors/tenures/:tenureId/role-configs`
9. `PUT /api/v1/pors/tenures/:tenureId/role-configs/bulk`
10. `PATCH /api/v1/pors/tenures/:tenureId/role-configs/:configId`
11. `PATCH /api/v1/pors/tenures/:tenureId/role-configs/:configId/status`
12. `DELETE /api/v1/pors/tenures/:tenureId/role-configs/:configId`
13. `POST /api/v1/pors/tenures/:tenureId/role-configs/clone-from/:sourceTenureId`
14. `POST /api/v1/pors/assignments`

## UX Requirements

1. Tenure form must treat month/year as primary period contract.
2. Role-config table must validate required role on create and enforce numeric ranges in UI.
3. Assignment form must support full-tenure default and optional partial period override.
4. Conflict responses (`409`) should map to specific UI messages:
    - tenure overlap
    - role at capacity
    - duplicate active assignment
    - role-config mutation conflicts

## Backend Suggestions For UI

1. For tenure updates, if user edits period, submit all four month/year fields together.
2. For partial assignment period, send all four assignment period fields together.
3. Role-config tree view should use `/tree` endpoint instead of re-constructing hierarchy in frontend.

## Acceptance Checklist

1. Tenure create/update works with month/year payloads and conflict handling.
2. Role-config CRUD/bulk/clone paths are fully wired with form validation.
3. Assignment create supports both full and partial tenure windows.

---

## Cross-Module UX Contracts

## Required State Matrix For Every Data Block

Each data block should define:

1. Idle
2. Loading
3. Success with data
4. Success with empty data
5. Recoverable error with retry
6. Mutation pending
7. Mutation success
8. Mutation failure with actionable message

## Required Field Validation Matrix

For editable forms:

1. Client-side quick validation for immediate feedback.
2. Server-side validation mapping for final authority.
3. Inline message placement near offending field.
4. Keep submit button enabled only when form is valid enough to send.

---

## Flow Definitions (End-To-End)

## Flow A: First Login To Ready State

1. User lands on app.
2. Starts OAuth login.
3. Callback completes and user session cookies are set.
4. Frontend fetches `/students/me`.
5. If `isOnboarded` false -> force onboarding.
6. Frontend loads hostels and username availability during onboarding.
7. User submits onboarding.
8. Frontend refetches `/students/me` and routes to home.

## Flow B: Visit Another Profile And Follow

1. User opens profile by username.
2. Frontend loads profile data.
3. Frontend loads relationship state for that student.
4. UI renders action based on relationship.
5. User clicks follow.
6. Frontend updates action state after mutation response/refetch.

## Flow C: Private Account Request Review

1. User opens connections requests tab.
2. Frontend loads incoming requests.
3. User accepts/rejects one request.
4. Row updates immediately and list refreshes.
5. Relationship state in profile pages stays consistent.

## Flow D: Session Hardening

1. User opens sessions tab.
2. Frontend loads sessions and marks current session.
3. User revokes old device.
4. Frontend refreshes list and confirms action.
5. User can optionally logout all other sessions.

## Flow E: Residence Update Without Contract Mistakes

1. Frontend loads hostels list.
2. User selects hostel label from dropdown.
3. Form state stores hostel `_id`.
4. User enters room number.
5. Frontend sends `currentHostelId` + numeric `currentRoomNo`.
6. Backend response updates profile state.

## Flow F: Organization Request To Approval

1. Student opens organization request page.
2. Frontend captures organization + first tenure + role-config hierarchy + creator role.
3. Frontend submits request.
4. Admin opens request review workspace.
5. Admin approves or rejects with remarks.
6. UI reflects final status and provisioning outcome.

## Flow G: Tenure Setup To Assignment

1. Admin creates tenure with month/year period fields.
2. Admin creates or bulk-upserts role configs for that tenure.
3. Admin creates assignment for selected role config.
4. Optional partial assignment window is provided for mid-tenure cases.
5. Frontend refreshes tenure/role-config/assignment state after mutation.

---

## Backend-To-UI Suggestions: Request And Response Blocks

For each mutation form, include a compact request and response helper block in dev-facing UI comments/docs.

Suggested internal pattern:

1. Request shape helper (dev comment/docs only)
2. Success response shape helper
3. Common error examples helper

Example for onboarding:

Request:

```json
{
    "displayName": "Siva",
    "username": "siva_iitm",
    "accountType": "public",
    "currentHostelId": "6801aabbccddeeff00112233",
    "currentRoomNo": 127
}
```

Success response (envelope):

```json
{
    "statusCode": 200,
    "data": {
        "_id": "...",
        "username": "siva_iitm",
        "isOnboarded": true
    },
    "message": "Onboarding complete",
    "success": true
}
```

Conflict sample:

```json
{
    "statusCode": 409,
    "message": "Username already taken",
    "success": false
}
```

This pattern helps frontend developers debug quickly and helps AI tools stay aligned.

---

## Suggested Component Inventory

Create reusable components to avoid repeated fragile logic:

1. `AsyncSelectField` for master data references
2. `InlineFieldError` for API validation feedback
3. `ActionStateButton` with idle/pending/success/error visual states
4. `ConnectionCard` for social lists
5. `SessionCard` for session manager
6. `EmptyStatePanel` standardized with retry support
7. `ApiErrorBanner` with route-specific hints

---

## Testing Expectations (Frontend)

Minimum test expectations per module:

1. Guard/routing tests:
    - unauthenticated redirect
    - onboarding-required redirect
2. API integration tests:
    - correct route/method/body wiring
    - refresh retry flow
3. UI behavior tests:
    - loading/empty/error states
    - relationship button transitions
4. Form tests:
    - username validation
    - hostel ID submission
    - privacy toggle behavior

---

## Delivery Sequence Recommendation

Recommended implementation order:

1. Auth guard + onboarding gate reliability
2. Onboarding contract correction (hostel ID dropdown)
3. Settings profile/privacy/session stabilization
4. Social connections and relationship consistency
5. UX polish and resilience

This order reduces integration churn and avoids building advanced UI on unstable contract assumptions.

---

## Definition Of Done (Frontend Module)

A module is done only when:

1. Routes are wired with correct method and payload.
2. All expected UX states exist.
3. Error handling is specific and user-actionable.
4. Reference fields use backend IDs, not labels.
5. Relationship/auth/onboarding state transitions are consistent.
6. Feature behavior matches `server/Current_Status.md` and Swagger.

---

## Ownership And Update Rule

Update this file whenever:

- a new page or modal is introduced
- an endpoint contract changes
- a flow step changes
- a route gate changes
- a UI block becomes required/obsolete

Keep this document stable and implementation-focused so teammates and AI can execute without assumption gaps.
