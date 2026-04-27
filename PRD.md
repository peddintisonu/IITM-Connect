# PRD — CampusOS

### Product Requirements Document

**Institute:** IIT Madras  
**Stack:** MERN + TypeScript  
**Team:** 2 developers  
**Start Date:** 11-04-2026  
**Last Updated:** 28-04-2026 — _Major POR system refactor: flat hierarchy, org autonomy, claims workflow_

---

## 1. Product Overview

CampusOS is a unified campus platform for IIT Madras that replaces scattered communication and operations across WhatsApp groups, mass mails, Google Forms, and unofficial social pages.

### Core Product Idea

```text
LinkedIn (verified student identity + roles/PORs)
+ Instagram (club and event communication)
+ Campus intranet (operations, complaints, announcements)
```

### Primary Problem Statement

- Student identity and contribution history are fragmented.
- Club and body communication is spread across unofficial channels.
- Announcements are noisy and not targetable.
- Elections, complaints, and handovers lack reliable institutional memory.
- Event participation, volunteering, and outcomes are not traceable in one place.

---

## 2. Product Goals

1. Establish a verified digital identity for every IITM student.
2. Make student-body governance and POR lifecycle transparent.
3. Centralize communication for clubs, hostels, departments, and institute bodies.
4. Preserve institutional memory through structured handovers and history.
5. Reduce operational friction for events, announcements, complaints, and engagement.

---

## 3. Target Users

| User Type       | Description                                                                               |
| :-------------- | :---------------------------------------------------------------------------------------- |
| Regular Student | Discovers updates, follows communities, registers for events, participates in campus life |
| POR Holder      | Manages page communication, events, memberships, and role transitions                     |
| Super Admin     | Seeds and governs top-level entities, resolves disputes, controls critical policy actions |

---

## 4. IITM Context and Constraints

| Entity             | Details                                                                        |
| :----------------- | :----------------------------------------------------------------------------- |
| Identity           | Google OAuth with `@smail.iitm.ac.in` only                                     |
| Expected scale     | ~10,000 students, 15+ hostels, 50+ clubs/bodies                                |
| Bodies             | Clubs, teams, hostels, departments, fests, committees, institute-level handles |
| Governance reality | PORs rotate often; handovers are currently inconsistent                        |

---

## 5. Product Principles

1. Verified identity first; anonymous participation is selective and explicit.
2. IDs are stable; names/labels are editable.
3. Governance actions must be auditable.
4. Institutional memory is a first-class feature, not an afterthought.
5. Privacy defaults must be understandable and user-controlled.

---

## 6. Scope Definition

### V1 Scope (Build and Launch First)

#### Identity and Profile

- smail-only Google onboarding
- Student profile creation and onboarding completion
- Privacy-aware profile visibility
- Academic and hostel-linked profile context

#### Social Graph

- Follow system (public/private behavior)
- Follow request lifecycle for private accounts
- Block/unblock safety layer

#### Organization and Governance Foundation

- Organization categories (club, team, fest, hostel body, department body, committee, institute body)
- POR-oriented role structures and hierarchy foundation
- Handover-ready role lifecycle architecture
- Student-initiated organization request workflow with approval gates
- First-tenure and first-role bootstrap captured during organization request
- Role-duty governance model for organization page operations
- Tenure period modeled with month/year boundaries for academic-cycle clarity
- Optional partial assignment period support within tenure bounds

#### V1 Governance Flow (Detailed)

1. Any onboarded student can submit an organization creation request.
2. Request payload includes:
    - organization basics (name, type, parent if applicable)
    - first tenure definition (name, month/year period, cycle year when applicable)
    - first tenure role configuration (hierarchy and role limits)
    - creator's requested role in the first tenure
3. Request is reviewed by super admin, and optionally by top POR of parent organization when parent-linked governance is required.
4. Only after approval:
    - organization page is created
    - first tenure is created
    - first tenure role configuration is created
    - creator role assignment is verified and activated
5. After activation, page operations are driven by organization role duties and hierarchy policy.

#### V1 Role Duty and Approval Rules

1. Duties are action-level permissions (profile edits, post actions, member actions, tenure actions), not only role labels.
2. Duties are mapped to POR roles at organization scope.
3. Approval authority follows **level-based hierarchy** (flat structure, no parent-child):
    - **Level 1**: Organization leader (all duties, can manage tenures and roles, can approve any claim)
    - **Level 2**: Core operational roles (limited duties: posts, events, member verification)
    - **Level 3+**: Member roles (read-only, no duties)
4. Role hierarchy is represented by **level assignment** (1-10 scale) within each tenure, not nested parent-child relationships.
5. Claims workflow: Student submits claim → Level 1/2 leader approves (chain-of-trust check) → Auto-creates POR assignment.

#### V1 Organization Leadership Autonomy

