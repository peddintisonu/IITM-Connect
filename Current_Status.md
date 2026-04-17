# IITMConnect — Current Status

## ✅ Monorepo Base Setup

- npm workspaces configured (client + server)
- TypeScript setup done — root `tsconfig.base.json` + server `tsconfig.json`
- ESLint + Prettier configured with TypeScript support
- Root scripts available for dev, build, lint, format, clean, and reinstall
- Express server wiring in place with `/api/v1/health`, Swagger UI, and JSON spec output

---

## ✅ Auth Module

- Zod env validation with typed `ENV` object
- MongoDB Atlas connected via mongoose with separate `DB_NAME`
- Passport Google OAuth strategy with smail domain check (`@smail.iitm.ac.in`)
- Student model with `tokenVersion` for session invalidation
- Session model with TTL index, device info, hashed refresh token storage
- Session management extended with IP/userAgent tracking, `lastAccessedAt`, revoked sessions, and per-device session listing/revocation
- Auth controller issues device-aware sessions from Google callback using UA + IP metadata
- JWT auth — access token (15m) + refresh token (7d) in httpOnly cookies
- `sessionId` embedded in JWT payload — direct link between token and session
- Refresh token rotation — old session deleted, new session created on every refresh
- Refresh token hashed with SHA-256 before storing in DB
- `asyncHandler`, `ApiError`, `ApiResponse`, `parseExpiry` utilities
- `errorHandler` middleware — centralized error formatting
- `protectRoute` middleware — verifies JWT + tokenVersion + session existence in parallel
- `redirectIfAuthenticated` middleware — prevents duplicate sessions on re-login
- `clearAuthCookies` helper — DRY cookie clearing across logout controllers
- Auth service — `generateTokens`, `refreshAccessToken`, `logoutOne`, `logoutAll`
- Auth routes
    - `GET  /api/v1/auth/google` — triggers Google OAuth
    - `GET  /api/v1/auth/google/callback` — Google redirect, issues tokens
    - `GET  /api/v1/auth/failure` — auth failure response
    - `GET  /api/v1/auth/refresh` — rotates tokens (currently GET; should become POST)
    - `GET  /api/v1/auth/logout` — clears current session
    - `POST /api/v1/auth/logout-all` — clears all sessions, increments tokenVersion
    - `GET  /api/v1/auth/sessions` — lists sessions for current user
    - `POST /api/v1/auth/sessions/:sessionId/logout` — revokes a specific session
- Express type augmentation for `req.user` as `IStudent`
- `session.model.ts` moved to `modules/auth/`

---

## ✅ Core Master Data Module

- `Hostel` model — name, code, type (`boys` | `girls`)
- `Department` model — name, code
- `Course` model — name, code, abbreviation, duration (optional for PhD)
- All three models live in `modules/core/models/`
- Structured seed system
    - `seeds/index.ts` — central seed runner, handles connect + disconnect
    - `seeds/masterData.seed.ts` — seeds all three collections with `deleteMany` before insert
    - `shared/constants/masterData.constants.ts` — all raw seed data in one place
- Seeded master data is already in place for hostels, departments, and courses

---

## ✅ Student Module

- Single Student collection — all profile data embedded, no separate collections
- `fullName` — frozen from Google OAuth display name, never editable
- `displayName` and `username` — set during onboarding by student
- Academic fields at root — `currentRollNo`, `currentDeptId`, `currentCourseId`, `currentBatch`, `graduationYear`
    - `currentBatch` stored as full year e.g. `2024` not `24`
    - `graduationYear` calculated from batch + course duration, null for PhD
    - `currentYear` not stored — calculated on the fly from batch and current date
- Hostel fields at root — `currentHostelId`, `currentRoomNo` (stored as Number)
- Social fields — `profilePhoto`, `coverPhoto`, `bio`, `links[]`, `interests[]`, `skills[]`
    - `links[]` stored as `{ label, url }` objects
- `rollNoHistory[]` — appended on dept/course change, no dates tracked
- `hostelHistory[]` — appended on every hostel change, no dates tracked, seeded on onboarding
- `accountType` — `"public"` | `"private"`, default `"public"`
- `privacySettings` — simplified `hiddenFields[]` array
    - public account defaults — `hiddenFields: ["roomNo"]`
    - private account defaults — `hiddenFields: ["rollNo", "hostel", "roomNo"]`
    - student can add or remove any field anytime
