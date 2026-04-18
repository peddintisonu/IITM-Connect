# CampusOS Product Implementation Blueprint

## 1. Document Purpose

This blueprint defines what the app should do across all domains and suggests implementation approaches that are practical for engineering and understandable for product and design.

This is intentionally:

- product-behavior focused
- implementation-guided
- flow-driven
- non-route-specific

Use this document to align product, frontend, backend, and AI-assisted development.

---

## 2. How This Differs From Other Docs

This blueprint is not a replacement for PRD, current status, or API docs.

Use each document for a different purpose:

1. PRD: product goals, scope, and strategy.
2. Current Status: what is currently implemented.
3. API docs/Swagger: endpoint-level request and response contracts.
4. This blueprint: module behavior, states, user journeys, and recommended implementation architecture.

---

## 3. Product Mission

CampusOS is a unified campus operating platform for IIT Madras that consolidates identity, social graph, governance, communication, and operations into one system with auditable institutional memory.

---

## 4. Core Product Principles

1. Verified identity first.
2. IDs are stable; labels are mutable.
3. Governance actions are auditable.
4. History is preserved rather than overwritten.
5. Privacy is explicit and user controlled.
6. Moderation and safety are first-class capabilities.
7. Product behavior should be understandable even when implementation is complex.

---

## 5. Actor Model

Primary actors:

1. Student
2. POR Holder
3. Org Admin
4. Super Admin
5. Moderator
6. Committee Member
7. External Participant (V2)
8. Alumni (V2)

Actor mapping should be explicit in each module so permissions are predictable.

---

## 6. Domain Map

Core domains:

1. Identity and Access
2. Student Profile and Privacy
3. Social Graph
4. Organization Domain
5. POR Domain
6. Tenure and Handover Domain
7. Feed and Content
8. Event Management
9. Polls and Decision Flows
10. Forums and Discussions
11. Complaint and Committee Workflows
12. Notification Domain
13. Search and Discovery
14. Admin and Moderation
15. Analytics and Reporting

---

## 7. Cross-Domain State Models

## 7.1 Identity State

1. unauthenticated
2. authenticated_not_onboarded
3. authenticated_onboarded
4. suspended

Expected behavior:

- only onboarding-safe flows in state 2
- full app access in state 3
- restricted access in state 4

## 7.2 Relationship State

1. none
2. pending_outgoing
3. pending_incoming
4. connected
5. blocked_by_me
6. blocked_me

Expected behavior:

- blocked states override follow/connect behavior
- relationship state drives profile action UI

## 7.3 POR State

1. draft
2. nominated
3. pending_approval
4. active
5. completed
6. revoked

Expected behavior:

- active POR is tied to tenure validity
- completion should preserve history and handover references

## 7.4 Tenure State

1. planned
2. active
3. grace
4. closed
5. archived

Expected behavior:

- no overlapping active tenure for same role slot unless policy allows
- closure should trigger handover checkpoints

---

## 8. Module Blueprint

## 8.1 Identity and Access

Objective:

- Provide secure authentication and device-aware session control.

What app should do:

1. Sign in only with approved identity provider and domain policy.
2. Maintain multi-device sessions safely.
3. Allow current-device logout and targeted other-device revocation.
4. Recover expired access with refresh flow.

Suggested implementation:

1. Session-per-device model.
2. Refresh rotation with grace window.
3. Token versioning for emergency session invalidation.
4. Centralized auth guard and onboarding guard.

UX expectations:

1. Session management view with current session indicator.
2. Clear account-action confirmations for destructive session actions.
3. Deterministic redirect behavior after auth transitions.

Risks:

1. Refresh loops.
2. Inconsistent session revocation across tabs/devices.
3. Silent auth failures.

---

## 8.2 Onboarding and Student Profile

Objective:

- Turn authenticated users into fully usable campus identities.

What app should do:

1. Collect display identity, username, privacy mode, and optional residence fields.
2. Validate username and prevent collisions.
3. Maintain editable profile sections.
4. Support profile and cover media updates.

Suggested implementation:

1. One-time onboarding completion guard.
2. Reference-based fields using master data IDs.
3. Snapshot-based privacy defaults by account mode.
4. Separate update flows by concern: profile text, privacy, residence, media.

UX expectations:

1. Inline validation and explicit conflict feedback.
2. Dropdown selectors for reference fields.
3. Profile settings organized by logical tab.

Risks:

1. Sending labels instead of IDs.
2. Merging unrelated profile updates into brittle single mutations.
3. Hidden-field confusion for privacy behavior.

---

