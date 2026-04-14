/**
 * @swagger
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
 */
