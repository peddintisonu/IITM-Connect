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

| Method | Route                                      | Description           |
| ------ | ------------------------------------------ | --------------------- |
| POST   | `/api/v1/social/follow/:followingId`       | Send follow request   |
| DELETE | `/api/v1/social/follow/:followingId`       | Unfollow              |
| POST   | `/api/v1/social/follow/:followerId/accept` | Accept follow request |
| POST   | `/api/v1/social/follow/:followerId/reject` | Reject follow request |
| DELETE | `/api/v1/social/follow/:followerId/remove` | Remove a follower     |
| GET    | `/api/v1/social/follow/followers`          | Get my followers      |
| GET    | `/api/v1/social/follow/following`          | Get my following      |
| GET    | `/api/v1/social/follow/requests`           | Get pending requests  |
| POST   | `/api/v1/social/block/:blockedId`          | Block a student       |
| DELETE | `/api/v1/social/block/:blockedId`          | Unblock a student     |
| GET    | `/api/v1/social/block`                     | Get my block list     |

---

## ✅ Student Profile & Discovery Module

### Profile Management

- `GET /api/v1/students/me` — retrieve authenticated user's full profile
- `GET /api/v1/students/:username` — public/semi-private profile view (privacy-aware)
- `PATCH /api/v1/students/me/profile` — edit bio, links, interests, skills, displayName, username
- `PATCH /api/v1/students/me/hostel` — update current hostel and room, appends to `hostelHistory`
- `PATCH /api/v1/students/me/privacy` — toggle between public/private account type, manage hidden fields

### Photo Management

- `PATCH /api/v1/students/me/photo` — upload profile photo (max 5MB)
- `PATCH /api/v1/students/me/cover` — upload cover photo (max 10MB)
- Cloudinary integration — auto-delete old photos before uploading new ones
- Image format support — JPEG, PNG, WebP, HEIC, HEIF

### Upload Configuration

- **Profile Photo** — 5MB max, min 200x200px, 1:1 aspect ratio
- **Cover Photo** — 10MB max, min 800x200px, 16:9 or 3:1 aspect ratio
- **Post Images** — 10MB max, up to 10 per post, 1:1, 4:5, or 16:9 aspect ratios
- **Documents** — 20MB max, PDF only (for future use)
- Multer memory storage for validation before Cloudinary upload
- File filter validates mime types and size limits

### Privacy & Visibility System

- Profile view logic — respects blocks, follows, and privacy settings
    - Blocked profiles — return 404 for both directions
    - Private account + non-follower — minimal profile (displayName, username, photo, accountType only)
    - Public account or follower — full profile minus hidden fields
- Hidden fields support — 8 allowed: `rollNo`, `batch`, `graduationYear`, `dept`, `course`, `hostel`, `roomNo`, `email`
- Default hidden fields — public accounts hide `roomNo`, private accounts hide `rollNo`, `hostel`, `roomNo`
- Privacy field selection — stripped from API responses

### Constants & Configuration

- `STUDENT_SELF_SELECT` — full profile minus tokens and private Cloudinary IDs
- `STUDENT_PUBLIC_SELECT` — limited public view, excludes email, history, system fields
- `UPLOAD_LIMITS` — centralized config for all image/document limits
- Mime type allow-list — prevents invalid file uploads

### Validation Schemas (Zod)

- `onboardingSchema` — displayName (2+), username (3-20, alphanumeric+underscore), optional hostel+room
- `updateProfileSchema` — all fields optional, bio max 200 chars, links max 5, interests/skills max 10/15
- `updateHostelSchema` — both hostel and room required together
- `updatePrivacySchema` — accountType or hiddenFields required, field enum validation

### Implementation Details

- Profile fetch service `getStudentByUsername()` — handles privacy filtering logic
- Cloudinary upload service — streams to buffer, stores public_id for deletion
- Photo deletion — removes old Cloudinary asset before uploading new one
- Error handling — validation errors aggregated and returned as single string
- All endpoints protected by `protectRoute` middleware

