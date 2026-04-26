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
//   For each role: set parentRoleId, level, sortOrder, maxHolders, canBeVacant
//   If role not in list: type custom name, flagged as isCustomRole: true for admin review
//   Hierarchy is almost always a straight vertical chain — siblings are rare
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
//     PORAssignment.create() with isActive: true, assignedBy: approver's studentId
//     Student notified — badge appears on profile
//   Approver rejects →
//     Claim document deleted
//     Student notified with rejection reason
//
// IMPORTANT RULE — Chain of Trust:
//   A POR holder can only verify roles at a level BELOW their own level
//   Level 1 can verify level 2, 3, 4...
//   Level 2 can verify level 3, 4... but NOT level 1
//   Nobody can self-verify
//
// FILES INVOLVED:
//   pors/models/assignment.model.ts
//   tenures/models/tenureRoleConfig.model.ts
//   pors/models/porClaim.model.ts        (to be created — tracks pending claims)
//   pors/services/porClaim.service.ts    (to be created)
//   pors/controllers/porClaim.controller.ts (to be created)
//   pors/routes/porClaim.routes.ts       (to be created)
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
// Role Permissions (on TenureRoleConfig model — to be added):
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
//   tenures/models/tenureRoleConfig.model.ts  (add permissions field)
//   tenures/constants/permissions.constants.ts (to be created)
//   shared/middleware/checkOrgPermission.ts   (to be created — reusable middleware)
//
// -----------------------------------------------------------------------------

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
//   shared/middleware/checkOrgPermission.ts     (to be created)
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
// 1. POR Claim model not yet created
//    Need a separate collection to track pending claims before PORAssignment is created
//    Similar to OrganizationRequest pattern
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
// 4. parentRoleId validation missing
//    TenureRoleConfig.parentRoleId should belong to same tenure
//    No service-level check exists yet — can accidentally reference wrong tenure's role
//
// 5. assignmentStartMonth/Year cross-field validation missing
//    Both month and year must be set together or not at all
//    Currently no validator enforcing this in assignment.model.ts
//
// 6. Org capabilities auto-set not yet implemented
//    Organization model has capabilities flags but no pre-save hook
//    that sets defaults based on category
//    Currently admin must manually set all 7 flags
//
// 7. normalizedDisplayName unique index scope in PORRole
//    Currently globally unique — blocks having "Secretary" for both clubs and hostels
//    Should be scoped to appliesToCategories
//
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// TODO LIST
// -----------------------------------------------------------------------------

// TODO: create pors/models/porClaim.model.ts
//   — tracks pending POR claims before PORAssignment is created
//   — fields: orgId, tenureId, tenureRoleConfigId, roleId, claimedBy, status, reviewedBy, reviewedAt, rejectionReason

// TODO: create pors/services/porClaim.service.ts
//   — submitPORClaim() — eligibility checks, create claim, notify level 1+2 holders
//   — approvePORClaim() — chain of trust check, create PORAssignment, notify student
//   — rejectPORClaim() — delete claim, notify student with reason

// TODO: create pors/controllers/porClaim.controller.ts
//   — claimPOR, approveClaim, rejectClaim, getMyPORs, getPendingClaimsForOrg

// TODO: create pors/routes/porClaim.routes.ts
//   — POST /pors/claim
//   — POST /pors/claim/:claimId/approve
//   — POST /pors/claim/:claimId/reject
//   — GET  /pors/me
//   — GET  /orgs/:orgId/pors/pending

// TODO: create organizations/services/orgRequest.service.ts
//   — submitOrgRequest() — validate, create OrganizationRequest
//   — approveOrgRequest() — MongoDB transaction creating Org + Tenure + TenureRoleConfigs + first PORAssignment
//   — rejectOrgRequest() — update status, notify student
//   — notifyParentTopPOR() — find level 1 holder of parent org, send notification

// TODO: create organizations/controllers/orgRequest.controller.ts
//   — submitRequest, approveRequest, rejectRequest, getMyRequests, getPendingRequests (admin)

// TODO: create organizations/routes/orgRequest.routes.ts
//   — POST /orgs/request
//   — GET  /orgs/request/me
//   — GET  /orgs/request/pending  (admin only)
//   — POST /orgs/request/:requestId/approve  (admin only)
//   — POST /orgs/request/:requestId/reject   (admin only)

// TODO: create tenures/services/tenure.service.ts
//   — createTenure() — create tenure + copy TenureRoleConfigs from previous tenure
//   — activateTenure() — update status, deactivate old assignments
//   — completeTenure() — mark completed, link nextTenureId/previousTenureId

// TODO: create tenures/controllers/tenure.controller.ts
//   — createTenure, getOrgTenures, getTenureById, updateTenure

// TODO: create tenures/routes/tenure.routes.ts
//   — POST /orgs/:orgId/tenures
//   — GET  /orgs/:orgId/tenures
//   — GET  /orgs/:orgId/tenures/:tenureId

// TODO: create jobs/tenureTransition.job.ts
//   — cron job — runs daily
//   — finds tenures where endDate is within 30 days and status: "active"
//   — notifies all active POR holders, sets handoverStatus: "in_progress"

// TODO: create jobs/tenureActivation.job.ts
//   — cron job — runs daily
//   — finds tenures where startDate is today and status: "planned"
//   — activates tenure, deactivates old tenure and old PORAssignments

// TODO: add permissions field to tenures/models/tenureRoleConfig.model.ts
//   — IRolePermissions interface
//   — canPost, canApproveMembers, canManageRoles, canCreateEvents, canVerifyPORBelow, canEditOrgProfile, canManageTenure

// TODO: create tenures/constants/permissions.constants.ts
//   — DEFAULT_ROLE_PERMISSIONS_BY_LEVEL map (level 1, 2, 3+)

// TODO: create shared/middleware/checkOrgPermission.ts
//   — reusable middleware factory: checkOrgPermission("canPost")
//   — finds active PORAssignment for req.user in req.params.orgId
//   — reads TenureRoleConfig.permissions for that assignment
//   — throws 403 if permission is false

// TODO: add pre-save hook to organizations/models/organization.model.ts
//   — auto-set capabilities based on category using CATEGORY_CAPABILITIES map

// TODO: fix normalizedDisplayName index in pors/models/porRole.model.ts
//   — change from globally unique to unique per appliesToCategories

// TODO: add parentRoleId validation in tenures/services/tenure.service.ts
//   — when creating TenureRoleConfig, verify parentRoleId belongs to same tenure

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

// TODO: create organizations/services/org.service.ts
//   — getOrgBySlug(), updateOrgProfile(), uploadOrgAvatar(), uploadOrgCover()

// TODO: create organizations/controllers/org.controller.ts
//   — getOrg, updateProfile, uploadAvatar, uploadCover

// TODO: create organizations/routes/org.routes.ts
//   — GET   /orgs/:slug
//   — PATCH /orgs/:slug/profile   (canEditOrgProfile permission required)
//   — PATCH /orgs/:slug/avatar    (canEditOrgProfile permission required)
//   — PATCH /orgs/:slug/cover     (canEditOrgProfile permission required)
