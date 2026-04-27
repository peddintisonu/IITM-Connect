// =============================================================================
// ORG SYSTEM — COMPLETE FLOW REFERENCE
// IITMConnect — Organisation, Tenure, and POR System
// =============================================================================
// This file is documentation only. No executable code.
// Use this as the single source of truth for all org-related flows.
// File references point to server/src/modules/
// =============================================================================

// -----------------------------------------------------------------------------
// SECTION 1 — DATA MODEL RELATIONSHIPS
// -----------------------------------------------------------------------------
//
// Organization         — the org itself (club, hostel, dept, fest etc.)
//   └── Tenure         — a time period the org operates in (e.g. "2024-25")
//         └── TenureRoleConfig  — how each role is configured in this tenure
//               └── PORAssignment — which student holds this role in this tenure
//
// PORRole              — global role definitions (Secretary, Core, President etc.)
//                        shared across orgs, filtered by appliesToCategories
//
// OrganizationRequest  — student's request to create a new org
//                        contains embedded firstTenure + firstTenureRoleConfigs
//                        becomes Organization + Tenure + TenureRoleConfigs on approval
//
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// SECTION 2 — ORG CREATION FLOW
// -----------------------------------------------------------------------------
//
// TRIGGER: Student fills 4-step modal and submits OrganizationRequest
//
// Step 1 — Org Details
//   Student provides: name, shortName, acronym, category, description,
//   avatar, coverImage, links, contactEmail, website, establishedYear, parentOrgId
//   slug is auto-generated from name (lowercase, hyphenated)
//   isPermanent is always false for student-created orgs
//
// Step 2 — First Tenure
//   Student provides: name, startMonth, startYear, endMonth, endYear, cycleYear
//   startDate and endDate are auto-calculated from month+year in Tenure pre-save hook
//
// Step 3 — Role Structure
//   Student picks roles from PORRole list filtered by org category
//   For each role: set level, sortOrder, maxHolders, canBeVacant
//   If role not in list: type custom name, flagged as isCustomRole: true for admin review
//   This becomes firstTenureRoleConfigs[] in OrganizationRequest
//
// Step 4 — Your Role
//   Student picks which role they are claiming from Step 3 roles
//   This becomes creatorRequestedRoleId in OrganizationRequest
//
// APPROVAL FLOW after submission:
//
//   OrganizationRequest created with status: "pending"
//         ↓
//   If parentOrgId exists AND requiresParentTopPorApproval is true:
//     Notify top POR holder (level 1) of parent org
//     They approve → approvalStep for PARENT_TOP_POR marked approved
//     They reject → request rejected, student notified
//         ↓
//   Super admin reviews request
//     If customRole names exist → admin maps them to existing PORRole or creates new PORRole
//     Admin approves → triggers org creation transaction (see below)
//     Admin rejects → request rejected with reviewRemarks, student notified
//         ↓
//   ON APPROVAL — single MongoDB transaction:
//     1. Organization.create() using request.organization fields
//     2. Tenure.create() using request.firstTenure fields, linked to new orgId
//     3. For each config in request.firstTenureRoleConfigs:
//          TenureRoleConfig.create() linked to new tenureId + orgId
//          permissions seeded from DEFAULT_ROLE_PERMISSIONS_BY_LEVEL based on level
//     4. PORAssignment.create() for creator's claimed role (creatorRequestedRoleId)
//          status: active, assignedBy: super admin's studentId
//     5. OrganizationRequest updated:
//          status: "approved"
//          approvedOrganizationId: new org _id
//          approvedTenureId: new tenure _id
//     If any step fails → entire transaction rolled back
//
// FILES INVOLVED:
//   organizations/models/organization.model.ts
//   organizations/models/request.model.ts
//   tenures/models/tenure.model.ts
//   tenures/models/tenureRoleConfig.model.ts
//   pors/models/assignment.model.ts
//   organizations/services/orgRequest.service.ts      (to be created)
//   organizations/controllers/orgRequest.controller.ts (to be created)
//   organizations/routes/orgRequest.routes.ts          (to be created)
//
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// SECTION 3 — POR CLAIM AND VERIFICATION FLOW
// -----------------------------------------------------------------------------
//
// TRIGGER: Student wants to claim a role in an existing org's active tenure
//
// ELIGIBILITY CHECK before creating claim:
//   - Org must be active
//   - Tenure must be active (status: "active", current date within startDate-endDate)
//   - TenureRoleConfig must exist for this role in this tenure
//   - TenureRoleConfig.isActiveInTenure must be true
//   - Current active PORAssignments for this role < TenureRoleConfig.maxHolders
//   - Student must not already have an active PORAssignment in this org+tenure
//
// WHO CAN APPROVE:
//   Only level 1 or level 2 role holders of the SAME org and SAME tenure can approve
//   Level is read from TenureRoleConfig.level for the approver's own PORAssignment
//   If no level 1 or level 2 holders exist → only super admin can approve
//   This prevents orphaned claims with nobody to approve them
//
// CLAIM FLOW:
//   Student submits POR claim for a specific TenureRoleConfig
//         ↓
//   System finds all active PORAssignments where level 1 or level 2 in same org+tenure
//         ↓
//   All of them get notified (first to act wins)
//         ↓
//   Approver reviews claim
//   Approver's own PORAssignment must be active — cannot verify if own POR is unverified
//         ↓
//   Approver approves →
//     Re-check capacity and duplicate-active constraints at approval time
//     PORAssignment.create() with isActive: true, assignedBy: approver's studentId
//     Claim document status set to "approved" (preserved for audit history)
//     Student notified — badge appears on profile
//   Approver rejects →
//     Claim document status set to "rejected" (preserved for audit history — NOT deleted)
//     Student notified with rejection reason
//
// NOTE: Claim documents are NEVER deleted. They are kept with status "rejected" or
//       "cancelled" for audit history. The design doc previously said "Claim document
//       deleted" on rejection — that was incorrect and has been updated here.
//
// IMPORTANT RULE — Chain of Trust:
//   A POR holder can only verify roles at a level BELOW their own level
//   Level 1 can verify level 2, 3, 4...
//   Level 2 can verify level 3, 4... but NOT level 1
//   Nobody can self-verify
//
// IMPORTANT RULE — Tenure Scoping:
//   Approver must have an active POR in the SAME tenure as the claim
//   A holder from a previous tenure (not yet cleaned up) cannot approve current tenure claims
//
// FILES INVOLVED:
//   pors/models/assignment.model.ts
//   tenures/models/tenureRoleConfig.model.ts
//   pors/porClaims/porClaim.model.ts        ✅ DONE
//   pors/porClaims/porClaim.service.ts      ✅ DONE
//   pors/porClaims/porClaim.controller.ts   ✅ DONE
//   pors/porClaims/porClaim.messages.ts     ✅ DONE
//   pors/pors.routes.ts                     ✅ DONE (claim routes wired)
//
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// SECTION 4 — TENURE TRANSITION AND HANDOVER FLOW
// -----------------------------------------------------------------------------
//
// TRIGGER: Cron job fires 30 days before tenure.endDate
//
// PRE-HANDOVER (30 days before):
//   Cron job finds all tenures where endDate is within 30 days and status: "active"
//   For each tenure:
//     All active POR holders notified to begin handover process
//     Tenure.handoverStatus updated to "in_progress"
//
// HANDOVER PROCESS (outgoing):
//   Each active POR holder fills structured handover notes
//   Notes stored on PORAssignment (or separate HandoverNote document — TBD)
//   Outgoing nominates incoming person for their role (optional — admin can override)
//
// TENURE CREATION (new tenure):
//   Top POR holder or admin creates next Tenure document
//   New TenureRoleConfigs created — copied from previous tenure's configs
//   Permissions and hierarchy preserved unless manually changed
//   New tenure starts with status: "planned" until startDate is reached
//
// ACTIVATION (on startDate):
//   Cron job fires on startDate of new tenure
//   Tenure.status updated from "planned" to "active"
//   Old tenure.status updated to "completed"
//   Old PORAssignments marked isActive: false, releasedAt: now
//   New PORAssignments created for incoming holders (if pre-assigned)
//
// LINKING:
//   Old tenure.nextTenureId = new tenure._id
//   New tenure.previousTenureId = old tenure._id
//   This creates a linked list of tenures for institutional memory
//
// FILES INVOLVED:
//   tenures/models/tenure.model.ts
//   tenures/models/tenureRoleConfig.model.ts
//   pors/models/assignment.model.ts
//   jobs/tenureTransition.job.ts         (to be created — cron job)
//   jobs/tenureActivation.job.ts         (to be created — cron job)
//   tenures/services/tenure.service.ts   (to be created)
//   tenures/controllers/tenure.controller.ts (to be created)
//
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// SECTION 5 — ROLE PERMISSIONS AND CAPABILITIES
// -----------------------------------------------------------------------------
//
// TWO SEPARATE CONCEPTS — do not confuse:
//
// Org Capabilities (on Organization model):
//   supportsMembers, supportsRoles, supportsTenures,
//   supportsEvents, supportsPosts, supportsRecruitment, supportsHierarchy
//   → Does this org even have this feature?
//   → Set at org creation based on category, admin can override
//
// Role Permissions (on TenureRoleConfig model):
//   canPost, canApproveMembers, canManageRoles,
//   canCreateEvents, canVerifyPORBelow, canEditOrgProfile, canManageTenure
//   → What can the holder of this role actually do?
//   → Seeded from DEFAULT_ROLE_PERMISSIONS_BY_LEVEL based on level
//   → Admin can override per role per tenure
//
// DEFAULT PERMISSIONS BY LEVEL:
//   Level 1 (President, Secretary, top role) → all permissions true
//   Level 2 (Core, Deputy) → canPost, canCreateEvents, canVerifyPORBelow only
//   Level 3+ (Members) → no permissions
//   Any level beyond defined levels falls back to level 3 defaults
//
// CAPABILITY CHECK FLOW (on every protected action):
//   Request comes in (e.g. student tries to create a post for an org)
//         ↓
//   Find student's active PORAssignment for this org in active tenure
//   If no active PORAssignment → reject (not a POR holder)
//         ↓
//   Find their TenureRoleConfig → read permissions.canPost
//   If false → reject with 403
//   If true → allow
//
// FILES INVOLVED:
//   tenures/models/tenureRoleConfig.model.ts  ✅ DONE (permissions field added)
//   pors/constants/permissions.constants.ts   ✅ DONE
//   shared/middleware/orgPermission.middleware.ts ✅ DONE (checkOrgPermission)
//
// NOTE: orgPermission.middleware.ts exists but is not yet wired into org-facing
//       routes (e.g. post creation, org profile edit). This is the next wiring step.
//
// IMPORTANT: Only level 1 POR holders can manage tenures and role configurations
//   — This ensures org leaders have autonomy without global admin intervention
//   — requireOrgTopLevelFromBody middleware checks this for tenure creation
//   — requireTenureTopLevel middleware checks this for tenure edits and role-config operations
//   — Routes at /api/v1/pors/ (not /api/v1/admin/pors)
//
// GLOBAL ADMIN ROUTES:
//   Global admin operations moved to /api/v1/admin/pors/assignments
//   This is for bootstrap and exception handling only:
//   — First leader assignment when no approvers exist (org creation edge case)
//   — Manual assignment correction (rare)
//   — Not for normal workflow (claims → approve → assign is the normal path)
//
// AUTHENTICATION FLOW:
//   1. protectRoute — user must be authenticated
//   2. requireOnboardingComplete — user must be onboarded student
//   3. requireOrgTopLevelFromBody or requireTenureTopLevel — user must be level 1 in that org
//
// -----------------------------------------------------------------------------

