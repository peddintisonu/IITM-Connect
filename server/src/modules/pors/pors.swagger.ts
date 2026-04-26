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
 *         status:
 *           type: string
 *           enum: [planned, active, grace, closed, archived]
 *     TenureStatusUpdateBody:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [planned, active, grace, closed, archived]
 *     TenureRoleConfigWrite:
 *       type: object
 *       properties:
 *         roleId:
 *           type: string
 *         isActiveInTenure:
 *           type: boolean
 *         parentRoleId:
 *           type: string
 *           nullable: true
 *         level:
 *           type: integer
 *         sortOrder:
 *           type: integer
 *         maxHolders:
 *           type: integer
 *         canBeVacant:
 *           type: boolean
 *         effectiveFrom:
 *           type: string
 *           format: date-time
 *         effectiveTo:
 *           type: string
 *           format: date-time
 *         changeReason:
 *           type: string
 *     BulkTenureRoleConfigUpsertBody:
 *       type: object
 *       required:
 *         - configs
 *       properties:
 *         configs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TenureRoleConfigWrite'
 *         overwriteExisting:
 *           type: boolean
 *     TenureRoleConfigStatusBody:
 *       type: object
 *       required:
 *         - isActiveInTenure
 *       properties:
 *         isActiveInTenure:
 *           type: boolean
 *         changeReason:
 *           type: string
 *     CloneTenureRoleConfigsBody:
 *       type: object
 *       properties:
 *         overwriteExisting:
 *           type: boolean
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
 *   get:
 *     summary: List tenure role configs
 *     tags: [POR Tenure Configs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: tenureId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActiveInTenure
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Tenure role configs fetched
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
 * /pors/tenures/{tenureId}/role-configs/tree:
 *   get:
 *     summary: Get tenure role config tree
 *     tags: [POR Tenure Configs]
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
 *         description: Tenure role config tree fetched
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
 *             $ref: '#/components/schemas/TenureRoleConfigWrite'
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
 *         description: Duplicate config for role or edit not allowed
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
 *             $ref: '#/components/schemas/TenureRoleConfigWrite'
 *     responses:
 *       200:
 *         description: Tenure role config updated
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
 *         description: Tenure config not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Active-assignment or max-holder conflict
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
