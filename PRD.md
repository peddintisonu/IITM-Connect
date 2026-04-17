# PRD — CampusOS

### Product Requirements Document

**Institute:** IIT Madras  
**Stack:** MERN + TypeScript  
**Team:** 2 developers  
**Start Date:** 11-04-2026  
**Last Updated:** 17-04-2026

---

## 1. Overview

CampusOS is a unified campus platform for IIT Madras replacing WhatsApp groups, mass mails, Google Forms, and scattered Instagram pages.

### The Core Idea

```
LinkedIn (profiles + PORs)
+ Instagram (clubs posting)
+ Intranet (college ops)
```

### The Problem It Solves

- No unified student identity or POR tracking
- Mass emails with no targeting
- Club communication scattered across Instagram and WhatsApp
- No formal lost and found
- No structured event registration or volunteer management
- Elections via Google Forms with no audit trail
- No institutional memory when POR holders graduate

---

## 2. Target Users

| User Type       | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| Regular Student | Consumer — browses feed, follows clubs, registers for events |
| POR Holder      | Producer — posts, manages org, verifies members              |
| Super Admin     | Seeds system, approves orgs, resolves disputes               |

---

## 3. College Context

| Entity     | Details                                                                              |
| ---------- | ------------------------------------------------------------------------------------ |
| Auth       | smail Google OAuth (@smail.iitm.ac.in)                                               |
| Scale      | ~10,000 students, 15+ hostels, 50+ clubs                                             |
| Orgs       | Clubs, Teams, Fests, Hostel Bodies, Dept Bodies, Monitoring Committees, Insti Bodies |
| Key Fests  | Saarang, Shaastra                                                                    |
| Key Bodies | CFI, SEC, MMCC                                                                       |

## 4. Org Types

- club: activity clubs, manual apply, POR based
- team: sports or tech teams, manual apply, POR based
- fest: Saarang, Shaastra, recruited, POR based
- hostel: hostel and student body, auto by profile, POR based
- department: department body, auto by roll number, POR based
- monitoring_committee: mess, shops, SEC, appointed, POR based
- insti_body: student council or GS, POR based
- institute_handle: institutional accounts like @iitmadras, not POR based

## 5. POR System

- Super Admin seeds the top level of each org hierarchy.
- POR approval flows upward through the hierarchy; statuses are pending, active, completed, and revoked.
- Role templates are versioned, and roles are permanent documents that are only deactivated.
- Tenure is a separate entity, and PORs are tied to a specific tenure and template version.

## 6. DB Schema Summary

- Master data: hostels, departments, and courses are seeded once and not edited through the app.
- Student: identity, profile, academic fields, history arrays, privacy settings, `status`, `isOnboarded`, and `tokenVersion`.
- Follow: `followerId`, `followingId`, `followingType`, `status`, `acceptedAt`; org follows are always accepted.
- Block: `blockerId`, `blockedId`; blocking removes follows in both directions.
- Organisation: org metadata, roles, templates, tenures, memberships, PORs, and change requests.
- Use `_id` references everywhere; names and handles are mutable, IDs are not.

## 7. Key Design Principles

1. Reference by `_id`, not by name or roll number.
2. Preserve history with versioning or append-only records.
3. Deactivate roles instead of deleting them.
4. Follow direction matters; orgs never follow anyone.
5. Privacy is account defaults plus per-field overrides.

## 8. Auth

| Step             | Detail                                                                   |
| :--------------- | :----------------------------------------------------------------------- |
| **Signup**       | Google OAuth — smail only                                                |
| **Domain check** | Must end with `@smail.iitm.ac.in`                                        |
| **Prefill**      | Roll no, dept, course, batch, graduationYear parsed at signup from smail |
| **Onboarding**   | displayName, username, accountType, hostel, roomNo                       |
| **Login**        | Google OAuth — one tap, no password                                      |
| **Session**      | Access token (15m) + Refresh token (7d) in httpOnly cookies              |
| **Username**     | Social identity only, not used for login                                 |