// SECTION 5a — MID-TENURE POR CHANGES (End, Transfer, Promotion)
// =============================================================================
//
// These flows handle changes to POR assignments within a tenure (not at tenure boundary)
//
// SCENARIO 1 — END ASSIGNMENT (Resignation / Removal)
// ─────────────────────────────────────────────────────
//
// TRIGGER: Level 1 leader or student themselves ends their assignment
//
// ENDPOINT: PATCH /pors/assignments/:assignmentId/end
//
// PAYLOAD:
//   {
//     "endMonth": 3,              // optional, Gregorian month of resignation
//     "endYear": 2026,            // optional, Gregorian year
//     "reason": "Resigned from position"
//   }
//
// WHO CAN END:
//   — Student can end their own assignment (always)
//   — Level 1 leader can end anyone's assignment in same org+tenure
//   — Super admin can end any assignment (fallback)
//
// FLOW:
//   Validate the assignment exists and belongs to the org
//         ↓
//   Check authorization (self OR level 1 in same org+tenure)
//         ↓
//   Update assignment: isActive = false, releasedAt = now
//   If endMonth/Year provided: set assignmentEndMonth, assignmentEndYear
//   Store reason in notes field
//         ↓
//   If this was the only level 1 holder:
//     Warn org leaders — no one can approve new claims until replacement arrives
//   If claims pending for this role:
//     Mark them as "cannot-approve" (approver no longer holds role)
//         ↓
//   Student profile updated — role badge removed immediately
//
// POST-END STATE:
//   — PORAssignment.isActive = false
//   — Pending claims for this person cannot be approved by them
//   — This person can still hold other roles in same org
//   — On next tenure: this assignment is NOT carried forward (clean slate)
//   — Handover notes from releasedAt available to org leaders
//
// FILES INVOLVED:
//   pors/porAssignments/porAssignment.service.ts — add endPORAssignment()
//   pors/porAssignments/porAssignment.controller.ts — add endAssignmentController()
//   pors/pors.routes.ts — add PATCH /assignments/:id/end
//
// SWAGGER:
//   PATCH /pors/assignments/:assignmentId/end
//   Query param: tenureId (optional, for scope verification)
//
// ─────────────────────────────────────────────────────
// SCENARIO 2 — TRANSFER ROLE (within same tenure)
// ─────────────────────────────────────────────────────
//
// TRIGGER: Level 1 leader moves someone to a different role in same tenure
//          (e.g. President → Treasurer, Core member 1 → Core member 2)
//
// ENDPOINT: PATCH /pors/assignments/:assignmentId/transfer
//
// PAYLOAD:
//   {
//     "newTenureRoleConfigId": "...",    // new role config in same org+tenure
//     "reason": "Position restructure"
//   }
//
// PRECONDITIONS:
//   — Both old and new configs must belong to same org+tenure
//   — New role must not be already at maxHolders capacity
//   — Student must not already hold the new role
//   — Cannot transfer to roles at much higher level (e.g. member → president needs review)
//
// FLOW:
//   Validate assignment exists, TenureRoleConfigs valid
//         ↓
//   Check authorization (level 1 in same org+tenure only)
//         ↓
//   Check: student not already in new role config
//   Check: new role not at capacity
//         ↓
//   ATOMIC TRANSACTION:
//     1. Update old assignment: tenureRoleConfigId = newRoleId, roleId = newRoleId
//     2. Update permissions based on new level
//     3. Store transfer reason in notes
//         ↓
//   Student profile updated — old role badge removed, new one appears
//
// POST-TRANSFER STATE:
//   — Student still has ONE active assignment in this org+tenure (not two)
//   — Their permissions changed according to new role's level
//   — Existing claims for their old role remain (reviewed under old role context)
//   — If they had pending claims as old role, they're unchanged but can't approve
//
// FILES INVOLVED:
//   pors/porAssignments/porAssignment.service.ts — add transferAssignment()
//   pors/porAssignments/porAssignment.controller.ts — add transferAssignmentController()
//   pors/pors.routes.ts — add PATCH /assignments/:id/transfer
//
// NOTE: This is DIFFERENT from claiming a new role and keeping both:
//       Transfer → ONE active role changes to another (1:1 swap)
//       Claim → request process with approvals for a SECOND role (if allowed)
//       System design: Only ONE active role per org per tenure (enforced in model)
//
// ─────────────────────────────────────────────────────
// SCENARIO 3 — PROMOTION TO NEXT TENURE (handover)
// ─────────────────────────────────────────────────────
//
// TRIGGER: New tenure begins, automatic or manual promotion of leaders
//
// APPROACHES (all valid — use case dependent):
//
// OPTION A: AUTOMATIC CLAIM RENEWAL (Student-initiated)
//   Student submits claim for same or higher role in new tenure
//         ↓
//   Level 1 holder of NEW tenure approves
//         ↓
//   New PORAssignment created in new tenure
//   This is handled by normal claim flow (no new endpoint needed)
//
// OPTION B: DIRECT TENURE TRANSFER (Admin convenience)
//   ENDPOINT: POST /pors/assignments/renew-for-tenure
//   Used when org leader wants to directly carry forward roles
//
//   PAYLOAD:
//     {
//       "previousAssignmentId": "...",
//       "newTenureId": "...",
//       "sameRoleId": true,  // or provide newRoleIdIfPromotion
//       "reason": "Promotion from president to advisor"
//     }
//
//   FLOW:
//     Verify:
//       — Old assignment is in an inactive tenure (just ended)
//       — New tenure exists in same org and is "planned" or "active"
//       — New tenure's roleConfig for this role exists
//         ↓
//     Create new PORAssignment in new tenure
//     Old assignment remains (audit trail)
//     New assignment linked to old (handoverContext: "promoted")
//         ↓
//     Student notified of new role in new tenure
//
// OPTION C: BULK PROMOTION (Admin mass-assignment)
//   ENDPOINT: POST /api/v1/admin/pors/bulk-promote-tenure
//   Only super admin can use this
//
//   PAYLOAD:
//     {
//       "fromTenureId": "...",
//       "toTenureId": "...",
//       "promotions": [
//         {
//           "studentId": "...",
//           "fromTenureRoleConfigId": "...",
//           "toTenureRoleConfigId": "...",
//           "reason": "Auto-renewed"
//         }
//       ]
//     }
//
//   FLOW:
//     For each promotion:
//       — Create new PORAssignment in toTenure
//       — Link to previous (handoverContext)
//       — Mark old as context="completed_tenure"
//         ↓
//     Batch notify all students of their roles in new tenure
//
// RECOMMENDED WORKFLOW:
//   1. When new tenure created (by level 1): status = "planned"
//   2. Old tenure ends (cron job): status = "completed", old assignments deactivated
//   3. Student/leader submits claim for new tenure using normal flow
//   4. Approve in new tenure = direct assignment (no need for Option B/C)
//   5. If exception: use Option B (direct transfer) or Option C (bulk)
//
// FILES INVOLVED:
//   pors/porAssignments/porAssignment.service.ts — add renewForTenure(), bulkPromote()
//   pors/porAssignments/porAssignment.controller.ts — add renewController(), bulkPromoteController()
//   pors/pors.routes.ts — add POST /assignments/renew-for-tenure
//   pors/pors.admin.routes.ts — add POST /bulk-promote-tenure
//
// HANDOVER NOTES:
//   When assignment is released (end or transfer):
//     Outgoing holder fills structured notes
//     Notes stored in PORAssignment.handoverNotes (text) or separate collection
//     Incoming holder sees notes when they start new tenure
//     For future: structured handover checklist (keys, documents, records, etc.)
//
// ────────────────────────────────────────────────────
// KEY INVARIANTS FOR ALL MID-TENURE CHANGES:
// ────────────────────────────────────────────────────
//
//  1. ONE active POR per org+tenure per student (invariant enforced in model)
//  2. Level 1 leaders can end/transfer anyone's role in their org
//  3. All changes are time-scoped to tenure (tenure change = fresh slate)
//  4. Audit trail: never delete assignments, only deactivate with reason
//  5. Claims pending → must resolve (re-assign, cancel) when holder changes
//
// ============================================================================
//

