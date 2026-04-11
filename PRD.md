# PRD — CampusOS
### Product Requirements Document
**Institute:** IIT Madras  
**Stack:** MERN + TypeScript  
**Team:** 2 developers  
**Start Date:** 11-04-2026  
**Last Updated:** 2026

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

| User Type | Description |
|---|---|
| Regular Student | Consumer — browses feed, follows clubs, registers for events |
| POR Holder | Producer — posts, manages org, verifies members |
| Super Admin | Seeds system, approves orgs, resolves disputes |

---

## 3. College Context

| Entity | Details |
|---|---|
| Auth | smail Google OAuth (@smail.iitm.ac.in) |
| Scale | ~10,000 students, 15+ hostels, 50+ clubs |
| Orgs | Clubs, Teams, Fests, Hostel Bodies, Dept Bodies, Monitoring Committees, Insti Bodies |
| Key Fests | Saarang, Shaastra |
| Key Bodies | CFI, SEC, MMCC |

---

## 4. Org Types

| Type | Description | Members | POR Based |
|---|---|---|---|
| club | Activity clubs | Manual apply | Yes |
| team | Sports / tech teams | Manual apply | Yes |
| fest | Saarang, Shaastra etc. | Recruited | Yes |
| hostel | Hostel + student body | Auto by profile | Yes |
| department | Dept + student body | Auto by roll no | Yes |
| monitoring_committee | Mess, shops, SEC etc. | Appointed | Yes |
| insti_body | Student council, GS | N/A | Yes |
| institute_handle | @iitmadras, placement cell | N/A | No |

### Permanent Orgs (Admin Managed)
Saarang, Shaastra, CFI, all CFI clubs, all hostels, all departments, SEC, MMCC, all monitoring committees

### Dynamic Orgs (Student Created)
New clubs, informal teams, fest sub-teams

---

## 5. POR System

### Trust Chain
```
Super Admin (seeds top of every org)
        ↓
Top POR holders verified manually at launch
        ↓
They verify the level below them
        ↓
Chain cascades down automatically
```

### POR Verification Flow
```
Student claims POR → status: pending
        ↓
Person above in hierarchy approves
        ↓
status: active — badge appears on profile
```

### Role Hierarchy Design
- Every org defines its own role structure (flexible)
- Roles are permanent documents — never deleted, only deactivated
- Level, maxHolders, permissions live on the template — not the role
- Template is versioned — changes create a new version, old preserved
- Tenure links to template version at creation time
- POR links to template version at assignment time

### Tenure Types
| Type | Used By | Cycle |
|---|---|---|
| academic-year | Most clubs, hostel bodies | July — May |
| semester | Some committees | Twice a year |
| event-based | Saarang, Shaastra | Fest duration |
| rolling | Research clubs etc. | No fixed end |

---

## 6. DB Schema

### Master Data
```
Hostels       { _id, name, code, type }
Departments   { _id, name, code }
Courses       { _id, name, duration }
```

### Student
```
Student                { _id, smailId, username, accountStatus, createdAt }
StudentAcademicProfile { studentId, currentDeptId, currentCourseId, currentRollNo,
                         batch, currentYear, rollNoHistory[] }
StudentHostelProfile   { studentId, currentHostelId, currentRoomNo, hostelHistory[] }
StudentSocialProfile   { studentId, displayName, bio, profilePhoto, coverPhoto,
                         links[], interests[], skills[], privacy{} }
Follow                 { followerId, followingId, followingType, followedAt }
```

### Organisation
```
Organisation      { _id, name, slug, entityType, parentOrgId,
                    associatedDeptId, associatedHostelId,
                    flags{ isPermanent, isAdminManaged, isGovernance,
                           canStudentsCreate, canBeArchived, isActive },
                    visibility, foundedYear, createdAt }

OrgRole           { _id, orgId, roleName, isElected,
                    tenureType, status, createdAt }

OrgRoleTemplate   { _id, orgId, version, isCurrentVersion,
                    roles[{ roleId, level, maxHolders,
                            permissions{}, canVerifyRoleIds[] }],
                    createdAt, createdBy, approvedBy, changeReason }

OrgTenure         { _id, orgId, label, tenureType,
                    startDate, expectedEndDate, actualEndDate,
                    status, templateVersionId, overlapPeriod{},
                    createdAt }

OrgMembership     { _id, studentId, orgId, membershipType,
                    joinedAt, leftAt, joinMethod, status }
```