### OAuth Callback Flow

1. **Google OAuth callback**
2. Extract email from profile.
3. Verify `@smail.iitm.ac.in` domain — **reject immediately** if not smail.
4. **If student exists:** Issue tokens → Done.
5. **If new student:**
    - Parse smail prefix → `deptCode`, `batch`, `courseCode`, `rollNo`.
    - Lookup **Department** by `deptCode` → get `deptId`.
    - Lookup **Course** by `courseCode` → get `courseId`.
    - Clean `fullName` from Google display name (strip roll no suffix).
    - Calculate `graduationYear` = `batch` + `course.duration` (null for PhD).
    - `Student.create()` with all prefilled data.
    - Issue tokens & redirect to onboarding.

### Onboarding Flow

- **Trigger:** Student logs in first time → `isOnboarded: false`.
- **Frontend:** Redirects to `/onboarding` page.
- **Fields:**
    - `displayName`: Required, editable display name.
    - `username`: Required, unique, lowercase handle.
    - `accountType`: `"public"` | `"private"`.
    - `currentHostelId`: Optional (day scholars skip).
    - `currentRoomNo`: Optional, required if hostel selected.
- **Backend:** `PATCH /api/v1/student/onboarding`
    - `privacySettings.hiddenFields` seeded based on `accountType`:
        - **Public:** `["roomNo"]`
        - **Private:** `["rollNo", "hostel", "roomNo"]`
    - `hostelHistory[]` seeded with first entry.
    - `isOnboarded: true`.
    - Redirect to feed.

### Token Strategy

- **Access token:** 15 minutes, JWT (HS256) in `httpOnly` cookie.
- **Refresh token:** 7 days, JWT in `httpOnly` cookie, hashed with SHA-256 before storing in DB.
- **`sessionId`:** Embedded in JWT payload — direct link between access token and session.
- **`tokenVersion`:** Embedded in JWT payload — checked on every request against DB value.
- **Refresh token rotation:** Old session deleted, new session created on every refresh.
- **Token invalidation:** Incrementing `tokenVersion` on Student instantly invalidates all sessions.

### Session Management

- **Storage:** One Session document per logged-in device.
- **Schema:** `userId`, `refreshToken` (hashed), `deviceInfo` (browser + OS via `ua-parser-js`), `ipAddress`, `userAgent`, `lastAccessedAt`, `revoked`, `expiresAt`, `sessionId`.
- **Cleanup:** TTL index on `expiresAt` for auto-deletion.
- **Optimization:** `protectRoute` fetches student + session in parallel via `Promise.all`.

### Auth Service Logic

- **`generateTokens(student, deviceInfo)`:** Creates session document, signs both tokens with `sessionId` + `tokenVersion`, hashes refresh token before saving.
- **`refreshAccessToken(refreshToken)`:** Verifies JWT, finds session, compares hash, rotates session, checks `tokenVersion`.
- **`logoutOne(refreshToken)`:** Verifies JWT, deletes session by `sessionId`.
- **`logoutAll(studentId, currentSessionId)`:** Revokes all other sessions, increments `tokenVersion`, preserves the current device session.
- **`listSessionsForUser(userId, currentSessionId)`:** Returns all sessions for the student, most recent first.
- **`revokeSession(userId, sessionId)`:** Revokes a specific session.

### API Routes

#### Auth Routes