// -----------------------------------------------------------------------------
// SECTION 6 — ORG PROFILE MANAGEMENT
// -----------------------------------------------------------------------------
//
// Who can edit org profile:
//   Only active POR holders where TenureRoleConfig.permissions.canEditOrgProfile is true
//   That means level 1 by default
//
// Editable fields:
//   description, avatar, coverImage, links, contactEmail, website
//   name change requires super admin approval (slug would change)
//   category change is never allowed after creation
//
// Avatar and Cover Image:
//   Same Cloudinary pattern as student photos
//   avatarPublicId and coverImagePublicId stored for deletion on update
//   Separate routes — PATCH /orgs/:slug/avatar and PATCH /orgs/:slug/cover
//
// profileVersion:
//   Incremented on every profile edit
//   Useful for cache invalidation on frontend
//
// structureVersion:
//   Incremented on every role structure change (new TenureRoleConfig created)
//   Separate from profileVersion — structural changes are more significant
//
// FILES INVOLVED:
//   organizations/models/organization.model.ts
//   organizations/services/org.service.ts      (to be created)
//   organizations/controllers/org.controller.ts (to be created)
//   organizations/routes/org.routes.ts          (to be created)
//   shared/middleware/orgPermission.middleware.ts ✅ DONE
//
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// SECTION 7 — PERMANENT ORGS (ADMIN SEEDED)
// -----------------------------------------------------------------------------
//
// Permanent orgs are seeded by super admin at launch — not created via request flow
// Examples: Saarang, Shaastra, CFI, all hostels, all departments, SEC, MMCC
// isPermanent: true on these orgs
//
// Seeding flow:
//   1. Super admin runs seed script
//   2. Organization.create() with isPermanent: true for each permanent org
//   3. First Tenure created for each
//   4. TenureRoleConfigs created with standard role structures
//   5. Top POR holders manually assigned by super admin from college records
//
// Permanent orgs cannot be:
//   - Archived
//   - Deleted
//   - Have their category changed
//   - Have their parentOrgId changed
//
// FILES INVOLVED:
//   seeds/orgData.seed.ts      (to be created)
//   seeds/index.ts             (update to include org seed)
//
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// SECTION 8 — KNOWN GAPS AND DESIGN DECISIONS PENDING
// -----------------------------------------------------------------------------
//
// 1. ✅ RESOLVED — POR Claim model and service created
//
// 2. Handover notes storage location TBD
//    Option A — embed in PORAssignment as handoverNotes field
//    Option B — separate HandoverNote collection linked to PORAssignment
//    Option B preferred for querying and future features
//
// 3. Custom role names in org creation request
//    isCustomRole flag designed but not yet in request.model.ts
//    Admin review flow for custom roles not yet designed
//
// 4. assignmentStartMonth/Year cross-field validation missing
//    Both month and year must be set together or not at all
//    Currently no validator enforcing this in assignment.model.ts
//
// 5. Org capabilities auto-set not yet implemented
//    Organization model has capabilities flags but no pre-save hook
//    that sets defaults based on category
//    Currently admin must manually set all 7 flags
//
// 6. normalizedDisplayName unique index scope in PORRole
//    Currently globally unique — blocks having "Secretary" for both clubs and hostels
//    Should be scoped to appliesToCategories
//
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// TODO LIST
// -----------------------------------------------------------------------------

