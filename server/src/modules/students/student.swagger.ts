/**
 * @swagger
 * tags:
 *   name: Student
 *   description: Student profile management and onboarding
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: "Auto-generated MongoDB ObjectId"
 *         fullName:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "cs24b001@smail.iitm.ac.in"
 *         displayName:
 *           type: string
 *           example: "JohnD"
 *         username:
 *           type: string
 *           example: "johndoe_iitm"
 *         profilePhoto:
 *           type: string
 *           format: uri
 *         coverPhoto:
 *           type: string
 *           format: uri
 *         bio:
 *           type: string
 *           example: "Passionate coder | IIT Madras '28"
 *         links:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 example: "LinkedIn"
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: "https://linkedin.com/in/username"
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Robotics", "Cricket"]
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           example: ["React", "TypeScript"]
 *         accountType:
 *           type: string
 *           enum: [public, private]
 *           default: public
 *         privacySettings:
 *           type: object
 *           properties:
 *             hiddenFields:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["roomNo"]
 *             publicHiddenFields:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["roomNo"]
 *             privateHiddenFields:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["rollNo", "hostel", "roomNo"]
 *         currentRollNo:
 *           type: string
 *           example: "cs24b001"
 *         currentDeptId:
 *           type: string
 *         currentCourseId:
 *           type: string
 *         currentBatch:
 *           type: number
 *           example: 2024
 *         graduationYear:
 *           type: number
 *           example: 2028
 *         currentHostelId:
 *           type: string
 *         currentRoomNo:
 *           type: number
 *         rollNoHistory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               rollNo:
 *                 type: string
 *                 example: "cs24b001"
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *         hostelHistory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               hostelId:
 *                 type: string
 *                 example: "65f1234567890abcdef12345"
 *               roomNo:
 *                 type: number
 *                 example: 302
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           default: active
 *         isOnboarded:
 *           type: boolean
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OnboardingInput:
 *       type: object
 *       required:
 *         - displayName
 *         - username
 *       properties:
 *         displayName:
 *           type: string
 *           example: "Jay Vardhan"
 *         username:
 *           type: string
 *           example: "jay_v"
 *         accountType:
 *           type: string
 *           enum: [public, private]
 *           example: "public"
 *           description: "Optional, defaults to public"
 *         currentHostelId:
 *           type: string
 *           description: "Required if currentRoomNo is provided"
 *           example: "65f1234567890abcdef12345"
 *         currentRoomNo:
 *           type: number
 *           description: "Required if currentHostelId is provided"
 *           example: 302
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PrivacySettingsInput:
 *       type: object
 *       properties:
 *         accountType:
 *           type: string
 *           enum: [public, private]
 *           description: "Optional, account visibility level"
 *           example: "private"
 *         hiddenFields:
 *           type: array
 *           items:
 *             type: string
 *             enum: [rollNo, batch, graduationYear, dept, course, hostel, roomNo, email]
 *           description: "Optional, fields to hide from public view"
 *           example: ["rollNo", "hostel", "roomNo"]
 *
 *     UsernameAvailabilityResponse:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           example: "jay_v"
 *         available:
 *           type: boolean
 *           example: true
 *
 *     StudentCard:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f1234567890abcdef12345"
 *         displayName:
 *           type: string
 *           example: "John Doe"
 *         username:
 *           type: string
 *           example: "john_doe"
 *         profilePhoto:
 *           type: string
 *           format: uri
 *         accountType:
 *           type: string
 *           enum: [public, private]
 *
 *     StudentSearchResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StudentCard'
 *         nextCursor:
 *           type: string
 *           nullable: true
 *           description: Opaque cursor for the next page of results
 *         hasMore:
 *           type: boolean
 *
 *     UpdateProfileInput:
 *       type: object
 *       properties:
 *         displayName:
 *           type: string
 *           example: "John Doe"
 *           description: "Optional"
 *         username:
 *           type: string
 *           example: "johndoe_iitm"
 *           description: "Optional"
 *         bio:
 *           type: string
 *           example: "Passionate coder | IIT Madras '28"
 *           description: "Optional"
 *         links:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 example: "LinkedIn"
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: "https://linkedin.com/in/username"
 *           description: "Optional, social media links"
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Robotics", "Cricket"]
 *           description: "Optional"
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           example: ["React", "TypeScript"]
 *           description: "Optional"
 */