| Method | Route                                     | Protection                | Description                              |
| :----- | :---------------------------------------- | :------------------------ | :--------------------------------------- |
| GET    | `/api/v1/auth/google`                     | `redirectIfAuthenticated` | Triggers Google OAuth                    |
| GET    | `/api/v1/auth/google/callback`            | —                         | Google redirect, issues tokens           |
| GET    | `/api/v1/auth/me`                         | `protectRoute`            | Returns current student                  |
| POST   | `/api/v1/auth/refresh`                    | —                         | Rotates tokens                           |
| POST   | `/api/v1/auth/logout`                     | `protectRoute`            | Clears current session                   |
| POST   | `/api/v1/auth/logout-all`                 | `protectRoute`            | Clears all sessions & increments version |
| GET    | `/api/v1/auth/sessions`                   | `protectRoute`            | Lists sessions for current student       |
| POST   | `/api/v1/auth/sessions/:sessionId/logout` | `protectRoute`            | Revokes a specific session               |

#### Student Routes

| Method | Route                         | Protection     | Description                                 |
| :----- | :---------------------------- | :------------- | :------------------------------------------ |
| PATCH  | `/api/v1/students/onboarding` | `protectRoute` | Submits onboarding form                     |
| GET    | `/api/v1/students/me`         | `protectRoute` | Returns current student                     |
| PATCH  | `/api/v1/students/me/profile` | `protectRoute` | Updates text profile fields                 |
| PATCH  | `/api/v1/students/me/hostel`  | `protectRoute` | Changes hostel and room, appends to history |
| PATCH  | `/api/v1/students/me/privacy` | `protectRoute` | Updates accountType or hiddenFields         |
| PATCH  | `/api/v1/students/me/photo`   | `protectRoute` | Uploads profile photo to Cloudinary         |
| PATCH  | `/api/v1/students/me/cover`   | `protectRoute` | Uploads cover photo to Cloudinary           |
| GET    | `/api/v1/students/:username`  | `protectRoute` | Returns privacy filtered student profile    |

### Middleware

- **`protectRoute`:** Verifies JWT, checks `tokenVersion` against DB, verifies session exists.
- **`redirectIfAuthenticated`:** Checks auth state before allowing access to `/google`, prevents duplicate sessions.

---

## 9. Follow & Block System

### Follow Flow

```

Student A wants to follow Student B
→ check block in both directions → fail silently if blocked
→ check duplicate follow → fail if already following or pending
→ if B accountType is "public" → create Follow, status: "accepted" immediately
→ if B accountType is "private" → create Follow, status: "pending"
→ B receives notification
→ B accepts → status: "accepted", acceptedAt set
→ B rejects → Follow document deleted

Student A wants to follow Org
→ check duplicate follow
→ always status: "accepted" — orgs are always public

```

### Block Flow

```

Student A blocks Student B
→ check self block → fail
→ check duplicate block → fail if already blocked
→ create Block document
→ delete all Follow documents in both directions (A→B and B→A)

Student A unblocks Student B
→ delete Block document
→ follows are NOT restored — B must re-follow manually if desired

Block visibility rules
→ A blocks B → B cannot view A's profile, cannot follow, cannot find in search
→ Block check runs in both directions on every follow or profile view request

```

### Social Routes

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

### Next Up Routes (Pre-Org)

| Module  | Method | Route                                              | Description                                |
| ------- | ------ | -------------------------------------------------- | ------------------------------------------ |
| Student | GET    | `/api/v1/students/search?q=&limit=&cursor=`        | Student discovery with pagination          |
| Student | GET    | `/api/v1/students/username-availability?username=` | Username availability check                |
| Student | DELETE | `/api/v1/students/me/photo`                        | Remove profile photo                       |
| Student | DELETE | `/api/v1/students/me/cover`                        | Remove cover photo                         |
| Student | GET    | `/api/v1/students/:username/mutuals`               | Mutual followers/following snapshot        |
| Student | POST   | `/api/v1/students/me/report`                       | Report profile or abuse                    |
| Social  | DELETE | `/api/v1/social/follow/:followingId/request`       | Cancel outgoing pending follow request     |
| Social  | GET    | `/api/v1/social/follow/requests/sent`              | List pending outgoing follow requests      |
| Social  | GET    | `/api/v1/social/relationship/:studentId`           | One-shot relationship state for profile UI |
| Social  | GET    | `/api/v1/social/suggestions`                       | Suggested people/accounts to follow        |
| Core    | GET    | `/api/v1/meta/hostels`                             | Hostel lookup for forms and filters        |
| Core    | GET    | `/api/v1/meta/departments`                         | Department lookup for forms and filters    |
| Core    | GET    | `/api/v1/meta/courses`                             | Course lookup for forms and filters        |