// ✅ DONE: pors/porClaims/porClaim.model.ts
// ✅ DONE: pors/porClaims/porClaim.service.ts
//   — submitPORClaim, cancelPORClaim, approvePORClaim, rejectPORClaim, getMyPORClaims, getPendingClaimsForOrg
// ✅ DONE: pors/porClaims/porClaim.controller.ts
// ✅ DONE: pors/porClaims/porClaim.messages.ts
// ✅ DONE: claim routes wired into pors.routes.ts

// ✅ DONE: organizations/orgReq/ — org request submit, approve, reject implemented
// ✅ DONE: pors/tenures/ — tenure CRUD and status transitions implemented
// ✅ DONE: pors/tenureConfig/ — tenure role config CRUD, bulk, clone, tree implemented
// ✅ DONE: pors/constants/permissions.constants.ts
// ✅ DONE: shared/middleware/orgPermission.middleware.ts (checkOrgPermission)

// TODO: wire orgPermission.middleware checkOrgPermission into org-facing routes
//   — POST /orgs/:orgId/posts           → checkOrgPermission("canPost")
//   — POST /orgs/:orgId/events          → checkOrgPermission("canCreateEvents")
//   — PATCH /orgs/:orgId/profile        → checkOrgPermission("canEditOrgProfile")
//   — tenure/role-config mutation routes → checkOrgPermission("canManageTenure")