## 8.3 Social Graph

Objective:

- Provide controlled student-to-student connection behavior with private-account support and safety controls.

What app should do:

1. Follow/unfollow for public accounts.
2. Request/accept/reject for private accounts.
3. View followers/following/request queues.
4. Block and unblock with relationship cleanup.

Suggested implementation:

1. Relationship state resolver utility used by UI and backend.
2. Block precedence over follow state.
3. List endpoints with pagination strategy and cache invalidation pattern.

UX expectations:

1. Connection tabs with reliable loading/empty/error states.
2. Per-row action pending states.
3. Relationship state reflected immediately after action.

Risks:

1. Divergent state between profile action button and list pages.
2. Missing block precedence handling.

---

## 8.4 Master Data and Reference Layer

Objective:

- Centralize reference entities such as hostels, departments, and courses.

What app should do:

1. Expose read-friendly reference data for forms and filters.
2. Restrict mutation of master data to privileged roles.
3. Keep downstream flows resilient to label changes.

Suggested implementation:

1. Bootstrap response for multi-reference hydration.
2. ID-based selections in frontend with label rendering.
3. Privileged mutation controls with audit trail.

UX expectations:

1. Async selects with retry support.
2. Fallback copy when reference data fails to load.

Risks:

1. Free-text input for reference-backed fields.
2. Broken historical references when labels change.

---

## 8.5 Organization Domain

Objective:

- Represent campus entities as structured organizations with durable identity and managed hierarchy.

What app should do:

1. Support organization types: clubs, teams, fests, hostels, departments, committees, institute bodies.
2. Store organization identity independently of current office bearers.
3. Support hierarchical relationships where relevant.
4. Allow controlled org profile updates.

Suggested implementation:

1. Immutable org identity record.
2. Versioned structure/profile metadata for significant changes.
3. Role-based management boundaries.

UX expectations:

1. Org profile with tabs: About, Members, Roles, Tenures, Posts, Events.
2. Org management workspace for admins.
3. Hierarchy visualization where applicable.

Risks:

1. Hard-deleting entities tied to historical POR data.
2. Unscoped edit privileges.

---

## 8.6 POR Lifecycle Domain

Objective:

- Track positions of responsibility with transparent assignment, approval, tenure linkage, and archival history.

What app should do:

1. Nominate candidates for POR slots.
2. Run approval chain per org policy.
3. Activate POR within valid tenure.
4. Complete or revoke POR with reason and auditability.

Suggested implementation:

1. POR records tied to role template version and tenure.
2. Append-only lifecycle events.
3. Explicit approval graph by role level.

UX expectations:

1. Nomination workflow UI.
2. Approval queue UI for authorized reviewers.
3. POR timeline with status badges and event history.

Risks:

1. Multiple active holders violating policy constraints.
2. Missing audit context on revocation.

---

## 8.7 Tenure and Handover Domain

Objective:

- Ensure continuity in governance and operations across role transitions.

What app should do:

1. Define tenure windows for roles and org cycles.
2. Trigger reminders before tenure end.
3. Collect and store handover notes/checklists.
4. Ensure transition from outgoing to incoming holder is traceable.

Suggested implementation:

1. Tenure entity separated from POR entity.
2. Handover packet schema with structured sections.
3. State machine for pre-close, close, and archive milestones.

UX expectations:

1. Tenure dashboard with countdown and risk markers.
2. Handover checklist view with completion indicators.
3. Historical handover archive access for next holders.

Risks:

1. Silent tenure expiry without handover completion.
2. New holder activation before previous closure actions.

---

## 8.8 Feed and Content

Objective:

- Deliver relevant campus information in a structured, target-aware feed.

What app should do:

1. Show priority announcements.
2. Show following content.
3. Show campus-wide updates.
4. Support content types like updates, achievements, recruitment, polls, galleries.

Suggested implementation:

1. Audience-target metadata per post.
2. Ranking buckets by urgency and relevance.
3. Moderation hooks before or after publish based on policy.

UX expectations:

1. Feed sectioning with clear labels.
2. Content cards with type indicator.
3. Fast fallback states when one feed segment is empty.

Risks:

1. Audience leakage from wrong targeting logic.
2. Announcement fatigue from poor prioritization.

---

## 8.9 Event Management

Objective:

- Support event lifecycle from planning to aftermath across orgs and campus contexts.

What app should do:

1. Create event with metadata and visibility scope.
2. Open/close registration.
3. Manage volunteer wings and role assignment.
4. Publish outcomes and artifacts.

Suggested implementation:

