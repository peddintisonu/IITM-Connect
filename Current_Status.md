# IITMConnect — Current Status

## ✅ Monorepo Base Setup

- npm workspaces configured (client + server)
- TypeScript setup done — root `tsconfig.base.json` + server `tsconfig.json`
- ESLint + Prettier configured with TypeScript support
- Server folder structure created (modules, shared, config, events, jobs, validations, seeds)
- Express server running with `/api/v1/health` endpoint
- `.gitignore`, `README.md`, `.env.example` in place

---

## ✅ Auth Module

- Zod env validation with typed `ENV` object
- MongoDB Atlas connected via mongoose with separate `DB_NAME`
- Passport Google OAuth strategy with smail domain check (`@smail.iitm.ac.in`)
- Student model with `tokenVersion` for session invalidation
- Session model with TTL index, device info, hashed refresh token storage
- JWT auth — access token (15m) + refresh token (7d) in httpOnly cookies
- `sessionId` embedded in JWT payload — direct link between token and session
- Refresh token rotation — old session deleted, new session created on every refresh
- Refresh token hashed with SHA-256 before storing in DB — safe against DB compromise
- `asyncHandler`, `ApiError`, `ApiResponse`, `parseExpiry` utilities
- `errorHandler` middleware — centralized error formatting
- `protectRoute` middleware — verifies JWT + tokenVersion + session existence in parallel
- `redirectIfAuthenticated` middleware — prevents duplicate sessions on re-login
- `clearAuthCookies` helper — DRY cookie clearing across logout controllers
- Auth service — `generateTokens`, `refreshAccessToken`, `logoutOne`, `logoutAll`
- Auth routes
  - `GET  /api/v1/auth/google` — triggers Google OAuth
  - `GET  /api/v1/auth/google/callback` — Google redirect, issues tokens
  - `GET  /api/v1/auth/me` — returns current student
  - `POST /api/v1/auth/refresh` — rotates tokens
  - `POST /api/v1/auth/logout` — clears current session
  - `POST /api/v1/auth/logout-all` — clears all sessions, increments tokenVersion
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
- 10 courses seeded — B.Tech, B.S., Dual Degree, M.Tech, M.A., Ph.D., M.S., M.Sc., MBA, BS Medical
- 18 departments seeded — AE, AM, BE, CH, CY, CE, CS, DA, EE, ED, HS, MS, MA, ME, MM, OE, PH, MD
- 20 hostels seeded — 15 boys, 5 girls with correct codes
- Seed script — `npm run seed -w server`

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

- `PATCH /api/v1/student/onboarding` — protected, sets onboarding data

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
- `unfollow` — deletes follow document
- `removeFollower` — removes someone who follows you
- `getFollowers` — all accepted followers with populated student data
- `getFollowing` — all accepted following with populated data
- `getPendingRequests` — all pending incoming follow requests

### Block Service

- `blockStudent` — checks self block, duplicate block, creates block, removes all follows in both directions
- `unblockStudent` — deletes block document
- `getBlockList` — returns all blocked students with populated data

### Routes — `social.routes.ts`

| Method | Route | Description |
| ------ | ----- | ----------- |
| POST | `/api/v1/social/follow/:followingId` | Send follow request |
| DELETE | `/api/v1/social/follow/:followingId` | Unfollow |
| POST | `/api/v1/social/follow/:followerId/accept` | Accept follow request |
| POST | `/api/v1/social/follow/:followerId/reject` | Reject follow request |
| DELETE | `/api/v1/social/follow/:followerId/remove` | Remove a follower |
| GET | `/api/v1/social/follow/followers` | Get my followers |
| GET | `/api/v1/social/follow/following` | Get my following |
| GET | `/api/v1/social/follow/requests` | Get pending requests |
| POST | `/api/v1/social/block/:blockedId` | Block a student |
| DELETE | `/api/v1/social/block/:blockedId` | Unblock a student |
| GET | `/api/v1/social/block` | Get my block list |

---

## 🔜 Security Improvements (Pre-Launch)

- Rate limiting on auth routes — prevent brute force on `/google` and `/refresh`
- Asymmetric keys (RS256) — replace shared JWT secret with private/public key pair
- Sliding session expiry — reset 7 day clock on active use
- Redis for session storage — faster auth middleware at scale
- Device info updation

---

## ⏳ Next Up

- Student profile endpoints — `GET /api/v1/student/:username`, `PATCH /api/v1/student/profile`
- Org module — Organisation, OrgRole, OrgRoleTemplate, OrgTenure, POR system