1. **Level 1 leaders manage their own tenures** — No global admin needed for org governance.
2. **Level 1 leaders configure roles** — Create new roles, update existing roles, set permissions per role.
3. **Admin role limited to bootstrap** — Global admins only create permanent orgs and handle exceptions.
4. **Permission model per role**: 7 configurable duties per role:
    - `canPost` — publish org announcements
    - `canCreateEvents` — schedule and manage events
    - `canEditOrgProfile` — update org description, avatar, cover
    - `canManageRoles` — create/edit/delete role configurations
    - `canManageTenure` — create/update tenures, change status
    - `canApproveMembers` — approve/reject POR claims
    - `canVerifyPORBelow` — verify members in lower-level roles

#### V1 Tenure and Assignment Window Rules

1. Tenure windows are defined using month/year boundaries and mapped to internal date ranges for overlap checks and reporting.
2. A student assignment can default to full-tenure coverage or use a partial month/year sub-window.
3. Partial assignment windows must remain fully inside the selected tenure window.
4. Tenure overlap is not allowed within the same organization for conflicting active windows.
5. **Single active POR per organization+tenure per student** — Invariant enforced at model level.
6. **Mid-tenure POR changes** — Level 1 can end, transfer, or promote assignments within tenure lifecycle.

#### Campus Content and Operations

- Structured posting and announcements
- Feed sections (priority, following, campus-wide)
- Events lifecycle foundation (create, register, execute, outcome)
- Basic polls and forum-like discussion support
- Complaint intake and status tracking foundation

#### Platform Essentials

- Notification-ready architecture
- Search-ready architecture
- Admin controls for data quality and moderation

### V1 Out of Scope

- Direct messages and full chat stack
- In-app election operations (end-to-end SEC workflows)
- Full external participant portal
- Alumni mode and mentor graph
- Org-level analytics dashboards
- Buy/sell and budget transparency modules

---

## 7. V2 Scope (Post-Adoption Expansion)

### Communication Expansion

- Direct messages (student-to-student)
- Official organization group chats

### Governance Expansion

- In-app election workflows with verifiable voting controls
- Expanded moderation and dispute tooling

### Ecosystem Expansion

- External participant portal for fests and intra-city events
- Alumni mode (limited profile + opportunity sharing + mentorship)

### Intelligence and Reporting

- Org analytics (content reach, event funnel, engagement)
- Advanced search and recommendation quality improvements

### Campus Utility Expansion

- Buy/sell board
- Budget transparency module for student bodies
- Faculty/warden read-only surfaces

### Delivery Expansion

- React Native app after PWA adoption is validated

---

## 8. Success Metrics

### Adoption

- Percentage of active IITM students onboarded
- Weekly active users across hostels, departments, and clubs

### Utility

- Announcement reach quality vs mass-mail baseline
- Event registration completion and attendance tracking quality
- Complaint resolution cycle visibility and closure rates

### Governance

- POR coverage and role continuity after tenure transitions
- Handover completion rate before role expiry

### Product Health

- Session reliability and authentication success rates
- Search and discovery usage in core flows

---

## 9. Rollout Plan

### Phase 1: Internal Build Validation

- Complete V1 backend and frontend MVP flows.
- Validate role, identity, and social foundations.

### Phase 2: Closed Beta

- 20-30 student testers across hostels, clubs, and departments.
- Capture UX and policy gaps before wider rollout.

### Phase 3: Campus Adoption Path

```text
Closed beta -> Student body endorsement -> Dean-level alignment -> Wider institute rollout
```

### Phase 4: V2 Readiness Decision

- Trigger V2 modules only after clear V1 adoption and operational stability.

---

## 10. Risks and Mitigations

| Risk                                             | Impact                              | Mitigation                                                            |
| :----------------------------------------------- | :---------------------------------- | :-------------------------------------------------------------------- |
| Ambiguous API contracts between frontend/backend | Incorrect UI assumptions and rework | Maintain explicit contract docs outside PRD and keep them versioned   |
| Governance complexity in POR transitions         | Workflow confusion                  | Keep policy and role transitions auditable and explicit               |
| Unclear organization request approvals           | Delayed launch and disputes         | Define explicit request stages, approver order, and rejection reasons |
| Role label vs duty mismatch                      | Unauthorized actions or blockers    | Use action-level duty mapping and hierarchy-based approval checks     |
| Privacy misunderstanding by users                | Trust loss                          | Clear defaults and explainable privacy controls                       |
| Multi-module scope creep                         | Delayed launches                    | Strong V1 boundary and staged V2 delivery                             |

---

## 11. Non-Goals for This PRD

- This PRD does not define endpoint-level request/response contracts.
- This PRD does not track day-to-day implementation details.
- Engineering status, API routes, and migration notes must live in technical docs.

---

_This document is product-facing and intentionally stable. Technical implementation details, route-level behavior, and active engineering progress are tracked separately in Current Status and API contract documentation._
