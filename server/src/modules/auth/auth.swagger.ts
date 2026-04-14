/**
 * @swagger
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Session ID
 *         deviceInfo:
 *           type: string
 *           description: Device info (browser and OS)
 *         ipAddress:
 *           type: string
 *           description: IP address used for this session
 *         userAgent:
 *           type: string
 *           description: User agent string
 *         lastAccessedAt:
 *           type: string
 *           format: date-time
 *           description: Last time this session was used
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Session creation time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Session expiry time
 *         revoked:
 *           type: boolean
 *           description: Whether this session is revoked (logged out)
 */

/**
 * @swagger
 * /auth/sessions:
 *   get:
 *     summary: List all sessions for the current user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of sessions
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         sessions:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Session'
 *                         currentSessionId:
 *                           type: string
 *                           description: The session ID of the current device/session
 */

/**
 * @swagger
 * /auth/sessions/{sessionId}/logout:
 *   post:
 *     summary: Revoke (logout) a specific session for the current user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The session ID to revoke
 *     responses:
 *       200:
 *         description: Session revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Session management (Google OAuth)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthResponse:
 *       type: object
 *       properties:
 *         student:
 *           $ref: '#/components/schemas/Student'
 *         accessToken:
 *           type: string
 *           description: "JWT access token (set in httpOnly cookie)"
 *         refreshToken:
 *           type: string
 *           description: "JWT refresh token (set in httpOnly cookie)"
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth
 *     description: Redirects to Google login page. Only @smail.iitm.ac.in accounts are allowed.
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirect to Google
 */

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth Callback
 *     description: Handles the redirection from Google. Sets httpOnly cookies (accessToken, refreshToken).
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Student'
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh Access Token
 *     tags: [Auth]
 *     security:
 *       - refreshCookieAuth: [] # Specifically requires the refresh cookie
 *     responses:
 *       200:
 *         description: Successfully rotated tokens
 */

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout from current device
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 */

/**
 * @swagger
 * /auth/logout-all:
 *   get:
 *     summary: Logout from all devices
 *     description: Increments tokenVersion and clears all sessions.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out of all sessions
 */
