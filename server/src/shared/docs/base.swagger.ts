/**
 * @swagger
 * tags:
 *   - name: System
 *     description: Service health and basic API infrastructure endpoints
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: accessToken
 *     refreshCookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: refreshToken
 *   schemas:
 *     ApiResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *           example: 200
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Success
 *         data:
 *           type: object
 *           description: The actual payload (varies per route)
 *     ApiError:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *           example: 400
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Error message detail
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Invalid email format", "Password too short"]
 * /health:
 *   get:
 *     summary: Health check
 *     description: Simple liveness endpoint for uptime checks.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: IITMConnect server is running
 */
