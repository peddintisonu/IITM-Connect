/**
 * @swagger
 * tags:
 *   name: POR Assignments
 *   description: POR holder assignment operations
 */

/**
 * @swagger
 * tags:
 *   name: POR Tenures
 *   description: Tenure lifecycle management for organizations
 */

/**
 * @swagger
 * tags:
 *   name: POR Tenure Configs
 *   description: Tenure role configuration and hierarchy operations
 */

/**
 * @swagger
 * tags:
 *   name: POR Claims
 *   description: Student-initiated POR claim and review operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PORAssignmentCreateBody:
 *       type: object
 *       required:
 *         - tenureRoleConfigId
 *         - studentId
 *       properties:
 *         tenureRoleConfigId:
 *           type: string
 *         studentId:
 *           type: string
 *         assignmentStartMonth:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           description: Optional partial assignment start month within tenure
 *         assignmentStartYear:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2500
 *           description: Optional partial assignment start year within tenure
 *         assignmentEndMonth:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           description: Optional partial assignment end month within tenure
 *         assignmentEndYear:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2500
 *           description: Optional partial assignment end year within tenure
 *         notes:
 *           type: string
 *           maxLength: 500
 *     TenureCreateBody:
 *       type: object
 *       required:
 *         - orgId
 *         - name
 *         - startMonth
 *         - startYear
 *         - endMonth
 *         - endYear
 *       properties:
 *         orgId:
 *           type: string
 *         name:
 *           type: string
 *         cycleYear:
 *           type: integer
 *         startMonth:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         startYear:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2500
 *         endMonth:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         endYear:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2500
 *         status:
 *           type: string
 *           enum: [planned, active, grace, closed, archived]
 *       example:
 *         orgId: "65f12a3b4c5d6e7f8a9b0c2f"
 *         name: "Tenure 2026-27"
 *         cycleYear: 2026
 *         startMonth: 8
 *         startYear: 2026
 *         endMonth: 5
 *         endYear: 2027
 *     TenureUpdateBody:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         cycleYear:
 *           type: integer
 *         startMonth:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         startYear:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2500
 *         endMonth:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         endYear:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2500
 *     TenureStatusUpdateBody:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [planned, active, grace, closed, archived]
 *     TenureRoleConfigCreateBody:
 *       type: object
 *       required:
 *         - roleId
 *       properties:
 *         roleId:
 *           type: string
 *           description: PORRole _id
 *         isActiveInTenure:
 *           type: boolean
 *         level:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: Role ordering level used for display and approval ranking.
 *         sortOrder:
 *           type: integer
 *           minimum: 0
 *           maximum: 999
 *         maxHolders:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         canBeVacant:
 *           type: boolean
 *         permissions:
 *           $ref: '#/components/schemas/RolePermissions'
 *         effectiveFrom:
 *           type: string
 *           format: date-time
 *         effectiveTo:
 *           type: string
 *           format: date-time
 *         changeReason:
 *           type: string
 *           maxLength: 300
 *     TenureRoleConfigUpdateBody:
 *       type: object
 *       description: All fields are optional. At least one field must be provided.
 *       properties:
 *         isActiveInTenure:
 *           type: boolean
 *         level:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         sortOrder:
 *           type: integer
 *           minimum: 0
 *           maximum: 999
 *         maxHolders:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         canBeVacant:
 *           type: boolean
 *         permissions:
 *           $ref: '#/components/schemas/RolePermissions'
 *         effectiveFrom:
 *           type: string
 *           format: date-time
 *         effectiveTo:
 *           type: string
 *           format: date-time
 *         changeReason:
 *           type: string
 *           maxLength: 300
 *     TenureRoleConfigBulkItem:
 *       type: object
 *       required:
 *         - roleId
 *       properties:
 *         roleId:
 *           type: string
 *           description: PORRole _id
 *         isActiveInTenure:
 *           type: boolean
 *         level:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         sortOrder:
 *           type: integer
 *           minimum: 0
 *           maximum: 999
 *         maxHolders:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         canBeVacant:
 *           type: boolean
 *         permissions:
 *           $ref: '#/components/schemas/RolePermissions'
 *         effectiveFrom:
 *           type: string
 *           format: date-time
 *         effectiveTo:
 *           type: string
 *           format: date-time
 *         changeReason:
 *           type: string
 *           maxLength: 300
 *     BulkTenureRoleConfigUpsertBody:
 *       type: object
 *       required:
 *         - configs
 *       properties:
 *         configs:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/TenureRoleConfigBulkItem'
 *         overwriteExisting:
 *           type: boolean
 *           default: true
 *     TenureRoleConfigStatusBody:
 *       type: object
 *       required:
 *         - isActiveInTenure
 *       properties:
 *         isActiveInTenure:
 *           type: boolean
 *         changeReason:
 *           type: string
 *           maxLength: 300
 *     CloneTenureRoleConfigsBody:
 *       type: object
 *       properties:
 *         overwriteExisting:
 *           type: boolean
 *           default: false
 *     RolePermissions:
 *       type: object
 *       properties:
 *         canPost:
 *           type: boolean
 *         canCreateEvents:
 *           type: boolean
 *         canEditOrgProfile:
 *           type: boolean
 *         canManageRoles:
 *           type: boolean
 *         canManageTenure:
 *           type: boolean
 *         canApproveMembers:
 *           type: boolean
 *         canVerifyPORBelow:
 *           type: boolean
 *     PORClaimSubmitBody:
 *       type: object
 *       required:
 *         - tenureRoleConfigId
 *       properties:
 *         tenureRoleConfigId:
 *           type: string
 *           description: TenureRoleConfig _id of the role being claimed
 *         notes:
 *           type: string
 *           maxLength: 500
 *           description: Optional note from the student about their claim
 *     PORClaimRejectBody:
 *       type: object
 *       required:
 *         - rejectionReason
 *       properties:
 *         rejectionReason:
 *           type: string
 *           description: Mandatory reason for rejection shown to the claimant
 */

