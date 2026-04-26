/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: Organization request and approval workflows
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrganizationRequestRoleConfigInput:
 *       type: object
 *       required:
 *         - roleId
 *       properties:
 *         roleId:
 *           type: string
 *         parentRoleId:
 *           type: string
 *           nullable: true
 *         level:
 *           type: integer
 *           minimum: 0
 *         sortOrder:
 *           type: integer
 *           minimum: 0
 *         maxHolders:
 *           type: integer
 *           minimum: 1
 *         canBeVacant:
 *           type: boolean
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
 *             - slug
 *             - category
 *           properties:
 *             name:
 *               type: string
 *             shortName:
 *               type: string
 *             acronym:
 *               type: string
 *             slug:
 *               type: string
 *             category:
 *               type: string
 *               enum: [club, team, fest, hostel, department, committee, institute_body]
 *             description:
 *               type: string
 *             avatar:
 *               type: string
 *               format: uri
 *             coverImage:
 *               type: string
 *               format: uri
 *             avatarPublicId:
 *               type: string
 *             coverImagePublicId:
 *               type: string
 *             links:
 *               type: array
 *               items:
 *                 type: object
 *                 required:
 *                   - label
 *                   - url
 *                 properties:
 *                   label:
 *                     type: string
 *                   url:
 *                     type: string
 *                     format: uri
 *             contactEmail:
 *               type: string
 *               format: email
 *             website:
 *               type: string
 *               format: uri
 *             establishedYear:
 *               type: integer
 *             parentOrgId:
 *               type: string
 *             isPermanent:
 *               type: boolean
 *         firstTenure:
 *           type: object
 *           required:
 *             - name
 *             - startDate
 *             - endDate
 *           properties:
 *             name:
 *               type: string
 *             cycleYear:
 *               type: integer
 *             startDate:
 *               type: string
 *               format: date-time
 *             endDate:
 *               type: string
 *               format: date-time
 *         firstTenureRoleConfigs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrganizationRequestRoleConfigInput'
 *         creatorRequestedRoleId:
 *           type: string
 *         requiresParentTopPorApproval:
 *           type: boolean
 *     OrganizationRequestRejectBody:
 *       type: object
 *       required:
 *         - remarks
 *       properties:
 *         remarks:
 *           type: string
 */

/**
 * @swagger
 * /organizations/requests:
 *   post:
 *     summary: Create organization request
 *     description: Submit a request to create a new organization with first tenure and initial role configuration.
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
 *         description: Organization request created
 *       400:
 *         description: Validation failed or role/category mismatch
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
 *         description: Onboarding required to access this resource
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Organization slug already exists or pending request already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /organizations/requests/{requestId}/approve:
 *   post:
 *     summary: Approve organization request
 *     description: Approves the next pending step of an organization request. Final approval materializes organization, tenure, role configs, and creator assignment.
 *     tags: [Organizations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization request approved
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
 *         description: Organization request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Request is not pending
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /organizations/requests/{requestId}/reject:
 *   post:
 *     summary: Reject organization request
 *     description: Rejects the current pending step of an organization request with mandatory remarks.
 *     tags: [Organizations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrganizationRequestRejectBody'
 *     responses:
 *       200:
 *         description: Organization request rejected
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
 *         description: Organization request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
