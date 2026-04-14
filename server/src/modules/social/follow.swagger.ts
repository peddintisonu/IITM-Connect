/**
 * @swagger
 * tags:
 *   name: Social
 *   description: Follow and block management for social interactions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Follow:
 *       type: object
 *       required:
 *         - followerId
 *         - followingId
 *         - followingType
 *         - status
 *       properties:
 *         _id:
 *           type: string
 *           description: "Auto-generated MongoDB ObjectId"
 *         followerId:
 *           type: string
 *           description: "MongoDB ObjectId of the follower"
 *         followingId:
 *           type: string
 *           description: "MongoDB ObjectId of the following entity"
 *         followingType:
 *           type: string
 *           enum: [Student, Org]
 *           example: "Student"
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *           default: accepted
 *         createdAt:
 *           type: string
 *           format: date-time
 *         acceptedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /social/follow/{followingId}:
 *   post:
 *     summary: Send follow request
 *     description: Sends a follow request to another user or organization.
 *     tags: [Social]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: followingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user or organization to follow
 *         example: "65f1234567890abcdef12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - followingType
 *             properties:
 *               followingType:
 *                 type: string
 *                 enum: [Student, Org]
 *                 description: "Required, type of entity to follow"
 *                 example: "Student"
 *     responses:
 *       201:
 *         description: Follow request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Follow'
 *       400:
 *         description: Validation failed, invalid followingId, or already following
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
 *         description: Unable to follow this user (blocked)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Target not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /social/follow/{followingId}:
 *   delete:
 *     summary: Unfollow user or organization
 *     description: Removes the follow relationship with another user or organization.
 *     tags: [Social]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: followingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user or organization to unfollow
 *         example: "65f1234567890abcdef12345"
 *     responses:
 *       200:
 *         description: Unfollowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Follow'
 *       400:
 *         description: Invalid followingId
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
 *       404:
 *         description: Follow not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /social/follow/{followerId}/accept:
 *   post:
 *     summary: Accept follow request
 *     description: Accepts a pending follow request from another user.
 *     tags: [Social]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: followerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose follow request to accept
 *         example: "65f1234567890abcdef12345"
 *     responses:
 *       200:
 *         description: Follow request accepted
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Follow'
 *       400:
 *         description: Invalid followerId
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
 *       404:
 *         description: Follow request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /social/follow/{followerId}/reject:
 *   post:
 *     summary: Reject follow request
 *     description: Rejects a pending follow request from another user.
 *     tags: [Social]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: followerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose follow request to reject
 *         example: "65f1234567890abcdef12345"
 *     responses:
 *       200:
 *         description: Follow request rejected
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Follow'
 *       400:
 *         description: Invalid followerId
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
 *       404:
 *         description: Follow request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /social/follow/{followerId}/remove:
 *   delete:
 *     summary: Remove follower
 *     description: Removes a follower from your list.
 *     tags: [Social]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: followerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the follower to remove
 *         example: "65f1234567890abcdef12345"
 *     responses:
 *       200:
 *         description: Follower removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Follow'
 *       400:
 *         description: Invalid followerId
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
 *       404:
 *         description: Follower not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /social/follow/followers:
 *   get:
 *     summary: Get followers
 *     description: Retrieves the list of users following you.
 *     tags: [Social]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Followers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Follow'
 *       401:
 *         description: Unauthorized - access token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /social/follow/following:
 *   get:
 *     summary: Get following
 *     description: Retrieves the list of users or organizations you are following.
 *     tags: [Social]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Following retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Follow'
 *       401:
 *         description: Unauthorized - access token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /social/follow/requests:
 *   get:
 *     summary: Get pending follow requests
 *     description: Retrieves the list of pending follow requests you have received.
 *     tags: [Social]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Pending requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Follow'
 *       401:
 *         description: Unauthorized - access token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
