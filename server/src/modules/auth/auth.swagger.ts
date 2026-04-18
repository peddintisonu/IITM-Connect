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
 *         initialLocation:
 *           type: object
 *           properties:
 *             ip:
 *               type: string
 *             city:
 *               type: string
 *             country:
 *               type: string
 *         currentLocation:
 *           type: object
 *           properties:
 *             ip:
 *               type: string
 *             city:
 *               type: string
 *             country:
 *               type: string
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
 *         endedAt:
 *           type: string
 *           format: date-time
 *           description: When the session ended
 *         endReason:
 *           type: string
 *           description: Why the session ended
 *         deletesAt:
 *           type: string
 *           format: date-time
 *           description: When the ended session is hard-deleted
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
 *     description: Handles the redirection from Google, sets auth cookies, and redirects to the app home page.
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Authentication successful, cookies set, and redirected
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: httpOnly access and refresh token cookies
 *           Location:
 *             schema:
 *               type: string
 *             description: Redirect target URL
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /auth/failure:
 *   get:
 *     summary: OAuth failure handler
 *     description: Returned when Google OAuth fails or uses a non-allowed account.
 *     tags: [Auth]
 *     responses:
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

/**
 * @swagger
 * /auth/refresh:
 *   get:
 *     summary: Refresh Access Token
 *     tags: [Auth]
 *     security:
 *       - refreshCookieAuth: [] # Specifically requires the refresh cookie
 *     responses:
 *       200:
 *         description: Successfully rotated tokens
 *       401:
 *         description: Refresh token missing, invalid, or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
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
 *       401:
 *         description: Unauthorized - access token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     description: Increments tokenVersion and clears all sessions.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out of all sessions
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