1. Event lifecycle state machine.
2. Registration and participation as separate entities.
3. Optional wing-level volunteer allocation model.

UX expectations:

1. Event detail pages with timeline.
2. Registration CTA with eligibility messaging.
3. Organizer workspace for participant and volunteer management.

Risks:

1. State transition confusion around registration windows.
2. Missing audit trail for outcome edits.

---

## 8.10 Polls and Decision Workflows

Objective:

- Enable structured campus decision interactions with clear visibility and eligibility rules.

What app should do:

1. Support poll types: simple choice, ranked, availability, feedback, nomination.
2. Allow separate scopes for visibility and voting eligibility.
3. Support result visibility policy by poll type.

Suggested implementation:

1. Poll config model with rules and lifecycle.
2. Response entity with anti-duplicate controls.
3. Optional anonymization policy flags.

UX expectations:

1. Poll creation wizard with policy hints.
2. Vote/submit confirmation with immutable receipt pattern when needed.
3. Results views honoring policy timing.

Risks:

1. Eligibility mismatch.
2. Ambiguous poll closure semantics.

---

## 8.11 Forums and Discussions

Objective:

- Provide structured asynchronous discussion beyond linear comments.

What app should do:

1. Topic threads with replies.
2. Upvote and relevance signals.
3. Resolve markers for issue-based threads.

Suggested implementation:

1. Thread and reply entities with parent references.
2. Moderation hooks for abuse and spam.

UX expectations:

1. Readability-first threaded UI.
2. Category and status filters.
3. Resolved state cues.

Risks:

1. Deep nesting without UX containment.
2. Low discoverability of resolved knowledge.

---

## 8.12 Complaint and Committee Workflow

Objective:

- Formalize complaint intake, assignment, tracking, and resolution with accountability.

What app should do:

1. Submit complaints with optional anonymity.
2. Route to relevant committee queue.
3. Track statuses through resolution stages.
4. Preserve audit history of actions and status changes.

Suggested implementation:

1. Complaint entity with immutable action log.
2. Status transitions with actor attribution.
3. Privacy settings for reporter identity and public visibility.

UX expectations:

1. Complaint submission form with category and evidence inputs.
2. Status timeline for reporters.
3. Committee dashboard for triage and updates.

Risks:

1. Privacy leaks for anonymous submissions.
2. Unclear ownership and stale queues.

---

## 8.13 Notifications

Objective:

- Keep users informed about relevant events without spam.

What app should do:

1. Notify on follow lifecycle changes.
2. Notify on approvals, role transitions, and tenure milestones.
3. Notify on event and poll updates.

Suggested implementation:

1. Event-driven notification producer model.
2. Delivery channel preferences and digest options.
3. Read/unread and archival behaviors.

UX expectations:

1. Notification center with type filters.
2. Deep-link actions into relevant feature context.

Risks:

1. Notification fatigue.
2. Missing high-priority governance alerts.

---

## 8.14 Search and Discovery

Objective:

- Help users discover students, orgs, events, and relevant campus context safely.

What app should do:

1. Student search with relationship/privacy constraints.
2. Org/event discovery with useful filters.
3. Suggestion surfaces based on context and policy.

Suggested implementation:

1. Search indexing strategy by entity type.
2. Privacy-aware filtering before result exposure.
3. Cursor-based pagination for large result sets.

UX expectations:

1. Unified search entry with scoped tabs.
2. Lightweight result cards.
3. Helpful no-result suggestions.

Risks:

1. Overexposure of private entities.
2. Expensive broad queries without rate protection.

---

## 8.15 Admin and Moderation

Objective:

- Maintain quality, safety, and policy compliance.

What app should do:

1. Role and permission governance.
2. Report handling and escalation.
3. Master data stewardship.
4. Visibility into high-risk actions.

Suggested implementation:

1. Explicit permission matrix by action, not only by role label.
2. Moderation queue with decision reasons.
3. Audit-first admin operations.

UX expectations:

1. Admin dashboards with actionable queues.
2. Dangerous action confirmations.
3. Decision history and accountability markers.

Risks:

1. Hidden moderation decisions.
2. Privilege drift over time.

---

## 8.16 Analytics and Reporting

Objective:

- Provide actionable insight for product and org operators without compromising privacy.

What app should do:

1. Track adoption and engagement trends.
2. Report event funnel metrics.
3. Report governance continuity indicators.

Suggested implementation:

1. Event instrumentation plan by module.
2. Aggregated analytics views.
3. Privacy-safe data retention policy.

UX expectations:

1. Role-appropriate dashboards.
2. Trend and benchmark cards.