/**
 * @swagger
 * /students/onboarding:
 *   patch:
 *     summary: Complete student onboarding
 *     description: Sets initial profile details. Only allowed once per student.
 *     tags: [Student]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OnboardingInput'
 *     responses:
 *       200:
 *         description: Onboarding successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Student'
 *       400:
 *         description: Validation failed, student already onboarded, or hostel/room data is invalid
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
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Username already taken
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /students/me:
 *   get:
 *     summary: Get current student profile
 *     description: Retrieves the authenticated student's own profile information.
 *     tags: [Student]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user profile fetched successfully
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
 *         description: Unauthorized - access token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /students/search:
 *   get:
 *     summary: Search students
 *     description: Searches active onboarded students by display name tokens, initials, and username prefix. Supports cursor pagination.
 *     tags: [Student]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search text for display name, initials, or username
 *         example: rah
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 20
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
 *         description: Student search completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/StudentSearchResponse'
 *       400:
 *         description: Validation failed or invalid search cursor
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
 */

/**
 * @swagger
 * /students/cards:
 *   post:
 *     summary: Get minimal student cards by user IDs
 *     description: Returns minimal profile cards for a list of user IDs, preserving input order and filtering blocked users.
 *     tags: [Student]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 100
 *                 items:
 *                   type: string
 *                   example: "65f1234567890abcdef12345"
 *     responses:
 *       200:
 *         description: Student cards fetched successfully
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
 *                         $ref: '#/components/schemas/StudentCard'
 *       400:
 *         description: Validation failed or invalid user IDs
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
 */

/**
 * @swagger
 * /students/me/profile:
 *   patch:
 *     summary: Update student profile
 *     description: Updates the authenticated student's profile information.
 *     tags: [Student]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileInput'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Student'
 *       400:
 *         description: Validation failed
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
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Username already taken
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /students/me/photo:
 *   patch:
 *     summary: Update profile photo
 *     description: Uploads and updates the authenticated student's profile photo.
 *     tags: [Student]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (max 5MB)
 *     responses:
 *       200:
 *         description: Profile photo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Student'
 *       400:
 *         description: No image provided or file too large
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
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /students/me/cover:
 *   patch:
 *     summary: Update cover photo
 *     description: Uploads and updates the authenticated student's cover photo.
 *     tags: [Student]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (max 10MB)
 *     responses:
 *       200:
 *         description: Cover photo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Student'
 *       400:
 *         description: No image provided or file too large
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
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /students/me/hostel:
 *   patch:
 *     summary: Update hostel information
 *     description: Updates the authenticated student's current hostel and room number.
 *     tags: [Student]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentHostelId
 *               - currentRoomNo
 *             properties:
 *               currentHostelId:
 *                 type: string
 *                 example: "65f1234567890abcdef12345"
 *               currentRoomNo:
 *                 type: number
 *                 example: 302
 *     responses:
 *       200:
 *         description: Hostel updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Student'
 *       400:
 *         description: Validation failed
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
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /students/me/privacy:
 *   patch:
 *     summary: Update privacy settings
 *     description: Updates the authenticated student's account type and hidden fields.
 *     tags: [Student]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrivacySettingsInput'
 *     responses:
 *       200:
 *         description: Privacy settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Student'
 *       400:
 *         description: Validation failed
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
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /students/{username}:
 *   get:
 *     summary: Get student profile by username
 *     description: Retrieves a student's public profile by username. Private accounts may hide certain fields.
 *     tags: [Student]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the student
 *         example: "johndoe_iitm"
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Student'
 *       400:
 *         description: Username is required
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
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /students/username-availability:
 *   get:
 *     summary: Check username availability
 *     description: Returns whether a username is available for use.
 *     tags: [Student]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username to validate and check for availability
 *         example: "jay_v"
 *     responses:
 *       200:
 *         description: Username availability fetched
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UsernameAvailabilityResponse'
 *       400:
 *         description: Invalid username format
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
 */