/**
 * @swagger
 * /pors/assignments:
 *   post:
 *     summary: Create POR assignment
 *     description: Assigns a student to a tenure role config, enforcing active config and holder-capacity constraints.
 *     tags: [POR Assignments]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PORAssignmentCreateBody'
 *     responses:
 *       201:
 *         description: POR assignment created
 *       400:
 *         description: Validation failed or assignment period outside tenure bounds
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Requires admin or super-admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Tenure role config or student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Role config inactive, at capacity, or student already assigned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/claims:
 *   post:
 *     summary: Submit a POR claim
 *     description: >
 *       Any onboarded student can submit a claim for a role in an active tenure.
 *       Checks that the tenure is active, the role is active in the tenure,
 *       the student has no existing active POR in the same org+tenure,
 *       and the role is not already at capacity.
 *     tags: [POR Claims]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PORClaimSubmitBody'
 *     responses:
 *       201:
 *         description: Claim submitted successfully
 *       400:
 *         description: Tenure not active or role not active in tenure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Onboarding required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Role configuration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Student already has active POR, pending claim, or role is at capacity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/claims/{claimId}:
/**
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Claim not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/claims/mine:
 *   get:
 *     summary: Get my claims
 *     description: Returns all claims submitted by the current student, optionally filtered by status.
 *     tags: [POR Claims]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled]
 *         description: Filter claims by status. Omit to return all.
 *     responses:
 *       200:
 *         description: Claims fetched
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Onboarding required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/claims/org/{orgId}:
 *   get:
 *     summary: Get pending claims for an organisation
 *     description: >
 *       Returns all pending claims for the given org scoped to a specific tenure.
 *       Caller must have an active POR in the same org and tenure to access this.
 *     tags: [POR Claims]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: tenureId
 *         required: true
 *         schema:
 *           type: string
 *         description: Scope claims to this specific tenure
 *     responses:
 *       200:
 *         description: Pending claims fetched
 *       400:
 *         description: tenureId query param is missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: No active POR in this org and tenure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/claims/{claimId}/approve:
 *   post:
 *     summary: Approve a pending claim
 *     description: >
 *       Approver must have an active POR in the same org and tenure as the claim.
 *       Approver must outrank the claimant (lower level number = higher rank).
 *       Level 1 holders can also approve parallel level-1 claims.
 *       Creates a PORAssignment atomically on approval.
 *     tags: [POR Claims]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: claimId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Claim approved and POR assignment created
 *       400:
 *         description: Claim is not in pending state
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Cannot approve own claim, no active POR, or insufficient level to approve
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Claim or role configuration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Role at capacity or claimant already has active POR
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/claims/{claimId}/reject:
 *   post:
 *     summary: Reject a pending claim
 *     description: >
 *       Rejecter must have an active POR in the same org and tenure as the claim.
 *       Rejecter must outrank the claimant (lower level number = higher rank).
 *       Level 1 holders can also reject parallel level-1 claims.
 *       Rejection reason is mandatory.
 *     tags: [POR Claims]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: claimId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PORClaimRejectBody'
 *     responses:
 *       200:
 *         description: Claim rejected
 *       400:
 *         description: Claim is not pending or rejection reason is missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: No active POR in this org and tenure, or insufficient level to reject
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Claim or role configuration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/tenures:
 *   get:
 *     summary: List tenures
 *     description: Lists tenures with optional filters by organization, status, cycle year, and active date.
 *     tags: [POR Tenures]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: orgId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planned, active, grace, closed, archived]
 *       - in: query
 *         name: cycleYear
 *         schema:
 *           type: integer
 *       - in: query
 *         name: activeOnDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Tenures fetched
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Onboarding required to access this resource
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/tenures/{tenureId}:
 *   get:
 *     summary: Get tenure by id
 *     tags: [POR Tenures]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: tenureId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tenure fetched
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Tenure not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/tenures:
 *   post:
 *     summary: Create tenure
 *     tags: [POR Tenures]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenureCreateBody'
 *     responses:
 *       201:
 *         description: Tenure created
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Requires admin or super-admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Overlapping tenure window for organization
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/tenures/{tenureId}:
 *   patch:
 *     summary: Update tenure
 *     tags: [POR Tenures]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: tenureId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenureUpdateBody'
 *     responses:
 *       200:
 *         description: Tenure updated
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Requires admin or super-admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Tenure not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/tenures/{tenureId}/status:
 *   patch:
 *     summary: Update tenure status
 *     description: Changes tenure status using guarded transitions.
 *     tags: [POR Tenures]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: tenureId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenureStatusUpdateBody'
 *     responses:
 *       200:
 *         description: Tenure status updated
 *       400:
 *         description: Validation failed or status unchanged
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Requires admin or super-admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Tenure not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Invalid status transition
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/tenures/{tenureId}/role-configs:
 *   post:
 *     summary: Create tenure role config
 *     tags: [POR Tenure Configs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: tenureId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenureRoleConfigCreateBody'
 *     responses:
 *       201:
 *         description: Tenure role config created
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Requires admin or super-admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Tenure or role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Duplicate config for role, archived tenure locked, or effective window conflict
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/tenures/{tenureId}/role-configs/bulk:
 *   put:
 *     summary: Bulk upsert tenure role configs
 *     tags: [POR Tenure Configs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: tenureId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkTenureRoleConfigUpsertBody'
 *     responses:
 *       200:
 *         description: Tenure role configs upserted
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Requires admin or super-admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Tenure or role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Target already has configs and overwrite is disabled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/tenures/{tenureId}/role-configs/{configId}:
 *   patch:
 *     summary: Update tenure role config
 *     tags: [POR Tenure Configs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: tenureId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: configId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenureRoleConfigUpdateBody'
 *     responses:
 *       200:
 *         description: Tenure role config updated
 *       400:
 *         description: Validation failed or no fields provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Requires admin or super-admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Tenure config not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Active-assignment conflict or maxHolders below current active count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/tenures/{tenureId}/role-configs/{configId}/status:
 *   patch:
 *     summary: Update tenure role config active status
 *     tags: [POR Tenure Configs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: tenureId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: configId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenureRoleConfigStatusBody'
 *     responses:
 *       200:
 *         description: Tenure role config status updated
 *       400:
 *         description: Validation failed or status already matches requested value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Requires admin or super-admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Tenure config not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Active-assignment conflict on deactivation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/tenures/{tenureId}/role-configs/{configId}:
 *   delete:
 *     summary: Delete tenure role config
 *     tags: [POR Tenure Configs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: tenureId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: configId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tenure role config deleted
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Requires admin or super-admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Tenure config not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Active-assignment conflict
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/tenures/{tenureId}/role-configs/clone-from/{sourceTenureId}:
 *   post:
 *     summary: Clone tenure role configs
 *     description: Copies all role configs from the source tenure into the target tenure. Both tenures must belong to the same organisation.
 *     tags: [POR Tenure Configs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: tenureId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sourceTenureId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CloneTenureRoleConfigsBody'
 *     responses:
 *       200:
 *         description: Tenure role configs cloned
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Requires admin or super-admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Source or target tenure not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Cross-org clone not allowed or target already has configs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EndAssignmentBody:
 *       type: object
 *       properties:
 *         endMonth:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           description: Optional Gregorian month of resignation/removal
 *         endYear:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2500
 *           description: Optional Gregorian year
 *         reason:
 *           type: string
 *           maxLength: 500
 *           description: Reason for ending assignment
 *     TransferAssignmentBody:
 *       type: object
 *       required:
 *         - newTenureRoleConfigId
 *       properties:
 *         newTenureRoleConfigId:
 *           type: string
 *           description: New role config in same org+tenure
 *         reason:
 *           type: string
 *           maxLength: 500
 *           description: Reason for transfer (e.g. position restructure)
 *     RenewForTenureBody:
 *       type: object
 *       required:
 *         - newTenureId
 *         - newTenureRoleConfigId
 *       properties:
 *         newTenureId:
 *           type: string
 *           description: New tenure to promote into
 *         newTenureRoleConfigId:
 *           type: string
 *           description: Role in new tenure (can be same or different from current)
 *         reason:
 *           type: string
 *           description: Reason for renewal (e.g. promoted from president to advisor)
 */

