/**
 * @swagger
 * components:
 *   schemas:
 *     Block:
 *       type: object
 *       required:
 *         - blockerId
 *         - blockedId
 *       properties:
 *         _id:
 *           type: string
 *           description: "Auto-generated MongoDB ObjectId"
 *         blockerId:
 *           type: string
 *           description: "MongoDB ObjectId of the user who blocked"
 *         blockedId:
 *           type: string
 *           description: "MongoDB ObjectId of the blocked student"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PaginatedBlockListResponse:
 *       type: object
 *       required:
 *         - items
 *         - nextCursor
 *         - hasMore
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Block'
 *         nextCursor:
 *           type: string
 *           nullable: true
 *           description: Opaque pagination cursor for the next page
 *         hasMore:
 *           type: boolean
 *           description: Whether another page is available
 */

/**
 * @swagger
 * /social/block/{blockedId}:
 *   post:
 *     summary: Block a student
 *     description: Blocks a student. Automatically removes any existing follow relationships.
 *     tags: [Social]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: blockedId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the student to block
 *         example: "65f1234567890abcdef12345"
 *     responses:
 *       200:
 *         description: Student blocked successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Block'
 *       400:
 *         description: Cannot block yourself or already blocked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized - access token missing or invalid
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
 * /social/block/{blockedId}:
 *   delete:
 *     summary: Unblock a student
 *     description: Removes the block on a previously blocked student.
 *     tags: [Social]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: blockedId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the student to unblock
 *         example: "65f1234567890abcdef12345"
 *     responses:
 *       200:
 *         description: Student unblocked successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Block'
 *       401:
 *         description: Unauthorized - access token missing or invalid
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
 *       404:
 *         description: Block not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /social/block:
 *   get:
 *     summary: Get block list
 *     description: Retrieves blocked users with cursor pagination.
 *     tags: [Social]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Page size
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: string
 *         description: Opaque pagination cursor returned by the previous page
 *     responses:
 *       200:
 *         description: Block list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PaginatedBlockListResponse'
 *       400:
 *         description: Validation failed or invalid list cursor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized - access token missing or invalid
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