- `getDefaultPrivacy()` method — returns correct hidden fields based on `accountType`
- `incrementTokenVersion()` method — invalidates all sessions on logout-all

### Utilities

- `parseRollNo` — parses smail prefix into `deptCode`, `batch`, `courseCode`, `rollNo`
- `cleanFullName` — strips roll number suffix from Google display name
- Both exported from `shared/utils/index.ts` barrel

### Services

- `createStudentFromOAuth(email, displayName, photoUrl)`
    - parses smail, looks up dept and course by code
    - calculates `graduationYear`
    - creates Student document with all prefilled academic data
    - called from Passport on new student login
- `onboardStudent(studentId, data)`
    - blocks re-onboarding if already onboarded
    - checks username uniqueness
    - validates hostel + room together or neither
    - sets `displayName`, `username`, `accountType`, `privacySettings`, `isOnboarded: true`
    - seeds first `hostelHistory` entry

### Routes

- `PATCH /api/v1/students/onboarding` — protected, sets onboarding data
- `GET /api/v1/students/me` — protected, returns current student
- `PATCH /api/v1/students/me/profile` — protected, updates profile fields
- `PATCH /api/v1/students/me/hostel` — protected, updates hostel and room
- `PATCH /api/v1/students/me/privacy` — protected, updates account type / hidden fields
- `PATCH /api/v1/students/me/photo` — protected, uploads profile photo
- `PATCH /api/v1/students/me/cover` — protected, uploads cover photo
- `GET /api/v1/students/:username` — protected, privacy-aware profile view

### Validation

- Onboarding Zod schema — `displayName`, `username`, `accountType`, `currentHostelId`, `currentRoomNo`

---

## ✅ Social Module

### Follow Model

- `followerId`, `followingId`, `followingType` (`"student"` | `"org"`), `status` (`"pending"` | `"accepted"`), `acceptedAt`
- `refPath` on `followingId` — dynamic ref to Student or Org collection based on `followingType`
- Compound unique index on `followerId + followingId` — prevents duplicate follows
- Index on `followingId + status` — fast follower lookups

### Block Model

- `blockerId`, `blockedId`
- Compound unique index on `blockerId + blockedId` — prevents duplicate blocks

### Follow Service

- `sendFollowRequest` — checks self follow, block in both directions, duplicate follow, sets status based on target `accountType`
- `acceptFollowRequest` — finds pending request, updates to accepted with `acceptedAt` timestamp
- `rejectFollowRequest` — deletes pending request
- `cancelSentFollowRequest` — cancels outgoing pending request
- `unfollow` — deletes follow document
- `removeFollower` — removes someone who follows you
- `getFollowers` — all accepted followers with populated student data
- `getFollowing` — all accepted following with populated data
- `getPendingRequests` — all pending incoming follow requests
- `getSentPendingRequests` — all pending outgoing follow requests
- `getRelationship` — one-shot relationship state for profile UI

### Block Service

- `blockStudent` — checks self block, duplicate block, creates block, removes all follows in both directions
- `unblockStudent` — deletes block document
- `getBlockList` — returns all blocked students with populated data

### Routes — `social.routes.ts`

| Method | Route                                        | Description                     |
| ------ | -------------------------------------------- | ------------------------------- |
| POST   | `/api/v1/social/follow/:followingId`         | Send follow request             |
| DELETE | `/api/v1/social/follow/:followingId/request` | Cancel outgoing pending request |
| DELETE | `/api/v1/social/follow/:followingId`         | Unfollow                        |
| POST   | `/api/v1/social/follow/:followerId/accept`   | Accept follow request           |
| POST   | `/api/v1/social/follow/:followerId/reject`   | Reject follow request           |
| DELETE | `/api/v1/social/follow/:followerId/remove`   | Remove a follower               |
| GET    | `/api/v1/social/follow/followers`            | Get my followers                |
| GET    | `/api/v1/social/follow/following`            | Get my following                |
| GET    | `/api/v1/social/follow/requests`             | Get pending requests            |
| GET    | `/api/v1/social/follow/requests/sent`        | Get sent pending requests       |
| GET    | `/api/v1/social/relationship/:studentId`     | Get relationship state          |
| POST   | `/api/v1/social/block/:blockedId`            | Block a student                 |
| DELETE | `/api/v1/social/block/:blockedId`            | Unblock a student               |
| GET    | `/api/v1/social/block`                       | Get my block list               |