/**
 * @swagger
 * /pors/assignments/{assignmentId}/end:
 *   patch:
 *     summary: End a POR assignment mid-tenure
 *     description: >
 *       Deactivate a POR assignment. Student can end their own,
 *       level 1 holders can end anyone's in same org,
 *       admins can end any. Sets isActive: false and releasedAt: now.
 *     tags: [POR Assignments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EndAssignmentBody'
 *     responses:
 *       200:
 *         description: Assignment ended successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Cannot end other's assignment (not level 1 or self)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Assignment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Assignment already inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/assignments/{assignmentId}/transfer:
 *   patch:
 *     summary: Transfer POR to different role in same tenure
 *     description: >
 *       Move a student to a different role within the same org and tenure.
 *       Only level 1 leaders can transfer. New role must not be at capacity.
 *     tags: [POR Assignments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransferAssignmentBody'
 *     responses:
 *       200:
 *         description: Assignment transferred successfully
 *       400:
 *         description: New role at capacity or invalid role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Only level 1 can transfer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Assignment or new role config not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Student already holds new role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /pors/assignments/renew-for-tenure:
 *   post:
 *     summary: Renew assignment for next tenure (promotion)
 *     description: >
 *       Directly carry forward or promote an assignment to the next tenure.
 *       Used as convenience for handover when org leader wants to pre-assign roles.
 *       Alternative is normal claim flow in new tenure.
 *     tags: [POR Assignments]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RenewForTenureBody'
 *     responses:
 *       201:
 *         description: Assignment renewed for new tenure
 *       400:
 *         description: Invalid tenure transition or role not available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Only org leaders can renew
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Previous assignment or new tenure not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