// TODO: implement mid-tenure POR changes (end, transfer, promotion)
//   — add endPORAssignment() to porAssignment.service.ts
//   — add transferAssignment() to porAssignment.service.ts
//   — add renewForTenure() to porAssignment.service.ts
//   — add bulkPromoteTenure() to porAssignment.service.ts (admin only)
//   — add endAssignmentController() to porAssignment.controller.ts
//   — add transferAssignmentController() to porAssignment.controller.ts
//   — PATCH /pors/assignments/:id/end → endAssignmentController
//   — PATCH /pors/assignments/:id/transfer → transferAssignmentController
//   — POST /pors/assignments/renew-for-tenure → renewController
//   — POST /api/v1/admin/pors/bulk-promote-tenure → bulkPromoteController
//   — update pors.routes.ts with new routes
//   — update pors.admin.routes.ts with bulk-promote endpoint
//   — add tests for all mid-tenure operation edge cases

// TODO: implement handover notes system
//   — add handoverNotes field to PORAssignment.model.ts
//   — create porAssignments/handoverNotes.service.ts (store/retrieve notes)
//   — PATCH /pors/assignments/:id/handover-notes → storeHandoverNotes
//   — GET /pors/assignments/:id/handover-notes → getHandoverNotes
//   — Notify incoming holder when they claim role in new tenure
//   — Display handover notes on student profile