---

## ✅ Student Profile & Discovery Module

### Profile Management

- `GET /api/v1/students/me` — retrieve authenticated user's full profile
- `GET /api/v1/students/:username` — public/semi-private profile view (privacy-aware)
- `PATCH /api/v1/students/me/profile` — edit bio, links, interests, skills, displayName, username
- `PATCH /api/v1/students/me/hostel` — update current hostel and room, appends to `hostelHistory`
- `PATCH /api/v1/students/me/privacy` — toggle between public/private account type, manage hidden fields

### Photo Management

- `PATCH /api/v1/students/me/photo` — upload profile photo
- `PATCH /api/v1/students/me/cover` — upload cover photo
- Cloudinary integration — auto-delete old photos before uploading new ones
- Image format support — JPEG, PNG, WebP, HEIC, HEIF

### Upload Configuration

- Profile photo and cover photo upload middleware are implemented
- Multer memory storage is used for validation before Cloudinary upload
- File filter validates mime types and size limits

### Privacy & Visibility System

- Profile view logic respects blocks, follows, and privacy settings
- Blocked profiles return 404 for both directions
- Private account + non-follower sees only minimal profile data
- Public account or follower sees full profile minus hidden fields
- Privacy-aware field selection is stripped from API responses

### Swagger Documentation

- Swagger/OpenAPI is wired for the implemented routes
- Request/response schemas exist for auth, student, and social flows

---

## ✅ Frontend Status

- Landing page is implemented
- OAuth entry CTA points to backend Google auth endpoint
- Responsive navbar and video-backed hero are present
- No post-login dashboard, feed, profile screens, or org pages yet

---

## 🔜 Security Improvements (Pre-Launch)

- Rate limiting on auth routes — prevent brute force on `/google` and `/refresh`
- Asymmetric keys (RS256) — replace shared JWT secret with private/public key pair
- Sliding session expiry — reset 7 day clock on active use
- Redis for session storage — faster auth middleware at scale
- Device info updation

---

## ⏳ Next Up

### Auth Module

- [ ] Switch `/api/v1/auth/refresh` from GET to POST
- [ ] Add rate limiting to auth routes
- [ ] Add session cleanup / sliding expiry polish
- [ ] Add tests for token rotation and logout-all behavior

### Core Module

- [ ] Add lookup endpoints for master data
- [ ] Add validation checks for seed data
- [ ] Expose `/api/v1/meta/hostels`
- [ ] Expose `/api/v1/meta/departments`
- [ ] Expose `/api/v1/meta/courses`

### Student Module

- [ ] Add `GET /api/v1/students/search?q=&limit=&cursor=`
- [ ] Add `GET /api/v1/students/username-availability?username=`
- [ ] Add `DELETE /api/v1/students/me/photo`
- [ ] Add `DELETE /api/v1/students/me/cover`
- [ ] Add `GET /api/v1/students/:username/mutuals`
- [ ] Add `POST /api/v1/students/me/report`

### Social Module

- [ ] Add `DELETE /api/v1/social/follow/:followingId/request` cancellation flow polish
- [ ] Add `GET /api/v1/social/relationship/:studentId` UI integration
- [ ] Add `GET /api/v1/social/suggestions`
- [ ] Add notification hooks for follow and block actions

### Org Module

- [ ] Create base org models and routes
- [ ] Add org hierarchy and POR system
- [ ] Add role templates and tenure tracking
- [ ] Add approval and handover flows

### Frontend

- [ ] Build post-login dashboard layout
- [ ] Create auth redirect handling after callback
- [ ] Build student profile pages
- [ ] Implement follow/block UI
- [ ] Create feed timeline component

### Testing

- [ ] Unit tests for utilities and validation schemas
- [ ] Integration tests for auth/session and privacy flows
- [ ] E2E tests for onboarding and social flows

---

## ✅ Completed Infrastructure & Services

- Cloudinary image upload service with error handling
- Upload middleware for multipart files with validation
- Image size/format/count validation in constants
- Multer memory storage for efficient processing
- Passport Google OAuth with smail domain restriction
- JWT session model with TTL indices
- Refresh token rotation mechanism
- Privacy middleware concepts embedded in profile service
- Master data seeding system
- Comprehensive error handling and response formatting