---

## 10. Pages & Social

### Page Types

| Page                 | Created By               | Posts By                   | Followable    |
| -------------------- | ------------------------ | -------------------------- | ------------- |
| Club / Team          | Admin seeded or approved | POR holders                | Yes           |
| Hostel / Dept        | Admin seeded             | Secretary POR holders      | Yes           |
| Monitoring Committee | Admin seeded             | POR holders (notices only) | Yes           |
| Fest                 | Top POR / admin          | Fest core team             | Yes           |
| Event                | POR holder of parent org | Organising team            | Yes           |
| Student Profile      | Auto on signup           | The student                | Yes           |
| Institute Handle     | Super admin              | Super admin                | Auto-followed |

### Student Profile Page

- Active and past PORs with verified badges
- Volunteering history
- Events organised and participated
- Posts
- Fields filtered based on viewer's relationship and student's privacySettings
- Exportable as PDF / shareable link

### Profile Visibility Rules

```

Viewer is the student themselves → see everything
Viewer is a follower → see everything except hiddenFields
Viewer is not a follower →
public account → see non-hidden fields
private account → see only displayName, username, profilePhoto
Viewer is blocked → profile not accessible

```

### Org Page Tabs

- Posts, Events, Members, About, Hierarchy (visual org chart)

---

## 11. Feed

| Section         | Content                                 |
| --------------- | --------------------------------------- |
| Pinned / Urgent | Hostel + dept announcements             |
| Happening Now   | Live events today on campus             |
| Following Feed  | Posts from orgs and students you follow |
| Campus Wide     | College-wide posts                      |

### Announcement Targeting

| From              | Reaches                      |
| ----------------- | ---------------------------- |
| Hostel Secretary  | Only that hostel's residents |
| Dept CR           | Only that dept's students    |
| General Secretary | Entire college               |
| Club page         | Club followers               |
| Institute handle  | Everyone (auto-followed)     |

### Post Types

update, announcement, result, achievement, recruitment, poll, gallery

---

## 12. Events

### Event Types

```

Intra-College
├── Intra-Club
├── Inter-Department
└── Inter-Hostel

Intra-City (you host, other colleges come)
Inter-College (you go to other college)

```

### Event Lifecycle

```

Creation → Registration → Execution → Aftermath

```

### Volunteer Wings

Events can have sub-teams (wings) — Events, Decorations, Media, Hospitality, Technical
Each wing has a head (POR holder) and volunteers

### Leaderboards

Running points tally for inter-hostel and inter-dept seasons. Updates after each result.

### External Participants (Intra-City)

Guest accounts tied to specific fest. Public registration link. QR check-in. No access to internal college data.

---

## 13. Polls

| Type            | Description            |
| --------------- | ---------------------- |
| Simple Vote     | Single choice          |
| Ranked Choice   | Drag to order          |
| Availability    | Which date works       |
| Feedback        | Post-event rating      |
| Open Nomination | Text input nominations |

- Visibility and voting eligibility are separate scopes
- Results: live / after-close / organiser-only
- Anonymous voting option

---

## 14. Forums

Async topic-based discussion. Built on top of posts + comments system.

- Threaded comments (reply to specific comment)
- Upvotes on replies
- Mark as resolved
- Category tags — academic, hostel, general, placement

---

## 15. Complaints (Monitoring Committees)

```

Student submits complaint
↓
Assigned to committee POR holder
↓
Status tracking: submitted → acknowledged → under review → resolved
↓
Full audit trail on every complaint

```