Risks:

1. Vanity metrics with low actionability.
2. Sensitive data exposure in raw analytics.

---

## 9. Cross-Module Flow Library

## 9.1 First Login to Product Entry

1. User authenticates.
2. App checks identity state.
3. If not onboarded, force onboarding flow.
4. On success, route to primary home surface.

## 9.2 Profile and Relationship Flow

1. User opens profile.
2. App resolves profile visibility and relationship state.
3. App renders context-specific actions.
4. Actions update relationship state and UI consistently.

## 9.3 POR Nomination to Activation Flow

1. Candidate nominated.
2. Approval chain processed.
3. POR activated under active tenure.
4. Notifications and audit events emitted.

## 9.4 Tenure Close and Handover Flow

1. System reaches pre-close threshold.
2. Outgoing holder completes handover checklist.
3. Incoming holder activation finalizes transition.
4. Tenure archived with continuity record.

## 9.5 Complaint Submission to Resolution Flow

1. Student files complaint.
2. Complaint routed to appropriate committee.
3. Committee updates status and logs actions.
4. Reporter receives status visibility based on policy.

---

## 10. Suggested Frontend Implementation Standards

1. Module-oriented feature folders.
2. Route guards for auth and onboarding.
3. Query and mutation wrappers per domain.
4. Shared state patterns for user/session context.
5. Reusable components for loading, empty, error, and action states.
6. Form layer with client validation and server error mapping.
7. Consistent response-envelope parser utilities.

---

## 11. Suggested Backend Implementation Standards

1. Domain modules with controller/service/model boundaries.
2. Validation at request edge and invariant checks in service layer.
3. Explicit error codes and stable error message strategy.
4. Audit logging for governance-critical actions.
5. Event hooks for notification and analytics emission.
6. Reference data validation for all ID-backed fields.
7. Test coverage for lifecycle state transitions.

---

## 12. Data and Governance Guidelines

1. Prefer immutable history entities for governance data.
2. Avoid hard deletes on records with historical references.
3. Store actor, timestamp, and reason for sensitive changes.
4. Define retention policy by entity type.
5. Maintain traceability from POR to tenure to handover records.

---

## 13. Security and Reliability Expectations

1. Enforce authentication before protected domain access.
2. Enforce onboarding completion before social and management features.
3. Add rate protection for abuse-prone flows.
4. Validate ownership and permissions on every state-changing action.
5. Protect against replay and duplicate side effects where relevant.
6. Maintain graceful error behavior for client retries.

---

## 14. Quality Strategy

Minimum quality gates for each module:

1. Happy path test.
2. Guard and permission test.
3. Validation failure test.
4. State transition test.
5. Regression test for critical flow.

End-to-end quality focus:

1. Auth and onboarding transitions.
2. Relationship state correctness.
3. POR and tenure lifecycle integrity.
4. Complaint and moderation auditability.

---

## 15. Delivery Roadmap Framework

## 15.1 V1 Focus

1. Identity and onboarding reliability.
2. Student profile and privacy foundation.
3. Social graph baseline.
4. Master data reliability.
5. Org, POR, and tenure foundation.

## 15.2 V1.5 Stabilization

1. Feed and event operational maturity.
2. Complaint workflow maturity.
3. Notification and search quality improvements.
4. Integration and contract hardening.

## 15.3 V2 Expansion

1. Messaging and group communication.
2. Election workflow depth.
3. External participant and alumni modules.
4. Analytics and administrative intelligence layers.

---

## 16. Known High-Risk Areas

1. Onboarding gate consistency across all clients.
2. Relationship state drift between views.
3. Governance data overwrites without history.
4. Tenure handover incompletion at cycle boundaries.
5. Reference ID misuse in forms.
6. Documentation drift between product intent and implementation.

---

## 17. Decision Records Template

For major architecture or policy decisions, record:

1. decision title
2. context
3. chosen option
4. rejected options
5. short-term impact
6. long-term impact
7. owner
8. review date

Keep decision records in a separate file or appendix linked from this blueprint.

---

## 18. Update Rule

Update this blueprint when:

1. product behavior changes across modules
2. lifecycle states change
3. governance policy changes
4. V1 or V2 module boundaries change
5. core flow definitions change

Do not update this document for minor route-level tweaks unless behavior changes.

---

## 19. Final Guidance

When building any new feature, ask three questions first:

1. Which domain state does this change?
2. Which actor is authorized for this transition?
3. How is this action preserved in history and user-facing UX?

If these are clear, implementation decisions will be more stable and easier to maintain.
