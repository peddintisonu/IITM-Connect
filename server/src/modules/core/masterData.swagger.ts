/**
 * @swagger
 * tags:
 *   - name: MasterData
 *     description: Reference/master data management (hostels, departments, courses)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Hostel:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f1234567890abcdef12345
 *         name:
 *           type: string
 *           example: Tapti
 *         code:
 *           type: string
 *           example: TA
 *         type:
 *           type: string
 *           enum: [boys, girls]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Department:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f1234567890abcdef12345
 *         name:
 *           type: string
 *           example: Computer Science & Engineering
 *         code:
 *           type: string
 *           example: CS
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Course:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 65f1234567890abcdef12345
 *         name:
 *           type: string
 *           example: Bachelor of Technology
 *         code:
 *           type: string
 *           example: B
 *         abbreviation:
 *           type: string
 *           example: B.Tech
 *         duration:
 *           type: number
 *           example: 4
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     MasterDataBootstrap:
 *       type: object
 *       properties:
 *         hostels:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Hostel'
 *         departments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Department'
 *         courses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Course'
 *
 *     CreateHostelInput:
 *       type: object
 *       required: [name, code, type]
 *       properties:
 *         name:
 *           type: string
 *           example: Tapti
 *         code:
 *           type: string
 *           example: TA
 *         type:
 *           type: string
 *           enum: [boys, girls]
 *
 *     UpdateHostelInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         type:
 *           type: string
 *           enum: [boys, girls]
 *
 *     CreateDepartmentInput:
 *       type: object
 *       required: [name, code]
 *       properties:
 *         name:
 *           type: string
 *           example: Computer Science & Engineering
 *         code:
 *           type: string
 *           example: CS
 *
 *     UpdateDepartmentInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         code:
 *           type: string
 *
 *     CreateCourseInput:
 *       type: object
 *       required: [name, code, abbreviation]
 *       properties:
 *         name:
 *           type: string
 *           example: Bachelor of Technology
 *         code:
 *           type: string
 *           example: B
 *         abbreviation:
 *           type: string
 *           example: B.Tech
 *         duration:
 *           type: integer
 *           minimum: 1
 *           example: 4
 *
 *     UpdateCourseInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         abbreviation:
 *           type: string
 *         duration:
 *           type: integer
 *           minimum: 1
 */

/**
 * @swagger
 * /master-data/bootstrap:
 *   get:
 *     summary: Get all master data in one call
 *     tags: [MasterData]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Master data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MasterDataBootstrap'
 *       401:
 *         description: Unauthorized - access token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /master-data/hostels:
 *   get:
 *     summary: Get all hostels
 *     tags: [MasterData]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Hostels fetched successfully
 *       401:
 *         description: Unauthorized - access token missing or invalid
 *   post:
 *     summary: Create a hostel (admin/super_admin)
 *     tags: [MasterData]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateHostelInput'
 *     responses:
 *       201:
 *         description: Hostel created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized - access token missing or invalid
 *       403:
 *         description: Insufficient permissions to access this resource
 *       409:
 *         description: Hostel name or code already exists
 */

/**
 * @swagger
 * /master-data/hostels/{hostelId}:
 *   patch:
 *     summary: Update a hostel (admin/super_admin)
 *     tags: [MasterData]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: hostelId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateHostelInput'
 *     responses:
 *       200:
 *         description: Hostel updated successfully
 *       400:
 *         description: Validation failed or invalid ID
 *       401:
 *         description: Unauthorized - access token missing or invalid
 *       403:
 *         description: Insufficient permissions to access this resource
 *       404:
 *         description: Hostel not found
 *       409:
 *         description: Hostel name or code already exists
 *   delete:
 *     summary: Delete a hostel (admin/super_admin)
 *     tags: [MasterData]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: hostelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hostel deleted successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized - access token missing or invalid
 *       403:
 *         description: Insufficient permissions to access this resource
 *       404:
 *         description: Hostel not found
 */

/**
 * @swagger
 * /master-data/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [MasterData]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Departments fetched successfully
 *       401:
 *         description: Unauthorized - access token missing or invalid
 *   post:
 *     summary: Create a department (admin/super_admin)
 *     tags: [MasterData]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDepartmentInput'
 *     responses:
 *       201:
 *         description: Department created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized - access token missing or invalid
 *       403:
 *         description: Insufficient permissions to access this resource
 *       409:
 *         description: Department name or code already exists
 */

/**
 * @swagger
 * /master-data/departments/{departmentId}:
 *   patch:
 *     summary: Update a department (admin/super_admin)
 *     tags: [MasterData]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDepartmentInput'
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       400:
 *         description: Validation failed or invalid ID
 *       401:
 *         description: Unauthorized - access token missing or invalid
 *       403:
 *         description: Insufficient permissions to access this resource
 *       404:
 *         description: Department not found
 *       409:
 *         description: Department name or code already exists
 *   delete:
 *     summary: Delete a department (admin/super_admin)
 *     tags: [MasterData]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized - access token missing or invalid
 *       403:
 *         description: Insufficient permissions to access this resource
 *       404:
 *         description: Department not found
 */

/**
 * @swagger
 * /master-data/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [MasterData]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Courses fetched successfully
 *       401:
 *         description: Unauthorized - access token missing or invalid
 *   post:
 *     summary: Create a course (admin/super_admin)
 *     tags: [MasterData]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseInput'
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized - access token missing or invalid
 *       403:
 *         description: Insufficient permissions to access this resource
 *       409:
 *         description: Course name/code/abbreviation already exists
 */

/**
 * @swagger
 * /master-data/courses/{courseId}:
 *   patch:
 *     summary: Update a course (admin/super_admin)
 *     tags: [MasterData]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCourseInput'
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       400:
 *         description: Validation failed or invalid ID
 *       401:
 *         description: Unauthorized - access token missing or invalid
 *       403:
 *         description: Insufficient permissions to access this resource
 *       404:
 *         description: Course not found
 *       409:
 *         description: Course name/code/abbreviation already exists
 *   delete:
 *     summary: Delete a course (admin/super_admin)
 *     tags: [MasterData]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized - access token missing or invalid
 *       403:
 *         description: Insufficient permissions to access this resource
 *       404:
 *         description: Course not found
 */
