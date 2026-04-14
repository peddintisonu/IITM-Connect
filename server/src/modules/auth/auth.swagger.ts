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