### POR
```
POR  { _id, studentId, orgId, roleId, tenureId, templateVersionId,
       startDate, endDate, status,
       verifiedBy, verifiedAt,
       handoverNotes, handoverTo, createdAt }
```

### Request Flows
```
OrgCreationRequest  { requestedBy, proposedName, orgType,
                      purpose, proposedRoles[], status }

RoleChangeRequest   { orgId, requestedBy, changeType,
                      proposedChange{}, isPermanent,
                      status, approvedBy }
```

---

## 7. Key Design Principles

1. **Reference by _id always** — never by name, roll no, or smail
2. **Names can change, IDs never do**
3. **Never hardcode** — everything is configuration
4. **Flags over conditionals** — isPermanent not if(org==="Saarang")
5. **Intrinsic vs template-specific** — level, maxHolders, permissions on template not role
6. **History over updates** — append, never overwrite
7. **Roles never deleted** — status → inactive, document preserved
8. **Event driven architecture** — new features plug in, nothing breaks
9. **Tenure is its own entity** — not just dates on a POR
10. **Separate what a person IS from HAS from DOES**

---

## 8. Auth

| Step | Detail |
|---|---|
| Signup | Google OAuth — smail only |
| Domain check | Must end with @smail.iitm.ac.in |
| Onboarding | Name, roll no, dept, hostel, course, username |
| Login | Google OAuth — one tap, no password |
| Session | JWT in httpOnly cookie, 7 day expiry |
| Username | Social identity only, not used for login |

---

## 9. Pages & Social

### Page Types
| Page | Created By | Posts By | Followable |
|---|---|---|---|
| Club / Team | Admin seeded or approved | POR holders | Yes |
| Hostel / Dept | Admin seeded | Secretary POR holders | Yes |
| Monitoring Committee | Admin seeded | POR holders (notices only) | Yes |
| Fest | Top POR / admin | Fest core team | Yes |
| Event | POR holder of parent org | Organising team | Yes |
| Student Profile | Auto on signup | The student | Yes |
| Institute Handle | Super admin | Super admin | Auto-followed |

### Student Profile Page
- Active and past PORs with verified badges
- Volunteering history
- Events organised and participated
- Posts
- Exportable as PDF / shareable link

### Org Page Tabs
- Posts, Events, Members, About, Hierarchy (visual org chart)

---

## 10. Feed

| Section | Content |
|---|---|
| Pinned / Urgent | Hostel + dept announcements |
| Happening Now | Live events today on campus |
| Following Feed | Posts from orgs and students you follow |
| Campus Wide | College-wide posts |

### Announcement Targeting
| From | Reaches |
|---|---|
| Hostel Secretary | Only that hostel's residents |
| Dept CR | Only that dept's students |
| General Secretary | Entire college |
| Club page | Club followers |
| Institute handle | Everyone (auto-followed) |

### Post Types
update, announcement, result, achievement, recruitment, poll, gallery

---

## 11. Events

