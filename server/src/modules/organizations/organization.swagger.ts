/**
 * @swagger
 * tags:
 *   - name: Organizations
 *     description: Organization request and approval workflows
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrganizationRequestRoleConfigInput:
 *       type: object
 *       required:
 *         - roleId
 *         - level
 *         - maxHolders
 *       properties:
 *         roleId:
 *           type: string
 *           example: "65f12a3b4c5d6e7f8a9b0c1d"
 *         level:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           example: 1
 *         sortOrder:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           example: 0
 *         maxHolders:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *         canBeVacant:
 *           type: boolean
 *           default: true
 *           example: false

 *     OrganizationRequestTenureInput:
 *       type: object
 *       required:
 *         - name
 *         - startMonth
 *         - startYear
 *         - endMonth
 *         - endYear
 *       properties:
 *         name:
 *           type: string
 *           example: "Tenure 2026-27"
 *         cycleYear:
 *           type: integer
 *           minimum: 1900
 *           description: Defaults to the start year when omitted.
 *           example: 2026
 *         startMonth:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           example: 8
 *         startYear:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2500
 *           example: 2026
 *         endMonth:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           example: 5
 *         endYear:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2500
 *           example: 2027

 *     OrganizationRequestCreateBody:
 *       type: object
 *       required:
 *         - organization
 *         - firstTenure
 *         - creatorRequestedRoleId
 *       properties:
 *         organization:
 *           type: object
 *           required:
 *             - name
 *             - category
 *           properties:
 *             name:
 *               type: string
 *               example: "CFI Electronics Club"
 *             slug:
 *               type: string
 *               description: Optional. If omitted, a slug will be generated from the name.
 *               example: "elec-club"
 *             category:
 *               type: string
 *               enum: [club, team, fest, hostel, department, committee, institute_body]
 *               example: "club"
 *             establishedYear:
 *               type: integer
 *               minimum: 1900
 *               example: 2008
 *             parentOrgId:
 *               type: string
 *               example: "65f12a3b4c5d6e7f8a9b0c1e"
 *             isPermanent:
 *               type: boolean
 *               default: false
 *               example: true

 *         firstTenure:
 *           $ref: '#/components/schemas/OrganizationRequestTenureInput'

 *         firstTenureRoleConfigs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrganizationRequestRoleConfigInput'

 *         creatorRequestedRoleId:
 *           type: string
 *           example: "65f12a3b4c5d6e7f8a9b0c1f"

 *         requiresParentTopPorApproval:
 *           type: boolean
 *           default: false
 *           example: true

 *       example:
 *         organization:
 *           name: "CFI Electronics Club"
 *           slug: "elec-club"
 *           category: "club"
 *           establishedYear: 2008
 *           parentOrgId: "65f12a3b4c5d6e7f8a9b0c1e"
 *           isPermanent: true
 *         firstTenure:
 *           name: "Tenure 2026-27"
 *           cycleYear: 2026
 *           startMonth: 8
 *           startYear: 2026
 *           endMonth: 5
 *           endYear: 2027
 *         firstTenureRoleConfigs:
 *           - roleId: "65f12a3b4c5d6e7f8a9b0c1d"
 *             level: 1
 *             sortOrder: 1
 *             maxHolders: 1
 *             canBeVacant: false
 *           - roleId: "65f12a3b4c5d6e7f8a9b0c2a"
 *             level: 2
 *             sortOrder: 2
 *             maxHolders: 5
 *             canBeVacant: true
 *         creatorRequestedRoleId: "65f12a3b4c5d6e7f8a9b0c1d"
 *         requiresParentTopPorApproval: true

 *     OrganizationRequestRejectBody:
 *       type: object
 *       required:
 *         - remarks
 *       properties:
 *         remarks:
 *           type: string
 *           example: "Organization category mismatch with parent body policy."
 */

/**
 * @swagger
 * /organizations/requests:
 *   post:
 *     summary: Create organization request
 *     description: Submit a request to create a new organization.
 *     tags: [Organizations]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrganizationRequestCreateBody'
 *     responses:
 *       201:
 *         description: Organization request created successfully.
 *       400:
 *         description: Validation failed or role/category mismatch.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Onboarding required.
 *       409:
 *         description: Slug or pending request already exists.
 */

/**
 * @swagger
 * /organizations/requests/{requestId}/approve:
 *   post:
 *     summary: Approve organization request
 *     description: Approves the next pending step.
 *     tags: [Organizations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           example: "65f12a3b4c5d6e7f8a9b0c99"
 *     responses:
 *       200:
 *         description: Organization request approved.
 *       403:
 *         description: Requires admin privileges.
 *       404:
 *         description: Request not found.
 *       409:
 *         description: Request is not in a pending state.
 */

/**
 * @swagger
 * /organizations/requests/{requestId}/reject:
 *   post:
 *     summary: Reject organization request
 *     description: Rejects the current pending step with mandatory remarks.
 *     tags: [Organizations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           example: "65f12a3b4c5d6e7f8a9b0c99"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrganizationRequestRejectBody'
 *     responses:
 *       200:
 *         description: Organization request rejected.
 *       400:
 *         description: Remarks missing or invalid.
 *       404:
 *         description: Request not found.
 */