// TODO: create organizations/services/org.service.ts
//   — getOrgBySlug(), updateOrgProfile(), uploadOrgAvatar(), uploadOrgCover()

// TODO: create organizations/controllers/org.controller.ts
//   — getOrg, updateProfile, uploadAvatar, uploadCover

// TODO: create organizations/routes/org.routes.ts
//   — GET   /orgs/:slug
//   — PATCH /orgs/:slug/profile   (checkOrgPermission("canEditOrgProfile"))
//   — PATCH /orgs/:slug/avatar    (checkOrgPermission("canEditOrgProfile"))
//   — PATCH /orgs/:slug/cover     (checkOrgPermission("canEditOrgProfile"))

// TODO: create jobs/tenureTransition.job.ts
//   — cron job — runs daily
//   — finds tenures where endDate is within 30 days and status: "active"
//   — notifies all active POR holders, sets handoverStatus: "in_progress"

// TODO: create jobs/tenureActivation.job.ts
//   — cron job — runs daily
//   — finds tenures where startDate is today and status: "planned"
//   — activates tenure, deactivates old tenure and old PORAssignments

// TODO: add cross-field validator in pors/models/assignment.model.ts
//   — assignmentStartMonth and assignmentStartYear must both be set or neither
//   — same for assignmentEndMonth and assignmentEndYear