### Event Types
```
Intra-College
├── Intra-Club
├── Inter-Department
└── Inter-Hostel

Intra-City       (you host, other colleges come)
Inter-College    (you go to other college)
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

## 12. Polls

| Type | Description |
|---|---|
| Simple Vote | Single choice |
| Ranked Choice | Drag to order |
| Availability | Which date works |
| Feedback | Post-event rating |
| Open Nomination | Text input nominations |

- Visibility and voting eligibility are separate scopes
- Results: live / after-close / organiser-only
- Anonymous voting option

---

## 13. Forums

Async topic-based discussion. Built on top of posts + comments system.

- Threaded comments (reply to specific comment)
- Upvotes on replies
- Mark as resolved
- Category tags — academic, hostel, general, placement

---

## 14. Complaints (Monitoring Committees)

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

## 15. Handover System

When tenure ends:
- App notifies all active POR holders 30 days before
- Outgoing fills structured handover notes
- Outgoing nominates / approves incoming
- Incoming POR activated, outgoing marked complete
- Notes permanently stored, visible to next holder

---

## 16. Admin Structure

| Role | Responsibilities |
|---|---|
| Super Admin (1-2) | Seed orgs, approve new orgs, resolve disputes, seed top POR holders |
| Org Admin (top POR holders) | Manage their org structure, verify chain below |
| Moderators (2-3) | Reported posts, fake POR claims |

### Role Change Rules
| Change Type | Approval Needed | Cooling Period |
|---|---|---|
| Rename role, change max holders | Auto approved | No |
| Delete role, change level, add new level | Super admin | 24 hours |
| Any change with active POR holders | Blocked | — |

---

## 17. Launch Plan

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

## 18. Tech Stack

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | React + Vite (PWA) | Vercel (free) |
| Styling | Tailwind CSS | — |
| State | React Query + Zustand | — |
| Backend | Node + Express + TypeScript | Railway (~$5/mo) |
| Database | MongoDB Atlas | Free (512MB) |
| Auth | Passport.js + Google OAuth | — |
| File Storage | Cloudinary | Free (25GB) |
| Real Time | Socket.io | On Railway server |
| Email | Resend | Free (3000/mo) |
| Push Notifs | Firebase FCM | Free |
| Search | MongoDB Atlas Search | Free (built in) |

---

## 19. Project Structure

### Monorepo with npm Workspaces
```
campusOS/
├── client/          React + Vite
├── server/          Node + Express
├── package.json     workspaces config + shared dev tools
├── tsconfig.base.json
├── eslint.config.mjs
├── .prettierrc
├── .gitignore
└── .vscode/
```

### Server Structure
```
server/src/
├── config/          DB, passport, cloudinary, env
├── modules/         feature modules (auth, student, org, por...)
├── shared/
│   ├── middleware/  auth, role, error
│   ├── utils/       asyncHandler, apiResponse, apiError
│   └── constants/   org types, por status etc.
├── validations/     Zod schemas
├── jobs/            cron jobs (tenure expiry, reminders)
├── events/          event emitter + handlers
├── types/           TypeScript interfaces
├── app.ts
└── server.ts
```

---

## 20. V1 — Build First

### In Scope
- smail Google OAuth + onboarding
- Student profiles (academic, hostel, social)
- Flexible org creation with role builder
- OrgRole, OrgRoleTemplate, OrgTenure
- POR chain of trust verification
- Handover notes system
- Org pages (all types)
- Student profile page + follow system
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

## 21. V2 — After Adoption

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

## 22. What Makes This Different

| Feature | WhatsApp | Instagram | Google Forms | CampusOS |
|---|---|---|---|---|
| Verified student identity | No | No | No | Yes |
| POR tracking | No | No | No | Yes |
| Institutional memory | No | No | No | Yes |
| Targeted announcements | No | No | No | Yes |
| Election audit trail | No | No | Partial | Yes |
| Complaint tracking | No | No | No | Yes |
| Unified calendar | No | No | No | Yes |
| Volunteer management | No | No | Partial | Yes |

---

## 23. Management Pitch — Key Points

> *"Every student's contribution to college life is invisible after they graduate. CampusOS makes PORs trackable, elections transparent, club communication structured, and gives every student a verified college identity."*

- Replaces 5 tools with one
- Full transparency in student body structure
- Accountability — who holds what post is public
- Institutional memory via handover system
- Reduced chaos in communication
- Alumni engagement built in from day one
- Cost at MVP stage — ₹0
- Cost at 5000 users — ~₹2500/month (less than one event's budget)

---

*Document will be updated as development progresses.*