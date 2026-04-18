import { Router } from "express";
import {
    protectRoute,
    requireRoles,
} from "../../shared/middleware/auth.middleware";
import { STUDENT_ROLE } from "../students/student.model";
import {
    createCourseController,
    createDepartmentController,
    createHostelController,
    deleteCourseController,
    deleteDepartmentController,
    deleteHostelController,
    getCoursesController,
    getDepartmentsController,
    getHostelsController,
    getMasterDataBootstrapController,
    updateCourseController,
    updateDepartmentController,
    updateHostelController,
} from "./masterData.controller";

const router = Router();

router.use(protectRoute);

router.get("/bootstrap", getMasterDataBootstrapController);

router.get("/hostels", getHostelsController);
router.post(
    "/hostels",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    createHostelController
);
router.patch(
    "/hostels/:hostelId",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    updateHostelController
);
router.delete(
    "/hostels/:hostelId",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    deleteHostelController
);

router.get("/departments", getDepartmentsController);
router.post(
    "/departments",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    createDepartmentController
);
router.patch(
    "/departments/:departmentId",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    updateDepartmentController
);
router.delete(
    "/departments/:departmentId",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    deleteDepartmentController
);

router.get("/courses", getCoursesController);
router.post(
    "/courses",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    createCourseController
);
router.patch(
    "/courses/:courseId",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    updateCourseController
);
router.delete(
    "/courses/:courseId",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    deleteCourseController
);

export default router;