- Anonymous option for student
- Public visibility option (others see complaint exists, not who filed)
- Photo evidence support

---

## 16. Handover System

When tenure ends:

- App notifies all active POR holders 30 days before
- Outgoing fills structured handover notes
- Outgoing nominates / approves incoming
- Incoming POR activated, outgoing marked complete
- Notes permanently stored, visible to next holder

---

## 17. Admin Structure

| Role                        | Responsibilities                                                    |
| --------------------------- | ------------------------------------------------------------------- |
| Super Admin (1-2)           | Seed orgs, approve new orgs, resolve disputes, seed top POR holders |
| Org Admin (top POR holders) | Manage their org structure, verify chain below                      |
| Moderators (2-3)            | Reported posts, fake POR claims                                     |

### Role Change Rules

| Change Type                              | Approval Needed | Cooling Period |
| ---------------------------------------- | --------------- | -------------- |
| Rename role, change max holders          | Auto approved   | No             |
| Delete role, change level, add new level | Super admin     | 24 hours       |
| Any change with active POR holders       | Blocked         | —              |

---

## 18. Launch Plan

### Pre-Launch (Super Admin)

1. Seed all permanent orgs (Saarang, Shaastra, CFI, all hostels, all depts, SEC, MMCC)
2. Create role templates for each org
3. Manually verify current top POR holders from college records
4. Populate calendar with current semester events
5. Add mess menus

### Soft Launch

- 20-30 trusted students across different clubs
- Gather feedback
- Fix issues

### Adoption Path

```

Soft launch → Student GS endorsement → Dean of Students → Institute adoption

```

---

## 19. Tech Stack

| Layer        | Technology                  | Hosting           |
| ------------ | --------------------------- | ----------------- |
| Frontend     | React + Vite (PWA)          | Vercel (free)     |
| Styling      | Tailwind CSS                | —                 |
| State        | React Query + Zustand       | —                 |
| Backend      | Node + Express + TypeScript | Railway (~$5/mo)  |
| Database     | MongoDB Atlas               | Free (512MB)      |
| Auth         | Passport.js + Google OAuth  | —                 |
| File Storage | Cloudinary                  | Free (25GB)       |
| Real Time    | Socket.io                   | On Railway server |
| Email        | Resend                      | Free (3000/mo)    |
| Push Notifs  | Firebase FCM                | Free              |
| Search       | MongoDB Atlas Search        | Free (built in)   |

---

## 20. Project Structure

### Monorepo with npm Workspaces

```

campusOS/
├── client/ React + Vite
├── server/ Node + Express
├── package.json workspaces config + shared dev tools
├── tsconfig.base.json
├── eslint.config.mjs
├── .prettierrc
├── .gitignore
└── .vscode/

```

### Server Structure

```

server/src/
├── config/ db, passport, env
├── modules/
│ ├── auth/ auth routes, controller, service, session model
│ ├── core/
│ │ └── models/ hostel, department, course
│ ├── student/ student model, service, controller, routes
│ └── social/ follow model, block model, services, controllers, routes
├── seeds/ index.ts, masterData.seed.ts
├── shared/
│ ├── middleware/ auth, error
│ ├── utils/ asyncHandler, apiError, apiResponse, parseExpiry, parseRollNo
│ └── constants/ masterData.constants.ts
├── validations/ student.validation.ts
├── types/ express.d.ts
├── jobs/ cron jobs (tenure expiry, reminders)
├── events/ event emitter + handlers
├── app.ts
└── server.ts

```

---

## 21. V1 — Build First

### In Scope