### Swagger Documentation

- Complete OpenAPI/Swagger schemas for Student model and all endpoints
- Request/response examples documented
- Error codes (400, 401, 404, 409) with descriptions
- Security scheme defined for cookie-based auth

---

## 🔜 Security Improvements (Pre-Launch)

- Rate limiting on auth routes — prevent brute force on `/google` and `/refresh`
- Asymmetric keys (RS256) — replace shared JWT secret with private/public key pair
- Sliding session expiry — reset 7 day clock on active use
- Redis for session storage — faster auth middleware at scale
- Device info updation

---

## ⏳ Next Up

- Student discovery & search — `GET /api/v1/students/search?query=...&dept=...&batch=...`
- Org module — Organisation, OrgRole, OrgRoleTemplate, OrgTenure, POR system

---

## 📋 Detailed Next Steps (Updated Roadmap)

### ✅ Phase 1: Student Profile & Discovery (COMPLETED)

**Profile Management Routes (DONE)**

- ✅ `GET /api/v1/students/me` — authenticated user's full profile
- ✅ `PATCH /api/v1/students/me/profile` — edit bio, links, interests, skills, displayName
- ✅ `PATCH /api/v1/students/me/privacy` — toggle account type, manage hidden fields
- ✅ `PATCH /api/v1/students/me/hostel` — update hostel and room
- ✅ `GET /api/v1/students/:username` — public profile view (privacy-aware, respects blocks)

**Photo Upload (DONE)**

- ✅ `PATCH /api/v1/students/me/photo` — profile photo upload with validation
- ✅ `PATCH /api/v1/students/me/cover` — cover photo upload with validation
- ✅ Cloudinary integration with auto-deletion of old photos
- ✅ Upload limits config (5MB profile, 10MB cover)

**Privacy & Visibility (DONE)**

- ✅ Privacy-aware profile fetching (blocks, follows, hidden fields)
- ✅ 8 allowed hidden fields with smart defaults
- ✅ Private account protection — minimal profile for non-followers

**Validation & Docs (DONE)**

- ✅ Zod schemas for all inputs with comprehensive validation
- ✅ Swagger/OpenAPI documentation for all endpoints
- ✅ Error handling with field-level validation messages

### Phase 1B: Student Discovery & Search (1-2 weeks)

1. **Search Endpoint**
    - `GET /api/v1/students/search?query=...&dept=...&batch=...&hostel=...&page=...&limit=...`
    - Text search on `displayName`, `username` (partial matches)
    - Filters — department, batch, hostel, account status
    - Pagination — default 20 results per page
    - Privacy-aware — respect hidden fields, blocks, private accounts

2. **Search Indices**
    - Create compound index on `displayName`, `username` for text search
    - Index on `currentDeptId`, `currentBatch`, `currentHostelId` for filtering
    - Consider search performance implications

3. **Suggestions/Autocomplete**
    - `GET /api/v1/students/search/suggestions?query=...` — limited results (5-10) for typeahead
    - Fast lookup for usernames and display names

### Phase 2: Organization Module (Week 2-3)

1. **Organisation Model**
    - `name`, `handle` (unique, like username), `description`, `logo`, `coverPhoto`
    - `createdBy` (founder ObjectId), `members[]` array of role objects
    - `type` — `"technical"` | `"cultural"` | `"sports"` | `"academic"` | `"other"`
    - `isVerified`, `joinPolicy` — `"open"` | `"approval"` | `"invite"`
    - Metadata — `followerCount`, `memberCount`, `createdAt`, `updatedAt`

2. **OrgRole Model**
    - Embedded in org's `members` array, not separate collection
    - `memberId` (StudentId), `role` (applies template), `status` (`"active"` | `"inactive"`), `joinedAt`, `leftAt`