// TODO: add isCustomRole flag to request.model.ts
//   — in IOrganizationRequestRoleConfigInput add: customRoleName?: string, isCustomRole: boolean
//   — validator: either roleId or customRoleName must be present, not both

// TODO: create seeds/orgData.seed.ts
//   — seed all permanent orgs (Saarang, Shaastra, CFI, all hostels, all depts, SEC, MMCC)
//   — seed first tenures and TenureRoleConfigs for each
//   — update seeds/index.ts to include this seed

// TODO: add pre-save hook to organizations/models/organization.model.ts
//   — auto-set capabilities based on category using CATEGORY_CAPABILITIES map

// TODO: fix normalizedDisplayName index in pors/models/porRole.model.ts
//   — change from globally unique to unique per appliesToCategories

// TODO: add notification calls in porClaim.service.ts
//   — submitPORClaim: notify all level 1 and level 2 POR holders in same org+tenure
//   — approvePORClaim: notify claimant their claim was approved
//   — rejectPORClaim: notify claimant their claim was rejected with reason

// TODO: add notification calls in porAssignment.service.ts
//   — endPORAssignment: notify other org leaders role is vacant
//   — renewForTenure: notify student they've been renewed to next tenure
//   — bulkPromote: notify all promoted students

// TODO: validation — single active POR per org+tenure
//   — add pre-save hook to PORAssignment.model.ts
//   — prevent creating second isActive=true for same student+org+tenure
//   — throw error: "Student already has active POR in this org+tenure"