- smail Google OAuth + onboarding
- Student profiles (academic, hostel, social)
- Follow system with public/private account support
- Block system
- Flexible org creation with role builder
- OrgRole, OrgRoleTemplate, OrgTenure
- POR chain of trust verification
- Handover notes system
- Org pages (all types)
- Student profile page with privacy filtering
- Feed (pinned, happening now, following, campus wide)
- Posts with image, likes, comments
- Targeted announcements
- Events (creation, registration, volunteer wings, results)
- Polls (simple + availability)
- Forums (threaded, upvotes, resolve)
- In-app notifications + basic preferences
- Search (students, orgs, events, PORs)
- Lost and found
- Unified college calendar
- Mess menu
- Leaderboards (inter-hostel, inter-dept)
- Complaint portal (monitoring committees)

### Out of Scope for V1

- Group messaging
- DMs
- Election flow inside app
- External participant portal
- Alumni mode
- Analytics for org heads
- Buy / sell board
- Budget transparency
- Live streaming
- Faculty / warden access

---

## 22. V2 — After Adoption

- **DMs** — simple text first, async
- **Group Chats** — official org groups only, real time
- **Election Flow** — SEC runs full election inside app, smail verified voting
- **External Participant Portal** — intra-city fest registrations, QR check-in
- **Alumni Mode** — read only, can post opportunities, mentor juniors
- **Analytics** — post reach, event funnel, poll participation for org heads
- **Buy / Sell Board** — textbooks, cycle, furniture
- **Budget Transparency** — club budget allocation and spend log
- **Faculty / Warden Access** — read only view
- **Live Leaderboard** — real time during fest season
- **React Native App** — after PWA proves adoption

---

## 23. What Makes This Different

| Feature                   | WhatsApp | Instagram | Google Forms | CampusOS |
| ------------------------- | -------- | --------- | ------------ | -------- |
| Verified student identity | No       | No        | No           | Yes      |
| POR tracking              | No       | No        | No           | Yes      |
| Institutional memory      | No       | No        | No           | Yes      |
| Targeted announcements    | No       | No        | No           | Yes      |
| Election audit trail      | No       | No        | Partial      | Yes      |
| Complaint tracking        | No       | No        | No           | Yes      |
| Unified calendar          | No       | No        | No           | Yes      |
| Volunteer management      | No       | No        | Partial      | Yes      |

---

## 24. Management Pitch — Key Points

> _"Every student's contribution to college life is invisible after they graduate. CampusOS makes PORs trackable, elections transparent, club communication structured, and gives every student a verified college identity."_

- Replaces 5 tools with one
- Full transparency in student body structure
- Accountability — who holds what post is public
- Institutional memory via handover system
- Reduced chaos in communication
- Alumni engagement built in from day one
- Cost at MVP stage — ₹0
- Cost at 5000 users — ~₹2500/month (less than one event's budget)

---

## 25. Implementation Progress Snapshot (17-04-2026)

### Implemented in Code

- Backend modules: `auth`, `student`, `social`, and core master-data models.
- Auth flow: Google OAuth (smail only), cookie-based JWT auth, refresh rotation, per-device session listing and revocation.
- Student flow: onboarding, profile edits, hostel and privacy updates, profile and cover uploads to Cloudinary.
- Social flow: follow, cancel follow request, accept/reject request, unfollow, remove follower, block/unblock, relationship lookup.
- API docs: Swagger UI served at `/api-docs`.

### Implemented Route Prefixes

- `/api/v1/auth`
- `/api/v1/students`
- `/api/v1/social`

### Current Frontend Scope

- Landing page is implemented.
- OAuth entry point is wired to `/api/v1/auth/google`.
- Post-login product UI (feed, profile pages, org flows, events, polls) is pending.

### Active Gaps vs Product Vision

- Org hierarchy and POR lifecycle modules are not yet implemented.
- Feed, posts, events, polls, forums, complaints, and notifications are not yet implemented.
- Real-time, email, and push pipelines are planned but not yet wired.

### Noted API Contract Cleanup

- Refresh endpoint is currently `GET /api/v1/auth/refresh`; should be migrated to `POST` for state-changing semantics.

---

_Document will be updated as development progresses._