3. **OrgRoleTemplate (Preset Roles)**
    - Defined per org
    - `roleName`, `permissions[]` — `post`, `moderate`, `invite`, `manage_roles`, `edit_org`, `remove_member`
    - Presets: Admin (all), Moderator (post, moderate, invite), Member (post)

4. **POR (Position of Responsibility) Tracking**
    - Separate collection or embedded in Org model
    - `studentId`, `orgId`, `position`, `roleId`, `startDate`, `endDate`
    - Displayed on student profile under achievements
    - Historical tracking — multiple PORs per student across time

5. **Organization Routes** (MVP)
    - `POST /api/v1/org` — create organization (auth required)
    - `GET /api/v1/org/:handle` — public org profile
    - `PATCH /api/v1/org/:id` — edit org details (admin only)
    - `POST /api/v1/org/:id/members` — invite/add member (respects joinPolicy)
    - `GET /api/v1/org/:id/members` — list members with roles
    - `POST /api/v1/org/:id/join` — join an open org
    - `POST /api/v1/org/:id/leave` — leave an org
    - `DELETE /api/v1/org/:id/members/:memberId` — remove member (admin only)

### Phase 3: Feed & Content (Week 3-4)

1. **Post Model**
    - `authorId`, `authorType` (`"student"` | `"org"`), `content` (required, max 1500 chars)
    - `mediaUrls[]` — up to 10 images, supports multiple formats
    - `metadata` — `likes[]`, `commentCount`, `shareCount`, `repostCount`
    - Timestamps — `createdAt`, `updatedAt`
    - Privacy: respects author's privacy settings + account type
    - Status — `"published"` | `"draft"` | `"archived"`

2. **Comment Model**
    - `postId`, `authorId`, `content`, `likes`, timestamps
    - Nested replies support (optional Phase 2)

3. **Feed Endpoints**
    - `POST /api/v1/posts` — create post (image upload middleware)
    - `GET /api/v1/feed` — personalized feed (following's posts, chronological or algorithm)
    - `GET /api/v1/students/:username/posts` — user's timeline (public/private per settings)
    - `GET /api/v1/org/:orgId/posts` — org timeline
    - `PATCH /api/v1/posts/:id` — edit own post (auth + author check)
    - `DELETE /api/v1/posts/:id` — delete own post
    - `POST /api/v1/posts/:id/like` — like/unlike post
    - `POST /api/v1/posts/:id/comment` — add comment
    - `GET /api/v1/posts/:id/likers` — who liked this post

4. **Feed Algorithm (Phase 3 V2 - Optional)**
    - Chronological default for MVP
    - Future: Engagement-based ranking (likes, comments, follows)

### Phase 4: Notifications & Real-time (Week 4+)

1. **Notification Model**
    - `recipientId`, `type` (`"follow_request"`, `"follow_accepted"`, `"post_like"`, `"comment"`, `"org_invite"`, etc.)
    - `relatedUserId`, `relatedPostId`, `relatedOrgId`, `message` (rich text or template-based)
    - `isRead`, `readAt`, `archivedAt`
    - `createdAt` — for chronological ordering

2. **Notification Routes**
    - `GET /api/v1/notifications` — all unread notifications
    - `GET /api/v1/notifications?read=false&limit=20` — pagination
    - `PATCH /api/v1/notifications/:id/read` — mark single notification as read
    - `PATCH /api/v1/notifications/read-all` — mark all as read
    - `DELETE /api/v1/notifications/:id` — archive/delete notification

3. **Socket.io Integration** (Real-time)
    - Follow request notifications — instant
    - Post interactions notifications — likes, comments (with batching)
    - Org invites — instant
    - Presence tracking — online/offline status
    - Typing indicators (optional)

4. **Notification Preferences**
    - Per notification type opt-in/out
    - Digest options — real-time, hourly, daily
    - Mute specific users or orgs

---

## ✅ Completed Infrastructure & Services

- ✅ Cloudinary image upload service with error handling
- ✅ Upload middleware for multipart files with validation
- ✅ Image size/format/count validation in constants
- ✅ Multer memory storage for efficient processing
- ✅ Passport Google OAuth with smail domain restriction
- ✅ JWT session model with TTL indices
- ✅ Refresh token rotation mechanism
- ✅ Privacy middleware concepts (embedded in profile service)
- ✅ Master data seeding system
- ✅ Comprehensive error handling and response formatting

---

---

## 🔒 Security & Infrastructure Todos

**Completed**

- ✅ Request validation — Zod schemas with comprehensive field validation
- ✅ Image upload validation — mime types, file size, aspect ratio checks
- ✅ Multer file handling — memory storage to prevent disk bloat
- ✅ Cloudinary integration — secure cloud storage with public_id tracking
- ✅ Privacy middleware patterns — implemented in profile service
- ✅ CORS headers — configured in Express

**In Progress / Planned**

- [ ] Rate limiting middleware — auth, post creation, search routes
- [ ] Request sanitization — XSS prevention on text inputs
- [ ] Asymmetric JWT keys (RS256) — generate and store securely
- [ ] Refresh token updates — implement sliding session expiry
- [ ] Redis integration — session caching, rate limit counters, feed caching
- [ ] Audit logging — track sensitive operations (logout-all, privacy changes, blocks)
- [ ] Device tracking — store/update device info in session model
- [ ] CSRF protection — add double-submit cookie or sync token pattern
- [ ] API key management — for external services (if needed)
- [ ] SQL/NoSQL injection protection — already in MongoDB driver + Zod, but verify edge cases

---

## 📊 Database Housekeeping

- [ ] Index optimization — review slow queries, add missing indices
- [ ] TTL indices — verify session cleanup works correctly
- [ ] Bulk operations — seed larger data sets efficiently
- [ ] Migration scripts — prepare for future schema changes

---

---

## 🚀 Pre-Launch Checklist

**Completed**

- ✅ Basic API documentation — Swagger/OpenAPI setup
- ✅ Error handling — centralized errorHandler middleware with proper HTTP codes
- ✅ Input validation — Zod schemas for all endpoints
- ✅ Privacy system — blocks, follows, hidden fields, account types

**Core Features (MVP Verification)**

- [ ] Auth flow complete — Google OAuth, token refresh, logout, session invalidation
- [ ] Student onboarding — complete, with hostel history seeding
- [ ] Social features — follow, block, with privacy rules working
- [ ] Profile management — all CRUD operations functional
- [ ] Photo uploads — profile and cover photos to Cloudinary
- [ ] Search endpoints — ready to implement search UI
- [ ] Org module — basic models and routes
- [ ] Feed system — post creation, viewing, interactions
- [ ] Notifications — back-end ready, sockets optional for MVP

**Testing Required**

- [ ] Unit tests — utility functions, validation schemas
- [ ] Integration tests — auth flow with session, profile updates with privacy
- [ ] E2E tests — full user journeys (onboarding → profile → follow → post)
- [ ] Edge case testing — privacy boundaries, blocks in both directions, concurrent uploads
- [ ] Performance testing — query performance with large follow/follower lists
- [ ] Load testing — concurrent user registration and token refresh

**API Documentation**

- [ ] Swagger/OpenAPI complete for all endpoints
- [ ] Request/response examples for each endpoint
- [ ] Error codes documented with solutions
- [ ] Rate limits documented (once implemented)
- [ ] Authentication flow documented

**Deployment Readiness**

- [ ] Environment configuration validated — all `process.env` checks
- [ ] Secrets management — use `.env.example` as template
- [ ] Database migrations — seed script tested on fresh DB
- [ ] Logging strategy — implement structured logging before prod
- [ ] Monitoring & alerts — set up Application Performance Monitoring (APM)
- [ ] Error tracking — Sentry or similar for prod errors
- [ ] Uptime monitoring — health check endpoint configured

**Front-end Integration**

- [ ] API contract finalized — base URL, auth headers, error format
- [ ] CORS policy tested with client origin
- [ ] Cookie policy — sameSite, secure flag settings
- [ ] TypeScript types — client-side types generated or manual definitions
- [ ] Error messages — user-friendly formatting from API errors

**Google OAuth Production Setup**

- [ ] OAuth app created in Google Cloud Console
- [ ] Redirect URIs configured (staging + prod)
- [ ] Client ID and Secret secured in prod `.env`
- [ ] Google signin button integration tested
- [ ] Token expiry handling — refresh before expiry during active session

---

## 📡 API Endpoints Summary

### Authentication

| Method | Route                          | Status | Description                   |
| ------ | ------------------------------ | ------ | ----------------------------- |
| GET    | `/api/v1/auth/google`          | ✅     | Initiate Google OAuth         |
| GET    | `/api/v1/auth/google/callback` | ✅     | Google redirect callback      |
| GET    | `/api/v1/auth/me`              | ✅     | Current authenticated student |
| POST   | `/api/v1/auth/refresh`         | ✅     | Rotate access token           |
| POST   | `/api/v1/auth/logout`          | ✅     | Logout current session        |
| POST   | `/api/v1/auth/logout-all`      | ✅     | Logout all sessions           |

### Student Profile

| Method | Route                         | Status | Description                                     |
| ------ | ----------------------------- | ------ | ----------------------------------------------- |
| GET    | `/api/v1/students/me`         | ✅     | Full profile of self                            |
| GET    | `/api/v1/students/:username`  | ✅     | Public/private profile (privacy-aware)          |
| PATCH  | `/api/v1/students/me/profile` | ✅     | Edit bio, links, interests, skills, displayName |
| PATCH  | `/api/v1/students/me/hostel`  | ✅     | Update hostel and room                          |
| PATCH  | `/api/v1/students/me/privacy` | ✅     | Toggle account type, manage hidden fields       |
| PATCH  | `/api/v1/students/me/photo`   | ✅     | Upload profile photo                            |
| PATCH  | `/api/v1/students/me/cover`   | ✅     | Upload cover photo                              |
| PATCH  | `/api/v1/students/onboarding` | ✅     | First-time setup after signup                   |

### Social (Follow & Block)

| Method | Route                                      | Status | Description           |
| ------ | ------------------------------------------ | ------ | --------------------- |
| POST   | `/api/v1/social/follow/:followingId`       | ✅     | Send follow request   |
| DELETE | `/api/v1/social/follow/:followingId`       | ✅     | Unfollow              |
| POST   | `/api/v1/social/follow/:followerId/accept` | ✅     | Accept follow request |
| POST   | `/api/v1/social/follow/:followerId/reject` | ✅     | Reject follow request |
| DELETE | `/api/v1/social/follow/:followerId/remove` | ✅     | Remove a follower     |
| GET    | `/api/v1/social/follow/followers`          | ✅     | Get my followers      |
| GET    | `/api/v1/social/follow/following`          | ✅     | Get my following      |
| GET    | `/api/v1/social/follow/requests`           | ✅     | Get pending requests  |
| POST   | `/api/v1/social/block/:blockedId`          | ✅     | Block a student       |
| DELETE | `/api/v1/social/block/:blockedId`          | ✅     | Unblock a student     |
| GET    | `/api/v1/social/block`                     | ✅     | Get my block list     |

### Planned (Not Yet Started)

| Route                         | Description                    |
| ----------------------------- | ------------------------------ |
| `GET /api/v1/students/search` | Student discovery with filters |
| `POST /api/v1/org`            | Create organization            |
| `POST /api/v1/posts`          | Create post                    |
| `GET /api/v1/feed`            | Personalized feed              |
| `GET /api/v1/notifications`   | Get notifications              |
